# provider route admin 보호와 guest 저장 rate limit 프롬프트

- 작성시각: 2026-03-27 10:28:40 +09:00
- 프롬프트:
  - `/api/providers/routes`를 admin 전용으로 바꾸고 `/api/battle/snapshot`, `/api/battle/applications`에 rate limit 넣는 패치. 그런데 admin전용으로 바꾼다는게 관리자만 바꿀수 있단건가? 유저는 못바꾸고.
- 해결하고자 한 문제:
  - 공개 쓰기 엔드포인트를 운영 정책에 맞게 제한하고 보안 남용 가능성을 낮추는 것
- 해결된 것:
  - admin 전용의 의미를 관리자만 변경 가능, 일반 유저는 변경 불가로 명확히 정리함
  - provider route 변경 API에 admin guard를 추가함
  - guest 저장/적용 API에 rate limit을 추가함
- 아직 해결되지 않은 것:
  - 필요한 경우 추가로 guest quota, payload limit, 운영 환경 비활성화 정책을 별도 구현해야 함
