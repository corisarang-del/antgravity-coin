# PRD: Ant Gravity Coin

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 구현된 화면, API, 저장 구조

## 제품 한 줄 정의

8명의 AI 캐릭터가 같은 코인을 bull / bear 관점으로 토론하고, 사용자가 실제 Bybit 캔들 결과로 자신의 선택을 검증하는 모바일 우선 코인 battle 앱.

## 핵심 문제

사용자는 코인에 대한 서로 다른 관점과 근거를 빠르게 비교하기 어렵다. 또 본인의 판단이 맞았는지 결과로 복기하기도 어렵다.

## 현재 해결 방식

1. 코인을 고른다.
2. AI 캐릭터 8명이 역할별 근거로 토론한다.
3. 사용자는 조기 선택 또는 전체 시청 후 선택한다.
4. 실제 Bybit 캔들 종가로 정산한다.
5. XP와 리포트로 결과를 복기한다.
6. 로그인 사용자는 `/me`에서 battle 아카이브를 다시 본다.

## 현재 구현 범위

### 공개 화면

- `/`
- `/home`
- `/battle/[coinId]`
- `/battle/[coinId]/pick`
- `/battle/[coinId]/waiting`
- `/battle/[coinId]/result`
- `/characters`
- `/login`

### 로그인 사용자 화면

- `/me`

### 운영 화면

- `/admin/battles`
- `/admin/memos`

## 현재 battle 구조

- 8명 완전 직렬이 아니라 4라운드 병렬 구조
- 라운드 조합:
  - `Aira + Ledger`
  - `Judy + Shade`
  - `Clover + Vela`
  - `Blaze + Flip`
- `battle_pick_ready`는 bull 2개, bear 2개 메시지가 모이면 먼저 열린다.
- 즉 전체 완료보다 선택 가능 시점을 앞당기는 구조다.

## 현재 결과 구조

- 시간프레임:
  - `5m`
  - `30m`
  - `1h`
  - `4h`
  - `24h`
  - `7d`
- 정산 기준:
  - entry: 선택 시점 Bybit entry candle close
  - settlement: 기간 종료 시점 Bybit settlement candle close
  - price source: `bybit-linear`

## 현재 제품 강점

- 토론, 선택, 정산, XP, 리포트, 아카이브까지 한 루프로 이어진다.
- `/me`에서 로그인 사용자 battle 기록을 다시 볼 수 있다.
- opening round prewarm과 `battle_pick_ready`로 체감 대기 시간이 줄었다.

## 현재 제품 리스크

1. 무료 OpenRouter 모델 availability와 tail latency 편차가 크다.
2. `pickReadyAt`가 아직 metrics에 저장되지 않는다.
3. `/admin/*` 접근 제어가 아직 없다.
4. 일부 화면과 문서에 UTF-8 깨짐 흔적이 남아 있다.

## 현재 우선순위

1. `pickReadyAt` metrics 추가
2. 반복 실측으로 편차와 평균 기록
3. 캐릭터별 primary/fallback 조합 재검토
4. prewarm wall-clock 추가 최적화
5. 운영 접근 제어 보강
