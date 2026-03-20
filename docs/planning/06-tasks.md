# TASKS 추적 로그

최종 갱신: 2026-03-20 18:15 KST

기준:

- 현재 코드베이스 실제 구현 상태
- 최근 성능/인증/캐릭터 화면 정렬 작업 반영

## 0. 현재 완료 범위

### A. 화면 라우팅

- `/`
- `/home`
- `/battle/[coinId]`
- `/battle/[coinId]/pick`
- `/battle/[coinId]/waiting`
- `/battle/[coinId]/result`
- `/characters`
- `/login`
- `/me`

### B. 인증/세션

- Supabase OAuth 로그인/콜백
- `/api/auth/session`
- `/api/auth/signout`
- `/api/auth/merge-local`
- 서버 `initialCurrentUserSnapshot` 기반 헤더 초기 렌더
- 로그아웃 이후 store 재검증 흐름

### C. 배틀 흐름

- `fetchMarketData`
- `getBattleMarketSnapshot`
- `/api/battle` SSE 스트리밍
- snapshot 서버 저장
- 배틀 선택/정산 대기/결과 계산
- outcome, report, memo, event 저장

### D. 캐릭터

- 로컬 카탈로그 기반 캐릭터 렌더
- 외부 소스 저장소 선택 로직
- 서버 `sourceNotice` 계산
- 캐릭터 상세 모달 dynamic import

### E. 프론트엔드 성능 정렬

- 랜딩 페이지 서버 중심 렌더링 + 클라이언트 아일랜드 분리
- 배틀 SSE 선행 워터폴 축소
- 헤더 세션 bootstrap 경로 정리
- 캐릭터 페이지 마운트 후 `/api/characters` 재호출 제거

## 1. 방금 완료된 항목

### T1. 배틀 SSE 초기 응답 지연 축소

- 상태: 완료
- 반영:
  - `getBattleMarketSnapshot()`과 `getReusableDebateContext()` 병렬 시작
  - `battle_start`를 시장 데이터 준비 직후 전송

### T2. 헤더 세션 초기화 정리

- 상태: 완료
- 반영:
  - 서버 `getInitialCurrentUserSnapshot()` 추가
  - 주요 페이지에서 `AppHeader`에 초기 세션 props 전달
  - `currentUserStore`는 초기 스냅샷을 1회 부트스트랩으로만 사용

### T3. 랜딩 페이지 서버/클라이언트 경계 재구성

- 상태: 완료
- 반영:
  - 정적 히어로/카드/CTA는 서버 렌더링
  - `LandingEnterOverlay`, `LandingCharacterRail`만 클라이언트 아일랜드

### T4. 캐릭터 페이지 후속 fetch 제거

- 상태: 완료
- 반영:
  - `getCharacterSourceNotice()` 서버 helper 추가
  - `/characters`는 서버에서 `sourceNotice`를 계산해서 props 전달
  - 클라이언트 `useEffect` 기반 `/api/characters` 재호출 제거

## 2. 다음 우선순위

### P1. 랜딩 진입 오버레이 리소스 로딩 최적화

- 목적:
  - hidden unlock video의 선행 다운로드 비용 줄이기
- 후보 작업:
  - `preload="auto"` 제거 또는 지연 preload
  - 사용자 상호작용 시점에만 미디어 준비

### P2. 헤더 세션 경로 추가 단순화

- 목적:
  - 현재 bootstrap + 재검증 store 구조를 더 단순하게 만들기
- 후보 작업:
  - layout 단위 세션 공급 여부 검토
  - `useCurrentUser` 소비처 분리

### P3. 캐릭터 소스 상태 문구와 실제 데이터 소스 일치화

- 목적:
  - 현재는 카드 데이터는 로컬 카탈로그, 문구는 서버 판정값이라 두 흐름이 분리돼 있음
- 후보 작업:
  - 카드 데이터까지 서버 저장소 결과를 직접 반영할지 결정
  - 또는 문구를 “카탈로그 기준”으로 축소

### P4. 전면 인코딩 정리

- 목적:
  - 일부 기존 화면/문서 문자열이 깨져 보여 추적과 유지보수가 어려움
- 후보 작업:
  - 사용자 노출 문자열 UTF-8 정리
  - 깨진 라벨/문구 회복

## 3. 중기 작업

### M1. 관측성 고도화

- timing metrics 정리
- fallback 사용률 집계
- provider 별 실패 사유 추적

### M2. 저장소 고도화

- 파일 기반 저장소에서 DB 중심 저장소로 단계적 이전 검토
- snapshot/event/report health check 추가

### M3. 결과 경험 개선

- `/me` 필터/정렬
- 배틀 상세 drill-down
- 결과 재방문 UX 개선

## 4. 검증 순서

각 작업 완료 후 아래 순서로 검증한다.

1. 관련 테스트 추가 또는 수정
2. `pnpm test`
3. `pnpm lint`
4. `pnpm typecheck`
5. 필요 시 브라우저 확인
