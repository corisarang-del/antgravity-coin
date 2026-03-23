# 결과 정산 플로우

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 `waiting`, `result`, `POST /api/battle/outcome` 구현

## 목적

- `waiting`에서 countdown이 `0`이 되면 사용자가 직접 누르지 않아도 `/result`로 이동한다.
- `result`는 verdict, 변화율, XP를 먼저 보여주고 report는 뒤에서 생성한다.
- 정산 직전 10초 구간에는 settlement 계산을 미리 시작한다.

## waiting 화면 동작

1. `CountdownTimer`는 남은 초를 표시한다.
2. `WaitingPageClient`가 자체 interval로 남은 초를 갱신한다.
3. 남은 초가 `10` 이하가 되면 `POST /api/battle/outcome`를 `mode: "settlement"`로 미리 호출한다.
4. 남은 초가 `0`이 되면 `/battle/[coinId]/result`로 자동 이동한다.

## result 화면 동작

1. `settlementAt`이 아직 안 지났으면 pending 카드와 countdown을 보여준다.
2. `settlementAt`이 지나면 `GET /api/battle/outcome?battleId=...`로 기존 결과를 먼저 확인한다.
3. 기존 결과가 없으면 `POST /api/battle/outcome`를 `mode: "settlement"`로 호출한다.
4. settlement 응답으로 아래를 먼저 확보한다.
   - `battleOutcomeSeed`
   - `characterMemorySeeds`
   - `playerDecisionSeed`
5. result 화면은 이 seed를 기반으로 아래를 먼저 렌더한다.
   - 승리 팀
   - 변화율
   - XP 변화
   - 승리 팀 핵심 발언
6. report가 아직 없으면 `리포트 정리 중` 상태를 보여준다.
7. 같은 route를 `mode: "full"`로 다시 호출해 report와 reusable memo를 후행 생성한다.
8. report가 준비되면 result 화면에 본문을 붙인다.

## `/api/battle/outcome` 모드

### `mode: "settlement"`

- 목적:
  - 실캔들 정산 결과를 최대한 빨리 만든다.
- 입력:
  - `userBattle`
  - 선택적으로 `messages`
- 출력:
  - `battleOutcomeSeed`
  - `characterMemorySeeds`
  - `playerDecisionSeed`
  - `report: null`
  - `reportPending: true`

### `mode: "full"`

- 목적:
  - report와 reusable memo까지 완성한다.
- 동작:
  - 기존 outcome seed가 있으면 재사용한다.
  - report가 없으면 report만 후행 생성 가능하다.
- 출력:
  - `battleOutcomeSeed`
  - `characterMemorySeeds`
  - `playerDecisionSeed`
  - `report`
  - `reportSource`

## 예외 처리

- settlement 시각 전이면 `409 settlement_pending`
- snapshot이 owner 기준으로 없으면 `404`
- snapshot과 battleId가 안 맞으면 `409 snapshot_battle_mismatch`
- rate limit 초과면 `429 rate_limit_exceeded`

## 외부 API timeout

- Bybit 요청 timeout: `4000ms`
- Gemini lesson synthesis timeout: `3500ms`

의도:

- 정산 전체가 외부 API에 오래 붙잡히지 않게 한다.
- Gemini가 늦으면 fallback report로 진행할 수 있게 한다.

## 사용자 체감 기준

1. `0초`가 됐는데 waiting에 멈춰 있지 않는다.
2. result는 verdict와 XP를 먼저 연다.
3. report가 늦을 때는 멈춘 화면 대신 `리포트 정리 중` 상태를 보여준다.
