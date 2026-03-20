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
