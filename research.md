# Ant Gravity Coin 리서치 정리

작성일: 2026-03-16  
기준 경로: `C:\Users\khc\Desktop\fastcampus\ant_gravity_coin`  
참고 문서: `docs/planning/*`, `docs/preview-hover-playbook.md`, `docs/개발일지/2026-03-16-docs-source-sync.md`

## 1. 프로젝트 한 줄 정의

이 프로젝트는 8명의 AI 캐릭터가 하나의 코인을 서로 다른 관점으로 토론하고, 사용자가 bull 또는 bear를 선택한 뒤 실제 가격 변화 기준으로 승패와 XP를 확인하는 모바일 우선 코인 배틀 앱이다.

---

## 2. 문서 기준 현재 제품 상태

- 진입점은 랜딩 `/`
- 실제 탐색 시작점은 `/home`
- 배틀 흐름은 `/battle/[coinId] -> /pick -> /waiting -> /result`
- 캐릭터 도감은 `/characters`
- 현재는 장기 대기나 푸시 알림이 없는 데모형 결과 확인 구조
- 결과 판정 기간은 `24h`, `7d` 두 가지

즉, 지금 단계의 중심은 “검색 -> 토론 시청 -> 팀 선택 -> 결과 확인”이다.

---

## 3. 문서 기준 핵심 사용자 문제

`docs/planning/01-prd.md` 기준으로 이 제품이 푸는 문제는 아래다.

1. 지표가 많아서 무엇부터 봐야 할지 어렵다.
2. 서로 다른 관점을 한 번에 비교하기 어렵다.
3. 분석을 읽고 끝나 자기 판단을 학습하기 어렵다.
4. 재방문 동기를 만드는 구조가 약하다.

이 제품은 배틀 형식과 XP 보상 구조로 분석 소비를 쉽게 만들고, 결과 확인으로 자기 판단을 되돌아보게 만드는 방향이다.

---

## 4. 문서 기준 화면 구조

```text
랜딩 (/)
  -> 홈 (/home)
  -> 배틀 (/battle/[coinId])
  -> 선택 (/battle/[coinId]/pick)
  -> 대기 (/battle/[coinId]/waiting)
  -> 결과 (/battle/[coinId]/result)
  -> 캐릭터 (/characters)
```

### 랜딩 `/`
- 첫 진입 게이트
- 브랜드 톤 전달
- 캐릭터 hover preview와 모달 제공
- `/home` 진입 유도

### 홈 `/home`
- 코인 검색
- Top 코인 진입
- 최근 본 코인 확인

### 배틀 `/battle/[coinId]`
- 시장 스냅샷 표시
- 8명 캐릭터 토론 시청
- SSE로 메시지 순차 수신

### 선택 `/pick`
- bull / bear 선택
- `24h`, `7d` 기간 선택

### 대기 `/waiting`
- 실제 장기 대기 대신 데모용 짧은 카운트다운
- `24h`는 12초
- `7d`는 18초

### 결과 `/result`
- 승패 확인
- XP 변화 반영
- 승리 팀 하이라이트 노출

### 캐릭터 `/characters`
- 8명 캐릭터 도감
- 역할, 성격, 선정 이유 확인

---

## 5. 문서 기준 핵심 데이터와 저장 원칙

`docs/planning/04-data-model.md` 기준 핵심 원칙:

- GPS 같은 민감 개인정보는 저장하지 않는다.
- 사용자 식별은 익명 세션 쿠키 `ant_gravity_user_id`
- 사용자 선택과 레벨은 로컬스토리지 중심
- 결과 중복 적용 여부만 서버 파일 저장소에 남긴다.

### 현재 핵심 모델
- `Coin`
- `MarketData`
- `DebateMessage`
- `UserBattle`
- `BattleResult`
- `UserLevel`
- `CharacterCatalogEntry`

### 현재 저장 위치
- 로컬스토리지
  - `ant_gravity_recent_coins`
  - `ant_gravity_battle_snapshot`
  - `ant_gravity_user_battle`
  - `ant_gravity_user_level`
- 서버 파일 저장
  - `database/data/battle_result_applications.json`

---

## 6. 문서 기준 API 구조

`docs/planning/05-api-spec.md` 기준 내부 API는 아래다.

- `GET /api/auth/session`
- `GET /api/coins/search`
- `GET /api/coins/top`
- `POST /api/battle`
- `GET /api/battle/applications`
- `POST /api/battle/applications`
- `GET /api/characters`

### `POST /api/battle` SSE 이벤트
- `battle_start`
- `character_start`
- `message`
- `character_done`
- `battle_complete`

문서상 중요한 해석:
- 현재는 `character_token`, `result`, `error` 이벤트가 없다.
- 배틀은 8개 메시지를 순차 송신한 뒤 종료된다.

---

## 7. 외부 의존성과 fallback 전략

문서 기준 외부 소스:

- CoinGecko: 검색, Top 코인, 가격 기반 데이터
- Alternative.me: 공포탐욕지수
- CryptoPanic: 뉴스 감성
- Coinglass: 선물 지표
- Anthropic: 캐릭터 발언 생성

문서 기준 fallback 원칙:

- CoinGecko 실패 시 mock 또는 fallback 검색 결과 사용
- Anthropic 실패 시 캐릭터별 fallback 메시지 생성
- 세션이나 battleId가 없으면 `400`
- 결과 반영은 중복 저장하지 않음
- `fetchMarketData`는 현재 synthetic 값을 일부 사용

즉, 이 프로젝트는 완전 실시간 정밀 엔진보다 “실데이터 우선 + fallback 유지” 철학이 강하다.

---

## 8. 캐릭터 구조

### 불리시팀
- Aira: 기술분석가
- Judy: 뉴스 스카우터
- Clover: 심리 센티먼트 분석가
- Blaze: 모멘텀 트레이더

### 베어리시팀
- Ledger: 온체인 분석가
- Shade: 리스크 매니저
- Vela: 고래 추적자
- Flip: 역발상 전략가

문서상 캐릭터는 단순 장식이 아니라 팀별 관점을 대표하는 분석 페르소나다.

---

## 9. 랜딩 preview 운영 메모

`docs/preview-hover-playbook.md` 기준으로 랜딩 hover preview는 꽤 중요한 운영 영역이다.

- 원본 mp4는 `design/character/*.mp4`
- 서비스용 mp4는 `public/characters/previews/*.mp4`
- 포스터 이미지는 `public/characters/*.webp`
- 첫 사용자 진입 액션 이후에만 오디오 unlock 시도
- preview는 preload/cache를 사용
- 프리뷰 레이어는 unmount보다 재사용을 우선
- 같은 캐릭터 재진입 시 2초 쿨다운 규칙이 있다

이건 단순 UI 효과가 아니라 랜딩 경험 품질을 좌우하는 별도 기능 축으로 봐야 한다.

---

## 10. 현재 완료된 범위와 다음 단계

`docs/planning/06-tasks.md` 기준 현재 완료된 범위:

- Next.js 앱 골격
- 랜딩, 홈, 배틀, 선택, 대기, 결과, 캐릭터 라우트
- CoinGecko 검색과 Top 코인 API
- 최근 본 코인 저장
- `fetchMarketData`
- `getBattleMarketSnapshot`
- `generateBattleDebate`
- `/api/battle` SSE
- `resolveBattle`
- XP 갱신
- 결과 중복 적용 방지
- 로컬 캐릭터 카탈로그
- 외부 API 전환 가능한 캐릭터 저장소 팩토리

문서 기준 바로 다음 단계:

1. 깨진 한글 문구 정리
2. 실데이터 품질 개선
3. 캐릭터 외부 연동 검증
4. seed / event log 초안
5. outcome / report 분리
6. provider router 초안
7. optimization 고도화

---

## 11. 문서 동기화 상태에 대한 메모

`docs/개발일지/2026-03-16-docs-source-sync.md` 기준:

- 예전 `/analyze` 흐름은 제거됐다.
- 현재 문서 기준 라우트는 `/`, `/home`, `/battle/*`, `/characters`로 통일됐다.
- `specs`도 현재 구현 계약에 맞춰 정리됐다.
- 아직 해결되지 않은 항목으로는 깨진 한글 UI 문구와 `fetchMarketData`의 synthetic 데이터 의존이 남아 있다.

즉, 지금 `docs`는 예전보다 훨씬 신뢰할 수 있지만, 여전히 “문서상 인지된 미해결 항목”이 존재한다.

---

## 12. 현재 이해 기준 결론

현재 프로젝트는 코인 분석을 캐릭터 토론형 UX로 바꾼 MVP이고, 지금 당장 중요한 축은 검색, SSE 배틀, 선택, 결과, XP 루프다. 문서 기준 다음 확장 방향은 멀티 provider, seed memory, event log, outcome/report 분리로 이어지는 멀티에이전트 운영 구조다.

---

## 13. 실구현 기준 코드 레이어 구조

기존 문서는 화면 흐름 중심 설명이 강한데, 실제 `src`는 역할이 꽤 분리된 layered 구조다.

- `src/app`
  - Next.js App Router 진입점
  - 실제 라우트, API Route Handler, 서버 컴포넌트 페이지가 있다.
  - `LandingPageClient.tsx`, `BattlePageClient.tsx`, `CharactersPageClient.tsx`, `AdminBattlesPageClient.tsx`처럼 페이지별 client wrapper를 따로 둔다.
- `src/presentation`
  - 재사용 UI 컴포넌트, 화면 훅, 클라이언트 상태 저장소가 모여 있다.
  - `components`, `hooks`, `stores`로 나뉘고, 화면 조립 책임이 여기에 많이 있다.
- `src/application`
  - 유스케이스와 포트 인터페이스 계층이다.
  - `useCases`는 배틀 생성, 결과 계산, 리포트 생성, provider 라우팅 최적화 같은 흐름을 담고, `ports`는 저장소와 LLM provider 계약을 정의한다.
  - `prompts`에는 캐릭터 발화 프롬프트와 최종 synthesis 프롬프트가 분리돼 있다.
- `src/domain`
  - 순수 모델 계층이다.
  - 기존 코인/배틀 모델 외에 `BattleOutcomeSeed`, `CharacterMemorySeed`, `PlayerDecisionSeed`, `BattleReport`까지 들어 있어 결과 후처리 도메인이 이미 확장돼 있다.
- `src/infrastructure`
  - 외부 API, 파일 저장소, 캐시, 런타임 설정, mapper 구현이 모여 있다.
  - `api`, `db`, `cache`, `config`, `mappers`로 분리돼 있고 application port 구현체가 여기에 있다.
- `src/features/characters`
  - 캐릭터 카탈로그 관련 코드를 별도 feature 모듈로 묶었다.
- `src/shared`
  - 상수, 유틸, 공용 helper가 있다.
  - `characterModelRoutes.ts`, `envConfig.ts`, `storageKeys.ts`처럼 전역 규칙이 이쪽에 있다.
- `src/styles`
  - 디자인 토큰과 전역 스타일 보조 CSS를 둔다.

즉, 이 프로젝트는 “화면 단위 폴더만 있는 단순 Next 앱”이 아니라 App Router 위에 domain/application/infrastructure/presentation을 얹은 구조다.

---

## 14. 문서보다 앞서 있는 실제 운영 API와 내부 도구

문서 기준 핵심 API 외에, 실제 구현에는 운영/관측용 엔드포인트가 이미 추가돼 있다.

- `POST/GET /api/battle/outcome`
  - 배틀 종료 뒤 outcome seed, memory seed, player decision seed, report를 생성하고 조회한다.
  - 결과 저장이 이미 별도 엔드포인트로 분리돼 있다.
- `GET /api/battle/events`
  - battleId 기준 이벤트 로그를 조회한다.
- `GET /api/admin/battles`
  - 최근 battle outcome 목록과 report 존재 여부를 반환한다.
- `GET /api/admin/battles/[battleId]`
  - 특정 배틀의 outcome seed, memory seed, player decision seed, report, event log를 한 번에 조회한다.
- `GET/POST /api/providers/routes`
  - 캐릭터별 모델 라우팅 상태를 조회하고, 평가 결과를 받아 런타임 override를 적용한다.
- `/admin/battles`
  - 위 운영 데이터를 보는 내부 페이지가 이미 있다.

문서 기준 설명과 실제 구현의 차이도 하나 보인다.

- `POST /api/battle` SSE는 문서상 `battle_start`, `character_start`, `message`, `character_done`, `battle_complete`만 설명돼 있지만, 실제 구현은 실패 시 `error` 이벤트도 송신한다.

즉, 문서에는 “향후 계획”처럼 적힌 일부 항목이 실제 코드에는 이미 운영 도구 형태로 들어와 있다.

---

## 15. 실제 저장 구조는 이미 4개 JSON 저장소로 분화돼 있다

기존 정리는 `battle_result_applications.json` 중심이었는데, 현재 서버 파일 저장은 더 세분화돼 있다.

### `database/data`

- `battle_result_applications.json`
  - 결과 중복 적용 방지 기록
- `seed_store.json`
  - `battleOutcomeSeeds`, `characterMemorySeeds`, `playerDecisionSeeds`
- `report_store.json`
  - 최종 배틀 리포트
- `event_log.json`
  - `battle_start`, `debate_complete`, `result_applied` 등 이벤트 로그

### 저장소 구현 방식

- `FileSeedRepository`
  - seed 저장과 최근 배틀 목록 조회를 담당한다.
- `FileReportRepository`
  - battleId 기준 report 저장/조회 담당
- `FileEventLog`
  - 이벤트 append와 battleId별 조회 담당

공통 특징:

- 파일이 없으면 실행 중 자동 생성한다.
- 모두 `process.cwd()/database/data` 아래 JSON 파일 기반이다.
- DB 서버 없이도 시드, 리포트, 이벤트를 보존하는 구조다.

즉, 문서에서 다음 단계로 적혀 있던 seed / event log / outcome-report 분리가 실제 코드에서는 이미 1차 구현돼 있다.

---

## 16. 런타임 모델 라우팅은 상수 + override 맵 2단 구조다

모델/provider 구조도 문서보다 구현 디테일이 더 있다.

- 기본 라우팅 정의는 `src/shared/constants/characterModelRoutes.ts`
  - 캐릭터별 provider, model, fallbackProvider, fallbackModel, timeoutMs, cacheTtlSeconds를 고정값으로 둔다.
- 런타임 override는 `src/infrastructure/config/providerRuntimeConfig.ts`
  - 메모리 맵으로 기본 route를 덮어쓴다.
- 실제 호출은 `src/infrastructure/api/llmRouter.ts`
  - 캐릭터별 route 조회
  - 캐시 키 생성
  - primary provider 호출
  - 실패 시 fallback provider/model 호출
  - 어떤 provider/model이 실제로 사용됐는지 로그 출력

현재 관찰 기준:

- 개별 캐릭터 발화는 거의 전부 `openrouter` 경유다.
- 최종 synthesis route만 `gemini-2.5-pro`를 사용한다.
- 캐릭터 라우팅 최적화는 이미 `optimizeProviderRoutes` 유스케이스와 `/api/providers/routes`로 연결돼 있다.

즉, provider 라우터는 아직 아이디어 단계가 아니라 “기본값 + 실험용 런타임 조정”까지 들어간 상태다.

---

## 17. 기술 스택과 테스트 배치도 구조 이해에 중요하다

`package.json` 기준 현재 실행 스택:

- Next.js `16.1.6`
- React `19.2.3`
- Tailwind CSS `4`
- Zustand
- Zod
- Recharts
- Vitest + Testing Library

스크립트는 단순하다.

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm dev:clean`
  - `scripts/kill-dev-port.ps1`로 포트 정리

테스트 배치 특징:

- `src` 내부에 소스와 테스트가 붙어 있는 colocated 방식이다.
- 현재 `src` 아래 테스트 파일은 33개다.
- 테스트는 `application/useCases`, `infrastructure/api`, `infrastructure/db`, `app/api`, `presentation/components`, `features/characters`, `shared/utils/constants`, `domain/models`에 분산돼 있다.

즉, 테스트가 한 폴더에 몰려 있지 않고 계층별로 따라다니는 구조라서, 구조를 읽을 때 테스트 파일도 실제 설계 의도를 보여주는 단서로 봐야 한다.

---

## 18. 루트 폴더에는 실행 앱 외 보조 작업공간도 있다

실행 기준 주 앱은 루트 `package.json`과 루트 `src`를 사용하는 현재 작업공간이다. 그 외에 아래 폴더는 보조 성격이 강해 보인다.

- `backup-worktree/`
  - 루트 앱의 별도 복사본 성격으로 보이는 작업 트리
- `bootstrap-app/`
  - 또 하나의 유사한 앱 스냅샷
- `skill-staging/preview-hover`
  - preview-hover 관련 스킬 작업 흔적
- `pptx/ant-gravity-report`
  - PPTX 산출물 폴더
- `tools/ffmpeg`
  - 로컬 FFmpeg 바이너리와 문서
- `design/`
  - 원본 디자인 자산, 디자인 토큰, 캐릭터 원본 미디어
- `public/characters`, `public/characters/previews`
  - 실제 서비스용 포스터/프리뷰 미디어

여기서 `backup-worktree/`와 `bootstrap-app/`은 루트와 매우 비슷한 파일 구성을 갖고 있어서, 구조 파악이나 수정 범위를 잡을 때 “활성 소스 오브 트루스는 루트인가, 보조 사본인가”를 항상 구분해야 한다. 현재 관찰상 실제 실행 대상은 루트 워크스페이스다.
---

## 19. 2026-03-18 추가 구조 이해 메모

이번 점검에서는 문서뿐 아니라 실제 파일 구조를 기준으로 현재 프로젝트를 다시 확인했다. 결론부터 말하면 이 저장소는 단순한 Next.js 화면 모음이 아니라, `src/app` 바깥에 `domain / application / infrastructure / presentation` 레이어를 분리한 구조 위에 App Router를 얹은 형태다.

### 기준 문서 위치

- 작업 지침에는 `docs/PRD.md`가 기준이라고 적혀 있지만, 현재 저장소의 실제 기준 문서 묶음은 `docs/planning/01-prd.md`부터 `09-cache-strategy.md`까지의 연속 문서다.
- 즉 현재 실무 기준으로는 `docs/planning/*`가 제품/기능/데이터/API/화면/태스크의 기준 문서 역할을 하고 있다.

### 실제 소스 레이어 구조

- `src/app`
  - Next.js App Router 진입점이다.
  - 사용자 페이지(`page.tsx`, `home`, `characters`, `battle/*`)와 API 라우트(`api/*`), 운영 페이지(`admin/*`)가 함께 있다.
  - `LandingPageClient.tsx`, `LandingCharacterPreviewModal.tsx`, `BattlePageClient.tsx`처럼 서버 페이지와 클라이언트 UI 래퍼를 나눠 두는 패턴이 보인다.
- `src/domain`
  - 순수 모델 계층이다.
  - `Coin`, `MarketData`, `BattleResult`, `BattleReport`, `BattleOutcomeSeed`, `CharacterMemorySeed`, `PlayerDecisionSeed`, `UserBattle`, `UserLevel` 같은 핵심 타입이 여기 있다.
- `src/application`
  - 유스케이스 계층이다.
  - `fetchMarketData`, `getBattleMarketSnapshot`, `generateBattleDebate`, `generateBattleReport`, `resolveBattle`, `updateLevels`, `optimizeProviderRoutes`처럼 실제 동작 흐름이 모여 있다.
  - `ports`에는 저장소와 외부 연동 인터페이스가 있고, `prompts`에는 캐릭터 발화 및 synthesis 프롬프트가 분리돼 있다.
- `src/infrastructure`
  - 외부 API, 파일 저장소, 캐시, 설정, 매퍼 구현이 들어 있다.
  - `api`, `db`, `cache`, `config`, `mappers`로 나뉘며 application port의 실제 구현체가 위치한다.
- `src/presentation`
  - 재사용 UI, 훅, 상태 저장소가 모여 있다.
  - 화면 조립에 가까운 컴포넌트와 클라이언트 훅이 이 계층에 집중돼 있다.
- `src/features/characters`
  - 캐릭터 카탈로그 관련 로직을 feature 단위로 따로 묶어 둔 예외적인 모듈이다.
- `src/shared`
  - 상수, 유틸, 공용 설정이 있다.
  - 특히 `characterModelRoutes.ts`, `characterDebateProfiles.ts`, `envConfig.ts`, `storageKeys.ts`가 전역 규칙 역할을 한다.
- `src/styles`
  - 토큰과 전역 스타일 보조 CSS가 있다.

### 사용자 흐름 기준 실제 페이지 구조

- 랜딩: `/`
- 홈: `/home`
- 캐릭터 소개: `/characters`
- 배틀 메인: `/battle/[coinId]`
- 포지션 선택: `/battle/[coinId]/pick`
- 대기: `/battle/[coinId]/waiting`
- 결과: `/battle/[coinId]/result`
- 운영 확인용: `/admin/battles`

즉 문서에 있던 핵심 소비자 흐름은 유지되고 있지만, 실제 구현에는 운영자 관찰용 `admin` 화면이 이미 포함돼 있다.

### API 경계는 문서보다 더 확장돼 있다

현재 `src/app/api` 기준 실제 API는 아래 묶음으로 이해하는 게 맞다.

- 인증/세션: `auth/session`
- 코인 조회: `coins/search`, `coins/top`
- 배틀 실행: `battle`
- 결과 적용 조회: `battle/applications`
- 이벤트 로그 조회: `battle/events`
- outcome/report 생성 및 조회: `battle/outcome`
- 캐릭터 목록: `characters`
- provider 라우팅 조회/조정: `providers/routes`
- 운영용 조회: `admin/battles`, `admin/battles/[battleId]`
- 운영용 캐시 예열: `admin/cache/prewarm`

특히 문서상 초기 API보다 실제 구현이 더 나아간 지점은 다음이다.

- `/api/battle`는 SSE 스트림으로 `battle_start`, `character_start`, `message`, `character_done`, `battle_complete`를 순차 전송한다.
- 구현상 실패 시 `error` 이벤트도 내려보낸다.
- `/api/battle/outcome`와 `/api/admin/battles*`가 추가되면서 배틀 이후 결과 자산과 운영 조회 기능이 독립 경계로 분리됐다.
- `/api/providers/routes`로 캐릭터별 모델 라우팅을 조회/조정할 수 있다.

### 저장소는 DB보다 파일 기반 운영에 가깝다

현재 지속 데이터는 `database/data` 아래 JSON 파일에 분리 저장된다.

- `battle_result_applications.json`: 결과 중복 반영 방지
- `seed_store.json`: `battleOutcomeSeeds`, `characterMemorySeeds`, `playerDecisionSeeds`
- `report_store.json`: 최종 배틀 리포트
- `event_log.json`: 배틀 이벤트 로그
- `source_cache.json`: 외부 소스 캐시

실제 구현도 이를 그대로 반영한다.

- `FileSeedRepository`
- `FileReportRepository`
- `FileEventLog`
- `FileBattleResultApplicationRepository`
- `FileDataCacheRepository`

즉 현재 단계의 운영 저장소는 RDB 중심이 아니라 “JSON 파일 저장소 + Next API” 형태의 로컬 MVP 운영 구조라고 보는 게 정확하다.

### 외부 연동 구조

- 마켓/코인 데이터: `coinGeckoClient`, `bybitClient`, `hyperliquidClient`, `fearGreedClient`
- 뉴스/감성 데이터: `newsApiClient`, `gdeltNewsClient`, `alphaVantageNewsClient`, `newsSentimentClient`
- LLM/합성: `openRouterProvider`, `geminiProvider`, `anthropicProvider`, `claudeClient`, `geminiSynthesisClient`, `llmRouter`

중요한 점은 provider 라우팅이 상수 테이블로 끝나지 않는다는 점이다.

- 기본 라우팅 상수: `src/shared/constants/characterModelRoutes.ts`
- 런타임 override 저장/로드: `src/infrastructure/config/providerRuntimeConfig.ts`
- 실제 호출 및 fallback 제어: `src/infrastructure/api/llmRouter.ts`

즉 이 프로젝트는 “캐릭터 발화 생성” 자체보다 “어떤 provider/model 조합으로 안정적으로 발화를 만들지”까지 운영 대상으로 보는 구조다.

### 테스트와 실행 구조

`package.json` 기준 실행 스크립트는 아래와 같다.

- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`
- `pnpm test:live-apis`
- `pnpm dev:clean`

테스트는 별도 폴더 하나에 몰아넣지 않고 구현 근처에 붙여 두는 colocated 방식이다. 현재 테스트 범위는 `application/useCases`, `infrastructure/api`, `infrastructure/db`, `app/api`, `presentation/components`, `features/characters`, `shared`, `domain`까지 퍼져 있어서, 구조를 이해할 때 테스트 파일도 실제 설계 단서로 봐야 한다.

### 루트 보조 디렉터리의 성격

루트 기준 주 실행 대상은 현재 `src`, `public`, `database`, `docs/planning`, `specs`다. 그 외 폴더는 보조 성격이 강하다.

- `design/`: 원본 디자인 자산, 토큰, 레퍼런스
- `public/characters`, `public/characters/previews`: 서비스용 캐릭터 이미지/프리뷰 비디오
- `tools/ffmpeg`: 로컬 미디어 변환 도구 번들
- `pptx/`: 보고서 산출물
- `backup-worktree`, `bootstrap-app`, `skill-staging`: 보조 작업 흔적 또는 별도 실험 공간

그래서 구조를 읽을 때는 루트 전체를 동일 가중치로 보지 말고, 실제 앱 실행 경로와 보조 산출물 경로를 구분해야 한다.

### 현재 시점 최종 이해

현재 프로젝트는 “AI 캐릭터 8명이 코인 방향성을 토론하고, 사용자가 bull/bear를 선택한 뒤 결과와 XP를 확인하는 Next.js 앱”이라는 제품 골격 위에,

- 파일 기반 seed/report/event 저장소
- provider/model 라우팅 운영 도구
- admin 관찰 화면
- hover preview용 미디어 자산 체계
- 문서/스펙/테스트가 함께 유지되는 구조

까지 이미 포함한 상태다.

즉 이 저장소의 핵심은 단순 화면 구현이 아니라, 배틀 생성 → 토론 스트리밍 → 결과 저장 → 운영 관찰까지 이어지는 작은 애플리케이션 플랫폼 구조를 이미 갖췄다는 점이다.
