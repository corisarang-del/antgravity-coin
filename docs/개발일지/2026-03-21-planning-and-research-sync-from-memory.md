# Planning And Research Sync From Memory

- 작성시각: 2026-03-21 03:01 KST
- 해결하고자 한 문제:
  - `memory.md`와 현재 소스 기준으로 `docs/planning/*`, `research.md`가 다시 맞춰져야 했음
  - 시간프레임 6종, `battle_pick_ready`, 병렬 라운드, opening round prewarm, `/me` 아카이브, 운영 memo 화면 같은 최근 구현이 문서에 충분히 반영되지 않았음

## 해결된 것

- `docs/planning` 문서를 현재 소스 기준으로 다시 정리함
- `research.md`를 현재 battle 구조, 저장 전략, 인증 흐름, 우선순위 기준으로 갱신함
- AGENTS 기준 문서 경로인 `docs/PRD.md`가 현재 저장소에 없다는 드리프트를 문서에 명시함

## 해결되지 않은 것

- 실제 소스에 남아 있는 UTF-8 깨짐 문자열은 아직 문서화만 했고 코드 정리는 하지 않았음
- `pickReadyAt` timing metric은 아직 구현 전이라 문서에 후속 과제로 남겨둠
- 운영 페이지 접근 제어는 여전히 후속 작업임
