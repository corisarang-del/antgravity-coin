# TASKS.md — 앤트배틀로그

> 최종 갱신일: 2026-03-16
> 기준: 현재 루트 코드 + 확정된 다음 단계 계획

## 문서 사용법

- `완료`: 이미 구현된 축
- `다음`: 바로 구현에 들어갈 순서
- `확장`: 멀티 provider, seed memory, event log까지 포함한 후속 단계

---

## 0. 현재 완료된 범위

### A. 앱 골격
- Next.js 앱 구성
- 테스트, 타입체크, 린트 스크립트 연결
- 랜딩 `/`
- 홈 `/home`
- 배틀/선택/대기/결과/캐릭터 라우트 구성

### B. 코인 탐색
- CoinGecko 검색 API
- Top 코인 API
- 최근 본 코인 로컬 저장

### C. 배틀 파이프라인
- `fetchMarketData`
- `getBattleMarketSnapshot`
- `generateBattleDebate`
- `/api/battle` SSE 응답

### D. 선택과 결과
- 팀 선택
- `24h`, `7d` 기간 선택
- `resolveBattle`
- 결과 중복 적용 방지
- 사용자 XP 갱신

### E. 캐릭터
- 로컬 캐릭터 카탈로그
- 외부 API 전환 가능한 저장소 팩토리
- 캐릭터 상세 모달

---

## 1. 바로 구현 순서

```text
S1 문구/인코딩 정리
  -> S2 실데이터 품질 개선
  -> S3 캐릭터 외부 연동 검증
  -> S4 seed / event log 초안
  -> S5 outcome / report 분리
  -> S6 provider router 초안
  -> S7 optimization 고도화
```

---

## 추가. 우선순위 A — 당장 해야 할 일

### A1. 문구와 화면 신뢰도 회복
- 깨진 한글 문구 정리
- `WinnerHighlight` 대표 메시지 선정 규칙 고정
- 선택 화면 설득력 강화

### A2. 데이터 품질과 결과 신뢰도 정비
- `fetchMarketData`의 실데이터/synthetic 경계 정리
- `priceChange7d` 정확도 개선
- 외부 API fallback 규칙 통일
- `fetchMarketData` 테스트 보강

### A3. 계약 정합성 정리
- `CHARACTERS_SOURCE=external` 실검증
- `/api/characters` 문서/테스트/구현 계약 일치화

메모:
- 이 우선순위는 기능 확장보다 현재 MVP의 신뢰도 회복을 먼저 처리하는 기준이다.
- 기존 `Step 1`~`Step 3`과 연결되지만, 별도 실행 우선순위로 읽는다.

---

## 추가. 우선순위 B — 나중에 해도 되는 일

### B1. 멀티에이전트 구조 확장
- 멀티 provider 라우팅
- seed memory
- event log
- outcome 계층 분리
- report 모델/저장

### B2. 운영 고도화
- optimization 메트릭
- shadow evaluation
- cheap / balanced / premium 티어링 전략

### B3. 사용자 경험 확장
- 장기 대기 UX
- 푸시 알림
- 개인화와 장기 회고 구조

메모:
- 이 범위는 중요하지만, 현재 검색-배틀-선택-결과 루프의 신뢰도를 먼저 안정화한 뒤 들어가는 것이 맞다.

---

## 추가. 위험도 높은 작업

- 높음 / `fetchMarketData` 실데이터 전환: 결과 판정 로직과 회귀 테스트 범위가 같이 흔들릴 수 있다.
- 높음 / 결과 계산 규칙 변경: XP, 승패, 사용자 신뢰도에 직접 영향이 간다.
- 높음 / `/api/characters` 계약 수정: 화면, 테스트, 외부 API 연동이 동시에 깨질 수 있다.
- 높음 / 결과 저장소 변경: 중복 XP 반영 버그가 생기기 쉽다.
- 높음 / 멀티 provider 도입: 비용, 응답 형식, fallback 복잡도가 급격히 증가한다.
- 높음 / seed/event/outcome/report 대형 구조 개편: MVP 단계에 과복잡화를 유발할 수 있다.

메모:
- 위험도가 높다는 뜻은 하지 말아야 한다는 의미가 아니라, 테스트와 단계 분리가 반드시 필요하다는 뜻이다.

---

## 2. Step 1 — UI 안정화

### S1-1. 깨진 한글 문구 정리
- 대상:
  - `src/app/home/page.tsx`
  - `src/app/battle/[coinId]/waiting/WaitingPageClient.tsx`
  - `src/app/battle/[coinId]/result/ResultPageClient.tsx`
  - 테스트 파일 설명문
- 목표:
  - 사용자 노출 문자열 전부 정상 한글화
- TDD:
  1. 주요 화면 렌더 텍스트 테스트 보강
  2. 문구 수정

### S1-2. 결과 하이라이트 기준 고정
- 대상:
  - `WinnerHighlight`
  - 관련 유틸 또는 use case
- 목표:
  - 승리 팀에서 어떤 메시지를 대표 하이라이트로 고를지 규칙 명시

### S1-3. 선택 화면 설득력 강화
- 대상:
  - `TeamSummaryCard`
  - pick 페이지 카피
- 목표:
  - 팀별 차이를 더 분명히 보여주기

---

## 3. Step 2 — 실데이터 품질 개선

### S2-1. `fetchMarketData` 입력값 정리
- 목표:
  - 현재 어떤 값이 실데이터고 어떤 값이 synthetic인지 명확히 분리

### S2-2. synthetic price 의존도 축소
- 목표:
  - `priceChange7d` 정확도 개선
  - 시계열 기반 계산으로 이동할 준비

### S2-3. 외부 API fallback 규칙 정리
- 대상:
  - CoinGecko
  - Alternative.me
  - CryptoPanic
  - Coinglass
- 목표:
  - 실패 시 어떤 값을 어떻게 채우는지 일관화

### S2-4. `fetchMarketData` 테스트 확장
- 목표:
  - 범위 테스트 외에 필수 필드 채움 여부 검증

### S2-5. 필드 출처 매트릭스 문서화
- 목표:
  - `fetchMarketData` 각 필드가 실데이터인지 synthetic인지 문서에서 고정
  - 향후 실데이터 전환 시 변경 범위를 명확히 추적

### S2-6. SSE 실패 정책 계약 고정
- 목표:
  - 배틀 시작 전 실패와 스트림 중간 실패 정책을 분리
  - `error` 이벤트, JSON 에러 응답, 재시도 가능 여부를 문서에서 먼저 고정

---

## 4. Step 3 — 캐릭터와 콘텐츠 계층 강화

### S3-1. fallback 메시지 품질 개선
- 대상:
  - `generateBattleDebate.ts`
- 목표:
  - 캐릭터별로 더 구분되는 fallback 문구

### S3-2. 외부 캐릭터 API 실검증
- 대상:
  - `GET /api/characters`
  - `ExternalCharacterRepository`
- 목표:
  - `CHARACTERS_SOURCE=external` 실검증
  - 실패 fallback 정책 정리

### S3-3. preview asset 전략 정리
- 목표:
  - 이미지/비디오/오디오 프리뷰 확장 시 계약 먼저 정리

### S3-4. `/api/characters` 응답 shape 단일화
- 목표:
  - `local`, `external`, fallback 모두 `{ characters: [...] }` 계약으로 통일
  - 외부 소스 실패 시 로컬 fallback 정책도 같이 고정

---

## 5. Step 4 — Seed Memory와 Event Log 초안

### S4-1. 모델 초안 추가
- 추가 후보:
  - `BattleOutcomeSeed`
  - `CharacterMemorySeed`
  - `PlayerDecisionSeed`

### S4-2. 저장소 초안 추가
- 목표:
  - 파일 저장소 기준 초안 구현
  - 현재 `battle_result_applications.json`과 책임 분리

### S4-3. event log 초안 추가
- 최소 이벤트:
  - `battle_start`
  - `debate_complete`
  - `choice_saved`
  - `result_applied`
  - `seed_saved`

### S4-4. TDD
- seed 저장/조회 테스트
- event append 테스트

### S4-5. event log 최소 스키마와 ID 규칙 확정
- 목표:
  - 공통 필드와 이벤트 타입을 먼저 고정
  - append-only 저장과 중복 방지 전제를 문서에서 명문화

---

## 6. Step 5 — Outcome / Report 분리

### S5-1. Outcome 계층 분리
- 현재 `resolveBattle` 중심 로직을 outcome 역할로 명확화

### S5-2. report 모델 초안 추가
- 저장 후보:
  - 승리 근거
  - 패배 근거
  - 플레이어 회고

### S5-3. 결과 화면과 저장 흐름 연결
- 목표:
  - 결과 계산
  - XP 반영
  - seed / report 저장
  를 중복 없이 연결

### S5-4. 결과 규칙 버전 도입 설계
- 목표:
  - `ruleVersion` 기준을 결과 모델에 포함
  - 규칙 변경 후에도 과거 배틀을 당시 규칙으로 해석 가능하게 준비

---

## 7. Step 6 — 멀티 Provider 초안

### S6-1. `LlmProvider` 인터페이스 추가

### S6-2. provider adapter 초안
- Gemini
- Qwen
- Kimi
- GLM
- DeepSeek
- MiniMax
- NVIDIA Nemotron
- StepFun

### S6-3. provider router 초안
- cheap / balanced / premium 티어
- 캐릭터별 배정 설정

### S6-4. 공통 fallback을 `Qwen: Qwen3.5-9B`로 통일
- 목표:
  - 개별 캐릭터 모델 실패 시 공통 fallback을 먼저 적용
  - `Qwen` fallback도 실패하면 캐릭터별 fallback 메시지로 종료

### S6-5. OpenRouter 우선 구조 고정
- 목표:
  - 캐릭터 모델은 `OPENROUTER_API_KEY` 하나로 먼저 시작
  - `Gemini`만 직결 API로 분리
  - provider별 timeout, retry, rate limit 수치 고정
  - provider별 개별 env 구조는 후속 직결 전환 단계로 분리

---

## 8. Step 7 — Optimization Agent 고도화

### S7-1. 운영 메트릭 정의
- 응답 시간
- 실패율
- 비용
- 캐릭터별 품질 체감

### S7-2. shadow evaluation 구조 초안

### S7-3. 승격/강등 규칙 초안

### S7-4. cache 정책 초안
- 시장 스냅샷 캐시
- 외부 API 응답 캐시
- LLM 발언 캐시

### S7-5. 관측성 메트릭 명세
- 목표:
  - 응답시간, fallback 사용률, provider 실패율, 결과 반영 실패율을 운영 지표로 정의
  - 고도화 이전에 관측 항목 이름과 측정 시점을 먼저 고정

---

## 9. 검증 순서

각 단계 완료 시 아래 순서로 검증한다.

1. 관련 테스트 추가 또는 수정
2. `pnpm test`
3. `pnpm lint`
4. `pnpm typecheck`
5. 필요 시 실브라우저 수동 확인

---

## 10. 가장 먼저 시작할 3개 작업

1. `S1-1` 깨진 한글 문구 정리
2. `S2-1`~`S2-3` `fetchMarketData` 데이터 품질 정리
3. `S4-1`~`S4-3` seed / event log 모델 초안 추가

---

## 추가. 현재 남은 즉시 구현 항목

- `gemini`, `qwen`, `kimi`, `glm`, `deepseek` 실제 provider 클라이언트 연결
- `llmRouter`가 비-Anthropic provider의 실제 응답을 받도록 연결
- `MiniMax`, `NVIDIA Nemotron`, `StepFun`도 실제 provider 클라이언트와 라우팅표에 맞게 연결
- `/api/battle/outcome` 저장 흐름의 실패 복구 보강
- 결과 저장, XP 반영, applied 기록 순서의 안정화
- seed / report / event log 조회 API 추가
- 캐릭터 외부 API fallback 후 안내 UI 추가
- SSE `error` 이벤트와 클라이언트 UX를 완전히 일치시키기

메모:
- 현재 구조는 들어갔지만, 실제 외부 provider 호출과 조회 계층은 아직 반쪽짜리 상태다.

### OpenRouter 기반 시작 태스크
- `OPENROUTER_API_KEY` 하나로 먼저 캐릭터 라우팅 검증
- provider prefix 포함 모델명으로 라우팅표 점검
- OpenRouter 경유 응답과 최종 직결 provider 응답 차이 비교
- 최종 운영 전 provider 직결 전환 여부 결정

---

## 추가. 현재 초안만 있는 부분

- provider route optimization
- shadow evaluation
- timing metrics 저장과 활용
- `ruleVersion` 기반 결과 해석 확장
- report 구조 고도화
- event log 활용 계층
- 캐시 TTL 정책의 실제 운영 적용
- preview asset 전략의 공통 모듈화

메모:
- 함수, 모델, 저장소, API 초안은 들어갔지만 운영 가능한 루프로 연결되지는 않았다.

---

## 추가. 운영 전에 꼭 마무리할 부분

- 비-Anthropic provider 실제 호출 안정화
- 결과 중복 반영 방지의 신뢰성 강화
- 실패 시 사용자 복구 경로 정리
- `재시도`, `홈 이동`, `fallback 안내` UX 보강
- 실데이터와 synthetic 데이터 경계 최종 점검
- 전체 `pnpm lint` 문제 해결
- 저장 파일 포맷 손상, 중복, 동시성 대응
- 주요 API와 결과 흐름 E2E 점검
- 운영 로그와 메트릭 확인 루트 확보

메모:
- 특히 `pptx` 하위 파일 때문에 전체 lint가 실패하므로, 운영 전 품질게이트 기준을 다시 통과시켜야 한다.

---

## 구현 전 문제점 체크

- 현재 planning 문서는 캐릭터 조사 방식과 모델 배정표까지는 정리됐지만, 실제 코드 구현 전 아래를 먼저 확정해야 한다.
- `OpenRouter`로 먼저 간다.
- `Gemini`는 직결 API로 분리한다.
- provider별 timeout, retry, rate limit 기준은 `05-api-spec.md` 수치로 고정한다.
- 캐릭터별 조사 입력은 공통 스냅샷과 역할 전용 evidence를 분리해서 준다.
- 최종 결과 취합 에이전트는 요약 + 승부 근거 재정리까지 맡는다.
- `Ledger`, `Shade`, `Vela`는 `MarketData`에 없는 필드를 직접 요구하지 않고 문서에 적은 대체 evidence 규칙을 따른다.
- `BattleReport` 문서 구조는 현재 코드 저장 구조인 `id`, `battleId`, `outcomeSeedId`, `report`, `createdAt`로 맞춘다.
