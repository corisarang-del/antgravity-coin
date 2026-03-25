# 보안 감사 리포트

**프로젝트:** ant-gravity-coin  
**점검일:** 2026-03-25 KST  
**점검 범위:** 8개 카테고리, 약 258개 파일, API 라우트 31개

## 요약

| 심각도 | 발견 수 |
|--------|---------|
| CRITICAL | 1 |
| HIGH | 2 |
| MEDIUM | 3 |
| LOW | 0 |
| **총계** | **6** |

## 발견된 취약점

### [CRITICAL-1] admin battle 데이터 API가 인증 없이 공개돼 있음
- **심각도:** CRITICAL
- **카테고리:** 인증/인가
- **위치:** `src/app/api/admin/battles/route.ts:5`, `src/app/api/admin/battles/[battleId]/route.ts:12`
- **설명:** 두 admin API 모두 인증/권한 체크가 전혀 없다. 요청자 신원 검증 없이 battle outcome seed, character memory seed, player decision seed, report, event log까지 그대로 반환한다.
- **영향:** 외부 사용자가 관리자용 배틀 리포트와 내부 메모를 직접 열람할 수 있다. 사용자 선택 기록과 이벤트 로그까지 노출될 수 있어서 데이터 유출로 이어진다.
- **수정 방법:**
```ts
// 수정 전
export async function GET(request: Request) {
  const seedRepository = new FileSeedRepository();
  ...
}

// 수정 후
export async function GET(request: Request) {
  const { user, isAuthenticated } = await getRequestOwnerId();
  if (!isAuthenticated || !isAdminUser(user)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  ...
}
```

### [HIGH-1] admin cache prewarm 엔드포인트가 비인증 사용자에게 열려 있음
- **심각도:** HIGH
- **카테고리:** 인증/인가 / Rate Limiting
- **위치:** `src/app/api/admin/cache/prewarm/route.ts:10`
- **설명:** `POST /api/admin/cache/prewarm`는 ownerId를 guest 쿠키로도 만들 수 있어서 사실상 누구나 호출 가능하다. rate limit은 있지만 관리자 권한 검증이 없어서 admin 기능이 외부에 노출돼 있다.
- **영향:** 외부 사용자가 prewarm 작업을 반복 호출해 LLM/외부 API 비용을 유발하거나 캐시 리프레시를 남용할 수 있다.
- **수정 방법:**
```ts
// 수정 전
const { ownerId } = await getRequestOwnerId();

// 수정 후
const { user, isAuthenticated } = await getRequestOwnerId();
if (!isAuthenticated || !isAdminUser(user)) {
  return NextResponse.json({ error: "forbidden" }, { status: 403 });
}
```

### [HIGH-2] rate limiter가 인메모리 Map 기반이라 멀티 인스턴스 배포에서 쉽게 우회됨
- **심각도:** HIGH
- **카테고리:** Rate Limiting
- **위치:** `src/shared/utils/requestRateLimiter.ts:21`
- **설명:** 현재 rate limiter는 프로세스 메모리 Map만 사용한다. 서버 재시작, 멀티 인스턴스, 서버리스 스케일아웃 환경에서는 카운터가 공유되지 않아서 `battle`, `battle/outcome`, `admin/cache/prewarm` 보호가 실질적으로 약해진다.
- **영향:** 비용이 드는 AI 엔드포인트를 여러 인스턴스에 분산 호출해 제한을 쉽게 우회할 수 있다.
- **수정 방법:**
```ts
// 수정 전
const windows = new Map<string, RateLimitWindow>();

// 수정 후
// Upstash Redis, Supabase, KV 같은 외부 저장소 기반 limiter로 교체
const rateLimit = await redisRateLimit.limit(key);
```

### [MEDIUM-1] Gemini provider가 시스템 프롬프트와 사용자 입력을 한 블록으로 합쳐서 보냄
- **심각도:** MEDIUM
- **카테고리:** Prompt Injection
- **위치:** `src/infrastructure/api/geminiProvider.ts:40`
- **설명:** Gemini 호출에서 시스템 프롬프트와 사용자 프롬프트를 `${system}\n\n${user}` 형태의 단일 텍스트로 합치고 있다. 다른 provider는 `system`/`user`를 분리하지만 Gemini는 구분이 없어 사용자 입력이 정책 텍스트를 더 쉽게 덮어쓸 수 있다.
- **영향:** prompt injection 방어력이 약해지고, 모델이 시스템 규칙보다 사용자 입력을 우선 해석할 가능성이 커진다.
- **수정 방법:**
```ts
// 수정 전
text: `${buildCharacterSystemPrompt(input)}\n\n${buildCharacterUserPrompt(input)}`

// 수정 후
contents: [
  { role: "model", parts: [{ text: buildCharacterSystemPrompt(input) }] },
  { role: "user", parts: [{ text: buildCharacterUserPrompt(input) }] },
]
```

### [MEDIUM-2] battle SSE 에러 이벤트에 내부 에러 메시지를 그대로 노출함
- **심각도:** MEDIUM
- **카테고리:** 정보 노출
- **위치:** `src/app/api/battle/route.ts:154`
- **설명:** 스트림 실패 시 `error instanceof Error ? error.message : ...`를 그대로 클라이언트에 내려준다. 내부 에러 문자열에 외부 provider 상태, 파싱 실패 원인, 내부 경로성 문구가 섞이면 그대로 노출된다.
- **영향:** 공격자가 내부 동작과 실패 원인을 더 쉽게 추론할 수 있다.
- **수정 방법:**
```ts
// 수정 전
message: error instanceof Error ? error.message : "배틀 스트림을 이어가지 못했어."

// 수정 후
message: "배틀 스트림을 이어가지 못했어. 잠깐 뒤에 다시 시도해줘."
// 상세 원인은 서버 로그로만 남김
```

### [MEDIUM-3] CSP와 주요 보안 헤더 설정이 없음
- **심각도:** MEDIUM
- **카테고리:** 정보 노출 / 보안 헤더
- **위치:** `next.config.ts:3`
- **설명:** `next.config.ts`에는 이미지 설정만 있고 `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` 같은 보안 헤더 설정이 없다. `middleware.ts/js`도 없다.
- **영향:** XSS 방어 심층화, clickjacking 방지, MIME sniffing 방지 같은 기본 보안 레이어가 빠져 있다.
- **수정 방법:**
```ts
// next.config.ts 예시
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        { key: "Content-Security-Policy", value: "default-src 'self'; ..." },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
      ],
    },
  ];
}
```

## 카테고리별 추가 메모

### 환경변수/시크릿 노출
- `.env`, `.env.local`은 `.gitignore`에 포함돼 있음.
- 코드 검색 기준 `service_role` 키를 클라이언트에 노출한 흔적은 찾지 못함.
- 하드코딩된 실제 API 키 패턴은 찾지 못함.

### 파일 업로드 보안
- 파일 업로드 엔드포인트와 multipart 처리 코드는 찾지 못함.

### 스토리지 보안
- Supabase Storage, public bucket, signed URL 사용 흔적을 찾지 못함.

### 의존성 취약점
- `pnpm audit --json` 결과 알려진 취약점 0건.

## 우선순위 액션 아이템

| 순위 | 심각도 | 난이도 | 액션 | 예상 소요시간 |
|------|--------|--------|------|---------------|
| 1 | CRITICAL | 낮음 | admin battle API 두 곳에 인증/관리자 권한 검증 추가 | 20분 |
| 2 | HIGH | 낮음 | admin prewarm API에 관리자 권한 검증 추가 | 15분 |
| 3 | HIGH | 중간 | 인메모리 rate limiter를 외부 저장소 기반으로 교체 | 1~2시간 |
| 4 | MEDIUM | 중간 | Gemini provider에서 system/user 프롬프트를 역할별로 분리 | 30분 |
| 5 | MEDIUM | 낮음 | battle SSE 에러 메시지를 일반화하고 상세는 서버 로그로만 남기기 | 15분 |
| 6 | MEDIUM | 보통 | next.config에 CSP/XFO/nosniff 등 기본 보안 헤더 추가 | 30~45분 |

## 권장사항

1. `admin` 네임스페이스 라우트는 전부 공통 권한 헬퍼로 감싸서 개별 누락을 막는 게 좋다.
2. AI 비용이 드는 엔드포인트는 인증 + 외부 저장소 기반 rate limit를 같이 적용해야 한다.
3. provider별 프롬프트 전송 포맷을 통일해서 prompt injection 방어 수준을 맞추는 게 좋다.
4. 보안 헤더는 `next.config.ts` 또는 edge middleware에서 공통 적용하는 쪽이 유지보수에 유리하다.

## 2026-03-25 후속 조치 업데이트

아래 항목은 코드 기준으로 후속 수정이 진행됐다.

### 수정 완료

- admin API 보호 추가
  - `src/app/api/admin/battles/route.ts`
  - `src/app/api/admin/battles/[battleId]/route.ts`
  - `src/app/api/admin/cache/prewarm/route.ts`
- `/admin` 페이지 공통 보호 추가
  - `src/app/admin/layout.tsx`
- admin 권한 판별 헬퍼 추가
  - `src/infrastructure/auth/adminAccess.ts`
- shared rate limit 경로 추가
  - `src/shared/utils/requestRateLimiter.ts`
  - `supabase/migrations/20260325170000_add_admin_role_and_rate_limits.sql`
- Gemini system/user prompt 분리
  - `src/infrastructure/api/geminiProvider.ts`
- battle SSE 내부 에러 문자열 일반화
  - `src/app/api/battle/route.ts`
- 보안 헤더 추가
  - `next.config.ts`

### 아직 운영 반영 전인 것

- Supabase migration은 아직 실제 DB에 적용 전일 수 있다.
- 관리자 계정 권한도 아직 주지 않았을 수 있다.

### 운영 반영 체크리스트

1. migration `20260325170000_add_admin_role_and_rate_limits.sql` 적용
2. 관리자 계정에 `is_admin` 또는 `ADMIN_USER_IDS` 설정
3. `/admin` 접근, `/api/admin/*` 접근, battle/outcome/admin-prewarm rate limit 재확인

### 코드 검증 상태

- `pnpm lint` 통과
- `pnpm typecheck` 통과
- `pnpm test` 통과
