# 보안 스킬에 console.log 전체 객체 금지 규칙 추가

- 작성시각: 2026-03-27 11:25:02 +09:00
- 해결하고자 한 문제:
  - `console.log`로 전체 객체를 찍는 디버그 코드가 깃헙 커밋이나 서버 배포에 남지 않도록 보안 스킬에 명시 규칙이 필요했음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\fireauto-secure\SKILL.md`에 전체 객체 디버그 출력이 커밋/배포에 남지 않는지 점검하는 규칙을 추가함
  - `C:\Users\khc\.codex\skills\fireauto-secure\references\patterns.md`에 배포 전 체크 항목과 판정 기준으로 `console.log` 전체 객체 dump 금지 규칙을 추가함
  - `quick_validate.py` 통과와 키워드 스모크 테스트를 확인함
- 아직 해결되지 않은 것:
  - 별도 없음
