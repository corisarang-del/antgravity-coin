# Narrative Evidence Injection

- 작성시각: 2026-03-20 21:10 KST
- 해결하고자 한 문제:
  - Judy, Clover, Vela, Ledger가 숫자형 지표 위주로만 말해서 캐릭터 차이가 약한 문제
  - 실제 원소스가 프롬프트 입력에서 거의 드러나지 않는 문제

## 해결된 것

- `MarketData`에 뉴스 헤드라인, 이벤트 요약, 심리 요약, 고래/파생 흐름 요약, 거래 구조 요약 필드를 추가했음
- 뉴스 API 계층에서 실제 헤드라인 2~3개와 이벤트 요약 문장을 같이 만들도록 확장했음
- `fetchMarketData`에서 Clover/Vela/Ledger용 서술형 근거를 생성하도록 변경했음
- `characterDebateProfiles`를 다시 정리해서 Judy/Clover/Vela/Ledger가 각자 다른 서술형 근거를 우선 사용하게 바꿨음
- evidence 문자열에 `원소스` 태그를 붙여 프롬프트 입력에 출처가 드러나게 했음
- LLM 캐시 버전을 올려 예전 프롬프트 결과가 재사용되지 않게 했음
- `pnpm lint`, `pnpm typecheck`, `pnpm test` 통과

## 해결되지 않은 것

- 현재 UI에는 원소스 태그를 그대로 노출하지 않고 프롬프트 입력 단계에서만 사용함
- Ledger는 여전히 “직접 온체인 지갑 추적”이 아니라 거래 구조 기반 서술형 근거라서, 진짜 온체인 소스를 붙이려면 후속 데이터 수집이 더 필요함

