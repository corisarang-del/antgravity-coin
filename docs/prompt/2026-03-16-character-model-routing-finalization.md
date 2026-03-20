# 프롬프트 기록 - 캐릭터 모델 라우팅 최종안 문서화

- 작성시각: 2026-03-16 22:35:00 +09:00
- 해결하고자 한 문제:
  - 캐릭터별 기본 모델과 공통 fallback, 최종 취합 모델 기준을 planning 문서에도 반영할 필요가 있었음.
- 사용자 요청 요약:
  - `Qwen`을 공통 fallback으로 하고, 팀당 4명이 서로 다른 기본 모델을 쓰는 최종 조합표를 planning 폴더 문서에 업데이트해달라는 요청.
- 반영한 핵심:
  - 불리시팀: `Aira -> Qwen`, `Judy -> MiniMax`, `Clover -> Nemotron`, `Blaze -> StepFun`
  - 베어리시팀: `Ledger -> Nemotron`, `Shade -> StepFun`, `Vela -> MiniMax`, `Flip -> Qwen`
  - 공통 fallback: `Qwen3.5-9B`
  - 최종 결과 취합: `Gemini`

