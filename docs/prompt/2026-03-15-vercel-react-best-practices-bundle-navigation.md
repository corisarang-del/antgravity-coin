# vercel-react-best-practices 번들 경로 정리와 내부 라우팅 최적화

- 작성시각: 2026-03-15 21:27:00 +09:00
- 해결하고자 한 문제:
  - `$vercel-react-best-practices` 스킬 기준으로 React/Next.js 코드에서 바로 적용 가능한 성능 최적화 지점을 찾고 정리하려고 했음.
  - 특히 `bundle-barrel-imports`와 Next 내부 라우팅 최적화 관점에서 클라이언트 번들 경로를 가볍게 만들고 싶었음.
- 사용한 프롬프트/지시:
  - `$vercel-react-best-practices`
  - 스킬 문서를 기준으로 현재 코드베이스를 검토하고, 테스트 가능한 범위에서 바로 적용 가능한 최적화를 구현한다.
  - `shared/constants/characters.ts`의 배럴 의존을 제거하고, 내부 이동 링크를 `Link`로 바꾼 뒤 `pnpm test`, `pnpm lint`, `pnpm typecheck`로 검증한다.
- 해결된 것:
  - `shared/constants/characters.ts`가 `features/characters` 배럴을 통하지 않고 직접 필요한 모듈만 import하도록 정리함.
  - `TopCoinsGrid`, `RecentCoinsList`의 내부 이동을 `next/link`로 바꿔 클라이언트 내비게이션 경로를 정리함.
  - `shared/constants/characters` 공개 계약을 검증하는 테스트를 추가하고, 테스트/린트/타입체크를 통과함.
- 해결되지 않은 것:
  - `LandingPageClient.tsx` 안의 일부 내부 `<a>` 링크는 이번 단계에서 같이 정리하지 않았음.
  - 랜딩 페이지 전체를 더 작은 서버/클라이언트 경계로 쪼개는 구조 최적화는 아직 안 했음.
