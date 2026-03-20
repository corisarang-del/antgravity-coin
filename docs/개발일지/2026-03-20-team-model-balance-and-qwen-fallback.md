# Team Model Balance And Qwen Fallback

- 작성시각: 2026-03-20 23:55 KST
- 해결하고자 한 문제:
  - 팀별 4명 배치에서 특정 무료 모델에 과도하게 몰려 있었음
  - fallback 모델이 캐릭터마다 달라 운영 기준이 복잡했음

## 해결된 것
- 불리시 팀 4명과 베어리시 팀 4명 각각에 아래 모델이 1개씩 배치되도록 재정렬함
  - `stepfun/step-3.5-flash:free`
  - `arcee-ai/trinity-large-preview:free`
  - `nvidia/nemotron-3-super-120b-a12b:free`
  - `minimax/minimax-m2.5:free`
- 8명 전부 fallback 모델을 `qwen/qwen3.5-9b`로 통일함

## 해결되지 않은 것
- 실제 운영에서 어떤 모델 조합이 가장 안정적인지는 추가 실측이 더 필요함

