# 개발일지 - provider 라우팅 재정렬

- 작성시각: 2026-03-16 21:36:00 +09:00
- 해결하고자 한 문제:
  - 멀티 provider 초안 구현에서 `anthropic`이 기본 provider처럼 남아 있었고, 이전 합의인 "비-Anthropic provider 중심, Anthropic은 최후 fallback"과 어긋났음.
- 진행 내용:
  - `characterModelRoutes`에서 기본 provider를 `qwen`, `gemini`, `deepseek`, `glm`, `kimi` 중심으로 재배치함.
  - `anthropic`은 모든 캐릭터의 `fallbackProvider`로만 남김.
  - provider routes API 테스트에 "기본 provider에 anthropic이 없어야 한다"와 "fallbackProvider는 anthropic이어야 한다" 조건을 추가함.
- 해결된 것:
  - 기본 라우팅이 Anthropic 중심에서 비-Anthropic 중심으로 정렬됨.
  - Anthropic은 최후 fallback 역할로만 제한됨.
- 해결되지 않은 것:
  - 개별 vitest 실행은 sandbox 환경에서 `esbuild spawn EPERM`으로 실패했음.
  - 전체 테스트 재실행은 이번 짧은 조정 단계에서 다시 돌리지 않았음.
