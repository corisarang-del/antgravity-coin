# 결과 페이지 준비 진행도 시각화

- 작성시각: 2026-03-28 22:05 KST

## 해결하고자 한 문제

- 결과 페이지의 `준비 중` 구간이 텍스트와 숫자 카운트다운만으로 보여서 남은 시간을 직관적으로 느끼기 어려웠음
- 사용자가 지금 얼마나 남았는지, 어떤 단계에 있는지 화면만 보고 감을 잡기 어렵다는 문제가 있었음

## 해결된 것

- `ResultPageClient`에 `selectedAt -> settlementAt` 기준 실제 시간 진행률 계산을 추가했음
- `결과 페이지 준비 중` 섹션에 전체 진행 바를 추가해서 남은 시간을 퍼센트와 초 단위로 같이 보여주게 했음
- 같은 섹션의 3단계 카드에도 단계별 진행 바를 넣었음
- settlement 전에는 `차트 마감 대기`만 실제 시간 기반으로 차고, 나머지 단계는 `곧 시작`으로 유지되게 했음
- settlement 이후 `checking / settling / report` 단계에 맞춰 단계별 진행률을 시각적으로 보여주게 했음
- `ResultPageClient.test.tsx`를 추가해서 pending 상태와 resolveStage 상태를 검증했음
- `pnpm.cmd typecheck` 통과
- 대상 파일 `eslint` 통과
- 대상 Vitest 통과

## 아직 안 된 것

- 이번 변경은 `/battle/[coinId]/result`에만 적용했고, waiting 화면의 카운트다운 카드에는 같은 로딩바를 붙이지 않았음
