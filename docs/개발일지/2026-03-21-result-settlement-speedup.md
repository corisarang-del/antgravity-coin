# Result Settlement Speedup

- 작성시각: 2026-03-21 17:25 KST
- 해결하고자 한 문제:
  - `waiting`에서 countdown이 `0s`가 돼도 사용자가 직접 눌러야 해서 멈춘 것처럼 느껴졌음
  - `result`는 승패보다 report 생성까지 같이 기다려야 해서 체감이 너무 느렸음
  - Bybit, Gemini 같은 외부 API가 느리면 전체 결과 화면이 같이 붙잡혔음

## 해결된 것

- `waiting` 화면에 자동 전환을 넣음
  - countdown `0s`가 되면 `/result` 자동 이동
  - 정산 `10초` 전부터 `mode: "settlement"` 선행 호출
- `result` 화면을 2단계로 분리함
  - 1단계: 실캔들 기준 승패, 변화율, XP, 승리 팀 핵심 발언 먼저 표시
  - 2단계: report와 memo는 후행 생성
- `/api/battle/outcome`에 두 모드를 명시적으로 사용하게 정리함
  - `settlement`
  - `full`
- timeout 보강
  - Bybit `4000ms`
  - Gemini `3500ms`
- 브라우저 실측 확인
  - `waiting`에서 `0s` 후 `/result` 자동 이동 확인
  - result에서 먼저 verdict와 XP가 뜨고, 잠시 뒤 report가 붙는 흐름 확인
- 테스트 확인
  - `pnpm.cmd typecheck`
  - `pnpm.cmd test -- --run src/app/api/battle/outcome/route.test.ts src/application/useCases/fetchBattleSettlement.test.ts src/infrastructure/api/bybitClient.test.ts`

## 해결되지 않은 것

- `pnpm.cmd lint`는 이번 수정과 무관한 `tmp/__prewarm-run.mts` 파싱 에러 때문에 전체 통과를 주장할 수 없음
- 기존 404 로그는 `GET /api/battle/outcome`에서 결과 없음 확인 후 `POST`로 넘어가는 정상 선조회 흐름이라 콘솔에 계속 보일 수 있음
