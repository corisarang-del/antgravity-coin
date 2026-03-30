# production sync와 dirty worktree cleanup

- 작성시각: 2026-03-31 KST

## 해결하고자 한 문제

- production 반영이 끝난 뒤에도 메인 workspace에 예전 실험 산출물과 중복 코드 변경이 남아 있어서, 새 세션 시작점이 불안정했음
- production에 아직 안 들어간 의미 있는 코드가 남아 있는지 다시 점검하고, 메인 workspace를 안전하게 정리할 필요가 있었음

## 해결된 것

- production 기준으로 최근 사용자 기능 4개가 모두 반영됐음을 직접 확인했음
  - 캐릭터 도감 초보 설명
  - 결과 페이지 준비 진행 바
  - 홈/로고 본문 랜딩 이동
  - `/me` 현재 등급 정상 표시
- 의미 있는 미반영 코드는 Gemini/OpenRouter 보안 후속뿐이라는 점을 다시 확인했고, 그 코드도 clean production worktree를 통해 `master`까지 반영했음
- 메인 workspace의 tracked dirty 변경은 되돌렸고, untracked 파일은 아래 backup 폴더로 이동했음
  - `C:\Users\Public\Documents\ESTsoft\CreatorTemp\ant_gravity_coin_dirty_backup_20260331_001`
- `.pnpm-store-clean/`, `.vercel/`은 `.gitignore`에 추가해서 다음 세션 noise를 줄였음

## 아직 안 된 것

- `vercel deploy --prod --yes` 수동 실행은 마지막 단계에서 계속 `Unexpected error`가 남아 원인 분석이 별도 과제로 남아 있음
- backup 폴더 안의 실험 파일 중 다시 살릴 게 있는지는 다음 세션에서 선별 검토가 필요함
