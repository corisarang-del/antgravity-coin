# 보안 취약점 후속 수정: admin 보호, 분산 rate limit, 보안 헤더

- 작성시각: 2026-03-25 17:32 KST
- 해결하고자 한 문제:
  - 보안 감사에서 나온 CRITICAL/HIGH/MEDIUM 취약점 6개를 실제 코드에서 닫아야 했음.
  - 특히 관리자 계정이 아직 없어도, 나중에 권한만 주면 즉시 보호가 적용되는 구조가 필요했음.

## 진행 내용

- `supabase/migrations/20260325170000_add_admin_role_and_rate_limits.sql`
  - `user_profiles.is_admin` 컬럼 추가
  - `request_rate_limits` 테이블 추가
  - `consume_request_rate_limit()` SECURITY DEFINER 함수 추가
- `src/infrastructure/auth/adminAccess.ts`
  - admin 판별 헬퍼 추가
  - 판별 기준
    - `user_profiles.is_admin = true`
    - `app_metadata.role === "admin"`
    - `app_metadata.is_admin === true`
    - `ADMIN_USER_IDS` env allowlist
- `src/app/admin/layout.tsx`
  - `/admin` 이하 페이지를 공통 admin 체크로 보호
- `src/app/api/admin/battles/route.ts`
  - 관리자 권한 체크 추가
- `src/app/api/admin/battles/[battleId]/route.ts`
  - 관리자 권한 체크 추가
- `src/app/api/admin/cache/prewarm/route.ts`
  - 관리자 권한 체크 추가
  - shared rate limit 사용으로 교체
- `src/shared/utils/requestRateLimiter.ts`
  - 기존 메모리 limiter 유지
  - Supabase RPC 기반 `consumeSharedRequestRateLimit()` 추가
  - 테스트 환경에서는 기존 로컬 limiter fallback 유지
- `src/app/api/battle/route.ts`
  - shared rate limit 사용으로 교체
  - 스트림 에러 시 내부 에러 상세 대신 일반화된 메시지만 반환
- `src/app/api/battle/outcome/route.ts`
  - shared rate limit 사용으로 교체
- `src/infrastructure/api/geminiProvider.ts`
  - `systemInstruction`과 `contents`를 분리해서 prompt injection 저항성 강화
- `next.config.ts`
  - CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy 추가
- `vitest.config.ts`
  - `tmp/**`를 테스트 대상에서 제외
- `.env.local.example`
  - `ADMIN_USER_IDS` 예시 추가

## 해결된 것

- admin API와 admin 페이지가 기본 차단되도록 변경
- 추후 관리자 권한만 부여하면 바로 접근 가능하도록 기반 추가
- 인메모리만 쓰던 rate limit를 공유 저장소 기반으로 확장
- Gemini 프롬프트 분리 적용
- battle 에러 상세 노출 제거
- 보안 헤더 추가
- `pnpm.cmd lint` 통과
- `pnpm.cmd typecheck` 통과
- `pnpm.cmd test` 통과

## 아직 안 된 것

- 실제 운영 환경에서 바로 효력을 내려면 Supabase migration 적용이 필요함.
- 관리자 계정도 아직 없으니, 실제 사용 전에는 `is_admin` 또는 `ADMIN_USER_IDS` 설정이 필요함.
