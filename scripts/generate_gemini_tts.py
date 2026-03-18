from __future__ import annotations

import argparse
import base64
import json
import os
import sys
import wave
from pathlib import Path

from google import genai
from google.genai import types

DEFAULT_MODEL = "gemini-2.5-flash-preview-tts"
DEFAULT_VOICE = "Kore"
DEFAULT_LANGUAGE_CODE = "ko-KR"
DEFAULT_SAMPLE_RATE = 24000


def load_local_env() -> None:
    env_path = Path(".env.local")
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key and key not in os.environ:
            os.environ[key] = value.strip()


def read_input_text(text: str | None, input_file: str | None) -> str:
    if text:
        return text.strip()
    if input_file:
        return Path(input_file).read_text(encoding="utf-8").strip()
    raise SystemExit("텍스트 또는 입력 파일이 필요해.")


def read_input_lines(text: str | None, input_file: str | None) -> list[str]:
    source = read_input_text(text, input_file)
    return [line.strip() for line in source.splitlines() if line.strip()]


def ensure_parent_dir(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def extract_pcm_bytes(response: object) -> bytes:
    candidates = getattr(response, "candidates", None)
    if not candidates:
        raise RuntimeError("Gemini TTS 응답에 candidate가 없어.")

    parts = getattr(candidates[0].content, "parts", None)
    if not parts:
        raise RuntimeError("Gemini TTS 응답에 audio part가 없어.")

    inline_data = getattr(parts[0], "inline_data", None)
    if inline_data is None or getattr(inline_data, "data", None) is None:
        raise RuntimeError("Gemini TTS 응답에 inline audio data가 없어.")

    data = inline_data.data
    if isinstance(data, bytes):
        return data
    if isinstance(data, str):
        return base64.b64decode(data)
    raise RuntimeError("Gemini TTS 오디오 데이터 형식을 해석할 수 없어.")


def save_wave_file(path: Path, pcm_data: bytes, sample_rate: int) -> None:
    ensure_parent_dir(path)
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)


def generate_pcm(
    client: genai.Client,
    model: str,
    voice: str,
    language_code: str,
    prompt: str,
) -> bytes:
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                language_code=language_code,
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name=voice,
                    )
                ),
            ),
        ),
    )
    return extract_pcm_bytes(response)


def build_silence_bytes(sample_rate: int, pause_ms: int) -> bytes:
    total_samples = int(sample_rate * (pause_ms / 1000))
    return b"\x00\x00" * total_samples


def write_timings(path: Path, segments: list[dict[str, object]], duration_ms: int) -> None:
    ensure_parent_dir(path)
    path.write_text(
        json.dumps(
          {
              "durationMs": duration_ms,
              "segments": segments,
          },
          ensure_ascii=False,
          indent=2,
        ),
        encoding="utf-8",
    )


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Gemini TTS로 WAV 파일을 생성해.")
    parser.add_argument("--text", help="직접 읽을 텍스트")
    parser.add_argument("--input-file", help="읽을 텍스트 파일 경로")
    parser.add_argument("--out", required=True, help="출력 wav 경로")
    parser.add_argument("--model", default=DEFAULT_MODEL, help="Gemini TTS 모델명")
    parser.add_argument("--voice", default=DEFAULT_VOICE, help="Gemini prebuilt voice")
    parser.add_argument("--language-code", default=DEFAULT_LANGUAGE_CODE, help="BCP-47 언어 코드")
    parser.add_argument("--sample-rate", type=int, default=DEFAULT_SAMPLE_RATE, help="출력 샘플레이트")
    parser.add_argument("--split-lines", action="store_true", help="빈 줄 제외 각 줄을 따로 합성해.")
    parser.add_argument("--pause-ms", type=int, default=220, help="줄 사이 무음 길이")
    parser.add_argument("--timings-out", help="문장별 타이밍 JSON 출력 경로")
    return parser


def main() -> int:
    load_local_env()
    parser = build_parser()
    args = parser.parse_args()

    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise SystemExit("GEMINI_API_KEY가 비어 있어.")

    client = genai.Client(api_key=api_key)

    if args.split_lines:
        lines = read_input_lines(args.text, args.input_file)
        silence_bytes = build_silence_bytes(args.sample_rate, args.pause_ms)
        combined = bytearray()
        segments: list[dict[str, object]] = []
        cursor_ms = 0

        for index, line in enumerate(lines):
            pcm_data = generate_pcm(
                client=client,
                model=args.model,
                voice=args.voice,
                language_code=args.language_code,
                prompt=line,
            )
            duration_ms = round((len(pcm_data) / 2 / args.sample_rate) * 1000)
            segments.append(
                {
                    "index": index,
                    "text": line,
                    "startMs": cursor_ms,
                    "endMs": cursor_ms + duration_ms,
                }
            )
            combined.extend(pcm_data)
            cursor_ms += duration_ms
            if index < len(lines) - 1:
                combined.extend(silence_bytes)
                cursor_ms += args.pause_ms

        output_path = Path(args.out)
        save_wave_file(output_path, bytes(combined), args.sample_rate)
        if args.timings_out:
            write_timings(Path(args.timings_out), segments, cursor_ms)
        print(f"generated={output_path}")
        return 0

    prompt = read_input_text(args.text, args.input_file)
    pcm_data = generate_pcm(
        client=client,
        model=args.model,
        voice=args.voice,
        language_code=args.language_code,
        prompt=prompt,
    )

    output_path = Path(args.out)
    save_wave_file(output_path, pcm_data, args.sample_rate)
    print(f"generated={output_path}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
