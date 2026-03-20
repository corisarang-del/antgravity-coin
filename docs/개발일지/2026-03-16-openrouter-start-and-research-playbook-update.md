# 개발일지 - OpenRouter 시작 방식과 캐릭터 조사 플레이북 문서화

- 작성시각: 2026-03-16 22:45:00 +09:00
- 해결하고자 한 문제:
  - OpenRouter 하나로 시작하는 실무적 방법과 캐릭터별 조사 방식이 planning 문서에는 아직 정리돼 있지 않았음.
  - 구현 전에 어떤 방식으로 모델을 붙이고, 각 캐릭터가 무엇을 조사해야 하는지 문서로 고정할 필요가 있었음.
- 진행 내용:
  - `docs/planning/05-api-spec.md`에 OpenRouter 단일 키 기반 시작 방법을 추가함.
  - `docs/planning/01-prd.md`에 캐릭터 조사 방식 원칙을 추가함.
  - `docs/planning/06-tasks.md`에 OpenRouter 기반 시작 태스크와 구현 전 문제점 체크를 추가함.
- 해결된 것:
  - `OPENROUTER_API_KEY` 하나로 검증을 시작하는 방법이 planning 문서에 반영됨.
  - 캐릭터별 조사 축이 역할별로 정리됨.
  - 구현 전 의사결정 포인트가 `06-tasks.md`에 명시됨.
- 해결되지 않은 것:
  - 실제 코드 라우팅이 OpenRouter 우선 전략으로 바뀐 것은 아님.
  - provider 직결과 OpenRouter 경유 중 최종 운영 선택은 아직 필요함.

