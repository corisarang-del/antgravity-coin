# Ant Battle Log 디자인 토큰

작성시각: 2026-03-14 14:33 KST
플랫폼: web
기준 문서: `docs/MASTER.md`, `docs/design-reference-analysis.md`, `docs/planning/06-screens.md`

## 입력 이해

- 제품 타입: 코인 배틀 로그 모바일 우선 웹앱
- 플랫폼: web
- 브랜드 캐릭터: 분석적이지만 게임처럼 몰입되는 배틀 경험
- 참고 레퍼런스: `Wall of Love`의 따뜻한 전시감과 반복 카드 리듬
- 산출물: 프로젝트 전용 토큰 정의, `shadcn/ui` 호환 CSS 변수

## 가정과 누락

- 현재 앱 코드 구조가 없어서 토큰은 공용 스타일 파일 기준으로 먼저 정의한다.
- 레퍼런스의 핑크 중심 감성은 직접 복제하지 않고, 현재 제품 특성에 맞게 절제된 웜 뉴트럴 + 강한 상태색 구조로 재해석한다.

## 토큰 방향

### 1. 컬러 시스템

- 기본 배경은 따뜻한 크림 계열로 잡는다.
- 본문과 핵심 UI는 잉크 네이비 계열을 사용해 신뢰감을 만든다.
- 상승/낙관 진영은 그린, 하락/경고 진영은 코랄 레드로 분리한다.
- XP, 보상, 성취 계열은 골드 옐로를 사용한다.

### 2. 서피스 구조

- `background`: 전체 캔버스
- `card`: 핵심 정보 카드
- `secondary`: 선택 전/보조 상태 카드
- `muted`: 보조 메타 정보, 비활성 배경
- `accent`: CTA, 선택 상태, 주요 포인트

### 3. 타이포그래피 스케일

- `display`: 32/40, 화면 상단 배틀 타이틀
- `h1`: 28/36
- `h2`: 24/32
- `h3`: 20/28
- `body`: 16/24
- `small`: 14/20
- `micro`: 12/16

권장 폰트 조합:

- 제목: `Space Grotesk`, `Pretendard`
- 본문: `Pretendard`, `Noto Sans KR`

### 4. 간격 스케일

기본 단위는 4px 기준이다.

- `space-1`: 4px
- `space-2`: 8px
- `space-3`: 12px
- `space-4`: 16px
- `space-5`: 20px
- `space-6`: 24px
- `space-8`: 32px
- `space-10`: 40px
- `space-12`: 48px

### 5. 라운드 스케일

- `radius-sm`: 10px
- `radius-md`: 14px
- `radius-lg`: 18px
- `radius-xl`: 24px
- 기본 `--radius`: `1rem`

### 6. 그림자 스케일

- `shadow-sm`: 얕은 카드 경계
- `shadow-md`: 일반 카드
- `shadow-lg`: 강조 카드, 모달

레퍼런스처럼 과장된 입체감 대신, 얇고 또렷한 경계와 짧은 그림자 위주로 잡는다.

### 7. 브레이크포인트 전략

- 기본: 375px 모바일 우선
- `sm`: 480px
- `md`: 768px
- `lg`: 1024px

### 8. 터치 타깃 규칙

- 버튼, 카드, 탭, 선택지는 최소 `44x44px`
- 주요 CTA 높이는 최소 `48px`
- 하단 액션 바 버튼은 최소 `52px`

## shadcn/ui 토큰 맵

- `primary`: 기본 CTA, 활성 탭, 진행 액션
- `secondary`: 보조 카드, 비선택 패널
- `accent`: 배틀 하이라이트, 선택 강조, 결과 포인트
- `destructive`: 손실, 경고, 위험
- 커스텀 `--bull`, `--bear`, `--xp`: 제품 도메인 상태색

## 토큰 리뷰

### passed checks

- `:root`, `.dark` 모두 정의했다
- `shadcn/ui` 기본 시맨틱 이름을 유지했다
- 모바일 우선 간격과 터치 타깃 규칙을 정했다
- `bull/bear/xp` 도메인 색을 별도 토큰으로 분리했다

### issues to fix

- 실제 컴포넌트에 얹기 전 버튼, 카드, 배지 대비를 한 번 더 시각 검증해야 한다

### risks

- 코인 제품 특성상 데이터 밀도가 높아지면 웜 배경이 다소 가볍게 느껴질 수 있다
- 따라서 대시보드형 화면에서는 카드 수를 늘릴수록 `card` 대비를 더 강하게 써야 한다

### recommended edits

- 배틀 피드 화면에서는 `card`보다 진한 서피스를 한 단계 더 두는 변형 토큰을 고려할 수 있다
- 캐릭터 도감 화면에서는 `secondary`와 `accent` 사용 비율을 조금 높여도 된다

### final status

`pass with fixes`
