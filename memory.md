# Memory

작성시각: 2026-03-21 00:10 KST

## 이 프로젝트에서 꼭 기억할 것

- 사용자 응답은 반말, 한글만, 이모티콘 금지.
- AGENTS 기준 문서:
  - 제품 사양: `docs/PRD.md`
  - API/Event 계약: `spec/*.md`
- 각 단계마다 `docs/개발일지`, `docs/prompt`에 기록 남기는 흐름을 유지해왔음.
- 코드 수정 시 `apply_patch`만 사용.
- 현재 워크트리는 매우 더럽고, 이번 세션 변경과 무관한 사용자 변경도 많음. 절대 함부로 되돌리면 안 됨.

## 최근 세션에서 실제로 한 일

### 문서 동기화

- `docs/planning` 주요 문서를 현재 소스 기준으로 다시 맞춤
- 특히 아래 문서가 현재 구현 기준으로 많이 갱신됨
  - `04-data-model.md`
  - `05-api-spec.md`
  - `06-tasks.md`
  - `08-character-debate-reference.md`
  - `09-cache-strategy.md`
  - `10-storage-json-types.md`
  - `12-auth-user-flow.md`
- `research.md`도 현재 코드 구조와 우선순위 기준으로 다시 정리함

### 배틀 라우팅 / prewarm / 복원 안정화

- `src/infrastructure/api/llmRouter.ts`
  - 기본 fallback 실패 후 공통 OpenRouter recovery model 풀을 한 번 더 시도하도록 확장
- `src/infrastructure/api/openRouterProvider.ts`
  - 404 / 429 / timeout 모델을 잠시 unavailable로 취급하는 쿨다운 로직 추가
- `src/application/useCases/preparedBattleContext.ts`
  - prepared context를 첫 캐릭터 초안 중심으로 줄여 prewarm 부담을 낮춤
- `src/application/useCases/prewarmMarketCache.ts`
  - fresh cache 재사용과 hit 여부 반환으로 정리

### auth merge / snapshot / outcome 테스트 보강

- 추가 또는 보강된 테스트
  - `src/app/api/battle/session/route.test.ts`
  - `src/app/api/auth/merge-local/route.test.ts`
  - `src/app/api/battle/snapshot/route.test.ts`
  - `src/app/api/battle/outcome/route.test.ts`
  - `src/infrastructure/api/llmRouter.test.ts`

### 토론 문장 품질 / 캐릭터 말투 개선

- `src/application/prompts/characterPrompts.ts`
  - 캐릭터별 `voice / lens / guardrail / habit` 프롬프트 강화
  - 실제 사람이 말하는 반말 한국어, 번역투 금지, 이름표 제거 규칙 추가
- `src/application/useCases/generateBattleDebate.ts`
  - fallback 문장을 설명서 톤에서 대화체로 수정
  - summary 앞 `Aira:` 같은 중복 이름표 제거
  - 캐릭터별 습관어 차이를 크게 벌림
    - `aira`: `내 눈엔`, `차트상`
    - `judy`: `헤드라인만 보면`, `지금 재료는`
    - `clover`: `분위기상`, `심리적으로 보면`
    - `blaze`: `지금은`, `이 구간은`
    - `ledger`: `숫자상`, `구조적으로 보면`
    - `shade`: `내 기준엔`, `리스크 쪽에선`
    - `vela`: `밑에서 보면`, `자금 흐름상`
    - `flip`: `근데 난`, `오히려 지금은`

### 캐릭터 모델 재배치

- 팀마다 4명씩 아래 무료 모델이 1개씩 배치되도록 재정렬함
  - `stepfun/step-3.5-flash:free`
  - `arcee-ai/trinity-large-preview:free`
  - `nvidia/nemotron-3-super-120b-a12b:free`
  - `minimax/minimax-m2.5:free`
- fallback은 8명 전부 `qwen/qwen3.5-9b`로 통일함

### Vela 모델 비교 실측 결과

실측 방식:

- `/api/providers/routes`로 `vela`의 primary만 바꿔가며 `/api/battle` 브라우저 실측
- 비교 대상:
  - `minimax/minimax-m2.5:free`
  - `stepfun/step-3.5-flash:free`
  - `arcee-ai/trinity-large-preview:free`
  - `nvidia/nemotron-3-super-120b-a12b:free`

결론:

- `minimax`:
  - Vela 도달 약 `91.9초`
  - 최종 `character-fallback`
- `step-3.5`:
  - Vela 도달 약 `44.9초`
  - 최종 `character-fallback`
- `trinity`:
  - Vela 도달 약 `3.4초`
  - 최종 `character-fallback`
- `nemotron`:
  - 120초 툴 제한 안에 Vela까지 확인 실패

판단:

- Vela는 성공률보다 “안 될 때 얼마나 빨리 qwen이나 fallback으로 넘기느냐”가 중요했음
- 이번 실측 기준으로는 `trinity`가 가장 빠르게 실패를 확정했고, 전체 흐름을 덜 막았음
- 그래서 `vela` primary를 `trinity`로 바꾸는 쪽이 현재 free 모델 조합에서는 가장 낫다고 판단

## 현재 코드 기준 모델 배치

- 불리시 팀
  - `aira`: primary `stepfun/step-3.5-flash:free`
  - `judy`: primary `arcee-ai/trinity-large-preview:free`
  - `clover`: primary `nvidia/nemotron-3-super-120b-a12b:free`
  - `blaze`: primary `minimax/minimax-m2.5:free`
- 베어리시 팀
  - `ledger`: primary `stepfun/step-3.5-flash:free`
  - `shade`: primary `arcee-ai/trinity-large-preview:free`
  - `vela`: primary `arcee-ai/trinity-large-preview:free`
  - `flip`: primary `nvidia/nemotron-3-super-120b-a12b:free`
- 8명 전부 fallback
  - `qwen/qwen3.5-9b`

## 검증 상태

- 최근 통과 확인
  - `pnpm.cmd typecheck`
  - `pnpm.cmd lint`
  - `pnpm.cmd test`
  - 토론 관련 부분 테스트
    - `src/application/useCases/generateBattleDebate.test.ts`
    - `src/infrastructure/api/llmRouter.test.ts`
    - `src/app/api/battle/route.test.ts`

## 현재 남아 있는 핵심 문제

### 1. 무료 OpenRouter 모델 품질 / 가용성 문제는 여전히 남아 있음

- 반복 이슈
  - `429 Rate limit exceeded: free-models-per-day`
  - `404` 죽은 모델 응답
  - `non_korean_response`
  - `message_parse_failed`
- 병목은 프롬프트보다 무료 모델 availability와 응답 품질 쪽 영향이 더 큼

### 2. warm battle은 빨라졌지만 prewarm 자체는 여전히 무거움

- prepared context 방향 자체는 맞음
- 하지만 prewarm wall-clock은 여전히 더 줄여야 함

### 3. 일부 문자열 / 인코딩 정리는 아직 완전히 끝나지 않음

- 주요 사용자 노출 화면은 많이 정리했지만, 문서와 일부 레거시 문자열엔 깨진 흔적이 남아 있음

## 다음 세션에서 바로 이어서 할 것

우선순위:

1. `Vela`를 포함한 최신 모델 배치로 `/battle/bitcoin` 재실측
2. `judy`, `blaze`도 Vela처럼 primary 후보별 실측 비교
3. 최근 로그만 기준으로 캐릭터별 primary 성공 / qwen fallback 전환율 다시 집계
4. prewarm wall-clock 줄이는 추가 구조 손보기
5. 남은 UTF-8 깨짐 정리

## 다음 세션에서 보면 좋은 파일

- `src/shared/constants/characterDebateProfiles.ts`
- `src/application/prompts/characterPrompts.ts`
- `src/application/useCases/generateBattleDebate.ts`
- `src/infrastructure/api/llmRouter.ts`
- `src/infrastructure/api/openRouterProvider.ts`
- `src/application/useCases/preparedBattleContext.ts`
- `src/application/useCases/prewarmMarketCache.ts`
- `src/app/api/providers/routes/route.ts`
- `database/data/event_log.json`
- `database/data/battle_prep_cache.json`

## 기억해야 할 판단

- 첫 발언 속도 자체는 prepared context로 해결 방향이 맞다.
- 지금 진짜 문제는 무료 모델 조합이 8캐릭터 토론을 안정적으로 감당하지 못하는 점이다.
- warm battle은 빠르지만 prewarm 자체가 너무 느리다.
- 토론 품질 이슈는 프롬프트보다 모델 availability / 429 / 불안정 응답 영향이 더 크다.
- Vela는 이번 실측 기준 `minimax`보다 `trinity`가 더 낫다.
- 사용자는 Gemini를 최종 보고서 용도로만 보고 있고, 토론 캐릭터는 OpenRouter 무료 모델 위주를 원했다.

## 2026-03-21 추가 업데이트

### battle 속도 구조 업그레이드

- `/api/battle`는 이제 8명 완전 직렬이 아니라 4라운드 병렬 구조
  - `Aira + Ledger`
  - `Judy + Shade`
  - `Clover + Vela`
  - `Blaze + Flip`
- `battle_pick_ready` 이벤트를 추가해서 양 팀 핵심 논거가 2개씩 모이면 선택 CTA를 먼저 열게 바꿈
- `llmRouter`는 공통 recovery model 풀 전체 순회를 제거하고 `primary + configured fallback`까지만 시도함
- `generateCharacterMessage`는 이전 발언을 `직전 1개 + 보완용 1개 + 공통 요약 1개`로 압축해서 뒤 캐릭터 프롬프트 길이를 줄임

### prewarm / waiting UX 추가 개선

- prepared context는 이제 첫 라운드 2명인 `Aira + Ledger` draft를 병렬 prewarm함
- 실제 스트림에서도 `Aira`, `Ledger` prewarm draft를 재사용하게 연결됨
- battle 대기 구간에 아래 프라이머 UI 추가
  - `시장 미니 브리핑`
    - RSI
    - 공포탐욕
    - 롱숏 비율
    - 펀딩비
  - `곧 등장할 캐릭터`
    - 다음 캐릭터 예고 카드 3개

### live 재실측 결과

- 서버 로그 기준 과거 한 번의 `/api/battle`는 `7.7분`
- 구조 변경 후 서버 로그 기준 `/api/battle`는 `4.2초` 기록이 확인됨
- fresh 브라우저 기준 `/battle/bitcoin`
  - 첫 발언 도착 시간: `15.2초`
  - 약 20초 추가 대기 후 `5/8 발언` + `battle_pick_ready` CTA 노출 확인
- 즉 이번 실측 기준 선택 가능 시점은 대략 `35초 이내`
- 다만 OpenRouter free 모델 상태에 따라 편차가 커서 반복 실측이 더 필요함

### Gemini 보고서 seed 경로 판단

- Gemini 보고서 본문이 raw text로 토론 프롬프트에 직접 주입되지는 않음
- 대신 결과 정산 뒤 만든 `ReusableBattleMemo`의 `globalLessons`, `characterLessons`가 다음 토론 시드로 들어감
- `synthesizeBattleLessonsWithGemini` 결과가 있으면 Gemini 합성 교훈을 우선 사용하고, 없으면 fallback 교훈을 씀
- 즉 Gemini는 `보고서 직접 주입`이 아니라 `교훈/요약 seed 주입` 형태로 토론에 영향 줌

### 다음 세션에서 바로 할 것

우선순위:

1. `pickReadyAt` 메트릭을 timing metrics에 추가해서 `requestStartedAt / firstMessageDisplayedAt / pickReadyAt / debateCompletedAt`를 같이 남기기
2. `/battle/bitcoin`을 3회 이상 반복 실측해서 편차와 평균을 보기
3. `pick-ready` 기준을 더 공격적으로 낮출지 (`1 bull + 1 bear + 공통 요약`) 검토
4. waiting 프라이머 문구를 현재 모델 상태나 fallback 여부와 연결할지 검토

### 지금 기억해야 할 판단

- 큰 폭 단축은 이제 prewarm 자체보다 `pick-ready를 얼마나 빨리 여느냐`가 더 중요함
- `Aira + Ledger` 2명 prewarm은 비용 대비 효과가 좋음
- OpenRouter free 모델 tail latency는 recovery 풀 축소만으로도 꽤 줄지만, 여전히 live 편차가 큼
- 결과적으로 사용자가 느끼는 속도는 `첫 발언`보다 `선택 가능 시점`이 더 중요함


