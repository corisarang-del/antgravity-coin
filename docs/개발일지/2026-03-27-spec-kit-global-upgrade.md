# spec-kit 전역 최신 업그레이드

- 작성시각: 2026-03-27 10:07 KST
- 해결하고자 한 문제:
  - 현재 `specify`로 실행되는 전역 spec-kit CLI가 최신 버전인지 확인하고, 아니라면 실제 사용 중인 전역 바이너리를 최신으로 올릴 필요가 있었음

## 해결된 것

- 로컬 `specify` 실행 경로가 `C:\Users\khc\.local\bin\specify.exe`인 것을 확인했음
- 기존 설치 메타데이터 기준 버전이 `specify-cli 0.1.5`인 것을 확인했음
- GitHub `github/spec-kit` 원격 태그를 조회해 최신 태그가 `v0.4.3`인 것을 확인했음
- `uv.exe tool upgrade specify-cli`로 실제 전역 도구를 업그레이드했음
- 업그레이드 후 메타데이터 기준 버전이 `specify-cli 0.4.3`으로 올라간 것을 확인했음

## 해결되지 않은 것

- `specify --help` 출력은 Windows 콘솔 인코딩 환경에 따라 배너 출력 중 깨질 수 있어 별도 런타임 확인은 하지 않았음
