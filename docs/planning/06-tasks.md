# TASKS 추적 로그

- 최종 갱신: 2026-03-21 03:01 KST
- 기준: 현재 코드, `memory.md`, 남은 성능/문자열 이슈

## 0. 현재 완료 범위

### A. 라우팅과 화면

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

- Supabase OAuth 로그인/콜백
- `GET /api/auth/session`
- `POST /api/auth/signout`
- `POST /api/auth/merge-local`
- `auth user id -> guest cookie id` owner 규칙
- 서버 초기 snapshot 기반 헤더 부트스트랩
- `/me` 진입 시 local 상태 병합

### C. battle 실행

- `fetchMarketData`
- `getBattleMarketSnapshot`
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

## 1. 최근 반영된 핵심 변경

### T1. battle 병렬 라운드 전환

- 상태: 완료
- 반영:
  - 8명 완전 직렬에서 4라운드 병렬 구조로 변경
  - `battle_pick_ready` 이벤트 추가

### T2. opening round prewarm 정리

- 상태: 완료
- 반영:
  - prepared context는 `Aira`, `Ledger` 초안 중심
  - prewarm coin 기본값: `bitcoin`, `ethereum`, `xrp`, `solana`
  - prewarm 동시성: 2

### T3. 인증 사용자 battle mirror / `/me` 고도화

- 상태: 완료
- 반영:
  - snapshot, session, outcome, memory seed를 Supabase에 미러 저장
  - `/me`에서 battle 목록과 상세 재조회 가능

### T4. 운영 memo 아카이브

- 상태: 완료
- 반영:
  - reusable memo 목록/상세 화면 추가
  - global lesson, character lesson 조회 가능

## 2. 다음 우선순위

### P1. battle timing 보강

- 목적
  - 체감 속도의 핵심인 pick-ready 시점을 숫자로 남기기
- 할 일
  - `pickReadyAt` 메트릭 추가
  - `requestStartedAt / firstMessageDisplayedAt / pickReadyAt / debateCompletedAt` 비교 저장

### P2. 무료 OpenRouter 조합 안정화

- 목적
  - `429`, `404`, `non_korean_response`, `message_parse_failed` 감소
- 할 일
  - `/battle/bitcoin` 3회 이상 반복 실측
  - 캐릭터별 primary/fallback 성공률 재집계
  - runtime route override 재조정

### P3. prewarm wall-clock 축소

- 목적
  - fresh prewarm 시간 추가 단축
- 할 일
  - opening round 외 추가 생성 시점을 더 늦출지 검토
  - refreshQueued 동작의 실효성 측정

### P4. 테스트 공백 보강

- 목적
  - 동시성, TTL 만료, 운영 경계 신뢰도 강화
- 할 일
  - outcome 동시 호출 idempotency
  - `battle_pick_ready` 이벤트 순서와 metrics 테스트
  - local TTL 만료 경로 테스트
  - admin 경계와 merge-local 후 복구 테스트

### P5. UTF-8 깨짐 정리

- 목적
  - 사용자 노출 문자열과 문서 가독성 회복
- 할 일
  - 깨진 라벨과 설명 문구 정리
  - 기준 문서 경로 정합성 복구

### P6. 인증 UX / `/me` 대시보드 고도화

- 목적
  - 기존 OAuth 흐름과 `/me`를 유지하면서 로그인/회원가입 진입과 내 페이지 첫 화면을 더 직관적으로 정리

### T5. 로그인/회원가입 통합 OAuth UX 고도화

- 상태: 예정
- 반영:
  - `/login` 카피를 `로그인/회원가입` 성격이 드러나게 정리
  - `Google`, `Kakao` 버튼을 공용 진입 버튼으로 재정렬
  - `error=oauth_callback_failed` 상태 문구 추가
  - 헤더 로그인 CTA를 `로그인/회원가입` 방향으로 맞출지 함께 반영
- 검증:
  - 로그인 버튼 클릭 시 provider와 `redirectTo` 값 확인
  - callback 실패 시 에러 문구 노출 확인

### T6. `/me` 요약 대시보드 재구성

- 상태: 예정
- 반영:
  - `/me` 상단 프로필 카드 재정렬
  - XP / 등급 / 승패 카드 고정 노출
  - 등급명은 기존 5단계 유지
    - `개미`
    - `새싹개미`
    - `중급개미`
    - `고수개미`
    - `전설개미`
  - 최근 battle 기록은 기본 5개 안팎의 압축 리스트로 정리
  - 배틀 상세는 선택 시 확장하는 현재 구조 유지
- 검증:
  - 비로그인 `/me` 리다이렉트 확인
  - `/me` 기본 화면에서 핵심 카드 우선 노출 확인
  - battle 상세가 기본 화면을 과도하게 점유하지 않는지 확인

### T5 / T6 진행 메모

- `T5`
  - 로그인/회원가입 통합 카피 반영
  - callback 실패 안내 문구 반영
  - 헤더 CTA를 `로그인/회원가입` 방향으로 정리
  - 상태: 부분 구현
- `T6`
  - `/me` 상단 요약 카드 반영
  - 등급 카드 반영
  - 최근 5개 battle 압축 리스트 반영
  - 상태: 부분 구현
- 현재 남은 막힘
  - `localhost:3000` dev 서버가 한 번 꼬여 전체 404를 반환했음
  - 재기동 후엔 Supabase env 에러가 보여서, 기능보다 dev 환경 재확인이 먼저 필요함

## 3. 중기 작업

### M1. 관측성

- provider별 실패 사유 집계
- fallback 사용률 집계
- prewarm hit / refreshQueued 비율 집계

### M2. 저장소 고도화

- 파일 저장소를 DB 중심으로 이전 검토
- snapshot / prep cache 정리 정책 추가

### M3. 운영 경계 정리

- `/admin/*` 접근 제어
- 운영 화면 필터, 정렬, 상태 배지 강화

## 4. 검증 순서

1. 관련 테스트 추가 또는 수정
2. `pnpm test`
3. `pnpm lint`
4. `pnpm typecheck`
5. 필요 시 브라우저 실측
