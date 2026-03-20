# Planning Doc Sync Audit

- 작성시각: 2026-03-20 18:20 KST
- 해결하고자 한 문제:
  - `docs/planning` 문서들이 최근 프론트엔드 구조 변경과 어긋난 부분을 정리
  - 특히 세션 bootstrap, `/characters` 서버 문구 계산, 랜딩 서버/클라이언트 경계, 배틀 SSE 시작 흐름을 문서 기준으로 맞추기

## 해결된 것

- `05-api-spec.md`를 현재 API와 프론트 소비 규칙 기준으로 재정리
- `06-screens.md`를 현재 화면 구조 기준으로 재정리
- `06-tasks.md`를 최신 완료 범위/다음 우선순위 기준으로 재정리
- `12-auth-user-flow.md`를 현재 세션 bootstrap 흐름 기준으로 재정리
- 나머지 planning 문서는 현재 변경 범위와 직접 충돌하는 내용이 없어 유지

## 해결되지 않은 것

- 일부 기존 planning 문서의 문자열 인코딩 문제는 남아 있을 수 있음
- 다음 변경이 생기면 `04-data-model`, `09-cache-strategy`, `10-storage-json-types`, `11-battle-api-test-gaps`도 함께 재점검 필요
