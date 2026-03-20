# Narrative Evidence Injection Prompt

- 작성시각: 2026-03-20 21:10 KST
- 프롬프트 요약:
  - `MarketData`를 확장해서 Judy/Clover/Vela/Ledger용 서술형 근거를 추가
  - 실제 뉴스 헤드라인, 심리 요약, 고래/파생 흐름 요약, 거래 구조 요약을 프롬프트에 직접 주입
  - 캐릭터별 evidenceSources를 다시 설계

## 해결된 것

- 데이터 모델, 캐시, 프롬프트, 테스트를 같이 수정했음
- 캐릭터별로 더 역할다운 서술형 근거를 입력할 수 있는 구조를 만들었음
- lint, typecheck, test를 모두 통과했음

## 해결되지 않은 것

- UI에서 출처를 직접 보여주는 단계는 아직 남아 있음
