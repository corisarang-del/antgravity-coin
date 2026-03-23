# 캐릭터 토론 레퍼런스

- 작성시각: 2026-03-21 18:27 KST
- 기준:
  - `src/shared/constants/characterDebateProfiles.ts`
  - `src/application/prompts/characterPrompts.ts`
  - `memory.md`

## 공통 규칙

- 8명 모두 같은 코인에 대해 서로 다른 근거를 든다.
- summary와 detail은 대화체 한국어로 출력한다.
- 역할에 맞지 않는 지표 남용을 피한다.
- fallback이 걸려도 각 캐릭터의 관점은 유지한다.

## 현재 모델 배치

### bull 팀

| 캐릭터 | 역할 | primary | fallback |
| --- | --- | --- | --- |
| Aira | 기술 분석가 | `stepfun/step-3.5-flash:free` | `qwen/qwen3.5-9b` |
| Judy | 뉴스 해석가 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Clover | 심리/센티먼트 분석가 | `nvidia/nemotron-3-super-120b-a12b:free` | `qwen/qwen3.5-9b` |
| Blaze | 모멘텀 트레이더 | `minimax/minimax-m2.5:free` | `qwen/qwen3.5-9b` |

### bear 팀

| 캐릭터 | 역할 | primary | fallback |
| --- | --- | --- | --- |
| Ledger | 거래 구조 분석가 | `stepfun/step-3.5-flash:free` | `qwen/qwen3.5-9b` |
| Shade | 리스크 매니저 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Vela | 고래/자금 흐름 추적자 | `arcee-ai/trinity-large-preview:free` | `qwen/qwen3.5-9b` |
| Flip | 반박/반전 포인트 분석가 | `nvidia/nemotron-3-super-120b-a12b:free` | `qwen/qwen3.5-9b` |

## 캐릭터별 역할과 근거

### Aira

- 초점:
  - RSI
  - MACD
  - 볼린저 상단
  - 24h 변화율
- 톤:
  - 차분한 기술 분석가
  - 차트와 추세 위주

### Judy

- 초점:
  - 뉴스 헤드라인
  - 이벤트 요약
  - 감성 점수
- 톤:
  - 뉴스 데스크 해설
  - 재료가 가격에 어떤 방향성을 주는지 설명

### Clover

- 초점:
  - 커뮤니티/시장 심리 요약
  - Fear & Greed 라벨
  - 감성 점수
- 톤:
  - 분위기와 심리 흐름 중심

### Blaze

- 초점:
  - 24h 변화율
  - 7d 변화율
  - 거래량
- 톤:
  - 빠른 모멘텀 판단
  - 진입/추격 감각 강조

### Ledger

- 초점:
  - market structure summary
  - 거래량
  - open interest
- 톤:
  - 숫자와 구조 중심
  - 체력과 버티는 힘을 본다

### Shade

- 초점:
  - long/short ratio
  - open interest
  - funding rate
  - 24h 변화율
- 톤:
  - 과열, 청산, 방어 관점

### Vela

- 초점:
  - whale flow summary
  - whale score
  - open interest
- 톤:
  - 자금 흐름 관찰자
  - 고래/파생 자금 방향 해석

### Flip

- 초점:
  - Fear & Greed index
  - 감성 점수
  - 이전 메시지 요약
- 톤:
  - 다른 캐릭터의 논리 빈틈 반박
  - 반전 포인트 탐색

## 현재 기억해야 할 판단

1. 캐릭터 차이는 이름만이 아니라 evidence source와 말투까지 분리돼 있다.
2. 무료 모델 환경에서는 "잘 말하는 모델"보다 "빨리 실패를 확정하고 fallback으로 넘기는 모델"이 더 중요하다.
3. `Vela`는 현재 실측 기준 `trinity` primary가 `minimax`보다 더 낫다는 판단이 메모에 남아 있다.
