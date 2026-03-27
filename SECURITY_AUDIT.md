# 보안 감사 리포트

**프로젝트:** ant-gravity-coin  
**점검일:** 2026-03-27 14:35 KST  
**점검 범위:** 8개 카테고리, 275개 파일 분석 (`src/`, `supabase/`, 설정 파일, 환경변수 예시 파일, lock 파일, 보안 테스트 파일 포함)  
**실행 검증:** `pnpm.cmd typecheck`, `pnpm.cmd lint`, `node_modules\.bin\vitest.cmd run src\app\api\coins\search\route.test.ts src\app\api\battle\events\route.test.ts src\infrastructure\api\geminiSynthesisClient.test.ts src\infrastructure\api\geminiProvider.test.ts`, `pnpm.cmd audit --json`

## 요약

| 심각도 | 발견 수 |
|--------|---------|
| CRITICAL | 0 |
| HIGH | 0 |
| MEDIUM | 0 |
| LOW | 0 |
| **총계** | **0** |

직전 재감사에서 열린 이슈로 분류했던 4건은 현재 코드 기준으로 모두 조치 완료했다. 이번 시점에는 즉시 수정이 필요한 열린 취약점을 재현하지 못했다.

## 이번에 조치한 항목

### [RESOLVED-1] 공개 코인 검색 API rate limit 추가
- **대상:** `src/app/api/coins/search/route.ts`
- **조치:** 빈 검색어는 즉시 빈 목록을 반환하고, 과도한 검색어 길이는 400으로 차단한다. 실제 검색 요청은 shared rate limit을 거치도록 변경했다.
- **보완 테스트:** `src/app/api/coins/search/route.test.ts`

### [RESOLVED-2] guest-scoped battle events 조회 rate limit 추가
- **대상:** `src/app/api/battle/events/route.ts`
- **조치:** owner 격리는 유지하면서 owner 기준 조회 rate limit을 추가했다.
- **보완 테스트:** `src/app/api/battle/events/route.test.ts`

### [RESOLVED-3] Gemini 리포트/lesson 합성 프롬프트 경계 분리
- **대상:** `src/application/prompts/synthesisPrompt.ts`, `src/infrastructure/api/geminiSynthesisClient.ts`
- **조치:** report/lesson 합성 입력을 단일 user 프롬프트에서 `systemInstruction + user prompt` 구조로 분리했다.
- **보완 테스트:** `src/infrastructure/api/geminiSynthesisClient.test.ts`

### [RESOLVED-4] battle/provider 운영 로그 과노출 축소
- **대상:** `src/app/api/battle/route.ts`, `src/infrastructure/api/llmRouter.ts`, `src/infrastructure/api/geminiSynthesisClient.ts`, `src/infrastructure/api/openRouterProvider.ts`, `src/application/useCases/generateBattleDebate.ts`, `.env.local.example`
- **조치:** 디버그성 `console.log`는 `DEBUG_BATTLE_LOGS=true`일 때만 찍히도록 바꿨고, raw response body나 raw model output 조각은 로그에서 제거했다.

## 카테고리별 결과

- **환경변수/시크릿 노출:** `.env*` ignore 유지, `service_role` 노출 흔적 없음
- **인증/인가:** admin guard, guest owner 서명 쿠키, session/merge 무결성 보호 유지
- **Rate Limiting:** battle/outcome/snapshot/applications/admin-prewarm + coins search + battle events까지 보호 범위 반영
- **파일 업로드 보안:** 업로드 경로 없음
- **스토리지 보안:** Supabase Storage public bucket / signed URL 경로 없음
- **Prompt Injection:** battle 생성 경로와 Gemini 합성 경로 모두 system/user 분리 유지
- **정보 노출:** 보안 헤더 유지, 과한 battle/provider 로그 축소 반영
- **의존성 취약점:** `pnpm audit --json` 기준 취약점 0건

## 검증 결과

- `pnpm.cmd typecheck` 통과
- `pnpm.cmd lint` 통과
- `node_modules\.bin\vitest.cmd run src\app\api\coins\search\route.test.ts src\app\api\battle\events\route.test.ts src\infrastructure\api\geminiSynthesisClient.test.ts src\infrastructure\api\geminiProvider.test.ts` 통과
- `pnpm.cmd audit --json` 결과 취약점 0건

## 잔여 메모

- 이번 문서는 현재 열린 보안 취약점 0건 기준이다.
- 전체 테스트 스위트와는 별개로, 이번 보안 수정 범위는 타깃 테스트로 재검증했다.
- 다음 보안 점검에서는 새 취약점 탐지보다 운영 환경 반영 상태와 신규 공개 API 추가 여부를 먼저 보면 된다.
