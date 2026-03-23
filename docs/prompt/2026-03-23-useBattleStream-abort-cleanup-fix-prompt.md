# useBattleStream abort cleanup fix prompt

- 작성시각: 2026-03-23 17:04 KST
- 프롬프트 요약:
  - `BodyStreamBuffer was aborted`
  - `src/presentation/hooks/useBattleStream.ts (276:18)`
  - cleanup의 `controller.abort()` 근처 에러 수정 요청

## 해결하고자 한 문제

- battle stream hook cleanup에서 abort가 noisy error로 보이는 원인을 찾아 수정해야 했음
- 정상적인 unmount cleanup과 실제 실패 상황을 분리해야 했음

## 해결된 것

- `useBattleStream` cleanup 분기를 수정해 reader가 있을 때는 `reader.cancel()`만 호출하도록 바꿨음
- 같은 시나리오를 재발 방지 테스트로 추가했음
- 타입체크와 테스트 동작까지 확인했음

## 해결되지 않은 것

- tmp 디렉터리의 기존 live 테스트가 전체 vitest 명령에 끼어드는 문제는 그대로 남아 있음
- battle UI 브라우저 재확인은 별도로 하지 않았음
