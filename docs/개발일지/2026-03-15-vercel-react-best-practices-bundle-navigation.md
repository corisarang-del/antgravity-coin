# vercel-react-best-practices 번들 경로 정리와 내부 라우팅 최적화

- 작성시각: 2026-03-15 21:27:00 +09:00
- 해결하고자 한 문제:
  - 클라이언트에서도 참조되는 캐릭터 상수 모듈이 배럴 파일을 통해 API 스키마까지 연결되는 구조라 번들 경로가 불필요하게 넓어질 수 있었음.
  - 일부 컴포넌트가 내부 페이지 이동에 일반 앵커를 써서 Next의 클라이언트 라우팅 이점을 충분히 못 쓰고 있었음.
- 진행 내용:
  - `src/shared/constants/characters.ts`를 직접 import 기반 모듈로 재구성함.
  - `src/presentation/components/TopCoinsGrid.tsx`와 `src/presentation/components/RecentCoinsList.tsx`를 `next/link` 기반으로 변경함.
  - `src/shared/constants/characters.test.ts`에 shared entry point 회귀 테스트를 추가함.
- 해결된 것:
  - `bundle-barrel-imports` 관점에서 shared constants가 더 가벼운 경로를 타도록 정리함.
  - 내부 이동 링크 2곳을 `Link`로 바꿔 프리패치/클라이언트 내비게이션 경로를 확보함.
  - `pnpm test -- src/shared/constants/characters.test.ts`, `pnpm lint`, `pnpm typecheck`를 모두 통과함.
- 해결되지 않은 것:
  - 랜딩 페이지 클라이언트 컴포넌트가 큰 편이라, 더 공격적인 성능 최적화는 다음 단계에서 별도 분리가 필요함.
  - `LandingPageClient.tsx` 내부 링크와 인터랙션 분리는 이번 단계 범위에서 제외했음.
