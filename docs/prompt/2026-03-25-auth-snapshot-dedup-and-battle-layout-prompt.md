# auth snapshot 중복 제거와 battle layout 헤더 공통화 프롬프트 기록

- 작성시각: 2026-03-25 16:29 KST
- 해결하고자 한 문제:
  - `/me`의 auth 조회 중복과 battle 단계 이동 시 header snapshot 반복 fetch를 줄여야 했음.

## 사용한 프롬프트

```text
[P1] /me/page.tsx:45 는 getInitialCurrentUserSnapshot()와 supabase.auth.getUser()를 한 요청 안에서 중복 실행하고 있어.
[P2] /battle/[coinId]/page.tsx:11 패턴이 pick, waiting, result에도 반복돼서 battle step 이동마다 header snapshot fetch가 다시 돌아
```

## 해결된 것

- `/me` auth snapshot 중복 제거
- battle `[coinId]` layout 추가로 header snapshot 공통화
- `lint`, `typecheck`, `test` 통과

## 아직 안 된 것

- 이번 단계에서 별도 커밋은 하지 않았음.
