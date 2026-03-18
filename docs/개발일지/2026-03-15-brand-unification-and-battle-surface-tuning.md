# 브랜드 통일과 배틀 화면 표면 레이어 조정

- 작성시각: 2026-03-15 22:27:02 +09:00
- 해결하고자 한 문제:
  - 랜딩은 `Ant Gravity`, 내부는 `Ant Battle Log`라 브랜드 인상이 갈라져 있었음.
  - 배틀 메인 화면은 카드와 보조 표면의 층이 약해 디자인 문서 대비 평평하게 느껴졌음.
- 진행 내용:
  - `src/presentation/components/AppHeader.tsx`, `src/app/layout.tsx`에서 브랜드/메타데이터를 랜딩 기준으로 정리함.
  - `src/app/LandingPageClient.tsx`에서 히어로 문구를 `캐릭터토론으로`로 변경함.
  - `src/app/battle/[coinId]/BattlePageClient.tsx`, `src/presentation/components/TeamBoard.tsx`, `src/presentation/components/SpeakerSpotlight.tsx`, `src/presentation/components/IndicatorCard.tsx`, `src/presentation/components/BattleFeed.tsx`에서 표면 레이어를 조정함.
  - 브라우저로 랜딩과 배틀 화면을 재확인함.
- 해결된 것:
  - 브랜드 톤이 랜딩과 내부 페이지 사이에서 통일됨.
  - 히어로 타이포가 요청한 문구와 밀도로 반영됨.
  - 배틀 화면이 크기 변화 없이 카드/보조표면 대비가 더 또렷해짐.
  - `pnpm test`, `pnpm lint`, `pnpm typecheck`를 모두 통과함.
- 해결되지 않은 것:
  - 개발 환경의 favicon 404는 계속 남아 있으나 UI 작업과 직접 관련은 없음.
