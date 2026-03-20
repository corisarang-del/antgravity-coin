# Source Doc Sync And Next Improvements

- 작성시각: 2026-03-20 23:35 KST
- 해결하고자 한 문제:
  - 최근 구현이 문서보다 앞서가서 `research.md`, `docs/planning/*` 설명이 실제 소스와 어긋난 부분이 있었음
  - 다음 세션에서 무엇을 우선 개선해야 하는지 `research.md`와 `memory.md`를 함께 보고 다시 정리할 필요가 있었음

## 해결된 것
- 소스를 기준으로 아래 문서를 다시 동기화함
  - `docs/planning/04-data-model.md`
  - `docs/planning/05-api-spec.md`
  - `docs/planning/06-tasks.md`
  - `docs/planning/09-cache-strategy.md`
  - `docs/planning/10-storage-json-types.md`
  - `docs/planning/12-auth-user-flow.md`
  - `research.md`
- 문서에 반영한 핵심 변경:
  - prepared battle context와 `battle_prep_cache.json`
  - `/api/battle/session`, `/api/me/*`, `/api/providers/routes`, 운영 API
  - guest + auth 공존 owner 규칙
  - 파일 저장 + Supabase 미러 저장 구조
  - 현재 우선 개선 과제 재정리

## 해결되지 않은 것
- 무료 OpenRouter 모델 안정성 문제 자체는 아직 해결되지 않음
- prewarm 비용 과다 문제도 구조 개선이 남아 있음
- 일부 화면/문서 문자열 인코딩 깨짐은 여전히 남아 있음

