# 배틀 API 테스트 취약점

- 작성시각: 2026-03-21 03:01 KST
- 기준: 현재 route 테스트와 남은 공백

## 이미 보강된 범위

- `POST /api/battle/session`
- `POST /api/auth/merge-local`
- `GET/POST /api/battle/snapshot`
- `GET/POST /api/battle/outcome`
- `GET/POST /api/providers/routes`

## 남은 테스트 공백

### 1. 동시성과 idempotency

- 같은 `battleId`로 `/api/battle/outcome`이 동시에 2번 들어와도 seed/report/application이 중복 저장되지 않는지 통합 테스트가 약하다.
- 다른 `battleId`들이 동시에 저장될 때 파일 저장소 직렬화로 유실이 없는지 검증이 없다.

### 2. `battle_pick_ready`와 timing metrics

- `battle_pick_ready`가 정확히 bull 2개, bear 2개 이후 한 번만 발생하는지 테스트가 없다.
- `battle_complete`보다 먼저 pick CTA가 열리는 이벤트 순서 테스트가 없다.
- `pickReadyAt` 메트릭은 아직 구현도, 테스트도 없다.

### 3. local TTL 만료 경계

- `battleSnapshot` 10일 TTL 만료 후 pick/result 가드가 기대대로 동작하는지 페이지 테스트가 부족하다.
- `userBattle` timeframe별 TTL 만료 경로 테스트가 없다.

### 4. applications와 XP 1회 적용

- `/api/battle/applications` route 자체의 idempotency 테스트가 없다.
- local `appliedBattleResults`와 서버 `battle_result_applications`가 서로 어긋났을 때의 복구 전략 테스트가 없다.

### 5. 부분 실패 복구

- seed 저장 성공 후 report 저장 실패 같은 중간 실패에서 재시도 시 recovered 응답으로 회복되는지 검증이 약하다.
- Gemini lesson synthesis 실패 후 fallback memo가 안전하게 저장되는지 더 명시적인 테스트가 필요하다.

### 6. 운영/인증 경계

- `/admin/*` API와 페이지 접근 경계 테스트가 없다.
- merge-local 이후 `/me`, `/api/me/*`에서 바로 방금 병합한 자산이 보이는지 통합 테스트가 부족하다.

## 우선순위

1. 동시성 + idempotency
2. `battle_pick_ready` 이벤트 순서와 metrics
3. local TTL 만료
4. 부분 실패 복구
5. 운영/인증 경계
