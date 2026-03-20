# Ant Gravity Coin 리서치 정리

작성일: 2026-03-20
기준 경로: `C:\Users\khc\Desktop\fastcampus\ant_gravity_coin`
참고 문서: `docs/planning/*`, `memory.md`, `docs/preview-hover-playbook.md`

## 1. 프로젝트 한 줄 정의

이 프로젝트는 8명의 AI 캐릭터가 하나의 코인을 서로 다른 관점으로 토론하고, 사용자가 bull 또는 bear를 선택한 뒤 실제 가격 변화 기준으로 승패와 XP를 확인하는 모바일 우선 코인 배틀 앱이다.

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
  -> 운영 (/admin/battles)
```

핵심 포인트:

- 배틀 시간프레임은 `5m`, `30m`, `1h`, `4h`, `24h`, `7d` 여섯 가지다.
- 결과 확인은 더 이상 단순 데모 화면이 아니라 실캔들 정산 기준으로 동작한다.
- `/me`와 `/admin/battles`가 추가되면서 battle archive와 운영 조회 기능이 실제로 들어와 있다.

## 3. 실구현 기준 구조

이 저장소는 단순 Next.js 화면 모음이 아니라 App Router 위에 레이어드 구조를 얹은 형태다.

- `src/app`
  - 라우트, API Route, 서버 페이지
- `src/presentation`
  - 재사용 UI, 훅, 클라이언트 상태
- `src/application`
  - 유스케이스, 포트, 프롬프트
- `src/domain`
  - 순수 모델
- `src/infrastructure`
  - 외부 API, 파일 저장소, 캐시, 런타임 설정
- `src/features/characters`
  - 캐릭터 feature 묶음
- `src/shared`
  - 상수, 유틸, 전역 규칙

## 4. 실제 API 경계

현재 핵심 API는 아래 묶음으로 보는 게 맞다.

- 인증/세션
  - `GET /api/auth/session`
  - `POST /api/auth/signout`
  - `POST /api/auth/merge-local`
- 코인 조회
  - `GET /api/coins/search`
  - `GET /api/coins/top`
- 배틀 실행/복원
  - `POST /api/battle`
  - `POST /api/battle/session`
  - `GET/POST /api/battle/snapshot`
  - `GET/POST /api/battle/outcome`
  - `GET/POST /api/battle/applications`
  - `GET /api/battle/events`
- 캐릭터
  - `GET /api/characters`
- 로그인 사용자
  - `GET /api/me`
  - `GET /api/me/progress`
  - `GET /api/me/battles`
  - `GET /api/me/battles/[battleId]`
- 운영
  - `GET/POST /api/providers/routes`
  - `POST /api/admin/cache/prewarm`
  - `GET /api/admin/battles`
  - `GET /api/admin/battles/[battleId]`

## 5. 저장 구조

현재 저장은 세 층으로 나뉜다.

### 1. localStorage

- `ant_gravity_recent_coins`
- `ant_gravity_battle_snapshot`
- `ant_gravity_user_battle`
- `ant_gravity_user_level`
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

### 3. 인증 사용자 Supabase 미러 저장

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

## 6. 배틀 실행과 캐시

현재 배틀 실행의 핵심은 prepared context다.

- `getPreparedBattleContext()`가 `marketData`, `summary`, `reusableDebateContext`, `preparedEvidence`, `firstTurnDrafts`를 준비한다.
- 이 결과는 `battle_prep_cache.json`에 coinId 기준으로 저장된다.
- `POST /api/battle`는 prepared first turn이 있으면 첫 발언을 즉시 재사용한다.
- 응답 헤더로 `x-battle-prepared-context-hit`, `x-battle-prepared-first-turn-hit`, `x-battle-prepared-at-age-ms`를 내려준다.

실측 메모:

- cold 상태 첫 `message` 도착 약 `291.3초`
- warm 상태 첫 `message` 도착 약 `222ms`
- 대신 `POST /api/admin/cache/prewarm` 자체는 약 `5.1분`으로 너무 무겁다

## 7. 인증과 owner 규칙

현재 owner 규칙은 단순 guest 쿠키 하나가 아니다.

- 로그인 상태면 Supabase auth user id를 owner로 사용
- 비로그인이면 `ant_gravity_user_id` guest 쿠키 사용
- `getRequestOwnerId()`가 이 계산을 공통화

또 `/me` 진입 시 `MergeLocalStateClient`가 아래를 계정으로 병합한다.

- local user level
- recent coins
- 현재 `userBattle`
- 현재 `battleSnapshot`
- guest owner로 파일 저장소에 남은 battle 자산

## 8. 현재 가장 큰 기술 리스크

`memory.md`와 실제 구현을 같이 보면 지금 우선 리스크는 아래 셋이다.

### 1. 무료 OpenRouter 모델 안정성

반복 이슈:

- `429 Rate limit exceeded: free-models-per-day`
- `404` 죽은 모델 응답
- `non_korean_response`
- `message_parse_failed`

즉 병목은 프롬프트보다 무료 모델 availability와 응답 품질이다.

### 2. prewarm 비용 과대

- warm battle은 매우 빨라졌다.
- 하지만 prewarm 자체가 너무 느려 운영 비용이 크다.
- 현재 구조는 첫 턴 속도 개선과 전체 준비 비용 사이의 균형이 아직 덜 잡혀 있다.

### 3. 문자열/인코딩 정리 미완료

- 일부 화면 문자열과 문서가 아직 깨져 보인다.
- 유지보수성과 QA 효율을 계속 깎는 문제다.

## 9. 다음에 개선해야 할 것

`research.md`와 `memory.md`를 합쳐 보면 다음 우선순위가 가장 타당하다.

1. 무료 OpenRouter 조합을 재정리해 dead model, 429, 비한글 응답 비율을 낮춰야 한다.
2. `/api/providers/routes` 런타임 override와 `/battle/bitcoin` 브라우저 실측을 묶어서 실제 체감 품질을 다시 검증해야 한다.
3. prewarm을 첫 턴 중심으로 더 가볍게 쪼개거나 지연 생성 구조로 바꿔야 한다.
4. auth merge, snapshot owner, battle session, outcome 복원 흐름의 통합 테스트를 보강해야 한다.
5. 사용자 노출 문자열과 문서의 UTF-8 깨짐을 정리해야 한다.

## 10. 결론

이 프로젝트는 이미 단순 MVP를 넘어섰다. 검색, 토론 스트리밍, 선택, 실정산, 결과 저장, 계정 병합, 운영 관찰까지 연결된 상태다.

지금의 핵심 과제는 새 기능 추가보다도 다음 세 가지다.

- 무료 모델 조합의 안정화
- prewarm 비용 축소
- 인증/복원/운영 흐름의 신뢰도 강화

## 11. Memory 동기화 기록

- 기록 시각: 2026-03-21 00:10 KST 확인, 2026-03-21 동기화 반영
- `memory.md` 기준으로 최근 세션의 핵심 변경 사항과 다음 우선순위를 다시 확인함
- 문서 기준은 계속 `docs/PRD.md`, `spec/*.md`이고, 사용자 응답 규칙은 반말/한글만/이모티콘 금지로 유지함
- 현재 가장 중요한 기술 판단은 그대로 유지함
  - 첫 발언 속도 개선 방향은 prepared context가 맞음
  - 진짜 병목은 프롬프트보다 무료 OpenRouter 모델의 가용성, 429, 응답 품질 불안정임
  - warm battle은 빨라졌지만 prewarm 자체는 여전히 무거움
  - Vela는 이번 실측 기준 `minimax`보다 `trinity`가 더 나았음
- 다음 세션 시작 시 우선 확인할 축도 그대로 유지함
  - `/battle/bitcoin` 재실측
  - 캐릭터별 primary/fallback 전환율 재집계
  - prewarm 추가 경량화
  - 남은 UTF-8 깨짐 정리

