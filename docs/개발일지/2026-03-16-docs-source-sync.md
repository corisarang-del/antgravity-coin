# 개발일지 - 문서와 실제 소스 동기화

- 작성시각: 2026-03-16 00:00:00 +09:00
- 해결하고자 한 문제:
  - `docs/planning`과 `specs` 일부가 오래된 `/analyze` 흐름과 예전 데이터 계약을 기준으로 남아 있었음.
  - 실제 구현은 `/`, `/home`, `/battle/*` 흐름과 로컬스토리지 기반 계약으로 바뀌었는데 문서가 따라오지 못했음.
- 진행 내용:
  - 실제 라우트, 화면, 데이터 모델, API 응답 형태를 소스 기준으로 다시 확인함.
  - `docs/planning/05-api-spec.md`, `docs/planning/06-screens.md`를 현재 동작 기준으로 갱신함.
  - `specs/domain`, `specs/shared`, `specs/screens`를 현재 구현 계약에 맞게 정리하고, obsolete한 `analyze.yaml`은 제거함.
- 해결된 것:
  - 문서 기준 라우트가 `/`, `/home`, `/battle/*`, `/characters` 흐름으로 통일됨.
  - `specs`의 타입/스토리지/API 계약이 현재 소스 구조와 맞춰짐.
  - 랜딩 hover preview, 대기 화면의 데모 카운트다운, 결과 화면의 실제 단순 규칙까지 문서에 반영됨.
- 해결되지 않은 것:
  - 소스에 남아 있는 깨진 한글 UI 문구 자체는 이번 작업에서 수정하지 않았음.
  - `fetchMarketData`의 synthetic 데이터 의존 역시 문서만 현행화했고 구현은 유지했음.

