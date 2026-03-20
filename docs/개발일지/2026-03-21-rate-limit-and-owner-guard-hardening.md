# Rate Limit And Owner Guard Hardening

- 작성시각: 2026-03-21 04:07 KST
- 해결하고자 한 문제:
  - `POST /api/battle`, `POST /api/battle/outcome`, `POST /api/admin/cache/prewarm`에 호출 제한이 없어 비용 유발과 자원 고갈 위험이 있었음
  - `battleId`만 알면 `snapshot`, `outcome`, `events` 일부 조회 API에 접근 가능한 owner 검증 공백이 있었음
  - `pnpm audit`에서 `next@16.1.6`, `flatted@3.4.1` 취약점이 확인됐음

## 해결된 것

- `requestRateLimiter` 유틸을 추가하고 아래 route에 in-memory rate limit을 적용함
  - `POST /api/battle`
  - `POST /api/battle/outcome`
  - `POST /api/admin/cache/prewarm`
- `battleId` 조회 API에 owner 기준 snapshot 검증을 추가함
  - `GET /api/battle/snapshot?battleId=...`
  - `GET /api/battle/outcome?battleId=...`
  - `GET /api/battle/events?battleId=...`
- `FileBattleSnapshotRepository`에 `getSnapshotByBattleIdForUser()`를 추가해 owner 검증을 공통화함
- 관련 route 테스트와 rate limit 유틸 테스트를 보강함
- `package.json`에서 `next`를 `16.1.7`로 올리고 `flatted`를 `3.4.2`로 override 하도록 반영함
- `docs/planning/05-api-spec.md`에 rate limit과 owner 검증 규칙을 반영함

## 해결되지 않은 것

- 운영자 전용 `/admin/*` 접근 제어 자체는 아직 미구현임
- rate limit은 현재 메모리 기반이라 다중 인스턴스 환경에서는 공용 저장소 기반으로 옮겨야 함
- 의존성 변경 후 lockfile 반영과 최종 audit 재확인은 별도 검증 단계에서 확인해야 함
