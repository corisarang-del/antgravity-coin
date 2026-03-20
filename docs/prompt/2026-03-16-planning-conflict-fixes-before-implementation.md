# 프롬프트 기록 - 구현 전 planning 충돌 정리

- 작성시각: 2026-03-16 23:05:00 +09:00
- 해결하고자 한 문제:
  - 구현 전에 planning 문서 안의 남은 충돌을 정리할 필요가 있었음.
- 사용자 요청 요약:
  - 문서 문제점을 다 수정해서 다시 반영
  - OpenRouter 전용 단일 키 경로와 개별 env 구조 분리
  - `Ledger`, `Shade`, `Vela`가 `MarketData`에 없는 필드를 쓰지 않도록 대안 찾기
  - `Gemini`가 승패 판정과 절대 섞이지 않게 분리
  - `BattleReport` 문서 구조를 현재 코드 저장 구조로 맞추기
- 반영한 핵심:
  - `01-prd.md`, `04-data-model.md`, `05-api-spec.md`, `06-tasks.md`를 현재 코드와 결정사항 기준으로 수정함.

