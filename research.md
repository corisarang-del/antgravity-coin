# Ant Gravity Coin 리서치 정리

- 작성시각: 2026-03-21 18:27 KST
- 기준:
  - `memory.md`
  - 현재 `src/`, `database/`, `supabase/` 구현
  - `docs/planning/*`

## 1. 이 프로젝트를 지금 어떻게 봐야 하는가

Ant Gravity Coin은 단순 코인 정보 조회 앱이 아니다. 현재 구현 기준 핵심 루프는 아래 6단계다.

1. 코인을 고른다.
2. 8명의 AI 캐릭터가 bull / bear 관점으로 토론한다.
3. 사용자가 중간에 조기 선택하거나 끝까지 보고 선택한다.
4. 실제 Bybit 캔들 결과로 승패를 정산한다.
5. XP를 반영하고 결과 리포트를 읽는다.
6. 로그인 사용자는 `/me`에서 battle 기록과 상세를 다시 본다.

즉 이 제품의 중심은 "실시간 토론" 하나가 아니라 탐색, 선택, 정산, 복기, 재사용 가능한 lesson 축적까지 이어지는 운영형 루프다.

## 2. 현재 사용자 흐름

현재 App Router 기준 실제 화면 흐름은 아래와 같다.

```text
/ -> /home -> /battle/[coinId] -> /battle/[coinId]/pick -> /battle/[coinId]/waiting -> /battle/[coinId]/result
                 ├-> /characters
                 ├-> /login -> /me
                 ├-> /admin/battles
                 └-> /admin/memos
```

핵심 포인트:

- `/`는 브랜드 랜딩이다.
- 실제 탐색과 진입의 중심은 `/home`이다.
- `/battle/[coinId]`는 SSE 기반 실시간 토론 화면이다.
- `battle_pick_ready` 이벤트가 오면 8명 전부가 끝나기 전에도 `/pick`으로 넘어갈 수 있다.
- `/waiting`은 정산 직전 10초부터 outcome settlement를 미리 호출한다.
- `/result`는 verdict, 변화율, XP를 먼저 보여주고 report는 후행 생성한다.
- `/me`는 단순 프로필이 아니라 battle archive 화면이다.

## 3. battle 구조에서 중요한 구현 판단

### 3-1. 4라운드 병렬 구조

현재 `/api/battle`는 8명 완전 직렬이 아니라 아래 4라운드 병렬 구조다.

- `Aira + Ledger`
- `Judy + Shade`
- `Clover + Vela`
- `Blaze + Flip`

이 구조의 목적은 전체 완료 시간보다 "사용자가 선택 가능한 시점"을 앞당기는 데 있다.

### 3-2. 조기 선택 이벤트가 핵심이다

현재 `battle_pick_ready`는 bull 메시지 2개, bear 메시지 2개가 모이면 먼저 열린다.

이 프로젝트의 체감 속도에서 더 중요한 지표는 `battle_complete`보다 `pick-ready 시점`이다. 실제 코드도 그 방향으로 설계돼 있다.

### 3-3. prepared context와 opening round prewarm

속도 개선의 중심은 prepared context와 opening round prewarm이다.

- prepared context는 시장 데이터, summary, reusable debate context, prepared evidence, first turn draft를 담는다.
- 현재 first turn draft prewarm 대상은 `Aira`, `Ledger` 2명이다.
- prewarm 캐시 대상 기본 코인은 `bitcoin`, `ethereum`, `xrp`, `solana`다.
- prewarm 동시성은 `2`다.

### 3-4. timing metrics 현황

현재 local timing metrics에는 아래 값이 저장된다.

- `requestStartedAt`
- `marketDataReadyAt`
- `firstCharacterStartedAt`
- `firstMessageDisplayedAt`
- `debateCompletedAt`
- `preparedContextHit`
- `preparedFirstTurnHit`
- `preparedAtAgeMs`

아직 없는 값:

- `pickReadyAt`

## 4. 현재 캐릭터 시스템 해석

8명은 서로 다른 역할과 근거 소스를 가진다.

- `Aira`: 기술 지표
- `Judy`: 뉴스와 이벤트 재료
- `Clover`: 심리와 커뮤니티 분위기
- `Blaze`: 모멘텀과 거래량
- `Ledger`: 거래 구조와 체력
- `Shade`: 리스크와 과열
- `Vela`: 고래/파생 자금 흐름
- `Flip`: 이전 주장 반박과 반전 포인트

현재 모델 배치는 다음과 같다.

### bull 팀

- `aira`: `stepfun/step-3.5-flash:free`
- `judy`: `arcee-ai/trinity-large-preview:free`
- `clover`: `nvidia/nemotron-3-super-120b-a12b:free`
- `blaze`: `minimax/minimax-m2.5:free`

### bear 팀

- `ledger`: `stepfun/step-3.5-flash:free`
- `shade`: `arcee-ai/trinity-large-preview:free`
- `vela`: `arcee-ai/trinity-large-preview:free`
- `flip`: `nvidia/nemotron-3-super-120b-a12b:free`

### 공통 fallback

- 전원 `qwen/qwen3.5-9b`

현재 병목은 프롬프트보다 무료 모델 availability와 tail latency 쪽이 더 크다.

반복 이슈:

- `429 rate_limit_exceeded`
- `404` 죽은 모델
- `non_korean_response`
- `message_parse_failed`

## 5. 데이터 소스와 결과 정산

현재 구현된 주요 데이터 소스는 아래와 같다.

- CoinGecko
- Alternative.me
- Alpha Vantage / GDELT / NewsAPI
- Bybit
- Hyperliquid
- OpenRouter
- Gemini
- Supabase

결과 정산은 현재 `bybit-linear` 고정이다.

## 6. 결과 화면 구조 해석

`/result`는 현재 한 번에 모든 걸 기다리지 않는다.

1. 기존 outcome이 있으면 먼저 읽는다.
2. 없으면 `mode: "settlement"`로 verdict, 변화율, XP용 seed를 먼저 만든다.
3. report가 없으면 `mode: "full"`로 report와 reusable memo를 후행 생성한다.

즉 결과 UX는 "정산 먼저, report 나중" 구조다.

timeout:

- Bybit timeout: `4000ms`
- Gemini lesson synthesis timeout: `3500ms`

## 7. 인증, owner, `/me`

현재 owner 규칙:

- 로그인 상태면 `auth user id`
- 비로그인 상태면 guest cookie id

`POST /api/auth/merge-local`는 local level, recent coins, `userBattle`, `battleSnapshot`, guest battle 자산을 로그인 계정으로 병합한다.

`/me`는 로그인 사용자 archive 화면이다.

- battle 목록 조회
- 특정 battle 상세 조회
- outcome, snapshot, player decision, character memory 확인

## 8. 저장 구조

### localStorage

- `ant_gravity_recent_coins`
- `ant_gravity_battle_snapshot`
- `ant_gravity_user_battle`
- `ant_gravity_user_level:[userId]`
- `ant_gravity_applied_battle_results`
- `ant_gravity_battle_timing_metrics`

### JSON 파일

- `database/data/source_cache.json`
- `database/data/battle_prep_cache.json`
- `database/data/battle_snapshot_store.json`
- `database/data/seed_store.json`
- `database/data/report_store.json`
- `database/data/event_log.json`
- `database/data/battle_result_applications.json`

### Supabase 미러

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

## 9. 운영 도구와 보안 상태

운영 화면과 API:

- `/admin/battles`
- `/admin/memos`
- `GET /api/admin/battles`
- `GET /api/admin/battles/[battleId]`
- `POST /api/admin/cache/prewarm`
- `GET/POST /api/providers/routes`

최근 반영된 보안 보강:

- `/api/battle`: 분당 5회
- `/api/battle/outcome`: 분당 10회
- `/api/admin/cache/prewarm`: 분당 2회
- `snapshot`, `outcome`, `events`는 owner snapshot 기준 battleId 조회 제한

아직 남은 보안 이슈:

- `/admin/*` 접근 제어 미구현
- rate limit은 in-memory라 단일 인스턴스 기준

## 10. 현재 테스트 지형

현재 battle 핵심 경로에는 테스트가 있다.

- `/api/battle`
- `/api/battle/snapshot`
- `/api/battle/session`
- `/api/battle/outcome`
- `/api/battle/events`
- `/api/auth/merge-local`
- `/api/admin/cache/prewarm`
- `/api/admin/battles`
- `/api/admin/battles/[battleId]`
- `llmRouter`
- `preparedBattleContext`
- `prewarmMarketCache`
- `fetchBattleSettlement`
- `requestRateLimiter`

반대로 아직 빈 곳:

- `pickReadyAt` metrics 없음
- waiting/result UI 자동 흐름 테스트 없음
- `/api/me*`, `/api/auth/session`, `/api/auth/signout` 테스트 없음
- `/admin/*` 권한 테스트 없음

## 11. 남은 핵심 과제

1. `pickReadyAt`를 timing metrics에 추가
2. `/battle/bitcoin` 반복 실측으로 편차 확인
3. `judy`, `blaze` primary 후보 재실측
4. prewarm wall-clock 추가 축소
5. `/admin/*` 접근 제어 추가
6. 남아 있는 UTF-8 깨짐 정리

## 12. 문서 기준 메모

- AGENTS에는 기준 문서가 `docs/PRD.md`로 적혀 있지만 현재 저장소에는 그 파일이 없다.
- 현재 실무 기준 PRD 역할은 `docs/planning/01-prd.md`가 대신하고 있다.
