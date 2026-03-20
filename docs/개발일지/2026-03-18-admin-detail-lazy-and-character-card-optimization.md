# admin 상세 lazy 분리와 character card 이미지 최적화

- 작성시각: 2026-03-18 20:49 KST
- 해결하고자 한 문제:
  - 관리자 배틀 페이지 상세 패널을 한 번 더 분리해 초기 렌더 비용을 줄이고 싶었다.
  - 캐릭터 카드 한 장당 같은 이미지를 3번 렌더링하던 구조를 줄여 이미지 decode/paint 비용을 낮추고 싶었다.

## 해결된 것
- 관리자 상세 패널을 `AdminBattleDetailPanel`로 분리하고 `next/dynamic`으로 lazy chunk 처리했다.
- 관리자 검색/목록/상세에 쓰는 타입을 `adminBattles.types.ts`로 분리해 구조를 정리했다.
- `CharacterCard`의 장식용 좌우 이미지를 제거하고 CSS 블러 레이어로 대체했다.
- 메인 캐릭터 이미지는 1장만 렌더링하고 `sizes`를 명시해 불필요한 이미지 비용을 줄였다.
- `pnpm lint`, `pnpm typecheck`를 통과했다.

## 아직 해결 안 된 것
- 관리자 상세 패널 내부에서 report, events 같은 더 작은 단위까지 추가 lazy 분리하지는 않았다.
- 캐릭터 카드 시각 효과가 이전과 아주 똑같지는 않고, 비슷한 무드로 가볍게 재구성한 상태다.

