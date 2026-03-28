# 내 페이지 등급명 깨짐 복구

- 작성시각: 2026-03-28 21:08 KST

## 해결하고자 한 문제

- 로그인 후 `/me` 화면의 `현재 등급` 카드에서 등급명이 `개미` 대신 깨진 문자열로 보이는 문제가 있었음
- 신규 코드의 상수는 정상이었지만, 기존 DB 또는 localStorage에 저장된 깨진 `title` 값이 그대로 렌더되는 상황으로 판단했음

## 해결된 것

- `src/infrastructure/mappers/levelMapper.ts`에 `normalizeUserLevel()`을 추가해서 깨진 등급명을 level 기준 canonical title로 보정하게 했음
- canonical title은 `개미`, `새싹개미`, `중급개미`, `고수개미`, `전설개미`로 고정했음
- `/me` 서버 렌더 경로에서 progress를 바로 정규화하도록 수정했음
- `/api/me`, `/api/me/progress` 응답도 정규화해서 이후 클라이언트 소비 경로에서도 같은 문제가 반복되지 않게 했음
- user level store가 localStorage에서 읽고 쓸 때도 정규화하도록 바꿔서 기존에 저장된 깨진 값도 자연스럽게 복구되게 했음
- `src/infrastructure/mappers/levelMapper.test.ts`를 추가해서 깨진 문자열 복구와 level clamp를 검증하는 테스트를 작성했음
- `pnpm.cmd typecheck` 통과
- 변경 파일 대상 `eslint` 통과

## 아직 안 된 것

- Vitest는 이 환경에서 `spawn EPERM` 때문에 실행 시작 단계에서 막혀 실제 테스트 런 결과는 확인하지 못했음
- `/me` 페이지의 다른 한글 문구 중 과거 인코딩 흔적이 더 있는지는 이번 요청 범위에서는 전부 정리하지 않았음

## 메모

- 이번 이슈의 핵심은 소스 상수 자체보다 저장된 이전 데이터 복구였음
- 따라서 단순 문자열 교체보다 읽기 경로 정규화가 더 중요한 수정이었음
