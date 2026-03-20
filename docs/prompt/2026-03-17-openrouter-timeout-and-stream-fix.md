# 프롬프트 기록 - OpenRouter timeout과 배틀 스트리밍 수정

- 작성시각: 2026-03-17 00:40:00 +09:00
- 해결하고자 한 문제:
  - 실호출 확인용 샘플 배틀에서 스트림이 열리기만 하고 실제 발언이 늦게 붙거나 멈추는 문제가 있었음.
- 사용자 요청 요약:
  - `openRouterProvider`에 `AbortController` 기반 timeout 적용
  - 실패 시 즉시 `Qwen` 공통 fallback 또는 캐릭터 fallback으로 전환
  - `/api/battle` SSE가 첫 모델 실패에도 `error` 또는 fallback 메시지를 보내고 종료/진행 보장
  - 그 다음 샘플 배틀 재실행
- 이번 작업에서 구현한 핵심:
  - OpenRouter fetch timeout 추가
  - same-provider 다른 model fallback 허용
  - 캐릭터별 순차 생성 후 즉시 SSE 송신
  - 실브라우저에서 `BTC` 배틀 첫 메시지 수신 확인
- 검증 결과:
  - `pnpm test -- --run` 통과
  - `pnpm typecheck` 통과
  - `pnpm lint` 통과

