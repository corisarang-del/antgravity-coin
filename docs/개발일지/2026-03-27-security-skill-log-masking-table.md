# 보안 스킬에 로그 마스킹 규칙 표 추가

- 작성시각: 2026-03-27 12:13:38 +09:00
- 해결하고자 한 문제:
  - 로그에 남기면 안 되는 민감 필드에 대해 구체적인 redaction 형태가 스킬에 없었음
  - `email`, `phone`, `card`, `jwt`, `api key`, `password` 기준이 실제로 스킬에 모두 반영됐는지 검증할 필요가 있었음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\fireauto-secure\references\patterns.md`에 로그 마스킹 규칙 표를 추가함
  - `password`, `email`, `phone`, `card`, `JWT`, `API key` 각각에 대해 권장 redaction 형태를 명시함
  - `C:\Users\khc\.codex\skills\fireauto-secure\SKILL.md`에 로그 민감정보 점검 항목을 추가함
  - `quick_validate.py` 통과를 확인함
  - grep 기반 커버리지 체크로 요청한 모든 항목이 스킬 안에 실제로 존재하는지 확인함
- 아직 해결되지 않은 것:
  - 스킬은 문서형 스킬이라 런타임 실행 테스트가 아니라 구조/키워드 커버리지 테스트 방식으로 검증함
