# Ant Gravity Coin 리서치 정리

- 작성시각: 2026-03-23 22:07 KST
- 기준 경로: `C:\Users\khc\Desktop\fastcampus\ant_gravity_coin`
- 이번 갱신의 기준 소스:
  - `memory.md`
  - `docs/planning/*`
  - 현재 워크트리에서 확인 가능한 `src/`, `database/`, `supabase/`

## 1. 이 문서의 역할

`memory.md`는 최근 세션의 의사결정, 실측 결과, 남은 리스크, 다음 우선순위를 이어받기 위한 운영 메모다.
이 `research.md`는 그 메모를 바탕으로 프로젝트의 현재 구조와 핵심 판단을 한 번에 파악할 수 있게 정리한 문서다.

즉 정리 기준은 아래다.

- 제품 아이디어 요약보다 현재 구현과 운영 판단을 우선한다.
- 예전 계획보다 최근 실측과 최근 코드 변경 내용을 더 신뢰한다.
- 다음 세션에서 바로 이어받을 수 있게 "지금 중요한 것" 위주로 적는다.

## 2. 프로젝트 한 줄 정의

이 프로젝트는 8명의 AI 캐릭터가 코인에 대해 bull / bear 토론을 벌이고, 사용자가 시간 프레임과 포지션을 선택한 뒤 실제 Bybit 캔들 결과로 승패와 XP를 확인하는 모바일 우선 코인 배틀 서비스다.

## 3. 현재 사용자 흐름

현재 핵심 흐름은 아래로 이해하면 된다.

```text
랜딩 (/)
  -> 홈 (/home)
  -> 배틀 (/battle/[coinId])
  -> 픽 선택 (/battle/[coinId]/pick)
  -> 대기 (/battle/[coinId]/waiting)
  -> 결과 (/battle/[coinId]/result)
  -> 캐릭터 소개 (/characters)
  -> 로그인 (/login)
  -> 내 정보 (/me)
  -> 관리자 전투 기록 (/admin/battles)
  -> 관리자 메모 (/admin/memos)
```

추가로 기억할 사용자 경험 포인트는 아래다.

- 시간 프레임은 `5m`, `30m`, `1h`, `4h`, `24h`, `7d` 여섯 개다.
- 결과는 가상 점수 계산이 아니라 Bybit entry / settlement candle close 기준으로 정산한다.
- `/me`는 단순 마이페이지가 아니라 guest 상태를 auth 계정으로 병합하는 허브다.
- `/result`는 정산 전에도 먼저 들어갈 수 있고, 지금은 pending 상태 설명과 `MyPickSummary`를 함께 보여주는 방향으로 보강돼 있다.

## 4. 코드 구조

현재 저장소는 Next.js App Router 기반이고, 레이어를 나눠서 관리하고 있다.

- `src/app`
  - 페이지와 API route
- `src/presentation`
  - UI 컴포넌트, client hook, client store
- `src/application`
  - 유스케이스, 프롬프트, 서비스 조합
- `src/domain`
  - 도메인 모델과 Zod 스키마
- `src/infrastructure`
  - 외부 API, 파일 저장소, Supabase persistence, 인증 유틸
- `src/features/characters`
  - 캐릭터 관련 feature 묶음
- `src/shared`
  - 상수, 공용 타입, 캐시 정책, 공용 유틸

이 프로젝트는 단순 프론트엔드가 아니라 아래를 함께 갖고 있다.

- 배틀 생성 / 스트리밍
- 결과 정산
- 시드와 메모 재사용
- 인증 병합
- 관리자 조회

## 5. 배틀 실행 구조

현재 배틀 체감 속도는 "8명 발언 완료"보다 "언제 pick 가능해지느냐"가 더 중요하다는 판단 위에서 설계돼 있다.

### 5-1. 4라운드 병렬 구조

현재 토론 순서는 완전 직렬이 아니라 아래 4라운드 병렬이다.

- `Aira + Ledger`
- `Judy + Shade`
- `Clover + Vela`
- `Blaze + Flip`

이 구조 덕분에 과거 긴 직렬 대기보다 체감 시간이 크게 줄었다.

### 5-2. `battle_pick_ready` 중심 UX

- bull 측 핵심 메시지 2개와 bear 측 핵심 메시지 2개가 모이면 `battle_pick_ready`를 열어 선택 CTA를 먼저 노출한다.
- 사용자는 8명 전체 완료 전에도 pick 단계로 갈 수 있다.
- 그래서 현재 속도 지표의 핵심은 `battle_complete`보다 `pickReadyAt`이다.

### 5-3. prepared context / prewarm

속도 개선의 핵심은 prepared context와 prewarm이다.

- `getPreparedBattleContext()`는 대략 아래 요소를 만든다.
  - `marketData`
  - `summary`
  - `reusableDebateContext`
  - `preparedEvidence`
  - `firstTurnDrafts`
- opening round인 `Aira`, `Ledger` 초안을 먼저 준비한다.
- 결과는 `database/data/battle_prep_cache.json`에 coinId 기준으로 캐시된다.

현재 기억해야 할 캐시 판단은 아래다.

- soft TTL: 2분
- hard TTL: 10분
- 기본 prewarm 코인: `bitcoin`, `ethereum`, `xrp`, `solana`
- 동시 prewarm 수: 2

판단은 분명하다.

- warm battle은 이미 꽤 빨라졌다.
- 남은 병목은 fresh prewarm wall-clock과 무료 모델 편차다.

## 6. 인증과 owner 규칙

owner 규칙은 단순 guest local 저장이 아니다.

- 로그인 상태면 Supabase auth user id를 owner로 사용한다.
- 비로그인 상태면 `ant_gravity_user_id` guest 쿠키를 owner로 사용한다.
- 공통 owner 판정은 `getRequestOwnerId()`를 통해 이뤄진다.

`/me` 진입 시에는 `MergeLocalStateClient`가 아래 데이터를 guest -> auth로 병합하는 흐름이 핵심이다.

- local user level
- recent coins
- 현재 `userBattle`
- 현재 `battleSnapshot`
- guest owner 기준 파일 저장 battle 자산

즉 `/me`는 프로필 화면이면서 상태 병합 허브다.

## 7. 저장 구조

### 7-1. localStorage

- `ant_gravity_recent_coins`
- `ant_gravity_battle_snapshot`
- `ant_gravity_user_battle`
- `ant_gravity_user_level:[userId]`
- `ant_gravity_applied_battle_results`
- `ant_gravity_battle_timing_metrics`

### 7-2. 서버 파일 저장소

- `database/data/source_cache.json`
- `database/data/battle_prep_cache.json`
- `database/data/battle_snapshot_store.json`
- `database/data/seed_store.json`
- `database/data/report_store.json`
- `database/data/event_log.json`
- `database/data/battle_result_applications.json`

### 7-3. Supabase 미러 저장

- `user_profiles`
- `user_progress`
- `user_recent_coins`
- `battle_snapshots`
- `battle_sessions`
- `battle_outcomes`
- `player_decision_seeds`
- `character_memory_seeds`

추가로 `memory.md` 기준 점검 결과로는, 현재 마이그레이션 기준 주요 테이블의 RLS는 켜져 있고 anon insert는 막혀 있는 쪽으로 확인돼 있다.

## 8. 현재 모델 라우팅 이해

최근 메모까지 포함해서 보면, 프로젝트의 핵심 병목은 프롬프트 설계보다 무료 OpenRouter 모델의 availability와 출력 안정성이다.

### 8-1. 현재 기억해야 할 라우팅 상태

2026-03-23 최신 메모 기준으로 opening round 분산이 중요하다.

- `aira`: primary `arcee-ai/trinity-mini`
- `ledger`: primary `google/gemma-3-12b-it`
- 두 캐릭터 fallback: `qwen/qwen3.5-9b`

이전에는 `aira`, `ledger`가 둘 다 `stepfun/step-3.5-flash:free`를 써서 동시에 429 / timeout을 맞는 위험이 컸다.
지금은 첫 라운드 병목을 분산시키는 쪽으로 조정됐다.

### 8-2. 최근 실측에서 남은 문제

최근 `/battle/bitcoin` 실측 기준으로는 아래 문제가 남아 있다.

- `aira`: `message_parse_failed`
- `ledger`: `non_korean_response`
- 다른 캐릭터도 일부 `message_parse_failed`, `non_korean_response`가 남아 있음

즉 병목이 "동시 Stepfun 장애"에서 "모델별 출력 품질 편차" 쪽으로 이동한 상태다.

### 8-3. prompt / parser 보강 방향

최근 비커밋 코드 기준으로 아래 보강이 들어가 있다.

- `characterPrompts.ts`
  - JSON 하나만 허용
  - 코드펜스 금지
  - 영어 단어 금지
  - 줄바꿈 금지
  - `aira`는 형식 안정성 강화
  - `ledger`는 영어 금융 용어를 한국어로 바꿔 쓰도록 규칙 강화
- `generateBattleDebate.ts`
  - JSON 파싱 실패 시 `summary:` 라벨 형식 응답도 재파싱
  - 영어 금융 용어를 파싱 직전에 한국어로 정규화

이건 아직 커밋되지 않은 변경으로 메모돼 있다.

## 9. 최근 실측과 사용자 체감

`memory.md` 기준 최근 체감 속도 판단은 아래처럼 이해하면 된다.

- 예전 한 번의 `/api/battle`는 서버 로그 기준 `7.7분`까지도 보였음
- 구조 변경 후 서버 로그 기준 `4.2초` 사례가 확인됨
- fresh 브라우저 기준 `/battle/bitcoin`
  - 첫 발언 도착 약 `15.2초`
  - 약 35초 이내 pick-ready CTA 확인 사례가 있었음
- 2026-03-23 추가 실측
  - 첫 발언 약 `11.3초`
  - 약 `25초` 안에 `5/8 발언` + pick-ready CTA 확인

중요한 결론은 아래다.

1. 지금은 첫 발언 자체보다 pick 가능 시점이 더 중요하다.
2. opening round `Aira + Ledger` prewarm은 비용 대비 효과가 좋다.
3. tail latency와 품질 편차는 여전히 무료 모델 상태에 크게 흔들린다.

## 10. 결과 화면과 대기 UX 이해

최근 메모에서 결과 흐름 관련 핵심 판단도 중요하다.

- `waiting`의 `결과 화면 열기`는 즉시 정산 버튼이 아니라 결과 페이지 선진입 링크다.
- `result`는 settlement 전이면 pending 화면만 뜨기 쉬워서 사용자가 버튼이 사라진 것처럼 느낄 수 있었다.
- 그래서 최근 비커밋 변경으로 아래 보강이 들어가 있다.
  - pending 상태에서도 `MyPickSummary` 노출
  - `결과 페이지 준비 중` 설명 섹션 추가
  - 3단계 문맥 표시
    - `차트 마감 대기`
    - `승패와 XP 계산`
    - `리포트와 요약 정리`
  - 현재 저장된 발언 수 `n/8` 표시

이 부분은 체감 개선 효과가 크고, 다음 세션에서 버튼 라벨 자체를 더 명확히 바꿀지 검토 예정으로 남아 있다.

## 11. 현재 검증 상태와 환경 이슈

최근 메모 기준 검증과 막힘은 같이 기억해야 한다.

통과 확인:

- `pnpm.cmd typecheck`
- 대상 파일 eslint
- 일부 Vitest 대상 테스트

막힘 또는 주의:

- `pnpm.cmd test -- src/app/login/LoginPageClient.test.tsx`
  - 이 환경에선 `spawn EPERM`으로 Vitest 시작이 막힌 적이 있음
- `pnpm.cmd lint`
  - 이번 변경 때문이 아니라 `tmp/` 아래 생성 산출물의 `require()` 때문에 전체 lint가 깨진 적이 있음
- dev 서버가 env를 못 물고 떠서 `@supabase/ssr` 관련 URL / API key 에러처럼 보인 사례가 있었음

즉 에러가 보이더라도 코드 문제와 dev 서버 상태 문제를 분리해서 봐야 한다.

## 12. 현재 워크트리 해석

`memory.md`와 실제 워크트리 메모를 합치면, 지금은 코드와 런타임 산출물을 의도적으로 분리해서 봐야 한다.

메모 기준 커밋된 변경:

- `618c411`
  - CTA 복구 + Supabase RLS audit
- `83a98bb`
  - primary 분산 + stream cleanup fix

메모 기준 비커밋 핵심 코드:

- `src/application/prompts/characterPrompts.ts`
- `src/application/useCases/generateBattleDebate.ts`
- `src/application/useCases/generateBattleDebate.test.ts`
- `src/app/battle/[coinId]/result/ResultPageClient.tsx`

추가로 현재 워크트리에는 아래처럼 런타임 데이터와 산출물이 많이 섞여 있다.

- `database/data/*.json`
- `tmp/*`
- `out/*`
- 이미지와 로그 산출물

따라서 새 작업 전에는 반드시 코드 변경과 산출물 변경을 분리해서 읽어야 한다.

## 13. 지금 남아 있는 핵심 리스크

### 13-1. 무료 모델 가용성과 품질

반복 이슈:

- `429 Rate limit exceeded`
- `404` 죽은 모델 응답
- `non_korean_response`
- `message_parse_failed`

현재 가장 큰 불확실성이다.

### 13-2. prewarm wall-clock

- warm battle은 좋아졌지만
- fresh prewarm 자체는 아직 무겁다

### 13-3. UTF-8 / 문서 인코딩 흔적

- 사용자 노출 화면은 많이 정리됐지만
- 일부 문서와 문자열에는 깨짐 흔적이 남아 있다

이번 `research.md` 재작성도 그 문제를 줄이기 위한 작업이다.

### 13-4. 기준 문서 경로 불일치

AGENTS에서는 기준 문서를 `docs/PRD.md`라고 적고 있지만, 현재 저장소에서는 `docs/planning/01-prd.md`가 실제 PRD 역할을 하고 있다.
이 차이는 다음 작업에서 혼선을 만들 수 있으니 계속 의식해야 한다.

## 14. 다음 세션 우선순위

`memory.md` 기준으로 다음 우선순위는 아래처럼 정리된다.

1. `/battle/bitcoin` 반복 실측으로 `firstMessageDisplayedAt`, `pickReadyAt`, 완료 시점 편차를 다시 본다.
2. `pickReadyAt`를 timing metrics에 추가했는지 확인하고, 아직이면 넣는다.
3. `aira`의 `message_parse_failed`, `ledger`의 `non_korean_response`를 다시 재현하고 prompt / parser 보강 효과를 본다.
4. result pending UI 체감을 다시 확인하고, 필요하면 `결과 화면 열기` 라벨을 더 명확히 바꾼다.
5. prewarm wall-clock과 남은 UTF-8 깨짐을 추가 정리한다.

## 15. 지금 이해한 핵심 결론

이 프로젝트의 현재 승부처는 기능 추가가 아니다.
핵심은 아래 다섯 가지다.

1. 무료 모델 조합의 불안정성을 어떻게 완충하느냐
2. 사용자가 느끼는 선택 가능 시점을 얼마나 앞당기느냐
3. opening round prewarm과 prepared context를 얼마나 가볍게 유지하느냐
4. guest -> auth 병합과 결과 정산 흐름을 얼마나 자연스럽게 보여주느냐
5. 더러운 워크트리와 깨진 문서를 어떻게 안전하게 관리하느냐

즉 `memory.md`를 읽고 난 현재 이해는 이렇다.

- battle 속도는 이미 많이 좋아졌지만 아직 안정화가 끝난 건 아니다.
- 문제의 중심은 프롬프트보다 모델 availability와 출력 안정성이다.
- `/me`와 `/result`는 단순 화면이 아니라 상태 전이의 핵심 허브다.
- 문서 작업도 단순 기록이 아니라 다음 세션의 시행착오를 줄이는 운영 작업이다.

## 16. 2026-03-23 UI 가독성 / 홈 레이아웃 추가 메모

- body font 기본값은 현재 `Pretendard`다.
- display headline은 계속 `Space Grotesk`를 사용한다.
- 설명문 확대는 전역 전체가 아니라 선택된 설명문에만 `ag-body-copy` 규칙으로 적용됐다.
- 홈, 검색, 로그인 설명문은 `ag-body-copy-strong`으로 대비가 한 단계 더 올라간 상태다.
- 캐릭터도감도 같은 규칙을 따라 상단 소개, 카드 본문, 상세 모달 설명문까지 보강됐다.
- 홈 상단 hero는 `불리시팀 vs 베어리시팀` 한 줄 headline과 오른쪽 검색 카드 조합을 유지하되, grid 최소폭을 `minmax(0, fr)`로 바꿔 overflow를 막았다.
- 검색 카드 headline은 현재 `어떤 코인으로 붙을지 골라줘`다.
- 추천 코인 목록은 현재 `AVAX`를 포함하는 쪽으로 정리됐다.
- 추천 코인 목록은 현재 curated 상수와 CoinGecko live 데이터를 섞는 구조다.
  - 코인 구성과 순서는 `topCoins`
  - 가격 / 변동률 / 시총은 CoinGecko live 응답
  - 즉 현재 구현은 "고정된 추천 코인 셋 + 실시간 시세" 조합으로 이해하면 된다.
