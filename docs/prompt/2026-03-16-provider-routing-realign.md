# 프롬프트 기록 - provider 라우팅 재정렬

- 작성시각: 2026-03-16 21:36:00 +09:00
- 해결하고자 한 문제:
  - 멀티 provider 구조가 이전 합의와 다르게 Anthropic 중심으로 잡혀 있었음.
- 사용자 요청 요약:
  - Anthropic이 아니라 `kimi`, `qwen`, `deepseek`, `gemini` 같은 provider 위주로 하기로 했고, Anthropic은 최후 fallback으로만 남겨달라는 요청.
- 이번 작업에서 반영한 내용:
  - `aira` 포함 기본 라우팅을 비-Anthropic provider로 재배치
  - `fallbackProvider`는 Anthropic으로 유지
  - provider routes 테스트에 기본 provider/fallback 조건 추가
- 검증 결과:
  - `pnpm typecheck` 통과
  - 변경 파일 eslint 통과
  - 개별 vitest는 sandbox `spawn EPERM`으로 실행 실패
