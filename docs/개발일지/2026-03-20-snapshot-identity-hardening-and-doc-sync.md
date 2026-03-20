# snapshot 식별자 강화와 planning 문서 동기화

작성시각: 2026-03-20 14:35 KST

## 해결하려고 한 문제

- snapshot 저장이 `snapshotId` 단독 기준이라 userId, battleId 관계가 충분히 명확하지 않은 문제
- planning 폴더 문서 다수가 현재 코드와 다른 구조이거나 인코딩이 깨진 상태인 문제

## 해결된 것

- snapshot 서버 저장 구조에 `userId`, `battleId`를 추가했다.
- snapshot API가 세션 userId 기준으로 저장/조회되게 바꿨다.
- pick 단계에서 snapshot과 battleId를 다시 바인딩하게 만들었다.
- outcome 정산 시 `userId + snapshotId + battleId` 관계를 검증하게 했다.
- planning 문서 `04-data-model`, `05-api-spec`, `06-screens`, `09-cache-strategy`, `10-storage-json-types`를 현재 코드 기준으로 정리했다.
- snapshot 관련 테스트를 보강했다.
- typecheck, lint, test를 다시 통과했다.

## 아직 안 된 것

- planning 폴더 전체를 제품 기획 문서 수준으로 다시 쓰는 작업은 후속 범위다.
- snapshot 보관 기간과 삭제 정책은 아직 정하지 않았다.

