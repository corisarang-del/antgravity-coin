# 실캔들 기반 배틀 정산 전환 프롬프트

작성시각: 2026-03-20 13:20 KST

## 프롬프트 요약

`UserBattle.ts`, `BattleOutcomeSeed.ts`, `PlayerDecisionSeed.ts`에 `settlementAt`, `priceSource`, `marketSymbol`, `settledPrice` 필드를 추가하고, `src/infrastructure/api`에 실캔들 조회 클라이언트를 넣고, `fetchBattleSettlement.ts` 유스케이스를 만들고, `resolveBattle.ts`를 실제 정산값 기준으로 교체하고, `ResultPageClient.tsx`를 pending/settled 흐름으로 바꾸고, `route.ts`도 정산 스냅샷 저장 기준으로 수정하고, 테스트까지 추가하기.

## 해결하려고 한 문제

- 추정 결과와 실제 캔들 결과의 불일치
- 정산 시각 이전에 결과가 열리는 UX 문제
- 저장 타입에 정산 메타데이터가 없는 문제

## 해결된 것

- Bybit 실캔들 정산 흐름을 코드와 저장 스키마에 반영했다.
- 테스트로 진입 가격/정산 가격 규칙을 고정했다.

## 아직 안 된 것

- 멀티 디바이스 복원과 복수 거래소 fallback은 후속 작업이다.

