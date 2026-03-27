# 보안 스킬에 관리자 분리, 배포 점검, 결제 시나리오 기준 추가

- 작성시각: 2026-03-27 11:23:15 +09:00
- 해결하고자 한 문제:
  - 전역 보안 스킬에 관리자 기능 분리, 관리자 액션 로깅, IP allowlist, 유저 생성 전 권한 점검, 배포 전 30초 체크, 결제/웹훅 3대 시나리오 기준이 부족했음
  - RLS/anon key/service_role/policy test 기준을 더 명확히 넣을 필요가 있었음
- 해결된 것:
  - `C:\Users\khc\.codex\skills\fireauto-secure\SKILL.md`에 관리자 기능 분리, middleware-only 금지, IP allowlist, 관리자 액션 로깅, URL 파라미터 우회, 스택 트레이스, 불필요한 필드, 결제/웹훅 시나리오, 테스트 키/실키 분리 기준을 추가함
  - `C:\Users\khc\.codex\skills\fireauto-secure\references\patterns.md`에 관리자 기능 분리 패턴, 유저 생성 전 점검 체크리스트, 배포 전 30초 체크, anon key 정책 테스트, 결제/웹훅 상세 시나리오를 추가함
  - `quick_validate.py`로 `fireauto-secure` 유효성 검증 통과를 확인함
  - grep 스모크 테스트로 middleware, IP allowlist, 관리자 액션 로깅, URL 파라미터, 스택 트레이스, 불필요한 필드, 파라미터 검증, 웹훅, 이중결제, 환불, 테스트 키/실키, anon key, 정책 테스트 키워드 반영을 확인함
- 아직 해결되지 않은 것:
  - 별도 없음
