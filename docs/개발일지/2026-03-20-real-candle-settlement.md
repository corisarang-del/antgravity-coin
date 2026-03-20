# 실캔들 기반 배틀 정산 전환

작성시각: 2026-03-20 13:20 KST

## 해결하려고 한 문제

- 결과 계산이 24시간/7일 변화율 파생치에 의존해서 실제 캔들 정산이 아닌 문제
- 결과 화면이 정산 시점 이전에도 즉시 승패를 계산하던 문제
- 저장 스키마에 `settlementAt`, `priceSource`, `marketSymbol`, `settledPrice`가 없어 실정산 감사 추적이 어려운 문제

## 해결된 것

- `UserBattle`, `BattleOutcomeSeed`, `PlayerDecisionSeed`에 정산 필드를 추가했다.
- Bybit 실캔들 조회 클라이언트를 추가했다.
- `fetchBattleSettlement` 유스케이스에서 pending/settled 상태와 실정산 가격을 계산하게 했다.
- `resolveBattle`를 실정산 스냅샷 기반으로 교체했다.
- 결과 화면을 `pending -> settled` 흐름으로 분리했다.
- outcome API가 실정산 완료 전에는 `settlement_pending`을 반환하고, 완료 후에는 결과를 저장하도록 바꿨다.
- 전체 타입체크, 린트, 테스트를 통과했다.

## 아직 안 된 것

- 배틀 메시지와 스냅샷은 여전히 클라이언트 localStorage 의존이 남아 있어서 다른 기기 복원까지는 지원하지 않는다.
- 거래소 소스는 현재 Bybit 단일 기준이다. 복수 거래소 fallback은 아직 넣지 않았다.

