# 화면 명세

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 App Router 화면 구현

## 전체 흐름

```text
/ -> /home -> /battle/[coinId] -> /battle/[coinId]/pick -> /battle/[coinId]/waiting -> /battle/[coinId]/result
                 ├-> /characters
                 ├-> /login -> /me
                 ├-> /admin/battles
                 └-> /admin/memos
```

## 공통 헤더

- 대상:
  - `/home`
  - `/characters`
  - `/battle/*`
  - `/me`
- 구조:
  - 서버에서 `getInitialCurrentUserSnapshot()` 생성
  - `AppHeader`에 초기 props 주입
  - 이후 클라이언트 store가 실제 세션 상태를 이어받음

## `/`

- 목적:
  - 브랜드 첫 인상
  - 캐릭터 분위기 전달
  - `/home` 진입 유도
- 현재 상태:
  - 서버 렌더 중심
  - `LandingEnterOverlay`, `LandingCharacterRail`, preview modal만 클라이언트 아일랜드
  - 히어로 CTA 2종
    - 주 CTA: `바로 배틀 시작`
    - 보조 CTA: `트레이더 먼저 보기`
  - 상단 우측 `배틀 입장`은 primary filled CTA 규칙 사용

## `/home`

- 목적:
  - 검색
  - Top 코인 진입
  - 최근 본 코인 복귀
- 현재 상태:
  - 서버에서 top coins와 초기 user snapshot 병렬 준비
  - `SearchBar`, `TopCoinsGrid`, `RecentCoinsList` 조합
  - Top 코인 카드 CTA는 최소 높이 `44px`, 최소 너비 `108px`

## `/battle/[coinId]`

- 목적:
  - 시장 요약
  - 실시간 토론
  - 조기 선택 오픈
- 현재 상태:
  - 진입 즉시 `POST /api/battle`
  - 상단 hero에 headline과 첫 발언 도착 시간 표시
  - 메시지 전에는 pre-message loading step 카드 노출
  - pick-ready 전에는 primer 노출
    - 시장 미니 브리핑
    - 곧 등장할 캐릭터 3명
  - `TeamBoard`, `BattleFeed`, `SpeakerSpotlight`, indicators 표시
  - `battle_pick_ready` 이후 pick CTA 오픈
  - `battle_complete` 후 snapshot 서버 저장
  - local snapshot은 메시지마다 갱신

## `/battle/[coinId]/pick`

- 목적:
  - bull / bear 선택
  - 시간프레임 선택
- 현재 상태:
  - local snapshot에서 bull/bear 요약 3개씩 추출
  - 시간프레임 6개 제공
  - 확정 시 `battleId` 생성 후 `/waiting` 이동

## `/battle/[coinId]/waiting`

- 목적:
  - 정산 시각 대기
  - 내 선택 복기
- 현재 상태:
  - timeframe label과 countdown 표시
  - `MyPickSummary` 표시
  - countdown 10초 전부터 settlement 선행 호출
  - countdown이 `0`이 되면 `/result` 자동 이동

## `/battle/[coinId]/result`

- 목적:
  - 실정산 결과, XP, report 표시
- 현재 상태:
  - `settlementAt` 이전이면 pending 카드와 countdown 표시
  - 이후 `GET outcome -> POST settlement -> POST full` 순서로 처리
  - `VerdictBanner`, `UserLevelChange`, `CharacterLevelChange`, `WinnerHighlight` 표시
  - report가 아직 없으면 `리포트 정리 중` 상태 표시

## `/characters`

- 목적:
  - 8명 캐릭터 소개
  - 역할, 성격, 선정 이유 확인
- 현재 상태:
  - 서버에서 `sourceNotice` 계산
  - 상세 모달만 dynamic import

## `/login`

- 목적:
  - Google / Kakao 로그인
  - 계정 연동 안내
- 현재 상태:
  - OAuth 버튼 제공
  - `/auth/callback` 후 `next` 또는 `/me` 이동

## `/me`

- 목적:
  - 로그인 사용자 프로필
  - 누적 레벨과 XP
  - 최근 battle 아카이브와 상세
- 현재 상태:
  - 비로그인 시 `/login?next=/me` redirect
  - 진입 시 `MergeLocalStateClient`가 local 자산 병합
  - battle 목록과 선택 battle 상세를 서버에서 조회

## `/admin/battles`

- 목적:
  - recent outcome 운영 조회
  - battleId 기준 상세 드릴다운
- 현재 상태:
  - recent battle 목록
  - outcome, report source, memo, event log 상세 확인
- 메모:
  - 화면에는 `Internal Only` 문구가 있지만 실제 접근 제어는 아직 없다.

## `/admin/memos`

- 목적:
  - reusable battle memo 조회
  - global lesson / character lesson 확인
- 현재 상태:
  - 최근 memo 목록
  - battleId 검색
  - 선택 memo lesson 상세 표시
