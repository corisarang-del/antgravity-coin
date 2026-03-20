# prewarm wall-clock 추가 개선과 UTF-8 BOM 정리

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- `POST /api/admin/cache/prewarm`의 wall-clock이 여전히 길어서 운영 체감이 무거웠음
- 같은 코인 prepared context가 동시에 stale rebuild되면 중복 작업이 생길 수 있었음
- `memory.md`, `research.md`, `docs/*` 같은 워크플로 문서가 Windows PowerShell 기본 읽기에서 UTF-8 깨짐처럼 보였음

## 이번에 해결한 것

- `preparedBattleContext`에 코인 단위 in-flight build dedupe를 추가해서 같은 코인 stale build가 동시에 들어와도 한 번만 생성되게 함
- prewarm 전용 경로에서 soft TTL은 즉시 hit, hard TTL 안의 stale cache는 즉시 반환하고 백그라운드 refresh로 넘기게 함
- `prewarmMarketCache`를 제한된 동시성으로 처리하게 바꿔 무료 모델 병목과 prewarm wall-clock 부담을 줄임
- prewarm 결과에 `refreshQueued`, `durationMs`를 포함해서 관찰 가능성을 높임
- `memory.md`, `research.md`, `docs/**/*.md`를 UTF-8 BOM으로 다시 저장해서 PowerShell 기본 읽기에서도 깨지지 않게 정리함
- 회귀 테스트를 추가함
  - `src/application/useCases/preparedBattleContext.test.ts`
  - `src/application/useCases/prewarmMarketCache.test.ts`

## 아직 남은 것

- 실제 운영 데이터 기준으로 prewarm wall-clock이 얼마나 줄었는지 브라우저/실서버 레벨 실측은 더 필요함
- 코드 파일 자체는 BOM으로 바꾸지 않았고, 문서 워크플로 중심으로만 UTF-8 정리를 적용함
- 무료 OpenRouter 모델 availability와 429 문제 자체는 여전히 별도 최적화가 필요함

## 검증

- `pnpm.cmd typecheck`
- `pnpm.cmd lint`
- `pnpm.cmd test`

