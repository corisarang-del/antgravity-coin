# production sync와 dirty worktree cleanup 프롬프트

- 작성시각: 2026-03-31 KST

## 프롬프트 요약

- 남아 있는 dirty worktree를 별도 정리하기전에 아직 프로덕션에 배포 안된 워크트리 있는지 찾아줘
- 안전하게 청소해줘. 그후에 새 세션에서 바로 이어서 남은 작업 실행시키고 싶은데 지금까지 내용을 완벽히 100% 숙지한 후 memory.md에 추가로 업데이트. 다른 관련 문서들에도 기존 내용 놔두고 추가로 업데이트

## 해결하고자 한 문제

- production 반영이 끝난 뒤에도 메인 workspace가 dirty 상태로 남아 있어서, 새 세션을 `master` 기준 clean 상태에서 시작할 수 있게 만드는 것

## 해결된 것

- production 미반영 의미 있는 코드를 다시 점검했고, 실제로는 Gemini/OpenRouter 보안 후속만 별도 반영 대상이었다는 점을 확인했음
- tracked dirty 변경은 되돌리고, untracked 파일은 외부 backup 폴더로 이동하는 방식으로 안전 cleanup을 진행했음
- `memory.md`, `research.md`, `SECURITY_AUDIT.md`에 이번 production sync와 cleanup 상태를 append로 남기게 했음

## 아직 안 된 것

- backup 폴더 안의 실험 파일을 다시 살릴지 버릴지는 다음 세션에서 선별 판단이 필요함
