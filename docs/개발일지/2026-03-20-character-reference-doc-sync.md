# Character Reference Doc Sync

- 작성시각: 2026-03-20 23:58 KST
- 해결하고자 한 문제:
  - 캐릭터 모델 배치, fallback, role/system/user/habit prompt 설명이 현재 구현과 문서 사이에 어긋나 있었음
  - 관련 문서를 소스 기준으로 다시 맞추고 커밋 가능한 상태로 정리할 필요가 있었음

## 해결된 것
- `docs/planning/08-character-debate-reference.md`를 현재 구현 기준으로 전면 동기화함
- 아래 내용을 현재 소스 기준으로 반영함
  - 팀별 모델 배치
  - 공통 fallback qwen 통일
  - 캐릭터별 `roleInstruction`
  - 캐릭터별 `systemRules`
  - 캐릭터별 `userInstruction`
  - 캐릭터별 `habit prompt`
  - 캐릭터별 근거 소스 요약

## 해결되지 않은 것
- 과거 개발일지와 prompt 문서들 중 예전 모델 배치를 설명하는 기록은 그대로 남아 있음
- 그 문서들은 당시 작업 기록이라 별도 정리 대상은 아님
