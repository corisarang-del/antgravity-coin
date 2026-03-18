# 랜딩 대비감·모바일 체감 점검과 배틀 문구 정리

- 작성시각: 2026-03-18 21:24 KST
- 해결하고자 한 문제:
  - 랜딩 페이지 전체 대비감과 hover 프리뷰 텍스트 가독성을 더 높이고 싶었다.
  - 배틀/결과/대기 화면에 남아 있는 깨진 한글 문구와 모바일 UX 거슬림을 정리하고 싶었다.

## 해결된 것
- 랜딩 hover 프리뷰와 캐릭터 카드 캡션의 텍스트 대비를 올렸다.
- `/characters` 모바일 뷰에서 검색 자동 포커스 제거, 모달 동작, 전체 가로 스크롤 여부를 실제 브라우저로 확인했다.
- `/home`과 랜딩 모바일 뷰에서 전체 가로 스크롤이 없는 걸 확인했다.
- `BattlePageClient`, `ResultPageClient`, `WaitingPageClient`, `CharacterDetailModal`, `LandingCharacterPreviewModal`, `RiskDisclaimer`, admin 화면 문구를 읽기 자연스럽게 정리했다.
- `useRecentCoins`의 서버 스냅샷을 안정화해서 모바일 홈 진입 시 보이던 콘솔 경고 원인도 정리했다.
- `pnpm lint`, `pnpm typecheck`를 통과했다.

## 아직 해결 안 된 것
- 랜딩 페이지 전체 카피 톤이나 영문 혼용(`Ready to Play`, `Featured`)까지는 이번 턴에서 전면 개편하지 않았다.
- 실기기 네트워크 품질이 낮은 환경에서의 이미지/비디오 체감은 추가 확인 여지가 있다.
