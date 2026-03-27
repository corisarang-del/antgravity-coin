# guest 저장 API 일일 quota 추가 프롬프트

- 작성시각: 2026-03-27 10:40:07 +09:00
- 프롬프트:
  - 일일 quota까지 붙혀줘
- 해결하고자 한 문제:
  - 공개 guest 쓰기 API에 분당 제한만 있고 하루 누적 상한이 없어서 자동화 남용을 더 줄일 필요가 있었음
- 해결된 것:
  - snapshot/applications POST에 일일 quota를 추가함
  - 운영 shared rate limit 함수가 24시간 윈도우를 허용하도록 migration을 추가함
  - quota 초과 테스트까지 추가해서 동작을 검증함
- 아직 해결되지 않은 것:
  - quota 값을 환경변수화하거나 사용자 등급별로 분리하는 정책은 아직 없음
