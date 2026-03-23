# Aira Ledger primary 분산 및 체감 확인

- 작성시각: 2026-03-23 17:41 KST
- 해결하고자 한 문제:
  - `aira`, `ledger`가 같은 `stepfun/step-3.5-flash:free`를 primary로 써서 429와 timeout이 한 번에 터지는 리스크를 줄여야 했음
  - 새 모델 배치가 실제 배틀 체감 안정성에 도움이 되는지 확인해야 했음

## 해결된 것

- `src/shared/constants/characterDebateProfiles.ts`
  - `aira` primary를 `arcee-ai/trinity-mini`로 변경
  - `ledger` primary를 `google/gemma-3-12b-it`로 변경
  - 두 캐릭터 fallback은 기존 `qwen/qwen3.5-9b` 유지
- dev 서버를 webpack 모드로 띄워 `/api/providers/routes`에서 런타임 모델 배치를 직접 확인했음
- `/battle/bitcoin` 실측 결과
  - 첫 발언 도착 약 `11.3초`
  - 약 `25초` 안에 `5/8 발언`과 pick-ready CTA 확인
  - 추가 대기 후 `6/8 발언`까지 확인
- 서버 로그에서 확인한 핵심
  - `aira`는 `arcee-ai/trinity-mini`로 실제 호출됨
  - `ledger`는 `google/gemma-3-12b-it`로 실제 호출됨
  - 예전처럼 `aira`, `ledger`가 동시에 `stepfun` 429/timeout을 맞는 패턴은 이번 실측에서 보이지 않았음

## 해결되지 않은 것

- 완벽한 품질 안정화까지 된 건 아님
  - `aira`: `message_parse_failed`
  - `ledger`: `non_korean_response`
  - 일부 free 모델도 `message_parse_failed`, `non_korean_response`가 남아 있음
- 즉 병목은 `stepfun` 동시 장애에서 모델별 출력 품질 편차 쪽으로 옮겨간 상태임
- 반복 실측 여러 회차 평균까지 낸 건 아니고, 이번 턴에선 단발 체감 확인까지만 수행했음
