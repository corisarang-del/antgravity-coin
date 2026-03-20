# 서버 배틀 snapshot 저장

작성시각: 2026-03-20 14:25 KST

## 해결하려고 한 문제

- 결과 정산 시점이 멀어지면 localStorage snapshot만으로는 토론 메시지 복원이 불안정한 문제
- 다른 탭/재방문 상황에서 결과 화면이 snapshot 메시지를 잃어버리면 리포트를 재생성할 수 없는 문제

## 해결된 것

- 서버용 `battle_snapshot_store.json` 저장소를 추가했다.
- `/api/battle/snapshot` POST/GET 라우트를 추가했다.
- `useBattleStream`가 배틀 완료 직후 snapshot을 서버에 저장하도록 바꿨다.
- `snapshotId`를 `UserBattle`와 `PlayerDecisionSeed`에 연결했다.
- 결과 정산 시 로컬 messages가 없어도 `snapshotId`가 있으면 서버 저장 snapshot을 사용할 수 있게 outcome API를 확장했다.
- 타입체크, 린트, 전체 테스트를 다시 통과했다.

## 아직 안 된 것

- 서버 snapshot 저장은 현재 파일 기반이라 장기적으로는 DB 이전이 필요하다.
- 다른 기기에서도 완전 복원이 되려면 사용자 계정 단위 snapshot 연결까지 추가로 정리해야 한다.

