# Ant Gravity Coin 리서치 정리

- 작성시각: 2026-03-25 18:01 KST
- 기준 경로: `memory.md`, `SECURITY_AUDIT.md`, `docs/planning/*`
- 목적: `memory.md`에 축적된 운영 메모를 현재 프로젝트 구조, 최근 판단, 다음 우선순위 기준으로 다시 정리한 작업 메모

## 1. 이 문서의 역할

`memory.md`는 세션 단위의 운영 메모에 가깝고, `research.md`는 그 메모를 바탕으로 프로젝트를 빠르게 재이해하기 위한 구조화 문서다.

이 문서는 특히 아래 질문에 바로 답하도록 정리한다.

- 이 서비스가 지금 정확히 무엇을 하는가
- 체감 속도 병목이 어디로 이동했는가
- 최근 수정이 어디까지 반영됐는가
- 아직 남은 리스크가 무엇인가
- 다음 세션에서 무엇부터 봐야 하는가

## 2. 프로젝트 한 줄 정의

이 프로젝트는 8명의 AI 캐릭터가 코인 방향성에 대해 bull / bear 토론을 벌이고, 사용자가 시간 프레임과 포지션을 선택한 뒤 실제 Bybit 캔들 결과로 승패와 XP를 확인하는 모바일 우선 코인 배틀 서비스다.

핵심은 단순 채팅이 아니라 아래 흐름을 연결하는 데 있다.

- 코인 선택
- 실시간 토론 스트림
- 충분한 논거가 모였을 때 빠른 선택 CTA 오픈
- waiting 상태 유지
- 결과 정산
- 리포트 / 요약 / 메모 누적
- guest 상태를 auth 계정으로 자연스럽게 병합

## 3. 현재 사용자 흐름

현재 이해해야 할 화면 흐름은 아래와 같다.

```text
랜딩 (/)
  -> 홈 (/home)
  -> 배틀 (/battle/[coinId])
  -> 선택 (/battle/[coinId]/pick)
  -> 대기 (/battle/[coinId]/waiting)
  -> 결과 (/battle/[coinId]/result)
  -> 캐릭터도감 (/characters)
  -> 로그인 (/login)
  -> 내 정보 (/me)
  -> 관리자 배틀 기록 (/admin/battles)
  -> 관리자 메모 (/admin/memos)
```

부가적으로 기억해야 할 사용자 경험 포인트는 아래다.

- 시간 프레임은 `5m`, `30m`, `1h`, `4h`, `24h`, `7d`를 사용한다.
- 결과는 단순 점수 계산이 아니라 Bybit entry / settlement 캔들 close 기준으로 정산한다.
- `/me`는 단순 마이페이지가 아니라 guest 상태를 auth 상태로 병합하는 허브다.
- `/result`는 정산 전에도 미리 진입할 수 있고, pending 상태를 설명하는 보조 화면 역할을 수행한다.

## 4. 코드 구조

현재 저장소는 Next.js App Router 기반이고, 책임 분리는 아래 식으로 읽으면 된다.

- `src/app`
  - 페이지와 API route
- `src/presentation`
  - UI 컴포넌트, client hook, client store
- `src/application`
  - 유스케이스, 프롬프트, 서비스 조합
- `src/domain`
  - 도메인 모델과 Zod 스키마
- `src/infrastructure`
  - 외부 API, 파일 저장소, Supabase persistence, 인증 유틸
- `src/features/characters`
  - 캐릭터 관련 feature 묶음
- `src/shared`
  - 상수, 공용 타입, 캐시 정책, 공용 유틸

즉 이 프로젝트는 화면만 있는 프론트엔드가 아니라 아래 운영 축을 같이 갖고 있다.

- 배틀 생성 / 스트리밍
- 결과 정산
- 시드 / 메모 / 리포트 누적
- 인증 병합
- 관리자 조회
- 보안 정책과 rate limit

## 5. 배틀 체감 속도 구조

최근 메모를 기준으로 가장 중요한 이해 포인트는, 체감 속도 지표가 이제 `전체 토론 완료`보다 `언제 선택 가능해지는가`로 이동했다는 점이다.

### 5-1. 4라운드 병렬 구조

예전 완전 직렬보다 현재는 아래 4라운드 병렬 구조가 핵심이다.

- `Aira + Ledger`
- `Judy + Shade`
- `Clover + Vela`
- `Blaze + Flip`

이 구조 덕분에 전체 직렬 대기보다 체감 속도가 크게 줄었다.

### 5-2. `battle_pick_ready` 중심 UX

현재는 bull 핵심 메시지 2개와 bear 핵심 메시지 2개가 모이면 `battle_pick_ready`를 먼저 열어 선택 CTA를 보여준다.

이 판단은 중요하다.

- 사용자는 8명 전체 발언보다 선택 가능 시점을 더 민감하게 느낀다.
- 그래서 속도 최적화의 핵심 지표는 `battle_complete`보다 `pickReadyAt`이다.

### 5-3. prepared context / prewarm

속도 개선의 중심은 prepared context와 prewarm이다.

- `getPreparedBattleContext()`는 `marketData`, `summary`, `reusableDebateContext`, `preparedEvidence`, `firstTurnDrafts`를 만든다.
- opening round의 `Aira`, `Ledger` 초안을 먼저 prewarm한다.
- 결과는 `database/data/battle_prep_cache.json`에 코인별로 캐시된다.

현재 기억해야 할 캐시 정책은 아래다.

- soft TTL: 2분
- hard TTL: 10분
- 기본 prewarm 코인: `bitcoin`, `ethereum`, `xrp`, `solana`
- 동시 prewarm 수: 2

결론은 분명하다.

- warm battle은 많이 빨라졌다.
- 하지만 fresh prewarm wall-clock은 여전히 무겁다.
- 지금은 prewarm 자체 단축과 pick-ready 조기 개방을 같이 봐야 한다.

## 6. 최근 실측에서 확정된 성능 판단

`memory.md` 최신 내용까지 포함하면 아래 흐름으로 이해하는 게 맞다.

- 과거 한때 `/api/battle`는 서버 로그 기준 `7.7분`까지도 걸렸다.
- 구조 변경 후에는 서버 로그 기준 `4.2초` 기록이 확인됐다.
- fresh 브라우저 기준 `/battle/bitcoin`
  - 첫 발언 약 `15.2초`
  - 약 `35초 이내` pick-ready CTA 확인
- 2026-03-23 추가 실측
  - 첫 발언 약 `11.3초`
  - 약 `25초` 안에 `5/8 발언` + pick-ready CTA 확인

그래서 지금의 핵심 결론은 아래다.

1. 첫 발언 자체는 이미 많이 개선됐다.
2. 다음 병목은 free 모델 tail latency와 pick-ready 개방 시점이다.
3. `Aira + Ledger` 2명 prewarm은 비용 대비 효과가 좋다.

## 7. 모델 라우팅과 실제 문제의 성격

이 프로젝트의 현재 병목은 프롬프트 설계 그 자체보다 무료 OpenRouter 모델의 availability와 출력 안정성이다.

반복 이슈는 아래 네 가지다.

- `429 Rate limit exceeded`
- `404` 죽은 모델 응답
- `non_korean_response`
- `message_parse_failed`

즉 문제의 성격은 "토론을 더 그럴듯하게 쓰기"보다 "언제든 불안정해질 수 있는 무료 모델 조합을 얼마나 빨리 우회하느냐"에 더 가깝다.

### 7-1. opening round 최신 판단

최신 메모에서 명시적으로 갱신 확인된 opening round primary는 아래다.

- `aira`: `arcee-ai/trinity-mini`
- `ledger`: `google/gemma-3-12b-it`
- 공통 fallback: `qwen/qwen3.5-9b`

이전에는 `aira`, `ledger`가 둘 다 `stepfun/step-3.5-flash:free`를 써서 동시에 429/timeout을 맞는 위험이 컸다.

지금은 병목이 "같은 모델 동시 장애"에서 "모델별 출력 품질 편차" 쪽으로 옮겨갔다고 봐야 한다.

### 7-2. Vela 관련 판단

Vela의 경우 성공률 자체보다, 실패 시 얼마나 빨리 fallback으로 넘기느냐가 더 중요하다는 결론이 이미 나왔다.

실측 비교에서는 `trinity`가 실패를 가장 빨리 확정해서 전체 흐름을 덜 막았고, 그 기준으로는 `minimax`보다 유리했다.

## 8. 프롬프트 / 파서 보강 방향

최근 메모를 종합하면 프롬프트와 파서는 "문장 품질 향상"보다 "실패 유형 축소"가 목적이다.

중요한 규칙은 아래다.

- 실제 사람이 말하는 반말 한국어 유지
- 번역투 금지
- 이름표 제거
- JSON 하나만 허용
- 코드펜스 금지
- 영어 단어 금지
- 줄바꿈 금지

캐릭터별 말투 차별화도 계속 유지된다.

- `aira`: `내 눈엔`, `차트상`
- `judy`: `헤드라인만 보면`, `지금 재료는`
- `clover`: `분위기상`, `심리적으로 보면`
- `blaze`: `지금은`, `이 구간은`
- `ledger`: `숫자상`, `구조적으로 보면`
- `shade`: `내 기준엔`, `리스크 쪽에선`
- `vela`: `밑에서 보면`, `자금 흐름상`
- `flip`: `근데 난`, `오히려 지금은`

또 아래 파서 보강이 중요하다.

- JSON 파싱 실패 시 `summary:` 라벨 형식 응답도 살린다.
- 영문 금융 용어는 파싱 직전에 한국어로 정규화한다.

여기서 핵심은 "더 멋진 답변"보다 `message_parse_failed`, `non_korean_response`를 줄이는 것이다.

## 9. Gemini의 역할

사용자는 토론 캐릭터 자체는 OpenRouter 무료 모델 중심을 원했고, Gemini는 최종 보고서와 교훈 합성 쪽으로 본다.

중요한 건 Gemini 보고서 본문이 raw text로 토론 프롬프트에 직접 주입되지 않는다는 점이다.

실제 경로는 아래다.

- 결과 정산 후 `ReusableBattleMemo` 생성
- `globalLessons`, `characterLessons` 축적
- `synthesizeBattleLessonsWithGemini` 결과가 있으면 그 합성 교훈을 우선 사용
- 없으면 fallback 교훈 사용

즉 Gemini는 "토론 본문 직접 주입"이 아니라 "교훈 / 요약 seed 주입" 형태로만 영향 준다.

## 10. auth / owner / `/me` 이해

owner 규칙은 단순 localStorage 분기보다 조금 더 중요하다.

- 로그인 상태면 Supabase auth user id를 owner로 사용한다.
- 비로그인 상태면 `ant_gravity_user_id` guest 쿠키를 owner로 사용한다.
- 공통 owner 판정은 `getRequestOwnerId()`를 통해 이뤄진다.

`/me`에 들어갈 때는 `MergeLocalStateClient`가 guest 상태를 auth 상태로 병합한다.

병합 대상은 아래다.

- local user level
- recent coins
- 현재 `userBattle`
- 현재 `battleSnapshot`
- guest owner 기준 파일 저장 battle 자산

그래서 `/me`는 단순 프로필 페이지가 아니라 상태 승격 허브로 봐야 한다.

## 11. 결과 페이지와 waiting UX 이해

최근 메모에서 결과 흐름은 꽤 중요하게 다뤄졌다.

- `waiting`의 `결과 화면 열기`는 즉시 정산 버튼이 아니라 결과 페이지 선진입 링크다.
- `result`는 settlement 전이면 pending 화면을 렌더한다.

이 구조 때문에 예전에는 버튼이 그냥 사라진 것처럼 느껴지는 문제가 있었다.

현재는 아래 보강이 반영된 상태로 이해하면 된다.

- pending 상태에서도 `MyPickSummary` 노출
- `결과 페이지 준비 중` 설명 섹션 추가
- 3단계 문맥 제공
  - `차트 마감 대기`
  - `승패와 XP 계산`
  - `리포트와 요약 정리`
- 현재 저장된 발언 수 `n/8` 표시

즉 `/result`는 정산 완료 후 결과만 보여주는 페이지가 아니라, 정산 전후 상태를 이어주는 가교 역할도 한다.

## 12. 추천 코인과 홈 화면 이해

홈 추천 코인은 단순 상수 하나만 바꾸면 끝나는 구조가 아니다.

- 화면 구성 / 순서 / thesis는 curated 목록 기준
- 가격 / 변동률 / 시총은 CoinGecko live 응답으로 덮는다

즉 현재 구조는 "고정된 추천 코인 집합 + 실시간 시세 갱신" 조합이다.

그래서 추천 코인 구성이 이상해 보이면 아래 순서로 봐야 한다.

1. `src/infrastructure/db/coinGeckoRepository.ts`
2. `src/shared/constants/mockCoins.ts`
3. dev 서버 재기동 여부

추가로 UI 쪽 최신 메모는 아래다.

- body font 기본값은 `Pretendard`
- display headline은 `Space Grotesk`
- 설명문 공통 규칙은 `ag-body-copy`, `ag-body-copy-strong`
- 홈 hero overflow는 `minmax(0, 1.5fr)` / `minmax(0, 1fr)`와 `min-w-0` 조합으로 정리됨

## 13. 저장소와 상태 저장 위치

### 13-1. localStorage

- `ant_gravity_recent_coins`
- `ant_gravity_battle_snapshot`
- `ant_gravity_user_battle`
- `ant_gravity_user_level:[userId]`
- `ant_gravity_applied_battle_results`
- `ant_gravity_battle_timing_metrics`

### 13-2. 서버 파일 저장소

- `database/data/source_cache.json`
- `database/data/battle_prep_cache.json`
- `database/data/battle_snapshot_store.json`
- `database/data/seed_store.json`
- `database/data/report_store.json`
- `database/data/event_log.json`
- `database/data/battle_result_applications.json`

### 13-3. Supabase 미러 테이블

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

메모 기준 판단으로는 주요 테이블 RLS가 켜져 있고, anon insert는 막혀 있는 상태다.

## 14. 보안 후속 수정의 현재 의미

2026-03-25 최신 메모 기준으로, 지금 워크트리의 핵심 미커밋 주제는 보안 감사 후속 수정이다.

핵심 포인트는 아래다.

- `/admin`은 이제 `src/app/admin/layout.tsx`에서 공통 차단한다.
- admin 판단은 `src/infrastructure/auth/adminAccess.ts`에 모아뒀다.
- 기본값은 차단 상태다.
- 아래 네 방식 중 하나만 설정하면 바로 관리자 권한이 열린다.
  - `user_profiles.is_admin = true`
  - `auth.users.app_metadata.role = 'admin'`
  - `auth.users.app_metadata.is_admin = true`
  - `ADMIN_USER_IDS` env allowlist

rate limit도 이제 중요하다.

- 실제 라우트는 Supabase RPC 기반 shared limiter로 연결됐다.
- 적용 라우트
  - `/api/battle`
  - `/api/battle/outcome`
  - `/api/admin/cache/prewarm`
- 테스트 환경에서는 로컬 fallback을 타서 Vitest를 깨지 않게 했다.

AI / 에러 / 헤더 쪽 의미도 분명하다.

- Gemini provider는 system/user 프롬프트를 분리한다.
- `/api/battle` 스트림 에러는 내부 상세를 그대로 노출하지 않는다.
- `next.config.ts`에는 주요 보안 헤더가 추가됐다.
  - `Content-Security-Policy`
  - `X-Frame-Options`
  - `X-Content-Type-Options`
  - `Referrer-Policy`
  - `Permissions-Policy`

운영 반영 전 필수 체크는 아래다.

1. `supabase/migrations/20260325170000_add_admin_role_and_rate_limits.sql` 적용
2. 실제 관리자 계정 권한 부여
3. 필요 시 `ADMIN_USER_IDS` 환경 변수 설정

## 15. 현재 검증 상태 해석

최신 메모 기준 검증은 아래처럼 읽는 게 맞다.

- 최근 보안 후속 수정 기준
  - `pnpm.cmd lint` 통과
  - `pnpm.cmd typecheck` 통과
  - `pnpm.cmd test` 통과
- 테스트 메모
  - `53 passed`, `1 skipped`
  - `134 passed`, `8 skipped`

다만 과거 세션 메모에서 보였던 아래 맥락도 기억해야 한다.

- `spawn EPERM`으로 특정 Vitest 시작이 막힌 적이 있다.
- `tmp/**` 산출물의 `require()` 때문에 lint가 깨진 적이 있다.
- dev 서버가 env를 못 문 상태처럼 보이며 `@supabase/ssr` 에러를 낸 적이 있다.

즉 검증 결과를 볼 때는 코드 문제와 환경 문제를 분리해서 읽어야 한다.

## 16. 현재 워크트리 해석 원칙

`memory.md`가 계속 강조하는 전제는 이 워크트리가 매우 더럽다는 점이다.

따라서 새 세션에서 반드시 지켜야 할 해석 원칙은 아래다.

1. 코드 변경과 런타임 산출물을 분리해서 본다.
2. 사용자 변경처럼 보이는 파일은 절대 함부로 되돌리지 않는다.
3. 작업 시작 전에 `git status`로 현재 범위를 분리한다.

특히 계속 섞여 나오는 대상은 아래다.

- `database/data/*.json`
- `tmp/*`
- `out/*`
- 이미지 / 로그 산출물

## 17. 아직 남은 핵심 리스크

### 17-1. 무료 모델 가용성과 출력 품질

이 프로젝트의 가장 큰 운영 리스크다.

- free 모델 rate limit
- 죽은 모델
- 한국어 실패
- 파싱 실패

### 17-2. prewarm wall-clock

- warm battle은 좋아졌지만
- fresh prewarm은 여전히 무겁다

### 17-3. UTF-8 / 문서 인코딩 흔적

- 주요 사용자 노출 화면은 많이 정리됐지만
- 문서와 일부 레거시에 깨진 흔적이 남아 있다

이 `research.md` 재정리 자체도 그 흔적을 줄이기 위한 작업의 일부다.

### 17-4. 기준 문서 경로 혼선

AGENTS에서는 제품 사양 기준 문서를 `docs/PRD.md`로 적고 있지만, 현재 저장소에서 실제로 계속 갱신되는 문맥은 `docs/planning/01-prd.md` 쪽에 더 가깝다.

이 차이는 다음 작업에서 참조 우선순위 혼선을 만들 수 있으니 계속 의식해야 한다.

## 18. 다음 세션 우선순위

`memory.md`를 충분히 이해한 뒤의 우선순위는 아래처럼 정리된다.

1. `/battle/bitcoin` 반복 실측으로 `firstMessageDisplayedAt`, `pickReadyAt`, 완료 시점 편차를 다시 본다.
2. `pickReadyAt`가 실제 timing metrics에 남는지 확인하고, 빠져 있으면 추가한다.
3. `aira`의 `message_parse_failed`, `ledger`의 `non_korean_response`가 얼마나 줄었는지 재측정한다.
4. result pending UX와 버튼 문구가 실제 체감에 맞는지 다시 본다.
5. prewarm wall-clock과 UTF-8 깨짐 정리를 이어간다.
6. 운영 반영 전에는 Supabase migration과 admin 권한 부여를 먼저 끝낸다.

## 19. 이번에 `memory.md`를 다시 읽고 확정한 이해

이번 재정리 기준으로 내가 확정한 핵심 이해는 아래다.

1. 이 프로젝트의 주된 난제는 기능 부족이 아니라 무료 모델 조합의 불안정성을 운영 가능한 UX로 흡수하는 일이다.
2. 체감 속도 최적화의 중심은 첫 발언보다 `pick-ready` 시점이다.
3. `/me`와 `/result`는 단순 페이지가 아니라 상태 전환을 연결하는 허브다.
4. 최근의 큰 미완료 범위는 보안 후속 수정의 운영 반영이다.
5. 새 작업을 시작할 때는 코드보다 먼저 더러운 워크트리와 산출물 범위를 분리해서 읽어야 한다.
## 0. 2026-03-27 `memory.md` 재독 업데이트

이번에 `memory.md`를 처음부터 끝까지 다시 읽고 아래 이해를 추가로 확정했다.

- 이 프로젝트의 핵심 문제는 단일 기능 미구현보다 무료 모델 조합의 불안정성을 UX와 운영 로직으로 흡수하는 데 있다.
- 사용자가 체감하는 속도에서 더 중요한 값은 첫 발언 도착보다 `pick-ready`가 언제 열리는지다.
- `/battle`은 4라운드 병렬 토론, waiting primer, result pending, 정산 이후 리포트까지 이어지는 상태 전환형 흐름으로 이해해야 한다.
- `/me`, `/result`도 단순 조회 페이지가 아니라 auth 병합, 요약 대시보드, 정산 대기, 결과 확인을 묶는 허브다.
- 원격에 이미 반영된 안정화와 local 미커밋 WIP를 섞어 보면 안 된다.
  - 원격 반영: auth/rate-limit fallback, Vercel read-only fallback, Bybit partial fallback 같은 production 대응
  - local WIP: `judy`/`shade` timing 로그, parser 보강, 일부 캐릭터의 `qwen` 재배치, rate limit ambiguity migration
- 지금 local 변경은 성공 확인 전 상태라서 바로 커밋/푸시할 대상이 아니다.
- 다음 세션 첫 작업은 구현보다 검증이다.
  - 새 포트로 서버를 띄우고
  - `/api/providers/routes`에서 현재 모델 배치를 확인하고
  - `/api/battle`에서 `round=2` 이후 `judy`, `shade`가 실제 hang인지 long wait인지 다시 확인해야 한다.
- 최근 보안 작업은 문서 정리가 아니라 운영 반영 직전 단계다.
  - admin guard
  - shared rate limit
  - Gemini prompt 분리
  - security headers
  - Supabase migration 적용 여부
  를 항상 같이 봐야 한다.
## 20. 2026-03-27 보안 수정 이후 상태

이번 보안 수정까지 반영하고 나면, 이 프로젝트의 운영 리스크는 “열린 보안 취약점”보다 “남아 있는 기능/품질 WIP” 쪽으로 무게가 옮겨간다.

- `merge-local`이 더 이상 클라이언트 로컬 상태를 그대로 올리지 않게 바뀌었음
- `battle/session`도 서버 snapshot과 일치하는 값만 저장하게 바뀌었음
- guest owner는 서명된 쿠키로 바뀌었음
- `/api/battle`, `/api/battle/outcome`, `/api/battle/snapshot`, `/api/battle/applications`는 minute + daily quota 관점으로 해석하면 됨
- shared rate limit RPC는 production에서 fail-open 하지 않으므로, migration 미적용 상태면 우회가 아니라 차단으로 나타난다고 이해해야 함
- `pnpm audit --json` 기준 dependency advisory는 0건으로 정리됐음

즉 다음 세션에서 보안 쪽으로 가장 먼저 확인할 것은 “새 취약점 탐색”보다 아래 배포 체크다.

1. Supabase rate limit 관련 migration 3개 적용 여부
2. `GUEST_SESSION_SECRET` 배포 환경 변수 설정 여부
3. admin 계정 권한 부여 여부

그 이후 우선순위는 다시 battle 품질과 live 안정성으로 넘어가면 된다.
