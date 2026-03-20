# 개발일지 - OpenRouter 키 설정과 캐릭터 라우팅 구현

- 작성시각: 2026-03-17 00:12:00 +09:00
- 해결하고자 한 문제:
  - OpenRouter 키를 실제 프로젝트에 연결하고, planning 문서 기준의 OpenRouter 단일 경로 + Gemini 직결 구조를 코드에 반영할 필요가 있었음.
  - 캐릭터별 모델 배정표, 역할별 evidence 분기, 시스템 프롬프트, Gemini 최종 취합 책임도 실제 코드에 맞춰야 했음.
- 진행 내용:
  - `.env.local`을 생성하고 OpenRouter 키를 반영함.
  - `.gitignore`를 추가해 `.env.local`, `.env`를 Git 제외 대상으로 설정함.
  - `envConfig`를 OpenRouter 중심으로 확장하고, 기존 Anthropic 참조와 공존 가능하게 정리함.
  - `characterModelRoutes`를 OpenRouter 단일 provider와 `Qwen` 공통 fallback 기준으로 재정렬함.
  - `openRouterProvider`, 캐릭터 시스템 프롬프트, 역할별 evidence 분기 로직을 추가함.
  - `generateBattleReport`를 `Gemini` 직결 합성 구조로 바꾸고, 실패 시 fallback report를 유지함.
  - shadow/provider 관련 타입과 테스트를 새 구조에 맞게 수정함.
- 해결된 것:
  - OpenRouter 키가 실제 프로젝트 설정에 반영됨.
  - 캐릭터별 기본 모델과 공통 fallback이 코드에 반영됨.
  - `Gemini`는 승부 근거 재정리와 report 생성만 담당하게 구현됨.
  - `pnpm test`, `pnpm typecheck`, `pnpm lint`를 모두 통과함.
- 해결되지 않은 것:
  - `GEMINI_API_KEY`가 아직 없어서 실제 Gemini 합성 결과는 fallback report가 대신할 수 있음.
  - OpenRouter 경유 실서비스 응답 품질은 실전 호출로 추가 검증이 필요함.

