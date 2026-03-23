# TASKS 추적 로그

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 코드, `memory.md`, 최신 문서 동기화 상태

## 0. 현재 완료 범위

### A. 화면과 라우트

- `/`
- `/home`
- `/battle/[coinId]`
- `/battle/[coinId]/pick`
- `/battle/[coinId]/waiting`
- `/battle/[coinId]/result`
- `/characters`
- `/login`
- `/me`
- `/admin/battles`
- `/admin/memos`

### B. 인증과 owner

- Supabase OAuth 로그인
- `GET /api/auth/session`
- `POST /api/auth/signout`
- `POST /api/auth/merge-local`
- `auth user id -> guest cookie id` owner 규칙
- `/me` 진입 시 local 상태 병합

### C. battle 실행

- `fetchMarketData`
- `getPreparedBattleContext`
- opening round prewarm
- 4라운드 병렬 토론
- `battle_pick_ready` 조기 오픈
- snapshot 서버 저장
- outcome, report, memo, seed, event, application 저장

### D. 저장과 아카이브

- localStorage battle snapshot / userBattle / userLevel / timing metrics
- JSON 파일 저장소
- 인증 사용자 Supabase 미러 저장
- `/me` battle archive

### E. 운영 도구

- `/api/providers/routes`
- `/api/admin/cache/prewarm`
- `/admin/battles`
- `/admin/memos`

## 1. 최근 반영된 큰 변화

### T1. battle 병렬 라운드 전환

- 상태: 완료
- 반영:
  - 8명 완전 직렬에서 4라운드 병렬로 변경
  - `battle_pick_ready` 이벤트 추가

### T2. opening round prewarm 정리

- 상태: 완료
- 반영:
  - `Aira`, `Ledger` 초안 중심 prewarm
  - 기본 prewarm coin: `bitcoin`, `ethereum`, `xrp`, `solana`
  - prewarm 동시성: `2`

### T3. 로그인 사용자 battle mirror / `/me` 아카이브

- 상태: 완료
- 반영:
  - snapshot, session, outcome, memory seed Supabase 미러 저장
  - `/me` battle 목록과 상세 조회 가능

### T4. 결과 정산 UX 재구성

- 상태: 완료
- 반영:
  - waiting 10초 전 settlement 선행 호출
  - `0초` 자동 result 이동
  - result에서 verdict/XP 선표시, report 후행 생성

### T5. rate limit 및 owner guard

- 상태: 완료
- 반영:
  - `/api/battle`, `/api/battle/outcome`, `/api/admin/cache/prewarm` rate limit
  - `snapshot`, `outcome`, `events` battleId 조회 owner 검증

## 2. 다음 우선순위

### P1. battle timing 보강

- 목적:
  - 체감 속도 중 `pick-ready 시점`을 숫자로 남기기
- 작업:
  - `pickReadyAt` metrics 추가
  - 주요 시점 비교 가능하게 만들기

### P2. 무료 OpenRouter 조합 안정화

- 목적:
  - `429`, `404`, `non_korean_response`, `message_parse_failed` 감소
- 작업:
  - `/battle/bitcoin` 반복 실측
  - 캐릭터별 primary/fallback 조합 재평가
  - runtime route override 개선

### P3. prewarm wall-clock 축소

- 목적:
  - fresh prewarm 시간을 더 줄이기
- 작업:
  - opening round 이후 준비를 더 늦출지 검토
  - refreshQueued 동작과 cache hit 측정 보강

### P4. 테스트 공백 보강

- 목적:
  - 자동화가 없는 경로 줄이기
- 작업:
  - waiting/result UI 흐름 테스트
  - `/api/me*`, `/api/auth/session`, `/api/auth/signout` 테스트
  - `/admin/*` 권한 테스트

### P5. UTF-8 정리

- 목적:
  - 사용자 노출 텍스트와 문서 가독성 회복

### P6. 운영 접근 제어

- 목적:
  - `/admin/*` 실제 보호

## 3. 검증 순서

1. 관련 테스트 수정 또는 추가
2. `pnpm test`
3. `pnpm lint`
4. `pnpm typecheck`
5. 필요 시 브라우저 실측
