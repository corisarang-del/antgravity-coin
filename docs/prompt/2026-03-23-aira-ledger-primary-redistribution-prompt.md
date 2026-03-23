# Aira Ledger primary 분산 프롬프트

- 작성시각: 2026-03-23 17:41 KST
- 프롬프트 요약:
  - `aira: arcee-ai/trinity-mini`
  - `ledger: google/gemma-3-12b-it`
  - 체감 안정성 확인 후 괜찮으면 커밋

## 해결하고자 한 문제

- `aira`, `ledger` primary를 서로 다른 모델로 분산해 동시 장애를 줄여야 했음
- 실제 배틀 체감 기준으로 괜찮은지 확인한 뒤 커밋까지 이어가야 했음

## 해결된 것

- 모델 라우팅을 요청한 값으로 반영했음
- `/api/providers/routes`로 런타임 반영 여부를 확인했음
- `/battle/bitcoin` 실측으로 첫 발언과 pick-ready 시점을 확인했음

## 해결되지 않은 것

- free/저가 모델 특유의 `message_parse_failed`, `non_korean_response`는 일부 남아 있음
- 반복 다회 실측까지 한 건 아니고, 이번에는 단발 체감 확인과 로그 확인 중심으로 진행했음
