# 개발일지 - planning 실패 정책과 계약 보강

- 작성시각: 2026-03-16 21:05:00 +09:00
- 해결하고자 한 문제:
  - 기존 planning 문서는 미구현 기능 목록은 있었지만, 구현 전에 반드시 고정해야 하는 실패 정책, 응답 계약, 데이터 출처, 버전 관리, 관측성 기준이 약했음.
  - 특히 `/api/battle` SSE 실패 처리, `/api/characters` shape, `fetchMarketData` 필드 출처, seed / event log 최소 계약이 문서상 불명확했음.
- 진행 내용:
  - `docs/planning/05-api-spec.md`에 SSE 실패 모드와 복구 정책, `/api/characters` 응답 계약 확정, `fetchMarketData` 필드 출처 매트릭스를 추가함.
  - `docs/planning/04-data-model.md`에 `BattleSnapshot` 로컬스토리지 계약, seed / outcome / report / event log 최소 스키마, 결과 규칙 버전 관리 정책을 추가함.
  - `docs/planning/06-screens.md`에 배틀 실패 UX, 대기 데모 UX 경계, 결과 하이라이트 규칙, 캐릭터 외부 소스 실패 처리 정책을 추가함.
  - `docs/planning/06-tasks.md`에 관련 세부 작업 항목을 추가함.
  - `docs/planning/01-prd.md`에 운영 안정성 원칙을 추가함.
- 해결된 것:
  - 구현 전 고정해야 하는 계약과 운영 정책이 문서상 한층 명확해짐.
  - `/api/characters`는 정식 계약을 `{ characters: [...] }`로 문서상 고정함.
  - 배틀 SSE는 중간 실패 시 `error` 이벤트 후 종료하는 목표 정책을 문서에 추가함.
  - `BattleResult.ruleVersion`과 `BattleSnapshot.version` 개념을 문서상 도입함.
- 해결되지 않은 것:
  - 실제 코드 구현은 아직 문서 정책을 따라오지 않음.
  - `error` 이벤트와 `/api/characters` 래핑 응답은 실제 구현과 테스트 정리가 후속으로 필요함.

