# PRD: Ant Gravity Coin

- 작성시각: 2026-03-21 03:01 KST
- 기준:
  - `memory.md`
  - 현재 `src/`, `database/`, `supabase/` 구현
  - `docs/PRD.md`는 현재 저장소에 없어서 이 문서를 작업 기준 PRD로 사용

## 한 줄 설명

8명의 AI 캐릭터가 하나의 코인을 서로 다른 관점으로 토론하고, 사용자가 bull 또는 bear를 선택한 뒤 실제 Bybit 캔들 정산 결과로 승패와 XP를 확인하는 모바일 우선 코인 배틀 앱.

## 현재 구현 범위

- 공개 라우트
  - `/`
  - `/home`
  - `/battle/[coinId]`
  - `/battle/[coinId]/pick`
  - `/battle/[coinId]/waiting`
  - `/battle/[coinId]/result`
  - `/characters`
  - `/login`
- 로그인 사용자 라우트
  - `/me`
- 운영 라우트
  - `/admin/battles`
  - `/admin/memos`

## 해결하려는 문제

1. 투자자는 차트, 뉴스, 심리, 파생 지표를 한 번에 비교하기 어렵다.
2. 분석을 읽고 끝나는 경우가 많아서 자기 판단을 복기하기 어렵다.
3. 재방문 동기를 만드는 게임형 구조가 약하다.

이 제품은 역할이 분리된 8명의 캐릭터 토론과 결과 복기 구조로 이 문제를 줄인다.

## 핵심 루프

```text
랜딩 진입
  -> 홈에서 검색 또는 Top 코인 선택
  -> 배틀 화면에서 시장 요약과 토론 시청
  -> 핵심 논거가 모이면 pick 화면으로 이동
  -> bull / bear + 시간프레임 선택
  -> waiting 화면에서 정산 시각 대기
  -> result 화면에서 실제 Bybit 캔들 기준 승패와 XP 확인
  -> 로그인 사용자는 /me 에서 배틀 아카이브 재확인
```

## 현재 배틀 구조

- 캐릭터는 8명이고 4라운드 병렬 구조로 발언한다.
  - `Aira + Ledger`
  - `Judy + Shade`
  - `Clover + Vela`
  - `Blaze + Flip`
- `battle_pick_ready`는 bull 2명, bear 2명이 발언하면 열린다.
- 사용자는 8명 발언을 모두 기다리지 않고도 pick 단계로 이동할 수 있다.
- `battle_complete` 후에는 전체 토론 snapshot을 서버에도 저장한다.

## 시간프레임과 결과 판정

- 지원 시간프레임
  - `5m`
  - `30m`
  - `1h`
  - `4h`
  - `24h`
  - `7d`
- 정산 기준
  - 진입가: 선택 시점 Bybit entry candle close
  - 정산가: timeframe 종료 시점 Bybit settlement candle close
  - 상승이면 bull 승, 하락이면 bear 승, 0이면 draw
- 데모용 가짜 결과가 아니라 `fetchBattleSettlement()` 기반 실정산 흐름이다.

## 데이터 소스

- CoinGecko
  - 검색
  - Top 코인
  - 가격, 거래량, 시총, 24h/7d 변화
  - RSI, MACD, 볼린저 계산용 가격 히스토리
- Alternative.me
  - Fear & Greed
- Alpha Vantage -> GDELT -> NewsAPI
  - 뉴스 감성
  - 헤드라인 요약
- Bybit
  - long/short ratio
  - 실제 정산 캔들
- Hyperliquid
  - open interest
  - funding rate
  - whaleScore 계산용 입력
- OpenRouter
  - 8명 캐릭터 발언 생성
- Gemini
  - 최종 리포트와 lesson synthesis
- Supabase Auth / Postgres
  - 로그인
  - 인증 사용자 battle 자산 미러 저장

## 캐릭터와 현재 모델 배치

### 불리시 팀

| 캐릭터 | 역할 | primary | fallback |
| --- | --- | --- | --- |
| Aira | 기술분석가 | `stepfun/step-3.5-flash:free` | `qwen/qwen3.5-9b` |
| Judy | 뉴스 스카우터 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Clover | 심리 센티먼트 분석가 | `nvidia/nemotron-3-super-120b-a12b:free` | `qwen/qwen3.5-9b` |
| Blaze | 모멘텀 트레이더 | `minimax/minimax-m2.5:free` | `qwen/qwen3.5-9b` |

### 베어리시 팀

| 캐릭터 | 역할 | primary | fallback |
| --- | --- | --- | --- |
| Ledger | 거래 구조 분석가 | `stepfun/step-3.5-flash:free` | `qwen/qwen3.5-9b` |
| Shade | 리스크 매니저 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Vela | 고래 추적자 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Flip | 역발상 전략가 | `nvidia/nemotron-3-super-120b-a12b:free` | `qwen/qwen3.5-9b` |

### 최종 합성

- 최종 리포트 생성 route는 `gemini-2.5-pro`
- Gemini는 승패를 다시 판정하지 않고, 이미 정해진 결과를 설명하고 lesson을 합성한다.

## 저장 원칙

- 민감 정보와 GPS는 저장하지 않는다.
- 요청 owner는 `auth user id -> guest cookie id` 우선순위로 계산한다.
- 로컬 저장
  - 최근 본 코인
  - 현재 battle snapshot
  - 현재 userBattle
  - 사용자 레벨
  - 결과 적용 여부
  - timing metrics
- 서버 파일 저장
  - snapshot
  - prep cache
  - outcome seed
  - player decision seed
  - character memory seed
  - report
  - reusable memo
  - event log
- 로그인 사용자는 주요 battle 자산을 Supabase에도 미러 저장한다.

## 현재 제품 강점

- battle 진입부터 결과 정산까지 실제 흐름이 이어진다.
- `/me`에서 로그인 사용자 battle archive를 확인할 수 있다.
- `/admin/battles`, `/admin/memos`에서 운영자가 결과와 lesson을 조회할 수 있다.
- opening round prewarm과 `battle_pick_ready` 도입으로 체감 대기 시간이 많이 줄었다.

## 현재 핵심 리스크

1. OpenRouter 무료 모델의 가용성과 응답 품질 편차가 크다.
2. warm battle은 빨라졌지만 prewarm wall-clock은 아직 더 줄일 여지가 있다.
3. 일부 화면/소스 문자열 인코딩 깨짐이 남아 있다.
4. `docs/PRD.md` 경로가 실제 저장소와 어긋나 있다.

## 현재 우선순위

1. `/battle/bitcoin` 반복 실측으로 첫 발언, pick-ready, 완료 시점 분포를 다시 집계
2. 캐릭터별 primary/fallback 조합 실패율 재조정
3. `pickReadyAt` 메트릭 추가와 관측성 강화
4. prewarm 추가 경량화
5. 남은 UTF-8 깨짐 정리

## 품질 게이트

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
