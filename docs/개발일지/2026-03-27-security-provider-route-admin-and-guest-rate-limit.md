# provider route admin 보호와 guest 저장 rate limit

- 작성시각: 2026-03-27 10:28:40 +09:00
- 해결하고자 한 문제:
  - `/api/providers/routes`가 인증 없이 런타임 provider route를 바꿀 수 있었음
  - `/api/battle/snapshot`, `/api/battle/applications`가 게스트 기준 공개 쓰기 API인데 route-level rate limit이 없었음
- 해결된 것:
  - `/api/providers/routes`의 GET/POST에 admin 권한 검사를 추가함
  - `/api/battle/snapshot` GET/POST에 owner+IP 기준 shared rate limit을 추가함
  - `/api/battle/applications` GET/POST에 owner+IP 기준 shared rate limit을 추가함
  - 관련 테스트를 추가/수정해서 권한 차단과 429 응답을 검증함
  - `pnpm lint`, `pnpm typecheck`, 대상 테스트 3개 파일 통과를 확인함
- 아직 해결되지 않은 것:
  - guest 쓰기 API의 장기 quota, payload size 제한, 저장소 TTL 청소 정책은 아직 없음
  - `/api/providers/routes`를 운영 환경에서 완전히 비활성화할지, admin 전용 유지할지는 추가 정책 결정이 필요함
