# Vercel React 성능 리뷰 지적사항 반영 프롬프트 기록

- 작성시각: 2026-03-25 15:45 KST
- 해결하고자 한 문제:
  - 리뷰에서 지적된 성능 이슈 4개를 실제 코드로 반영해야 했음.

## 사용한 프롬프트

```text
[P1] useBattleStream.ts 에서 스트림 메트릭을 이벤트마다 state로 올려서 배틀 화면 전체 리렌더를 만들고 있어.
[P2] SearchBar.tsx 는 isOpen 변화만으로도 같은 검색어 재요청이 나가서 client fetch가 중복돼.
[P2] AppHeader.tsx 는 헤더 전체를 client component로 둬서 모든 페이지의 공통 번들 비용을 키우고 있어.
[P2] me/page.tsx 는 상세 조회를 * projection으로 넓게 가져와서 서버 fetch/serialization 비용이 크다.
```

## 해결된 것

- `useBattleStream` 메트릭 state 갱신 범위 축소
- `SearchBar` 동일 쿼리 중복 fetch 제거
- `AppHeader` 서버 셸 + 클라이언트 auth controls 분리
- `/me` 상세 projection 축소
- `typecheck`, 대상 파일 `eslint` 확인

## 아직 안 된 것

- 전체 `pnpm.cmd lint`는 `tmp/` 산출물 오류 때문에 실패함.
- 별도 테스트 추가는 이번 작업 범위에 넣지 않았음.
