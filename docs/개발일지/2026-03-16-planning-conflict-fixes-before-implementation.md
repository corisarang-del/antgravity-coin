# 개발일지 - 구현 전 planning 충돌 정리

- 작성시각: 2026-03-16 23:05:00 +09:00
- 해결하고자 한 문제:
  - planning 문서에 남아 있던 구현 충돌 요소를 정리할 필요가 있었음.
  - 특히 OpenRouter 단일 키 경로와 provider별 개별 env 구조가 같이 적혀 있었고, `Ledger`, `Shade`, `Vela`가 현재 `MarketData`에 없는 필드를 전제하는 부분이 있었음.
  - `Gemini`가 승패 판정과 섞이지 않게 분리하는 원칙과 `BattleReport` 문서 구조도 현재 코드와 더 맞출 필요가 있었음.
- 진행 내용:
  - `docs/planning/01-prd.md`에 OpenRouter 단일 키 우선 원칙과 `Gemini` 역할 분리를 보강함.
  - `docs/planning/05-api-spec.md`에 현재 구현 상태 기준 API 설명과 역할별 대체 evidence 규칙을 추가함.
  - `docs/planning/04-data-model.md`의 `BattleReport` 구조를 현재 코드 저장 구조와 일치시킴.
  - `docs/planning/06-tasks.md`의 구현 전 문제점 체크를 현재 결정사항 기준으로 보강함.
- 해결된 것:
  - OpenRouter 단일 키 경로와 provider 직결 env 구조의 우선순위가 문서상 분리됨.
  - `Ledger`, `Shade`, `Vela`의 조사 입력이 현재 `MarketData` 기준으로 구현 가능한 수준으로 정리됨.
  - `Gemini`가 승패 판정이 아니라 승부 근거 재정리와 report 생성만 맡는다는 원칙이 문서에 반영됨.
  - `BattleReport` 문서 구조가 현재 코드와 맞춰짐.
- 해결되지 않은 것:
  - 실제 코드 라우팅과 env 사용 방식이 문서 기준으로 완전히 재정렬됐는지는 별도 구현 검증이 필요함.
