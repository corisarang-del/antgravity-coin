# 디자인 토큰 기준 페이지 전수 점검 및 UI 정렬

- 작성시각: 2026-03-15 21:49:19 +09:00
- 해결하고자 한 문제:
  - 디자인 토큰 문서상 권장된 표면, 강조색, 간격 리듬에 비해 일부 페이지 계열감이 약했음.
  - 특히 배틀 선택/대기/결과 페이지는 홈/배틀 메인과 공통 헤더 흐름이 끊겨 UX가 분리돼 보였음.
- 진행 내용:
  - `AppHeader`, `SearchBar`, `CharacterCard`, 홈 페이지, 캐릭터 도감 페이지의 색감/표면/상태 표현을 조정함.
  - `PickPageClient`, `WaitingPageClient`, `ResultPageClient`에 공통 헤더와 카드형 빈 상태를 추가함.
  - `PickButton`, `TimeframeSelector`의 선택/포커스 상태를 정리함.
  - Playwright로 `/home`, `/characters`, `/battle/bitcoin/pick`, `/battle/bitcoin/waiting`, `/battle/bitcoin/result`를 확인하고 선택 플로우도 한 번 실제로 밟아봄.
- 해결된 것:
  - 홈/도감/배틀 파생 페이지 간 시각적 계열감이 맞춰졌음.
  - 선택 상태, CTA, 빈 상태 메시지의 UX 흐름이 더 자연스러워졌음.
  - `pnpm test`, `pnpm lint`, `pnpm typecheck`를 모두 통과함.
- 해결되지 않은 것:
  - 결과 페이지의 실제 승패 결과 UI는 스냅샷 데이터가 쌓인 상태에서 추가 확인이 필요함.
