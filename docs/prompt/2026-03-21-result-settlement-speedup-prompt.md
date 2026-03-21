# Result Settlement Speedup Prompt

- 작성시각: 2026-03-21 17:25 KST
- 프롬프트:
  - `0s 되면 waiting에서 자동으로 /result로 보내.`
  - `결과 페이지는 정산 결과와 리포트 생성을 분리해.`
  - `settlement 5~10초 전부터 백그라운드 준비를 걸어.`
  - `외부 API 호출엔 timeout과 fallback을 강하게 넣어.`
  - `result 화면에 단계별 진행 상태를 보여줘.`

## 해결하고자 한 문제

- 사용자가 `waiting`에서 멈춘 것처럼 느끼는 문제
- result에서 verdict보다 report까지 같이 기다려야 하는 문제
- 외부 API 지연 때문에 정산 UX 전체가 늘어지는 문제

## 해결된 것

- waiting 자동 전환, settlement 선행 준비, result 단계 분리, timeout 보강, 단계별 상태 표시를 구현함
- outcome route에 `settlement`와 `full` 흐름을 나눔
- 브라우저와 테스트로 정산 흐름이 실제 동작하는지 확인함

## 해결되지 않은 것

- 전체 lint는 저장소의 기존 `tmp/__prewarm-run.mts` 에러 때문에 아직 막힘
