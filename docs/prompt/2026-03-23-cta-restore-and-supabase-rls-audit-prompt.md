# CTA 복구 및 Supabase RLS 배포 점검 프롬프트

- 작성시각: 2026-03-23 16:57 KST
- 프롬프트 요약:
  - 다른 브랜치 내용을 `master` 기준으로 반영하고
  - 배포 전 Supabase에서 `RLS`, `anon key`, `service_role key`, `정책 테스트`를 확인
  - anon key로 전체 테이블 조회가 되는지 실제로 점검

## 해결하고자 한 문제

- CTA 복구본이 현재 `master`에서 빠진 상태라 다시 반영할 필요가 있었음
- 배포 전에 Supabase가 anon 기준으로 열려 있지 않은지 실제 응답으로 확인해야 했음
- 작업 기록 규칙상 이번 요청의 프롬프트도 문서로 남겨야 했음

## 해결된 것

- CTA 가독성 복구 코드를 다시 `master` 쪽 소스에 반영했음
- Supabase 마이그레이션과 환경변수 사용 위치를 점검했음
- anon 기준 live `select`/`insert` 테스트를 실행해 RLS가 실제로 동작하는지 확인했음

## 해결되지 않은 것

- orphan 브랜치인 `codex/push-safe-20260323`를 히스토리 그대로 `master`에 merge한 건 아님
- 로그인 사용자 토큰 기준 정책 테스트와 `update/delete` 전수 테스트는 이번 범위에 포함하지 않았음
