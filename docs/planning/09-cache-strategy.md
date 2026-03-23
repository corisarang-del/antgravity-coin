# 캐시 전략

- 작성시각: 2026-03-21 18:27 KST
- 기준:
  - `src/shared/constants/cachePolicy.ts`
  - `preparedBattleContext`
  - `prewarmMarketCache`

## 목표

1. 첫 발언까지의 대기 시간을 줄인다.
2. 동일 코인 재진입 시 준비 비용을 줄인다.
3. 결과 복구와 재방문을 빠르게 만든다.

## 현재 캐시 정책

### prewarm 기본값

- coin ids:
  - `bitcoin`
  - `ethereum`
  - `xrp`
  - `solana`
- 최대 동시성: `2`

### TTL

| 구간 | soft TTL | hard TTL |
| --- | --- | --- |
| market seed | 2분 | 10분 |
| fear greed | 1시간 | 6시간 |
| news sentiment | 15분 | 2시간 |
| derivatives | 2분 | 10분 |
| battle prep | 2분 | 10분 |

## prepared battle context

prepared context는 아래를 묶어서 battle 시작 전에 준비한다.

- `marketData`
- `summary`
- `reusableDebateContext`
- `preparedEvidence`
- `firstTurnDrafts`
- `preparedAt`

현재 first turn draft prewarm은 `Aira`, `Ledger` 중심이다.

## prewarm API

`POST /api/admin/cache/prewarm`

응답 결과 필드:

- `coinId`
- `ok`
- `symbol`
- `prepared`
- `cacheHit`
- `preparedAtAgeMs`
- `refreshQueued`
- `durationMs`
- `error`

현재 이 route는 분당 2회 rate limit이 있다.

## local 복구 캐시

### `battleSnapshot`

- 토론 메시지마다 local 저장
- `battle_complete` 후 서버 snapshot 저장 시도
- TTL: 10분

### `userBattle`

- 선택 직후 local 저장
- 시간프레임별 TTL 다름

### `battleTimingMetrics`

- battle 실행 중 단계별 시간 저장
- 아직 `pickReadyAt`는 없음

## 서버 쪽 캐시/저장

- `source_cache.json`: 외부 데이터 캐시
- `battle_prep_cache.json`: prepared context 저장
- `battle_snapshot_store.json`: 복구용 토론 스냅샷

## 현재 전략에서 중요한 판단

1. warm battle보다 fresh prewarm wall-clock이 여전히 더 무겁다.
2. 첫 발언 자체보다 `pick-ready`를 빠르게 여는 것이 더 중요하다.
3. prepared context와 opening round prewarm은 방향이 맞다.

## 남은 과제

1. `pickReadyAt` metrics 추가
2. refreshQueued 비율과 hit 비율 관측 강화
3. opening round 이후 준비를 더 늦출지 검토
4. snapshot / prep cache 정리 정책 추가
