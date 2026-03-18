# 프롬프트 기록 - OpenRouter 실패 로그 확장과 운영자 추적 강화

- 작성시각: 2026-03-17 01:20:00 +09:00
- 해결하고자 한 문제:
  - `MiniMax`가 실제로 안 붙는 이유를 더 자세히 알고 싶고, 운영자 대시보드에서도 `reportSource`, `provider`, `model`, `fallbackUsed`를 확인하고 싶었음.
- 사용자 요청 요약:
  - OpenRouter 실패 로그 확장
  - `status`, `timeout`, `body 일부`, `parse 실패 여부`
  - 운영자 대시보드에 `reportSource`, `provider`, `model`, `fallbackUsed` 추가
  - MiniMax 호출되는지 확인 가능한 수준으로 추적 강화
- 이번 작업에서 구현한 핵심:
  - provider/model/fallbackUsed를 메모리, event log, SSE, outcome 응답에 반영
  - OpenRouter 실패 원인 로깅 강화
  - 운영자 대시보드에서 추적 필드 표시
  - 테스트/타입체크/린트 통과
