# production 통과 확인 후 문서 동기화

- 작성시각: 2026-03-27 21:44 KST
- 해결하고자 한 문제:
  - production `BTC -> pick -> waiting -> result` 흐름이 실제로 통과한 뒤, 그 결과를 기존 문서에 반영하고 마무리 커밋/푸시까지 이어가야 했음

## 해결된 것

- production `antgravity-coin.vercel.app`에서 아래를 실제로 확인했음
  - `BTC` 배틀 시작
  - `8/8` 발언 완료
  - pick CTA 노출
  - pick 선택
  - waiting 진입
  - result pending 화면 진입
- 기존 문서에 아래 내용을 추가 반영했음
  - `docs/planning/05-api-spec.md`
  - `docs/planning/06-screens.md`
- 배포용 `.vercelignore`를 저장소에 추가했음

## 해결되지 않은 것

- 이번 기록은 production 실제 통과와 문서 반영까지고, 추가 기능 개선은 포함하지 않았음
