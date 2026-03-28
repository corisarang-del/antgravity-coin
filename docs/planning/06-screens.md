# 화면 명세

- 작성시각: 2026-03-21 14:50 KST
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

- 대상
  - `/home`
  - `/characters`
  - `/battle/*`
  - `/me`
- 구조
  - 서버에서 `getInitialCurrentUserSnapshot()` 생성
  - `AppHeader`에 초기 props 주입
  - 이후 클라이언트 store가 실제 세션 상태를 이어받음

## `/`

- 목적
  - 브랜드 첫 인상
  - 캐릭터 분위기 전달
  - `/home` 진입 유도
- 현재 상태
  - 서버 렌더 중심
  - `LandingEnterOverlay`, `LandingCharacterRail`, preview modal만 클라이언트 아일랜드
  - 입장 전 오버레이 CTA
    - 흰 배경 pill
    - 텍스트는 `landing-hero-ink`
    - 최소 높이 `48px`
  - 히어로 CTA 2종
    - 주 CTA: `바로 배틀 시작`
      - 흰 배경
      - `landing-hero-ink` 전경색
      - 최소 높이 `48px`
    - 보조 CTA: `트레이더 먼저 보기`
      - 반투명 배경 + 흰색 텍스트
  - 상단 우측 `배틀 입장`은 primary filled CTA 규칙 사용

## `/home`

- 목적
  - 검색
  - Top 코인 진입
  - 최근 본 코인 복귀
- 현재 상태
  - 서버에서 top coins와 초기 user snapshot 병렬 준비
  - `SearchBar`, `TopCoinsGrid`, `RecentCoinsList` 조합
  - 공통 헤더 행동 요소
    - `로그인`은 primary filled CTA
    - `계정 상태 게스트` pill은 action 버튼 옆에서도 읽히도록 라벨 대비 유지
  - Top 코인 카드 CTA
    - 라벨: `배틀 입장`
    - 최소 높이 `44px`
    - 최소 너비 `108px`
    - 글자 크기 `14px`, 두께 `700`
    - 네이비 filled + 밝은 foreground 유지

## `/battle/[coinId]`

- 목적
  - 시장 요약
  - 실시간 토론
  - 조기 선택 오픈
- 현재 상태
  - 진입 즉시 `POST /api/battle`
  - 상단 hero에 headline, 첫 발언 준비 단계, 첫 발언 도착 시간 표시
  - 메시지가 아직 없으면 pre-message loading step 카드 노출
  - pick-ready 전에는 waiting primer 노출
    - 시장 미니 브리핑
    - 곧 등장할 캐릭터 3명
  - `TeamBoard`, `BattleFeed`, `SpeakerSpotlight`, summary indicators 표시
  - `battle_pick_ready`가 오면 pick CTA 열림
  - `battle_complete` 후 snapshot 서버 저장
  - localStorage snapshot은 메시지마다 갱신

## `/battle/[coinId]/pick`

- 목적
  - bull / bear 선택
  - 시간프레임 선택
- 현재 상태
  - local snapshot에서 bull/bear 요약 3개씩 추출
  - 시간프레임은 6개
    - `5m`
    - `30m`
    - `1h`
    - `4h`
    - `24h`
    - `7d`
  - 확정 시
    - `battleId` 생성
    - snapshot에 `battleId` 재저장
    - `/api/battle/session` 호출 시도
    - local `userBattle` 저장
    - `/waiting` 이동

## `/battle/[coinId]/waiting`

- 목적
  - 정산 시각 대기
  - 내 선택 복기
- 현재 상태
  - timeframe label과 countdown 표시
  - `MyPickSummary`로 선택 팀, 코인, timeframe 표시
  - countdown 10초 전부터 result route와 settlement outcome 계산 선행 준비
  - countdown이 0초가 되면 `/result`로 자동 이동
  - 결과 화면 이동 CTA 제공
  - 선택 정보가 없으면 pick 화면으로 복귀 링크 표시

## `/battle/[coinId]/result`

- 목적
  - 실정산 결과와 XP, 리포트 표시
- 현재 상태
  - `settlementAt` 이전이면 pending 화면과 countdown 노출
  - 이후에는
    1. `GET /api/battle/outcome?battleId=...` 조회
    2. 없으면 `POST /api/battle/outcome` settlement 모드로 승패/XP 우선 계산
    3. report가 없으면 같은 route full 모드로 후행 생성
  - `VerdictBanner`, `UserLevelChange`, `CharacterLevelChange`, `WinnerHighlight` 표시
  - report가 아직 없으면 `리포트 정리 중` 단계 표시
  - report가 준비되면 본문 출력
  - XP는 local applied set으로 1회 반영

## `/characters`

- 목적
  - 8명 캐릭터 소개
  - 팀, 역할, 성격, 선정 이유 확인
- 현재 상태
  - 서버에서 `sourceNotice` 계산
  - 마운트 후 `/api/characters` 재호출 없음
  - 상세 모달만 dynamic import

## `/login`

- 목적
  - Google / Kakao 로그인
  - 계정 연동 안내
- 현재 상태
  - OAuth 버튼 제공
  - `/auth/callback` 후 `next` 또는 `/me` 이동

## `/me`

- 목적
  - 로그인 사용자 프로필
  - 누적 레벨과 XP
  - 최근 battle 아카이브와 상세
- 현재 상태
  - 비로그인 시 `/login?next=/me` redirect
  - 진입 시 `MergeLocalStateClient`가 local 자산 병합
  - battle 목록과 선택 battle 상세를 서버에서 조회
  - 상세에는 outcome, snapshot, player decision, character memory가 포함됨

## `/admin/battles`

- 목적
  - 최근 outcome 운영 조회
  - battleId 기준 상세 드릴다운
- 현재 상태
  - recent battle 목록
  - outcome, reportSource, event log 상세 확인

## `/admin/memos`

- 목적
  - reusable battle memo 조회
  - global lesson / character lesson 확인
- 현재 상태
  - 최근 memo 목록
  - battleId 검색
  - 선택 memo의 lesson 상세 표시

## 2026-03-23 인증 / 대시보드 화면 방향 업데이트

### `/login`

- 추가 방향
  - 로그인과 회원가입을 따로 나누지 않고 통합 OAuth 화면으로 유지
  - `Google`, `Kakao` 버튼은 로그인/회원가입 공용 진입 버튼으로 사용
  - `next` 쿼리를 유지한 채 `/auth/callback` 이후 원래 목적지 또는 `/me`로 이동
  - `error=oauth_callback_failed` 상태를 화면 문구로 노출
  - 헤더 CTA도 `로그인/회원가입` 의미가 드러나는 방향으로 맞춤 검토

### `/me`

- 추가 방향
  - 기본 진입 화면을 battle archive 중심에서 요약 대시보드형으로 강화
  - 상단은 아래 정보 우선 노출
    - 아바타
    - 이름
    - 이메일
    - provider
    - XP
    - 등급
    - 승패
  - 최근 battle은 기본 5개 안팎의 압축 리스트로 먼저 노출
  - 상세는 현재처럼 선택 시 패널 또는 상세 섹션으로 확장 유지
  - 긴 리포트, 토론 메시지, character memory는 기본 화면에서 주도권을 갖지 않도록 뒤로 배치
  - 등급명은 기존 XP 5단계 유지
    - `개미`
    - `새싹개미`
    - `중급개미`
    - `고수개미`
    - `전설개미`

## 2026-03-23 구현 진행 메모

### `/login`

- 현재 구현 반영
  - 좌측 소개 패널 + 우측 OAuth 진입 패널 2구역 구조
  - `Google`, `Kakao` 버튼은 공통 카드 스타일 안에서 배지로만 차별화
  - `error=oauth_callback_failed` 안내 문구 표시
- 아직 확인할 것
  - dev 서버 재기동 후 실제 브라우저에서 spacing / hover / env 로딩 확인

### `/me`

- 현재 구현 반영
  - 프로필, XP, 등급, 승패를 상단 요약 카드로 우선 배치
  - 최근 battle 기록은 5개 기준 압축
  - 상세는 선택 시 확장 유지
- 아직 확인할 것
  - 실제 모바일 375px 기준 시각 우선순위 체감

## 2026-03-23 홈 / 로그인 / 캐릭터도감 append

### `/home`

- 상단 headline `불리시팀 vs 베어리시팀`은 현재 한 줄 유지 기준으로 구현돼 있다.
- 오른쪽 `SearchBar` 카드가 외곽 밖으로 밀리지 않도록 hero grid는 `minmax(0, 1.5fr)` / `minmax(0, 1fr)` 구조를 사용한다.
- 홈 상단 설명문과 추천 코인 섹션 보조 카피는 확대된 설명문 규칙을 적용받는다.

### `/login`

- 로그인 화면 headline은 현재 `바로시작` 한 줄 카피다.
- Google / Kakao 버튼은 설명을 줄여 선택 자체가 먼저 보이게 정리됐다.
- 로그인 본문 설명과 에러 안내, 하단 보조 카피는 확대된 설명문 규칙을 적용받는다.

### `/characters`

- 캐릭터도감 상단 소개와 `sourceNotice`는 확대된 설명문 규칙을 적용받는다.
- 카드에서는 `specialty`, 상세 모달에서는 `specialty`, `personality`, 초보용 해설이 같은 규칙을 적용받는다.
