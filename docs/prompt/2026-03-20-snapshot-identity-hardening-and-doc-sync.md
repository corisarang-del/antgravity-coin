# snapshot 식별자 강화와 planning 문서 동기화 프롬프트

작성시각: 2026-03-20 14:35 KST

## 프롬프트 요약

`userId + snapshotId + battleId` 관계를 더 명확히 고정하고, planning 폴더 안 문서를 현재 소스코드 기준으로 업데이트하고, 그 외 관련 문서도 같이 정리하기.

## 해결하려고 한 문제

- snapshot 소유권과 battle 연결성이 약한 점
- planning 문서와 실제 구현의 드리프트

## 해결된 것

- snapshot 저장/조회/정산 검증 규칙을 코드와 테스트에 반영했다.
- 핵심 planning 문서를 현재 코드 기준으로 다시 작성했다.

## 아직 안 된 것

- snapshot 삭제 정책과 멀티디바이스 복원 정책은 후속 과제다.

