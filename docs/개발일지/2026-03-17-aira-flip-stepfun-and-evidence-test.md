# Aira/Flip 모델 교체와 근거 소스 검증

- 작성시각: 2026-03-17 14:34 KST
- 해결하고자 한 문제:
  - `Aira`, `Flip`의 기본 모델을 `Qwen3.5`에서 `Step 3.5 Flash (free)`로 바꾸고, fallback일 때만 `Qwen3.5`를 쓰게 해야 했다.
  - 8명 캐릭터 프로필에 적힌 근거 소스가 실제 `MarketData`에서 채워지는지 테스트가 필요했다.

## 해결된 것

- `src/shared/constants/characterDebateProfiles.ts`에서 `Aira`, `Flip` 기본 모델을 `stepfun/step-3.5-flash:free`로 변경했다.
- 두 캐릭터 모두 fallback 모델은 `qwen/qwen3.5-9b`로 유지했다.
- `docs/planning/08-character-debate-reference.md`도 새 모델 정보에 맞춰 갱신했다.
- `fetchMarketData.test.ts`에 8명 프로필의 모든 `market` 근거 소스 필드가 실제 `MarketData`에 채워지는지 검증하는 테스트를 추가했다.
- 프로필 테스트에도 `Aira`, `Flip`의 새 모델 배정을 반영했다.

## 아직 안 된 것

- `previous_messages` 계열 근거는 `MarketData`가 아니라 `DebateMessage` 기반이라 이번 테스트 범위에 포함하지 않았다.
- 외부 API별 실네트워크 호출까지 검증하는 E2E는 아니고, 현재 앱이 생성하는 `MarketData` 계약 기준 검증이다.

