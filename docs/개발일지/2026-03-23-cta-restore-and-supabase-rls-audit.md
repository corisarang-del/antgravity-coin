# CTA 복구 및 Supabase RLS 배포 점검

- 작성시각: 2026-03-23 16:57 KST
- 해결하고자 한 문제:
  - `master`에서 CTA 가독성 수정이 빠져 다시 어두운 버튼이 보이던 문제를 복구해야 했음
  - 배포 전 Supabase RLS, publishable key, service role key, anon 접근 가능 여부를 실제 기준으로 점검해야 했음

## 해결된 것

- `codex/local-archive-20260323`에 남아 있던 CTA 복구 내용을 현재 `master` 기준 코드에 다시 반영했음
- 아래 7개 파일에 공통 CTA 규칙과 홈/랜딩/battle/pick CTA 스타일을 복원했음
  - `src/app/globals.css`
  - `src/presentation/components/AppHeader.tsx`
  - `src/presentation/components/TopCoinsGrid.tsx`
  - `src/app/page.tsx`
  - `src/app/LandingPageClient.tsx`
  - `src/app/battle/[coinId]/BattlePageClient.tsx`
  - `src/app/battle/[coinId]/pick/PickPageClient.tsx`
- `pnpm run typecheck` 통과
- `pnpm run lint`는 기존 `tmp/cache-prewarm-runner.cjs`의 `require()` 이슈 때문에 실패했고, `tmp/**` 제외 기준 eslint는 통과했음
- Supabase 점검 결과
  - 마이그레이션 기준 주요 테이블에 RLS가 켜져 있음
  - 프론트/서버 공통으로 publishable key만 사용 중임
  - 코드와 `.env*` 기준 service role key 사용 흔적은 찾지 못했음
  - live anon 테스트에서 주요 8개 테이블 `select`는 모두 `200 []`
  - 같은 8개 테이블 `insert`는 모두 `401`과 `row-level security policy` 위반으로 거부됨

## 해결되지 않은 것

- `codex/push-safe-20260323`는 orphan 브랜치라 일반적인 `git merge` 대상이 아니고, 현재는 필요한 코드 내용을 `master`에 선별 반영한 상태임
- Supabase 정책 테스트는 anon 기준 `select`/`insert`까지 확인했지만, 로그인 사용자 시나리오와 `update/delete`까지 자동화한 건 아님
- `tmp/*` 때문에 기본 lint가 여전히 깨지는 기존 이슈는 남아 있음
