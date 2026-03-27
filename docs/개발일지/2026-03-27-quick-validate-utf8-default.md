# quick_validate UTF-8 기본 읽기 수정

- 작성시각: 2026-03-27 11:08:55 +09:00
- 해결하고자 한 문제:
  - `quick_validate.py`가 Windows 기본 인코딩(cp949)으로 스킬 파일을 읽어서 UTF-8 한글 스킬 검증에 실패했음
  - `PYTHONUTF8=1` 같은 환경변수 우회 없이 바로 검증되게 만들 필요가 있었음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\.system\skill-creator\scripts\quick_validate.py`에서 `read_text()`를 `encoding="utf-8-sig"`로 변경함
  - `fireauto-secure`, `guardrails` 두 스킬에 대해 환경변수 없이 `quick_validate.py`를 다시 실행해 둘 다 `Skill is valid!` 통과를 확인함
- 아직 해결되지 않은 것:
  - 별도 없음
