# 디자인 토큰 리뷰

작성시각: 2026-03-14 14:33 KST
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

## final status

`pass with fixes`
