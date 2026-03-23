# memory md understanding and research update

- 작성시각: 2026-03-23 20:39 KST
- 해결하고자 한 문제:
  - `memory.md`에 담긴 최신 세션 문맥을 빠짐없이 이해하고, 그 이해를 `research.md`에도 이어 붙여 다음 세션 진입 비용을 낮춰야 했음
  - 기존 `research.md` 최신 구간 일부가 깨져 있어서, 읽는 사람이 다시 혼동하지 않게 현재 판단을 clean하게 정리할 필요가 있었음

## 해결된 것

- `memory.md` 전체를 다시 읽고 아래를 핵심 이해로 정리했음
  - 최근 커밋된 변경과 아직 비커밋인 핵심 코드 구분
  - 현재 런타임 기준 `aira`, `ledger` primary 분산 상태
  - `/battle/bitcoin` 최근 실측값과 `pick-ready` 중심 판단
  - prompt/parser/result pending UI 보강의 목적
- `research.md` 14번 섹션을 최신 이해 기준으로 다시 써서 인코딩 깨짐 없이 읽을 수 있게 정리했음
- 작업 규칙에 맞춰 이번 작업의 프롬프트 기록과 개발일지도 함께 추가했음

## 해결되지 않은 것

- 문서 정리만 수행했으므로 테스트, 린트, 타입체크는 실행하지 않았음
- 실제 코드 상태는 여전히 비커밋 코드와 런타임 산출물이 섞여 있으니, 다음 작업 시작 전 `git status`로 의도적으로 분리해서 봐야 함
