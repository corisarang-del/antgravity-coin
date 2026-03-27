# 보안 감사 4건 실제 수정

- 작성시각: 2026-03-27 14:35 KST
- 해결하고자 한 문제:
  - 직전 `SECURITY_AUDIT.md`에 남아 있던 4건의 열린 보안 이슈를 실제 코드에서 막고, 리포트도 조치 완료 상태로 갱신할 필요가 있었음

## 해결된 것

- `/api/coins/search`에 query 길이 검증과 shared rate limit을 추가했음
- `/api/battle/events`에 owner 기준 rate limit을 추가했음
- Gemini 리포트/lesson 합성 경로를 `systemInstruction + user prompt` 구조로 분리했음
- battle/provider 로그에서 raw body, raw model output 조각을 제거했고, 디버그 로그는 `DEBUG_BATTLE_LOGS`로만 열리게 바꿨음
- 보강 테스트를 추가했음
  - `src/app/api/coins/search/route.test.ts`
  - `src/app/api/battle/events/route.test.ts`
  - `src/infrastructure/api/geminiSynthesisClient.test.ts`
- `SECURITY_AUDIT.md`를 조치 완료 상태로 갱신했음
- 검증 결과
  - `pnpm.cmd typecheck` 통과
  - `pnpm.cmd lint` 통과
  - 타깃 Vitest 9개 통과
  - `pnpm.cmd audit --json` 취약점 0건 확인

## 해결되지 않은 것

- 이번 범위는 보안 4건 수정까지고, battle 품질이나 live 모델 안정성 이슈는 별도 작업으로 남아 있음
