# Rate Limit And Owner Guard Hardening Prompt

- 작성시각: 2026-03-21 04:07 KST
- 프롬프트 내용 간단 요약:
  - `battle/outcome/prewarm`에 rate limit 추가
  - `battleId` 조회 API에 owner 검증 추가
  - `next`와 취약 의존성 업데이트 검토

## 해결된 것

- 고비용 route 3곳에 rate limit을 추가함
- `battleId` 기반 조회 3곳에 owner 검증을 추가함
- 관련 테스트와 planning API 문서를 갱신함
- `next` 버전 상향과 `flatted` override를 `package.json`에 반영함

## 해결되지 않은 것

- 운영자 페이지 접근 제어 전체는 이번 범위에서 다루지 않음
- lockfile 업데이트와 재설치 결과는 검증 단계에서 확인해야 함
