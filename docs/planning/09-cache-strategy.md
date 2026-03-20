# 캐시 전략

- 작성시각: 2026-03-21 03:01 KST
- 기준: `cachePolicy`, `preparedBattleContext`, `useBattleSnapshot`, `useUserBattle`

## 대상

- `database/data/source_cache.json`
- `database/data/battle_prep_cache.json`
- `database/data/battle_snapshot_store.json`
- localStorage `ant_gravity_battle_snapshot`
- localStorage `ant_gravity_user_battle`
- localStorage `ant_gravity_battle_timing_metrics`

## 1. source cache

### `source_cache.json`

- 목적
  - 시장, 심리, 뉴스, 파생 데이터를 soft/hard TTL로 재사용

### TTL 정책

- market seed
  - soft 2분
  - hard 10분
- fear greed
  - soft 1시간
  - hard 6시간
- news sentiment
  - soft 15분
  - hard 2시간
- derivatives
  - soft 2분
  - hard 10분

### 동작

- soft fresh면 그대로 사용
- hard fresh면 stale 응답 허용 후 갱신 가능
- hard expired면 동기 재조회

## 2. prepared battle context

### `battle_prep_cache.json`

- 목적
  - battle 시작 전 재사용할 prepared context 저장

### 현재 저장 내용

- `marketData`
- `summary`
- `reusableDebateContext`
- `preparedEvidence`
- `firstTurnDrafts`
- `preparedAt`

### 현재 전략

- opening round 캐릭터 `Aira`, `Ledger` 초안이 핵심
- soft TTL 2분
- hard TTL 10분
- soft fresh면 그대로 사용
- hard fresh면 기존 값을 먼저 쓰고 background refresh 가능
- hard expired면 fresh build 필요

### 관련 API / 헤더

- `POST /api/admin/cache/prewarm`
- `POST /api/battle`
- `x-battle-prepared-context-hit`
- `x-battle-prepared-first-turn-hit`
- `x-battle-prepared-at-age-ms`

## 3. prewarm 운영 정책

- 기본 prewarm coin
  - `bitcoin`
  - `ethereum`
  - `xrp`
  - `solana`
- 최대 동시성
  - 2

메모:

- warm battle 자체는 빨라졌지만 fresh prewarm wall-clock은 아직 최적화 여지가 남아 있다.

## 4. 클라이언트 snapshot

### localStorage `ant_gravity_battle_snapshot`

- 목적
  - pick/result 단계 즉시 복원
- 저장 시점
  - 메시지 수신마다 저장
  - `battle_complete` 후 서버 저장 결과와 함께 재저장
- TTL
  - 10일
- 폐기 조건
  - version mismatch
  - `coinId` mismatch
  - TTL 만료

## 5. 클라이언트 userBattle

### localStorage `ant_gravity_user_battle`

- 목적
  - waiting/result 단계 선택 상태 복원
- TTL
  - `5m`: 90분
  - `30m`: 3시간
  - `1h`: 4시간
  - `4h`: 12시간
  - `24h`: 36시간
  - `7d`: 10일
- 폐기 조건
  - `coinId` mismatch
  - 선택 시각 기준 TTL 만료

## 6. 서버 snapshot 저장

### `battle_snapshot_store.json`

- 목적
  - localStorage 없이도 정산 시 메시지 복원
- 핵심 규칙
  - `snapshotId` 기준 저장
  - owner mismatch 저장 금지
  - pick 시점에 `battleId`를 다시 연결
  - 정산 시 `owner + snapshotId + battleId` 정합성 확인
  - 로그인 사용자는 Supabase `battle_snapshots`도 함께 upsert

## 7. timing metrics

### localStorage `ant_gravity_battle_timing_metrics`

- 현재 저장 값
  - `requestStartedAt`
  - `marketDataReadyAt`
  - `firstCharacterStartedAt`
  - `firstMessageDisplayedAt`
  - `debateCompletedAt`
  - `preparedContextHit`
  - `preparedFirstTurnHit`
  - `preparedAtAgeMs`

### 현재 빈칸

- `pickReadyAt`은 아직 저장하지 않음

## 8. 현재 한계

- prewarm fresh 생성 시간이 여전히 크다.
- snapshot / prep cache 정리 정책은 아직 약하다.
- 다중 인스턴스 운영에는 파일 저장소보다 DB가 더 적합하다.
