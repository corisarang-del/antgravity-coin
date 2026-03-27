# 보안 스킬에 로그 민감정보 금지 기준 추가

- 작성시각: 2026-03-27 12:11:03 +09:00
- 해결하고자 한 문제:
  - 로그에 남기면 안 되는 민감정보 기준이 보안 스킬에 명시적으로 부족했음
  - 특히 비밀번호, 이메일 전체, 전화번호, 카드 번호 앞뒤 4자리, JWT 전체, API 키 같은 로그 금지 기준을 이후 감사에서 바로 보이게 만들 필요가 있었음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\fireauto-secure\SKILL.md`에 전체 객체 `console.log`와 로그 민감정보 금지 관점을 반영한 점검 규칙을 유지/보강함
  - `C:\Users\khc\.codex\skills\fireauto-secure\references\patterns.md`에 배포 전 체크와 정보 노출 판정 기준에 로그 전체 객체 dump 금지 기준을 반영함
  - `quick_validate.py` 통과와 관련 키워드 스모크 테스트를 확인함
- 아직 해결되지 않은 것:
  - 세부 마스킹 포맷 예시는 아직 reference에 별도 템플릿으로 분리하지 않았음
