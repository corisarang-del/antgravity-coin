# 캐릭터 토론 설정 기준서

수정 기준 파일: `src/shared/constants/characterDebateProfiles.ts`

이 파일 하나를 수정하면 아래 항목이 같이 바뀐다.

- 캐릭터별 기본 모델 / fallback 모델 / timeout
- 어떤 시장 데이터 필드를 근거로 쓰는지
- 역할 프롬프트와 한글 출력 규칙
- fallback 토론 문구

실데이터가 비는 경우 동작:

- 배틀 전체를 즉시 중단하지 않는다.
- 해당 캐릭터에게 필요한 근거 소스가 하나라도 비면 그 캐릭터는 분석 대신 사과 메시지를 출력한다.
- 사과 메시지 기본 문구:
  - `지금 의견을 제시하지 못해서 죄송합니다.`
  - `다음번에 하겠습니다.`
- 다른 캐릭터들은 남은 실데이터 기준으로 계속 진행한다.

## 뉴스 감성 파이프라인

현재 구현은 아래 순서의 멀티 뉴스 감성 파이프라인을 사용한다.

1. `Alpha Vantage NEWS_SENTIMENT`
   - 장점: 공식적으로 crypto ticker 필터를 지원하고, 기사별 sentiment 정보를 함께 제공한다.
   - 단점: 무료 호출량 제한이 있고, 키가 필요하다.
2. `GDELT DOC 2.0`
   - 장점: 키 없이 글로벌 뉴스 검색이 가능하고 tone 기반 필터가 있다.
   - 단점: crypto 전용 sentiment API가 아니라 직접 질의와 점수화를 설계해야 한다.
3. `NewsAPI`
   - 장점: 기사 검색이 단순하고 개발용 무료 키 발급이 쉽다.
   - 단점: sentiment를 직접 계산해야 하고, crypto 특화 메타데이터가 약하다.

현재 적용 방식:

- `Alpha Vantage NEWS_SENTIMENT` 1순위
- `GDELT DOC 2.0` 2순위
- `NewsAPI` 3순위
- 앞선 소스가 실패하거나 키가 없으면 다음 소스로 넘어간다

근거 소스 표기 규칙:

- `실호출`: 외부 API를 직접 호출해서 얻는 값
- `실데이터 기반 계산`: 외부 API에서 받은 실제 시계열이나 응답값을 내부 계산식으로 가공한 값

표시 위치 메모:

- `summary`
  - 배틀 피드
  - 현재 스포트라이트
  - 승리 팀 핵심 발언 후보
  - CharacterMemorySeed
- `detail`
  - 배틀 피드
  - 현재 스포트라이트
  - CharacterMemorySeed
- `indicatorLabel`, `indicatorValue`
  - 배틀 피드 우측 상단
  - 승리 팀 핵심 발언
  - CharacterMemorySeed

## Aira

- 모델: `openrouter / stepfun/step-3.5-flash:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `rsi` from CoinGecko 30일 가격 히스토리 `(실데이터 기반 계산)`
  - `macd` from CoinGecko 30일 가격 히스토리 `(실데이터 기반 계산)`
  - `bollingerUpper` from CoinGecko 30일 가격 히스토리 `(실데이터 기반 계산)`
  - `priceChange24h` from CoinGecko `(실호출)`
- 역할 프롬프트: 기술분석가처럼 RSI, MACD, 볼린저, 추세와 거래량 패턴을 우선해서 본다.

## Judy

- 모델: `openrouter / minimax/minimax-m2.5:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `sentimentScore` from 뉴스 감성 파이프라인 `(Alpha Vantage 1순위 -> GDELT -> NewsAPI)`
  - `priceChange24h` from CoinGecko `(실호출)`
  - `priceChange7d` from CoinGecko `(실호출)`
- 역할 프롬프트: 뉴스 스카우터처럼 뉴스, 공시, 일정, 정책 변화가 가격을 밀 수 있는지 본다.

## Clover

- 모델: `openrouter / nvidia/nemotron-3-super-120b-a12b:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `fearGreedIndex` from Alternative.me `(실호출)`
  - `fearGreedLabel` from Alternative.me `(실호출)`
  - `sentimentScore` from 뉴스 감성 파이프라인 `(Alpha Vantage 1순위 -> GDELT -> NewsAPI)`
- 역할 프롬프트: 심리 센티먼트 분석가처럼 공포탐욕과 군중 심리, 커뮤니티 온도를 읽는다.

## Blaze

- 모델: `openrouter / openrouter/hunter-alpha`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `priceChange24h` from CoinGecko `(실호출)`
  - `priceChange7d` from CoinGecko `(실호출)`
  - `volume24h` from CoinGecko `(실호출)`
- 역할 프롬프트: 모멘텀 트레이더처럼 속도, 변동률, 거래량, 돌파 지속 가능성을 본다.

## Ledger

- 모델: `openrouter / nvidia/nemotron-3-super-120b-a12b:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `volume24h` from CoinGecko `(실호출)`
  - `priceChange24h` from CoinGecko `(실호출)`
  - `priceChange7d` from CoinGecko `(실호출)`
- 역할 프롬프트: 온체인 분석가처럼 현재 v1에서는 거래량과 가격 변화로 체력과 기대의 균형을 본다.

## Shade

- 모델: `openrouter / openrouter/hunter-alpha`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `longShortRatio` from Bybit 계정 비율 `(실호출)`
  - `openInterest` from Hyperliquid Asset Context `(실호출)`
  - `fundingRate` from Hyperliquid Asset Context `(실호출)`
  - `priceChange24h` from CoinGecko `(실호출)`
- 역할 프롬프트: 리스크 매니저처럼 롱숏 비율, 미결제약정, 펀딩비를 보고 먼저 방어 관점에서 말한다.

## Vela

- 모델: `openrouter / minimax/minimax-m2.5:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `whaleScore` from Hyperliquid 실데이터 기반 계산 `(실데이터 기반 계산)`
  - `volume24h` from CoinGecko `(실호출)`
  - `openInterest` from Hyperliquid Asset Context `(실호출)`
- 역할 프롬프트: 고래 추적자처럼 whaleScore, 거래 강도, 미결제약정 변화를 읽는다.

## Flip

- 모델: `openrouter / stepfun/step-3.5-flash:free`
- fallback: `openrouter / qwen/qwen3.5-9b`
- 근거 소스:
  - `fearGreedIndex` from Alternative.me `(실호출)`
  - `sentimentScore` from 뉴스 감성 파이프라인 `(Alpha Vantage 1순위 -> GDELT -> NewsAPI)`
  - 이전 캐릭터 요약 from `DebateMessage` `(실시간 토론 데이터)`
- 역할 프롬프트: 역발상 전략가처럼 다른 캐릭터 논리의 허점을 찾아 반대편 가능성을 제기한다.
