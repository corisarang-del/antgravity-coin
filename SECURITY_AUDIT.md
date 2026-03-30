# 보안 감사 리포트

**프로젝트:** ant-gravity-coin  
**점검일:** 2026-03-27 12:28 KST  
**점검 범위:** 8개 카테고리, 266개 파일 분석 (`src/`, `supabase/`, 설정 파일, 환경변수 파일, lock 파일)  
**상태:** 2026-03-27 보안 수정 반영 후 재점검 완료

## 요약

| 심각도 | 발견 수 |
|--------|---------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 0 |
| **총계** | **0** |

직전 감사에서 잡았던 6건은 모두 코드와 의존성 트리에서 조치했다. 현재 기준으로는 즉시 수정이 필요한 열린 취약점을 재현하지 못했다.

## 해결 완료 항목

### [RESOLVED-1] 클라이언트 진행도/배틀 상태 직접 주입 차단
- **대상:** `src/app/api/auth/merge-local/route.ts`, `src/app/me/MergeLocalStateClient.tsx`, `src/app/api/battle/session/route.ts`
- **조치:** `merge-local`은 이제 최근 코인과 서버에 저장된 guest battle 산출물만 가져오고, 클라이언트가 보낸 `localUserLevel`, `userBattle`, `battleSnapshot`는 신뢰하지 않는다. `battle/session`은 서버 snapshot과 일치하는 값만 저장한다.

### [RESOLVED-2] AI 비용 엔드포인트 일일 quota 추가
- **대상:** `src/app/api/battle/route.ts`, `src/app/api/battle/outcome/route.ts`
- **조치:** 기존 분당 제한에 더해 일일 quota를 추가했다.

### [RESOLVED-3] shared rate limit fail-open 제거
- **대상:** `src/shared/utils/requestRateLimiter.ts`
- **조치:** 운영 환경에서 Supabase RPC가 없거나 실패하면 로컬 메모리 limiter로 폴백하지 않고 차단한다. 테스트/개발 환경에서만 로컬 폴백을 허용한다.

### [RESOLVED-4] 게스트 쿠키 위조 완화
- **대상:** `src/infrastructure/auth/guestSession.ts`
- **조치:** guest owner 식별자를 서명된 쿠키로 바꿨다. 유효하지 않은 값은 신뢰하지 않는다.

### [RESOLVED-5] `.env.production` 계열 커밋 위험 제거
- **대상:** `.gitignore`, `.env.local.example`
- **조치:** `.env*` 전체를 ignore 하고 example 파일만 예외로 유지했다. `GUEST_SESSION_SECRET` 예시 키도 추가했다.

### [RESOLVED-6] dependency advisory 정리
- **대상:** `package.json`, `pnpm-lock.yaml`
- **조치:** `pnpm.overrides`로 취약한 transitive 버전을 올리고 재설치 후 `pnpm audit --json` 기준 취약점 0건을 확인했다.

## 카테고리별 결과

- **환경변수/시크릿 노출:** 현재 기준으로 `service_role` 노출이나 하드코딩된 API 키는 찾지 못했다. `.env*` ignore 규칙은 보강했다.
- **인증/인가:** admin 경로는 계속 `getAdminAccess()`로 보호되고 있고, 일반 사용자 경로의 클라이언트 상태 신뢰 문제는 제거했다.
- **Rate Limiting:** 비용성 battle/outcome 엔드포인트에 일일 quota를 추가했고, shared limiter 장애 시 fail-open도 막았다.
- **파일 업로드 보안:** 업로드 엔드포인트나 multipart 처리 코드는 찾지 못했다.
- **스토리지 보안:** `storage.from`, public bucket, signed URL 관련 코드는 찾지 못했다.
- **Prompt Injection:** system/user 프롬프트 분리는 유지되고 있고, AI 응답이 코드 실행이나 DB 쿼리에 직접 연결되는 경로는 찾지 못했다.
- **정보 노출:** `next.config.ts`의 CSP와 기본 보안 헤더는 유지되고 있다.
- **의존성 취약점:** `pnpm audit --json` 기준 `critical/high/moderate/low` 모두 0건이다.

## 검증

- `pnpm.cmd typecheck` 통과
- `pnpm.cmd lint` 통과
- `node_modules\.bin\vitest.cmd run src/shared/utils/requestRateLimiter.test.ts src/app/api/auth/merge-local/route.test.ts src/app/api/battle/session/route.test.ts src/infrastructure/auth/guestSession.test.ts src/app/api/battle/route.test.ts src/app/api/battle/outcome/route.test.ts` 통과
- `pnpm.cmd audit --json` 결과 취약점 0건

## 잔여 메모

- 전체 `pnpm.cmd test`는 이번 보안 수정과 무관한 기존 `src/infrastructure/api/llmRouter.test.ts` 2건 실패가 남아 있어서 아직 전체 green은 아니다.
- 이번 리포트 기준으로는 보안 취약점 6건은 조치 완료로 본다.
## 새 세션 메모

- 이 리포트는 “현재 열린 취약점 0건” 기준 문서다.
- 다음 세션 첫 보안 체크는 코드 스캔보다 배포 반영 상태 확인이 더 중요하다.
  - Supabase migration 3개 적용
  - `GUEST_SESSION_SECRET` 설정
  - admin 권한 부여
- 그 이후에는 보안보다 battle live 품질과 기존 `llmRouter.test.ts` 실패 정리가 우선이다.

## 2026-03-31 추가 메모

- dirty worktree에서 production 미반영 의미 있는 코드가 남았는지 다시 점검한 결과, 사실상 Gemini/OpenRouter 보안 후속만 별도 반영 대상이었다
- 아래 보안 후속은 clean production worktree에서 따로 반영했고 현재 `master`까지 올렸음
  - Gemini API 키를 URL 쿼리스트링 대신 `x-goog-api-key` 헤더로 전송
  - OpenRouter 실패 로그에서 raw response body 제거
  - 관련 테스트 3개 추가/보강
- 관련 커밋
  - `dc86c3e`
  - `fix: harden gemini and openrouter logging`
- 검증
  - `pnpm.cmd typecheck` 통과
  - `pnpm.cmd build` 통과
  - Gemini/OpenRouter 관련 Vitest 통과
- 운영 메모
  - Git 기반 production 반영은 실제로 정상 동작
  - `vercel deploy --prod --yes` 수동 실행은 마지막 단계에서 `Unexpected error. Please try again later. ()`가 반복됨
  - 따라서 현재는 수동 CLI 배포보다 Git 기반 production 반영을 우선하는 게 안전함
