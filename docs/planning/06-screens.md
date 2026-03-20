# 화면 명세

작성시각: 2026-03-20 18:10 KST

## 전체 흐름

```text
/ -> /home -> /battle/[coinId] -> /battle/[coinId]/pick -> /battle/[coinId]/waiting -> /battle/[coinId]/result
                  └-> /login -> /me
```

## 공통 헤더

대상 화면:

- `/home`
- `/characters`
- `/me`
- `/battle/[coinId]`
- `/battle/[coinId]/pick`
- `/battle/[coinId]/waiting`
- `/battle/[coinId]/result`

현재 상태:

- 각 페이지는 서버에서 `initialCurrentUserSnapshot`을 만들어 `AppHeader`에 props로 전달한다.
- 헤더는 서버 초기 스냅샷으로 첫 화면을 그리고, 이후 클라이언트 store가 실제 세션 상태를 이어받는다.
- 로그아웃 이후에는 `refreshCurrentUserStore()`로 다시 `/api/auth/session` 재검증 흐름을 탄다.

## `/`

목적:

- 첫 진입 브랜드 경험
- 캐릭터 분위기 전달
- `/home` 진입 유도

현재 상태:

- 정적인 히어로, 카드 섹션, CTA는 서버 렌더링이다.
- 진입 오버레이(`LandingEnterOverlay`)와 캐릭터 hover/모달 레일(`LandingCharacterRail`)만 클라이언트 아일랜드다.
- CTA는 `/home`으로 이동한다.

## `/home`

목적:

- 코인 검색
- Top 코인 진입
- 최근 본 코인 복귀

현재 상태:

- 서버에서 `getTopCoinsSnapshot()`과 `initialCurrentUserSnapshot`을 병렬로 준비한다.
- `SearchBar`는 초기 코인 목록을 props로 받는다.
- `AppHeader`는 서버 초기 세션 스냅샷을 사용한다.

## `/battle/[coinId]`

목적:

- 시장 개요와 8명 토론 메시지 스트리밍

현재 상태:

- 진입 즉시 `/api/battle` 호출
- SSE 이벤트로 토론 진행
- 서버는 시장 데이터와 reusable debate context를 병렬 시작하고, 시장 데이터 준비 직후 `battle_start`를 먼저 보낸다.
- 토론 중 localStorage snapshot 갱신
- `battle_complete` 직후 snapshot 서버 저장
- 완료 후 pick 화면으로 이동 가능

## `/battle/[coinId]/pick`

목적:

- 불리시/베어리시 선택
- 차트 구간 선택

현재 차트 구간:

- `5m`
- `30m`
- `1h`
- `4h`
- `24h`
- `7d`

현재 상태:

- local snapshot에서 메시지 요약을 읽는다.
- 선택 시 `battleId`, `snapshotId`, `settlementAt`, `marketSymbol`, `priceSource`를 저장한다.
- 같은 시점 snapshot 서버 저장도 `battleId`를 다시 넣어 관계를 고정한다.
- 헤더는 서버 초기 세션 스냅샷을 사용한다.

## `/battle/[coinId]/waiting`

목적:

- 정산 시점까지 대기

현재 상태:

- `settlementAt` 기준 남은 시간을 보여준다.
- 카운트다운은 UTC 정산 시각 기준이다.
- 헤더는 서버 초기 세션 스냅샷을 사용한다.

## `/battle/[coinId]/result`

목적:

- 실제 캔들 기준 승패와 리포트 표시

현재 상태:

- `settlementAt` 이전이면 pending 상태 화면
- `settlementAt` 이후면 `/api/battle/outcome` 호출
- 결과가 확정되면 XP 반영과 리포트 출력
- 헤더는 서버 초기 세션 스냅샷을 사용한다.

## `/characters`

목적:

- 캐릭터 소개
- 팀/성격/선정 이유 표시

현재 상태:

- 캐릭터 카드 목록 자체는 정적 데이터로 렌더링한다.
- 상단 `sourceNotice` 문구는 서버에서 `getCharacterSourceNotice()`로 계산해서 props로 전달한다.
- 클라이언트 마운트 후 `/api/characters`를 다시 호출하지 않는다.
- 상세 모달만 dynamic import로 지연 로드한다.

## `/login`

목적:

- Google/Kakao 로그인
- 계정 기반 기록 연동 안내

현재 상태:

- Google, Kakao OAuth 버튼 제공
- 로그인 성공 후 `/auth/callback`을 거쳐 `next` 파라미터 또는 `/me`로 이동

## `/me`

목적:

- 로그인 사용자 프로필
- 레벨/XP
- 최근 배틀 기록

현재 상태:

- 로그인 필요 페이지
- 서버에서 프로필, 진행도, 배틀 목록, 선택 배틀 상세를 병렬 조회한다.
- 페이지 진입 시 local 익명 상태를 `/api/auth/merge-local`로 1회 병합한다.
- 헤더는 서버 초기 세션 스냅샷을 사용한다.
