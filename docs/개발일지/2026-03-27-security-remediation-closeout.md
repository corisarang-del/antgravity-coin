# 보안 취약점 6건 수정

- 작성시각: 2026-03-27 12:28 KST
- 해결하고자 한 문제:
  - 앞선 보안 감사에서 나온 6건의 취약점을 실제 코드와 의존성 트리에서 모두 제거해야 했음

## 해결된 것

- `merge-local`이 더 이상 클라이언트 진행도와 배틀 상태를 직접 믿지 않게 바꿨음
- `battle/session`이 서버 snapshot과 맞는 값만 저장하게 바꿨음
- guest owner 쿠키를 서명 방식으로 바꿨음
- `battle` / `battle/outcome`에 일일 quota를 추가했음
- shared rate limit RPC 장애 시 운영 환경 fail-open을 막았음
- `.gitignore`와 `.env.local.example`을 보강했음
- `pnpm.overrides` + 재설치로 dependency advisory를 0건으로 정리했음
- typecheck, lint, 보안 관련 타깃 테스트, `pnpm audit --json`까지 확인했음

## 해결되지 않은 것

- 전체 `pnpm test`는 기존 `llmRouter.test.ts` 2건 실패가 남아 있어 전체 green은 아님
- 이 실패는 이번 보안 수정 범위 밖이라 별도 작업으로 분리하는 게 맞음
