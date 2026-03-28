# fresh store 재설치와 Next dev 복구

- 작성시각: 2026-03-28 18:40 KST
- 해결하고자 한 문제:
  - 손상된 pnpm 캐시/설치본 때문에 같은 의존성 오류가 반복 재발했고, 그 상태에서 lock 충돌과 `spawn EPERM`까지 겹쳐 dev 서버를 안정적으로 띄우지 못하고 있었음

## 해결된 것

- 기존 store 재사용 경로가 아니라 새 로컬 store `.pnpm-store-clean`로 재설치 방향을 바꿨음
- 새 store 설치에서 실제 다운로드가 일어나는 것까지 확인했음
- 설치 중 postinstall `spawn EPERM`은 sandbox 밖 실행으로 통과시켰음
- 의존성 resolve를 다시 확인했음
  - `react`
  - `react-dom`
  - `scheduler`
  - `zod`
  - `@supabase/ssr`
- `pnpm build`를 실행해서 production build가 끝까지 통과하는 것까지 확인했음
- `next dev` 로그에서 `Ready in 1039ms`를 확인했고, 검증용으로 띄운 프로세스는 다시 정리했음

## 해결되지 않은 것

- 사용자가 직접 띄우는 다음 `pnpm run dev`에서 어떤 포트를 잡는지는 남아 있는 시스템 프로세스 상태에 따라 달라질 수 있음
- 워크스페이스 바깥에서 이미 떠 있던 다른 `node` 프로세스까지 전부 정리한 건 아님
