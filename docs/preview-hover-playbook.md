# Preview Hover Playbook

## 목적

- 캐릭터 카드 hover 시 mp4 프리뷰를 빠르게 보여준다.
- 첫 사용자 진입 액션 이후에만 오디오를 안정적으로 재생한다.
- 같은 캐릭터 재진입 스팸에도 오디오가 튀지 않게 제어한다.

## 자산 규칙

- 원본 mp4는 `design/character/*.mp4`
- 서비스용 mp4는 `public/characters/previews/*.mp4`
- 포스터 이미지는 `public/characters/*.webp`

## ffmpeg 변환 규칙

- 오디오를 제거하지 않는다.
- 원본 비율을 유지한다.
- 웹 재생 최적화를 위해 `+faststart`를 넣는다.
- hover 프리뷰 박스 비율에 맞게 720 기준으로 줄인다.

```powershell
.\tools\ffmpeg\bin\ffmpeg.exe -y -i input.mp4 -vf "scale=720:-2" -c:v libx264 -preset medium -crf 28 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k output.mp4
```

## 웹 오디오 규칙

- hover만으로는 브라우저가 소리 재생을 허용하지 않을 수 있다.
- 첫 진입 게이트의 명시적 클릭에서 오디오 unlock을 시도한다.
- 필요하면 첫 카드 `pointerdown`에서 한 번 더 fallback unlock을 시도한다.
- unlock 성공 전에는 hover 프리뷰가 무음일 수 있다.

## 구현 규칙

### 1. preload/cache

- `PreviewVideoCache`로 mp4를 캐시한다.
- 카드 `pointerenter`, `pointerdown`, `focus`에서 preload 한다.
- 특정 캐릭터만 idle preload 하지 않는다.

### 2. 프리뷰 레이어

- 프리뷰를 닫을 때 unmount 하지 말고 숨긴다.
- 같은 비디오 엘리먼트를 재사용해야 2번째 hover에서도 오디오 상태가 안정적이다.

### 3. 비디오 재생

- poster를 먼저 보여주고 `loadeddata` 후 비디오를 보여준다.
- `loop`는 제거한다.
- 한 번 재생 후 마지막 프레임에서 멈춘다.

### 4. 오디오 충돌 방지

- 한 번에 하나의 preview 오디오만 재생한다.
- 새 preview가 시작되면 이전 preview는 `pause + currentTime = 0 + muted = true`

### 5. 재진입 쿨다운

- 마지막 오디오 시작 후 2초 이내에는 재시작하지 않는다.
- 2초 이후에는 같은 캐릭터여도 다시 재생한다.
- 다른 캐릭터도 같은 2초 규칙을 따른다.

## 트러블슈팅

### Aira/Judy만 소리가 안 날 때

- 파일 문제가 아닌지 먼저 확인한다.

```powershell
.\tools\ffmpeg\bin\ffprobe.exe -v error -show_entries stream=index,codec_type,codec_name -of csv=p=0 .\public\characters\previews\aira.mp4
.\tools\ffmpeg\bin\ffprobe.exe -v error -show_entries stream=index,codec_type,codec_name -of csv=p=0 .\public\characters\previews\judy.mp4
```

- `h264,video`와 `aac,audio`가 둘 다 보여야 정상이다.

### 오디오 볼륨 자체가 작은지 볼 때

```powershell
.\tools\ffmpeg\bin\ffmpeg.exe -i .\public\characters\previews\aira.mp4 -af volumedetect -vn -sn -dn -f null NUL
```

### 브라우저 정책인지 확인할 때

- `입장 -> hover -> 2초 대기 -> 같은 캐릭터 hover`
- Playwright나 DevTools에서 `video.muted`, `video.paused`, `video.currentTime` 확인

## 검증 체크리스트

- `pnpm lint`
- `pnpm typecheck`
- 브라우저에서 `입장` 클릭 후 hover 프리뷰 표시 확인
- `Aira -> Judy -> Aira`
- `Aira -> 빠져나옴 -> 2초 대기 -> Aira`

## 결론

- 자산 변환, 브라우저 오디오 unlock, preview 레이어 재사용, 쿨다운 제어를 같이 설계해야 한 번에 성공한다.
