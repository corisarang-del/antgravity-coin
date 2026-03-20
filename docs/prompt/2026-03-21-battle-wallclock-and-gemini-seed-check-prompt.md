# battle wall-clock 재실측과 gemini 시드 확인 프롬프트

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- live OpenRouter 기준 실제 wall-clock 재실측
- 제미니 보고서가 토론에 시드 소스로 주어지고 있는지 확인

## 사용한 프롬프트 요약

- `live OpenRouter 기준 실제 wall-clock 재실측이다. 다음엔 이 변경으로 /battle/bitcoin 체감 시간이 얼마나 줄었는지 바로 재보고 제미니 보고서는 토론에 시드소스로 주어지고 있나`

## 해결된 것

- `/battle/bitcoin` fresh run 기준 첫 발언 도착 시간 확인
- pick-ready CTA가 실제로 노출되는지 브라우저 재확인
- 제미니 보고서 seed 경로를 코드 기준으로 확인

## 아직 안 된 것

- pick-ready 초 단위 정밀 계측 자동화
- 여러 번 반복한 평균값 측정

