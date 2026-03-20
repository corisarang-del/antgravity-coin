# Team Model Balance And Qwen Fallback Prompt

- 작성시각: 2026-03-20 23:55 KST
- 프롬프트 내용 간단 요약:
  - 팀마다 4명이 있으니 각각 팀마다 1명은 `step-3.5`, `trinity`, `nemotron-3`, `minimax`
  - fallback은 8명 전부 `qwen`

## 해결된 것
- 팀별 모델 배치를 균형 있게 재배치함
- fallback을 `qwen/qwen3.5-9b`로 통일함

## 해결되지 않은 것
- 실운영 안정성 비교는 후속 검증이 필요함

