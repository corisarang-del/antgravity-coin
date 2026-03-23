# 디자인 토큰 리뷰

작성시각: 2026-03-21 14:50 KST
대상 파일: `src/styles/tokens.css`

## passed checks

- `shadcn/ui` 기본 토큰 세트를 모두 포함했다
- 라이트/다크 테마를 모두 정의했다
- `border`, `input`, `ring`을 분리해 상태 구분 가능성을 확보했다
- 모바일 우선 제품에 맞게 반경과 간격이 과도하지 않다
- `primary`와 `background`의 대비가 충분히 큰 방향으로 설계됐다

## issues to fix

- 실제 앱 컴포넌트에서 `accent`를 넓게 쓰면 시각적 피로가 생길 수 있다
- 다크 모드에서 `secondary` 카드가 많은 화면은 밀도가 높아 보일 수 있다

## risks

- 상승/하락 상태색이 동시에 많이 붙는 화면은 게임성은 강해지지만 금융 UI의 안정감은 약해질 수 있다
- 결과 화면과 캐릭터 화면의 감성 톤이 지나치게 벌어지지 않게 운영 규칙이 필요하다

## recommended edits

- 결과 배너에는 `--xp`와 `--accent`를 같이 쓰지 말고 하나만 대표색으로 쓴다
- 배틀 로그 행 단위 컴포넌트에는 `muted` 계열을 우선 적용하고, 선택 상태에서만 `accent`를 올린다
- 핵심 CTA는 토큰 값만 선언하는 걸로 끝내지 말고 실제 렌더에서 foreground가 덮이지 않게 규칙을 강제해야 한다
- 랜딩 히어로의 흰 CTA는 `background` 배경 + `landing-hero-ink` 텍스트 조합을 고정해야 한다
- 홈/헤더 CTA는 최소 `44px`, 랜딩 흰 CTA는 최소 `48px`, 카드 CTA는 `108px` 이상 폭을 권장한다

## runtime validation

- `localhost:3000` 브라우저 실측 기준 확인
  - `로그인`: 밝은 foreground on 네이비, `44px`, `14px`
  - 홈 카드 `배틀 입장`: 밝은 foreground on 네이비, `44px`, `108px`, `14px`
  - 랜딩 `바로 배틀 시작`: `landing-hero-ink` on 밝은 배경, `48px`, `14px`

## final status

`pass with validated CTA rules`
