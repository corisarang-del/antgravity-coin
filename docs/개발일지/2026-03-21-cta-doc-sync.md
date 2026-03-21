# CTA Doc Sync

- 작성시각: 2026-03-21 14:50 KST
- 해결하고자 한 문제:
  - 구현된 CTA 가독성 규칙이 planning 문서와 디자인 문서에 아직 반영되지 않은 상태였음
  - 사용자가 소스는 건드리지 말고 관련 문서만 현재 구현 기준으로 맞추길 원했음

## 해결된 것

- 아래 planning 문서를 현재 구현 기준으로 갱신함
  - `docs/planning/03-feature-list.md`
  - `docs/planning/06-screens.md`
  - `docs/planning/07-coding-convention.md`
- 반영한 핵심 내용
  - 핵심 CTA 가독성 규칙이 구현 상태로 존재한다는 점
  - 랜딩 흰 CTA의 전경색 고정 규칙
  - 일반 CTA `44px`, 랜딩 흰 CTA `48px`, 카드 CTA `108px` 기준
  - 홈/랜딩/헤더 CTA의 현재 역할과 화면 명세
- 아래 디자인 관련 문서도 구현 기준으로 동기화함
  - `design/tokens/design-token-review.md`
  - `design/design-system-preview.html`

## 해결되지 않은 것

- planning 문서 전체를 전수 비교한 건 아니고, CTA 가독성과 직접 연결된 부분만 갱신함
- 코드나 스타일 구현은 이번 단계에서 수정하지 않았음
