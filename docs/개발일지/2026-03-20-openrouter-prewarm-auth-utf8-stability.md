# OpenRouter Prewarm Auth UTF8 Stability

- 작성시각: 2026-03-20 23:45 KST
- 해결하고자 한 문제:
  - 무료 OpenRouter 모델 응답이 불안정할 때 fallback 폭이 좁아 실제 토론 시작 안정성이 떨어졌음
  - prepared context가 8명 전체 초안을 미리 만들면서 prewarm 비용이 과도했음
  - auth merge, snapshot owner, battle session, outcome 복원 경로 테스트가 부족했음
  - 일부 화면과 fallback 문구의 UTF-8/문구 품질 정리가 필요했음

## 해결된 것
- `llmRouter`에 공통 OpenRouter recovery model 풀 재시도 로직을 추가함
- `openRouterProvider`에 404/429/timeout 기반 임시 unavailable 쿨다운을 추가함
- prepared context를 첫 캐릭터 초안 중심으로 줄여 prewarm 부담을 낮춤
- `prewarmMarketCache`가 fresh cache를 재사용하고 hit 여부를 함께 반환하도록 정리함
- 아래 테스트를 추가/보강함
  - `src/app/api/battle/session/route.test.ts`
  - `src/app/api/auth/merge-local/route.test.ts`
  - `src/app/api/battle/snapshot/route.test.ts`
  - `src/app/api/battle/outcome/route.test.ts`
  - `src/infrastructure/api/llmRouter.test.ts`
- 브라우저에서 `/api/providers/routes`와 `/battle/bitcoin`을 확인했고 prepared hit와 첫 chunk 수신 시간을 실측함
- Judy fallback 문구 중 `Judy: Judy:`처럼 보이던 중복 표시를 정리함

## 해결되지 않은 것
- 무료 모델 자체의 429/품질 이슈를 완전히 없앤 건 아님
- prewarm wall-clock 시간을 실제 운영 수준에서 얼마나 줄였는지는 추가 실측이 더 필요함
- 화면 전반의 모든 문자열 인코딩 정리를 끝낸 건 아님

