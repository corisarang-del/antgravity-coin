# battle API 테스트 공백

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 `src/**/*.test.ts(x)` 기준

## 이미 테스트가 있는 영역

### battle 핵심 route

- `/api/battle`
- `/api/battle/snapshot`
- `/api/battle/session`
- `/api/battle/outcome`
- `/api/battle/events`

### 인증/운영 관련 route

- `/api/auth/merge-local`
- `/api/admin/cache/prewarm`
- `/api/admin/battles`
- `/api/admin/battles/[battleId]`
- `/api/providers/routes`
- `/api/characters`

### use case / infra

- `preparedBattleContext`
- `prewarmMarketCache`
- `fetchBattleSettlement`
- `generateBattleDebate`
- `optimizeProviderRoutes`
- `llmRouter`
- `requestRateLimiter`

## 현재 비어 있는 테스트

### 1. session/auth 조회 계열

- `/api/auth/session`
- `/api/auth/signout`
- `/api/me`
- `/api/me/progress`
- `/api/me/battles`
- `/api/me/battles/[battleId]`

### 2. waiting/result UI 흐름

- waiting 10초 전 settlement 선행 호출
- `0초` 자동 result 이동
- result의 `settlement -> full` 2단계 클라이언트 호출
- report pending UI 전환

### 3. timing metrics

- metrics 저장 내용에 대한 직접 테스트가 없다.
- `pickReadyAt` 자체가 아직 구현되지 않았다.

### 4. 운영 접근 제어

- `/admin/*`는 화면과 API가 있지만 실제 접근 제어가 아직 없어 권한 테스트도 없다.

### 5. live 안정성

- OpenRouter free 모델 편차
- 외부 뉴스 소스 변동성
- prewarm wall-clock 편차

이 부분은 정적 테스트보다 반복 실측이 더 필요하다.

## 지금 우선 보강할 테스트

1. waiting/result UI 흐름 테스트
2. timing metrics 테스트
3. `/api/me*`, `/api/auth/session`, `/api/auth/signout` route 테스트
4. `/admin/*` 접근 제어가 생긴 뒤 권한 테스트
