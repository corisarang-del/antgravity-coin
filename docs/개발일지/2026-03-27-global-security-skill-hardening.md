# 전역 보안 스킬 보강

- 작성시각: 2026-03-27 11:06:04 +09:00
- 해결하고자 한 문제:
  - 전역 보안 스킬에 우리가 최근 점검한 Next.js + Supabase, 공개 운영 API, daily quota, OAuth 보안 체크 항목이 충분히 반영돼 있지 않았음
  - `guardrails`와 `fireauto-secure`의 역할 경계가 모호했음
  - 스킬 수정 후 구조 검증과 내용 스모크 테스트까지 완료할 필요가 있었음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\fireauto-secure\SKILL.md`를 보강해서 Next.js + Supabase, OAuth/소셜 로그인, admin-only / guest-scoped / authenticated 분류, daily quota 관점을 추가함
  - `C:\Users\khc\.codex\skills\fireauto-secure\references\patterns.md`를 재구성해서 상세 검색 패턴과 판정 기준을 추가함
  - `C:\Users\khc\.codex\skills\guardrails\SKILL.md`에 저장소 수준 보안 감사는 `fireauto-secure`에서 본다는 역할 경계 문구를 추가함
  - `quick_validate.py`를 UTF-8 모드로 실행해서 `fireauto-secure`, `guardrails` 둘 다 유효성 검증 통과를 확인함
  - grep 스모크 테스트로 `service_role`, `NEXT_PUBLIC_`, `RLS`, `admin-only`, `guest-scoped`, `daily quota`, `signInWithOAuth`, `exchangeCodeForSession`, `signOut`, `callback` 키워드 반영을 확인함
- 아직 해결되지 않은 것:
  - `quick_validate.py`는 기본 Windows 인코딩(cp949)로는 UTF-8 한글 스킬 파일을 읽지 못해서, 현재는 `PYTHONUTF8=1` 환경변수로 우회 검증함
  - 필요하면 나중에 validator 자체를 UTF-8 기본 읽기로 개선할 수 있음
