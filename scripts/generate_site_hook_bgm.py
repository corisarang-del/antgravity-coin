import math
import struct
import wave
from pathlib import Path

SAMPLE_RATE = 44_100
DURATION_SECONDS = 18.0
TEMPO = 128
BEAT = 60.0 / TEMPO
TOTAL_SAMPLES = int(SAMPLE_RATE * DURATION_SECONDS)


def clamp(value: float) -> float:
    return max(-1.0, min(1.0, value))


def midi_to_freq(note: int) -> float:
    return 440.0 * (2 ** ((note - 69) / 12))


def triangle(phase: float) -> float:
    return 2.0 * abs(2.0 * (phase - math.floor(phase + 0.5))) - 1.0


def soft_clip(value: float) -> float:
    return math.tanh(value * 1.35)


def write_track(path: Path) -> None:
    left = [0.0] * TOTAL_SAMPLES
    right = [0.0] * TOTAL_SAMPLES

    def add_sample(index: int, sample: float, pan: float = 0.0) -> None:
        if index < 0 or index >= TOTAL_SAMPLES:
            return
        left[index] += sample * (1.0 - pan * 0.35)
        right[index] += sample * (1.0 + pan * 0.35)

    def add_kick(start_time: float) -> None:
        length = int(SAMPLE_RATE * 0.26)
        start = int(start_time * SAMPLE_RATE)
        for i in range(length):
            t = i / SAMPLE_RATE
            envelope = math.exp(-t * 18.0)
            freq = 150.0 - 110.0 * min(1.0, t / 0.12)
            phase = t * freq
            tone = math.sin(2 * math.pi * phase)
            click = math.sin(2 * math.pi * 1800.0 * t) * math.exp(-t * 45.0)
            sample = (tone * 0.85 + click * 0.2) * envelope * 0.92
            add_sample(start + i, sample)

    def add_clap(start_time: float) -> None:
        length = int(SAMPLE_RATE * 0.18)
        start = int(start_time * SAMPLE_RATE)
        for i in range(length):
            t = i / SAMPLE_RATE
            envelope = math.exp(-t * 22.0)
            noise = math.sin(2 * math.pi * 1600.0 * t) * math.sin(2 * math.pi * 1870.0 * t)
            noise += math.sin(2 * math.pi * 1350.0 * t) * 0.6
            sample = noise * envelope * 0.35
            add_sample(start + i, sample)

    def add_hat(start_time: float, pan: float) -> None:
        length = int(SAMPLE_RATE * 0.08)
        start = int(start_time * SAMPLE_RATE)
        for i in range(length):
            t = i / SAMPLE_RATE
            envelope = math.exp(-t * 58.0)
            metallic = math.sin(2 * math.pi * 6200.0 * t)
            metallic += math.sin(2 * math.pi * 9100.0 * t) * 0.7
            metallic += math.sin(2 * math.pi * 11300.0 * t) * 0.4
            sample = metallic * envelope * 0.09
            add_sample(start + i, sample, pan=pan)

    def add_bass(start_time: float, note: int, beats: float) -> None:
        length = int(SAMPLE_RATE * (BEAT * beats))
        start = int(start_time * SAMPLE_RATE)
        freq = midi_to_freq(note)
        for i in range(length):
            t = i / SAMPLE_RATE
            sustain = min(1.0, t / 0.03)
            release = max(0.0, 1.0 - max(0.0, t - BEAT * beats * 0.72) / (BEAT * beats * 0.28))
            envelope = sustain * release
            phase = t * freq
            sample = (
                math.sin(2 * math.pi * phase) * 0.72
                + math.sin(2 * math.pi * phase * 2.0) * 0.2
                + triangle(phase) * 0.12
            )
            add_sample(start + i, sample * envelope * 0.24, pan=-0.04)

    def add_chord_pad(start_time: float, notes: list[int], beats: float) -> None:
        length = int(SAMPLE_RATE * (BEAT * beats))
        start = int(start_time * SAMPLE_RATE)
        for i in range(length):
            t = i / SAMPLE_RATE
            attack = min(1.0, t / 0.18)
            release = max(0.0, 1.0 - max(0.0, t - BEAT * beats * 0.78) / (BEAT * beats * 0.22))
            envelope = attack * release
            sample = 0.0
            for note in notes:
                freq = midi_to_freq(note)
                phase = t * freq
                sample += math.sin(2 * math.pi * phase) * 0.55
                sample += math.sin(2 * math.pi * phase * 2.0) * 0.08
            add_sample(start + i, sample * envelope * 0.05, pan=0.05)

    def add_pluck(start_time: float, note: int, pan: float) -> None:
        length = int(SAMPLE_RATE * 0.32)
        start = int(start_time * SAMPLE_RATE)
        freq = midi_to_freq(note)
        for i in range(length):
            t = i / SAMPLE_RATE
            envelope = math.exp(-t * 10.5)
            phase = t * freq
            sample = (
                math.sin(2 * math.pi * phase) * 0.55
                + triangle(phase * 2.0) * 0.22
                + math.sin(2 * math.pi * phase * 3.0) * 0.12
            )
            wobble = 1.0 + math.sin(2 * math.pi * 4.0 * t) * 0.02
            add_sample(start + i, sample * envelope * wobble * 0.16, pan=pan)

    chord_progression = [
        ([57, 60, 64], 45),
        ([53, 57, 60], 41),
        ([48, 52, 55], 36),
        ([55, 59, 62], 43),
    ]
    bass_notes = [45, 41, 36, 43]
    lead_pattern = [
        [72, 76, 79, 76],
        [72, 77, 79, 77],
        [67, 72, 76, 72],
        [71, 74, 79, 74],
    ]

    total_beats = int(DURATION_SECONDS / BEAT) + 2
    for beat_index in range(total_beats):
        beat_time = beat_index * BEAT
        if beat_time >= DURATION_SECONDS:
            break
        add_kick(beat_time)
        if beat_index % 2 == 1:
            add_clap(beat_time)
        add_hat(beat_time, pan=-0.25 if beat_index % 2 == 0 else 0.25)
        add_hat(beat_time + BEAT / 2.0, pan=0.25 if beat_index % 2 == 0 else -0.25)

    bars = math.ceil(DURATION_SECONDS / (BEAT * 4))
    for bar_index in range(bars):
        bar_time = bar_index * BEAT * 4
        chord_index = bar_index % len(chord_progression)
        chord_notes, bass_note = chord_progression[chord_index]
        add_chord_pad(bar_time, chord_notes, 4)
        add_bass(bar_time, bass_note, 4)

        melody = lead_pattern[chord_index]
        for step, note in enumerate(melody):
            pluck_time = bar_time + step * BEAT
            if pluck_time < DURATION_SECONDS - 0.1:
                add_pluck(pluck_time, note, pan=-0.18 if step % 2 == 0 else 0.18)
                add_pluck(pluck_time + BEAT / 2.0, note + (12 if step in (1, 3) else 7), pan=0.1)

    fade_length = int(SAMPLE_RATE * 0.6)
    pcm_frames: list[bytes] = []
    for i in range(TOTAL_SAMPLES):
        if i > TOTAL_SAMPLES - fade_length:
            fade = max(0.0, (TOTAL_SAMPLES - i) / fade_length)
        else:
            fade = 1.0

        left_sample = soft_clip(left[i] * 0.88 * fade)
        right_sample = soft_clip(right[i] * 0.88 * fade)
        pcm_frames.append(
            struct.pack(
                "<hh",
                int(clamp(left_sample) * 32767),
                int(clamp(right_sample) * 32767),
            )
        )

    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as wav_file:
        wav_file.setnchannels(2)
        wav_file.setsampwidth(2)
        wav_file.setframerate(SAMPLE_RATE)
        wav_file.writeframes(b"".join(pcm_frames))


if __name__ == "__main__":
    output_path = Path("public/audio/ant-gravity-site-hook.wav")
    write_track(output_path)
    print(f"generated {output_path}")
