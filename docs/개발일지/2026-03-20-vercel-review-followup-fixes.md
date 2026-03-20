# Vercel Review Follow-up Fixes

- 작성시각: 2026-03-20 18:05 KST
- 해결하고자 한 문제:
  - `currentUserStore`가 초기 서버 스냅샷을 너무 오래 우선해서 로그아웃 직후 헤더가 오래된 사용자 상태를 잠깐 유지할 수 있는 문제
  - 캐릭터 페이지가 배너 문구 하나 때문에 마운트 후 `/api/characters`를 다시 호출하는 문제

## 해결된 것

- 초기 서버 스냅샷은 첫 구독 시 1회 부트스트랩 용도로만 적용하고, 이후 `refreshCurrentUserStore()` 이후에는 실제 store fetch가 다시 돌도록 수정했음
- 캐릭터 소스 상태 문구를 서버 helper에서 계산해서 페이지 props로 내려주도록 변경했음
- `CharactersPageClient`에서 클라이언트 후속 fetch와 `useEffect`를 제거했음
- `pnpm typecheck`, `pnpm lint` 통과

## 해결되지 않은 것

- 캐릭터 카드 본문 문자열 자체의 인코딩 정리는 이번 범위에서 다루지 않았음

