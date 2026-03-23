# 캐릭터도감 설명문 가독성 규칙 동기화

- 작성시각: 2026-03-23 22:54 KST
- 해결하고자 한 문제:
  - 캐릭터도감 쪽 설명문과 보조 카피는 홈/검색/로그인에 적용한 `16px + 대비 강화` 규칙이 아직 반영되지 않았음
  - 캐릭터 역할 같은 메타 텍스트는 유지하면서, 실제 읽어야 하는 설명문만 같은 규칙으로 맞출 필요가 있었음

## 해결된 것

- `src/app/characters/CharactersPageClient.tsx`
  - 페이지 상단 설명문과 `sourceNotice`에 `ag-body-copy`, `ag-body-copy-strong`를 적용했음
- `src/presentation/components/CharacterCard.tsx`
  - 카드 본문 설명인 `specialty`를 같은 가독성 규칙으로 조정했음
- `src/presentation/components/CharacterDetailModal.tsx`
  - `specialty`, `personality`, `selectionReason` 본문을 같은 규칙으로 조정했음
- 유지한 것
  - 역할(role) 텍스트 같은 메타 정보는 기존 `text-sm` 스타일을 그대로 유지했음
- 검증
  - `pnpm.cmd typecheck` 통과
  - 대상 파일 `eslint` 통과

## 해결되지 않은 것

- 실제 브라우저에서 카드/모달의 시각 밸런스는 이번 턴에서 따로 확인하지 않았음
- 캐릭터도감 외 다른 세부 화면의 설명문까지 확장 적용할지는 추가 피드백에 따라 조정 가능함
