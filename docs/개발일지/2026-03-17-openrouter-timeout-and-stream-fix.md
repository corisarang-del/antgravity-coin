# 개발일지 - OpenRouter timeout과 배틀 스트리밍 수정

- 작성시각: 2026-03-17 00:40:00 +09:00
- 해결하고자 한 문제:
  - 실배틀에서 `battle_start`만 오고 캐릭터 발언이 오래 멈추는 문제가 있었음.
  - 원인은 OpenRouter 호출에 timeout이 없고, 같은 provider 안에서 모델만 바뀌는 fallback이 실제로는 타지 않았으며, `/api/battle`가 8명 메시지를 모두 만든 뒤 한꺼번에 스트림으로 보내고 있었기 때문이었음.
- 진행 내용:
  - `openRouterProvider`에 `AbortController` 기반 timeout을 추가함.
  - `llmRouter`에서 같은 `openrouter` provider라도 `fallbackModel`이 다르면 fallback을 타도록 수정함.
  - `/api/battle`가 캐릭터 한 명씩 메시지를 생성하자마자 바로 스트림으로 보내도록 수정함.
  - 관련 회귀 테스트를 추가하고 기존 테스트 기대값을 새 구조에 맞게 정리함.
  - 실제 브라우저에서 `BTC` 배틀을 다시 열어 첫 발언 도달과 첫 메시지 수신을 확인함.
- 해결된 것:
  - 실배틀에서 첫 캐릭터 발언이 정상적으로 도달함.
  - `Qwen` 공통 fallback이 실제로 동작할 수 있는 구조가 됨.
  - `pnpm test`, `pnpm typecheck`, `pnpm lint`를 모두 통과함.
- 해결되지 않은 것:
  - 전체 8명 배틀 완료 시간은 OpenRouter 응답 품질과 네트워크 상태에 따라 추가 확인이 필요함.
  - `Gemini` 최종 취합 실호출은 별도 배틀 완료 후 확인이 필요함.

