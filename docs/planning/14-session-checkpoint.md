# Session Checkpoint

- 작성시각: 2026-03-27 14:30 KST
- 목적: production 대응 이후 local 미커밋 WIP와 다음 세션 시작 순서를 한 곳에서 이어받기 위한 체크포인트 문서

## 원격에 반영된 production 안정화 커밋

- `1ec1e61`
  - Supabase env / rate limit fallback
- `e31aba5`
  - pnpm build script allowlist
- `dfd1c75`
  - read-only filesystem file store fallback
- `9ed4c87`
  - 비차트 캐릭터 evidence gating 완화
- `754e016`
  - missing evidence source 로그 추가
- `3565deb`
  - Bybit 403 시 Hyperliquid partial fallback

## 현재 local 미커밋 WIP

- `src/app/api/battle/route.ts`
  - round / pending / settled / emitted 로그
  - `judy`, `shade` timing 로그
- `src/application/useCases/generateBattleDebate.ts`
  - bare key JSON 허용
  - 한국어 stance 매핑
  - raw snippet 로그
- `src/shared/constants/characterDebateProfiles.ts`
  - `judy`, `clover`, `ledger`, `shade`, `vela` -> `qwen/qwen3.5-9b`
- `supabase/migrations/20260325212000_fix_rate_limit_function_ambiguity.sql`

## local 검증 사실

- `next dev`는 `spawn EPERM`으로 자주 막혀서 `next start` 기준 검증 진행
- `3005` 기준 `/api/providers/routes`에서 현재 local 모델 배치 확인 완료
- `3005` 기준 `/api/battle`는
  - `aira` emitted
  - `ledger` emitted
  - `round=2 pending=judy,shade`
  까지만 확인
- 아직 `round=2` 이후 완료 여부를 확인 못 했으므로, 성공 상태로 간주하면 안 됨

## 다음 세션 첫 확인 순서

1. 최신 빌드 서버를 새 포트로 재기동
2. `/api/providers/routes` 확인
3. `/api/battle` 재실행
4. `judy`, `shade` timing log와 `round=2 settled/emitted` 확인
5. 성공이면 그때만 checkpoint commit + push
