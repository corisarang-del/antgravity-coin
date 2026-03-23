# Ant Gravity Coin 리서치 정리

- 작성시각: 2026-03-21 03:01 KST
- 기준 경로: `C:\Users\khc\Desktop\fastcampus\ant_gravity_coin`
- 참고:
  - `memory.md`
  - `docs/planning/*`
  - 현재 `src/`, `database/`, `supabase/`

## 1. 프로젝트 한 줄 정의

이 프로젝트는 8명의 AI 캐릭터가 하나의 코인을 bull / bear 관점으로 토론하고, 사용자가 팀과 시간프레임을 선택한 뒤 실제 Bybit 캔들 결과로 승패와 XP를 확인하는 모바일 우선 코인 배틀 앱이다.

## 2. 현재 제품 상태

현재 실제 사용자 흐름은 아래다.

```text
랜딩 (/)
  -> 홈 (/home)
  -> 배틀 (/battle/[coinId])
  -> 선택 (/battle/[coinId]/pick)
  -> 대기 (/battle/[coinId]/waiting)
  -> 결과 (/battle/[coinId]/result)
  -> 캐릭터 (/characters)
  -> 로그인 (/login)
  -> 내 정보 (/me)
  -> 운영 battle (/admin/battles)
  -> 운영 memo (/admin/memos)
```

핵심 포인트:

- 시간프레임은 `5m`, `30m`, `1h`, `4h`, `24h`, `7d` 여섯 가지다.
- 결과는 더 이상 데모 수치가 아니라 Bybit entry/settlement candle close 기반이다.
- `/me`는 인증 사용자 battle archive 역할을 한다.
- `/admin/memos`까지 들어오면서 운영자가 reusable memo와 lesson을 조회할 수 있다.

## 3. 실구현 구조

이 저장소는 Next.js App Router 위에 layered 구조를 얹은 형태다.

- `src/app`
  - 라우트와 API route
- `src/presentation`
  - UI 컴포넌트, hooks, client store
- `src/application`
  - 유스케이스, 프롬프트, 포트
- `src/domain`
  - Zod 스키마와 도메인 모델
- `src/infrastructure`
  - 외부 API, 파일 저장소, Supabase persistence, 인증 유틸
- `src/features/characters`
  - 캐릭터 feature 묶음
- `src/shared`
  - 상수, 캐시 정책, 공용 유틸

## 4. battle 실행 구조

현재 battle 흐름의 핵심은 두 가지다.

### 1. 4라운드 병렬 토론

- `Aira + Ledger`
- `Judy + Shade`
- `Clover + Vela`
- `Blaze + Flip`

이전의 8명 완전 직렬보다 체감 대기 시간을 많이 줄인 구조다.

### 2. `battle_pick_ready` 기반 조기 선택

- bull 2명, bear 2명 메시지가 모이면 `battle_pick_ready` 이벤트가 열린다.
- 사용자는 8명 전체 완료 전에 pick 단계로 이동할 수 있다.
- 지금 사용자 체감 속도에서 더 중요한 지표는 `battle_complete`보다 `pick-ready` 시점이다.

## 5. prepared context와 prewarm

현재 배틀 속도 개선의 핵심은 prepared context다.

- `getPreparedBattleContext()`는 다음을 만든다.
  - `marketData`
  - `summary`
  - `reusableDebateContext`
  - `preparedEvidence`
  - `firstTurnDrafts`
- 현재 opening round 캐릭터인 `Aira`, `Ledger` 초안을 먼저 예열한다.
- 이 결과는 `database/data/battle_prep_cache.json`에 coinId 기준으로 저장된다.

현재 정책:

- soft TTL: 2분
- hard TTL: 10분
- prewarm 기본 coin: `bitcoin`, `ethereum`, `xrp`, `solana`
- prewarm 동시성: 2

의미:

- warm battle은 매우 빨라졌다.
- 하지만 fresh prewarm wall-clock은 아직 더 줄여야 한다.

## 6. 실제 API 경계

### 인증

- `GET /api/auth/session`
- `POST /api/auth/signout`
- `POST /api/auth/merge-local`

### 코인

- `GET /api/coins/search`
- `GET /api/coins/top`

### battle

- `POST /api/battle`
- `GET/POST /api/battle/snapshot`
- `POST /api/battle/session`
- `GET/POST /api/battle/outcome`
- `GET/POST /api/battle/applications`
- `GET /api/battle/events`

### 캐릭터

- `GET /api/characters`

### 로그인 사용자

- `GET /api/me`
- `GET /api/me/progress`
- `GET /api/me/battles`
- `GET /api/me/battles/[battleId]`

### 운영

- `GET/POST /api/providers/routes`
- `POST /api/admin/cache/prewarm`
- `GET /api/admin/battles`
- `GET /api/admin/battles/[battleId]`

## 7. 저장 구조

### 1. localStorage

- `ant_gravity_recent_coins`
- `ant_gravity_battle_snapshot`
- `ant_gravity_user_battle`
- `ant_gravity_user_level:[userId]`
- `ant_gravity_applied_battle_results`
- `ant_gravity_battle_timing_metrics`

### 2. 서버 파일 저장

- `database/data/source_cache.json`
- `database/data/battle_prep_cache.json`
- `database/data/battle_snapshot_store.json`
- `database/data/seed_store.json`
- `database/data/report_store.json`
- `database/data/event_log.json`
- `database/data/battle_result_applications.json`

### 3. Supabase 미러 저장

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

## 8. 인증과 owner 규칙

현재 owner 규칙은 단순 guest local 앱이 아니다.

- 로그인 상태면 Supabase auth user id를 owner로 사용
- 비로그인이면 `ant_gravity_user_id` guest 쿠키를 owner로 사용
- `getRequestOwnerId()`가 이 규칙을 공통화

또 `/me` 진입 시 `MergeLocalStateClient`가 아래를 계정으로 병합한다.

- local user level
- recent coins
- 현재 `userBattle`
- 현재 `battleSnapshot`
- guest owner 기준으로 파일 저장소에 남은 battle 자산

즉 `/me`는 단순 프로필 페이지가 아니라 guest -> auth 병합 허브다.

## 9. 현재 모델 배치

### 불리시 팀

- `aira`: `stepfun/step-3.5-flash:free`
- `judy`: `arcee-ai/trinity-large-preview:free`
- `clover`: `nvidia/nemotron-3-super-120b-a12b:free`
- `blaze`: `minimax/minimax-m2.5:free`

### 베어리시 팀

- `ledger`: `stepfun/step-3.5-flash:free`
- `shade`: `arcee-ai/trinity-large-preview:free`
- `vela`: `arcee-ai/trinity-large-preview:free`
- `flip`: `nvidia/nemotron-3-super-120b-a12b:free`

### 공통 fallback

- 전원 `qwen/qwen3.5-9b`

### 최종 리포트

- `gemini-2.5-pro`

## 10. 현재 중요한 기술 판단

`memory.md`와 실제 코드 기준으로 지금 가장 중요한 판단은 아래다.

1. 첫 발언 단축만으로는 부족하고, 사용자가 언제 pick 가능한지가 더 중요하다.
2. opening round prewarm은 현재 비용 대비 효과가 좋다.
3. 무료 OpenRouter 모델 병목은 프롬프트보다 availability와 latency 편차 쪽 영향이 더 크다.
4. Gemini는 토론 본문 직접 주입이 아니라 battle 이후 lesson seed 경로에 더 가깝다.

## 11. 현재 가장 큰 리스크

### 1. 무료 OpenRouter 모델 안정성

반복 이슈:

- `429 Rate limit exceeded`
- `404` 죽은 모델
- `non_korean_response`
- `message_parse_failed`

즉 battle 병목은 문장 품질보다 모델 availability와 실패 편차다.

### 2. prewarm wall-clock

- warm battle은 빨라졌다.
- 하지만 fresh prewarm 자체는 여전히 무겁다.

### 3. 인코딩 깨짐

- 실제 소스의 일부 라벨과 문자열이 깨져 있다.
- 문서와 화면 가독성을 같이 해치고 있다.

### 4. 기준 문서 경로 드리프트

- AGENTS는 `docs/PRD.md`를 기준 문서로 말하지만 현재 저장소엔 그 파일이 없다.
- 지금은 `docs/planning/01-prd.md`가 실질 PRD 역할을 한다.

## 12. 다음 우선순위

1. `/battle/bitcoin` 반복 실측으로 첫 발언, pick-ready, 완료 시점 분포 재집계
2. `pickReadyAt`를 timing metrics에 추가
3. 캐릭터별 primary/fallback 실패율 로그 기반 재배치
4. prewarm 추가 경량화
5. 남은 UTF-8 깨짐 정리

## 13. 결론

이 프로젝트는 이미 단순 데모를 넘어서 battle 생성, 선택, 실정산, 아카이브, 운영 조회까지 연결된 상태다.

지금의 핵심 과제는 새 기능 추가보다 아래 세 가지다.

- 무료 모델 조합 안정화
- prewarm 비용 축소
- 문서/문자열/관측성 정합성 회복

## 14. 2026-03-23 추가 메모

이 아래 내용은 `memory.md`를 다시 끝까지 읽고 최신 상태 기준으로 덧붙인 정리다.
기존 9~12장은 2026-03-21 기준 베이스라인이고, 실제 최신 운영 판단은 이 섹션을 우선해서 보면 된다.

### 최신 운영 기준

- CTA 가독성 복구와 Supabase RLS 점검은 `master`에 선별 반영돼 있고 관련 커밋은 `618c411`이다.
- stream cleanup noisy abort 완화와 Aira / Ledger primary 분산도 반영돼 있고 관련 커밋은 `83a98bb`다.
- 현재 런타임 라우팅에서 핵심 opening pair는 아래처럼 분산된 상태다.
  - `aira`: `arcee-ai/trinity-mini`
  - `ledger`: `google/gemma-3-12b-it`
  - 두 캐릭터 fallback: `qwen/qwen3.5-9b`
- `/battle/bitcoin` 최근 실측 기준으로
  - 첫 발언 도착 약 `11.3초`
  - 약 `25초` 안에 `5/8 발언`과 `pick-ready` 확인
- 즉 예전의 `stepfun` 동시 장애 리스크는 줄었고, 지금은 모델별 출력 품질 편차가 더 큰 변수다.

### 아직 비커밋으로 남은 핵심 코드

- 아래 변경은 `memory.md` 기준 아직 커밋되지 않은 작업으로 분리해서 봐야 한다.
  - `src/application/prompts/characterPrompts.ts`
  - `src/application/useCases/generateBattleDebate.ts`
  - `src/application/useCases/generateBattleDebate.test.ts`
  - `src/app/battle/[coinId]/result/ResultPageClient.tsx`
- 목적은 세 가지다.
  - `aira`의 `message_parse_failed` 완화
  - `ledger`의 `non_korean_response` 완화
  - `/result` pending 상태에서 사용자 문맥 보강

### memory.md에서 다시 확인한 작업 원칙

- 응답은 반말, 한글만, 이모티콘 금지다.
- 워크트리가 매우 더럽기 때문에 이번 작업과 무관한 변경은 절대 되돌리면 안 된다.
- 코드 수정은 `apply_patch`만 사용한다.
- 각 단계마다 `docs/개발일지`, `docs/prompt` 기록을 남기는 흐름을 계속 유지한다.
- AGENTS는 `docs/PRD.md`를 기준 문서로 가리키지만, 실제 저장소에선 `docs/planning/01-prd.md`가 더 실질적인 기준 문서 역할을 한다.

### 지금 기준 핵심 해석

- 사용자가 느끼는 속도는 `battle_complete`보다 `pick-ready` 시점이 더 중요하다.
- opening round prewarm 자체는 방향이 맞고, `Aira + Ledger` 예열은 비용 대비 효과가 좋다.
- 현재 병목은 공통 모델 장애보다 캐릭터별 출력 형식 안정성, 한국어 응답 일관성, 파서 회복력 쪽으로 이동했다.
- warm battle은 많이 빨라졌지만 fresh prewarm wall-clock은 여전히 더 줄여야 한다.
- Gemini는 토론 본문 직접 주입보다 battle 이후 lesson seed를 통해 다음 토론 품질에 간접 영향을 준다.

### 바로 이어서 볼 우선순위

1. `git status`에서 비커밋 코드 4개와 런타임 산출물(`database/data`, `tmp`, `out`)을 먼저 분리해서 보기
2. prompt/parser/result pending UI 변경을 커밋할지 결정하기 전에 `/battle/bitcoin` 재실측으로 체감 확인
3. 재실측 시 특히 아래를 다시 보기
   - `aira`의 parse 실패 감소 여부
   - `ledger`의 영문 응답 감소 여부
   - `result` pending 상태의 설명 UI 체감
4. 필요하면 `waiting`의 `결과 화면 열기` 라벨도 실제 동작에 맞게 손보기

## 15. 2026-03-23 로그인 / `/me` 진행 추가 메모

### 이번 세션 구현 상태

- `/login`
  - 통합 로그인/회원가입 카피 반영
  - `Google`, `Kakao` OAuth 버튼 유지
  - `error=oauth_callback_failed` 안내 문구 추가
  - 디자인 규칙에 맞춰 2패널 구조로 리프레시
- `/me`
  - 프로필, XP, 등급, 승패를 상단에서 먼저 보이는 요약 대시보드 방향으로 조정
  - 최근 battle 기록은 5개 기준 압축
  - 상세는 선택 시 확장 구조 유지
- 헤더
  - 비로그인 CTA를 `로그인/회원가입`으로 맞추고 버튼군과 더 자연스럽게 섞이도록 카드형 스타일로 조정

### 현재 검증 메모

- `pnpm.cmd typecheck` 통과
- 변경 파일 기준 eslint 통과
- `pnpm.cmd test -- src/app/login/LoginPageClient.test.tsx`는 환경상 `spawn EPERM`으로 실행 불가
- 전체 `pnpm.cmd lint`는 기존 `tmp/` 산출물 때문에 실패하며, 이번 변경 원인은 아님

### 지금 가장 중요한 런타임 판단

- `localhost:3000` 전체 404는 페이지 코드보다 꼬인 dev 서버 프로세스 영향이 더 컸음
- 3000 점유 PID를 정리하고 `.next/dev/lock`을 지운 뒤, 로그인 클릭 시엔 Supabase env 관련 런타임 에러가 새로 보였음
- 하지만 `.env`, `.env.local`에는 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 실제로 존재함
- 따라서 새 세션 첫 우선순위는 코드 수정보다 dev 서버를 깨끗하게 재기동해서 env 로딩 상태부터 다시 확인하는 것이다
