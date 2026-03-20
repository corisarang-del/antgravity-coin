# opening round 2명 prewarm과 대기 프라이머 추가

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- 첫 라운드 prewarm이 사실상 1명만 준비되어 있어서 초반 균형감이 부족했음
- 배틀 대기 구간에서 사용자가 읽을 정보가 적어서 로딩 체감이 지루했음

## 이번에 해결한 것

- `preparedBattleContext`가 `Aira + Ledger` opening round draft를 병렬로 미리 생성하게 바꿈
- `/api/battle`에서 `firstTurnDrafts`에 있는 opening round draft를 실제 스트림에 재사용하게 함
- battle waiting 구간에 `시장 미니 브리핑` 카드 추가
  - RSI
  - 공포탐욕
  - 롱숏 비율
  - 펀딩비
- battle waiting 구간에 `곧 등장할 캐릭터` 예고 카드 추가

## 아직 남은 것

- 미니 브리핑 항목을 캐릭터 라운드 진행과 더 밀접하게 묶는 후속 개선
- 등장 예고 문구를 캐릭터별 현재 모델 상태나 fallback 여부와 연동하는 개선
- live 실측 기준 opening round 2명 prewarm 효과를 수치로 다시 확인하는 작업

## 검증

- `pnpm.cmd typecheck`
- `pnpm.cmd test -- src/application/useCases/preparedBattleContext.test.ts src/app/api/battle/route.test.ts`
- `pnpm.cmd lint`

