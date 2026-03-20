# 개발일지 - S1~S3 구현

- 작성시각: 2026-03-16 21:15:00 +09:00
- 해결하고자 한 문제:
  - `docs/planning/06-tasks.md`의 S1~S3 범위 중 실제 코드와 테스트가 아직 따라오지 않는 항목이 있었음.
  - 특히 하이라이트 선정 규칙, `fetchMarketData` 실데이터 활용, SSE 에러 처리, `/api/characters` 응답 계약 정합성이 미구현 상태였음.
- 진행 내용:
  - 선택 화면 카피와 `TeamSummaryCard` 설명을 보강하고 `RiskDisclaimer`를 추가함.
  - `WinnerHighlight`를 단순 선착순 2개가 아니라 정보 밀도와 지표 포함 여부를 기준으로 고르도록 개선함.
  - `fetchMarketData`가 CoinGecko 실데이터를 우선 시도하고 실패 시 fallback seed로 유지되도록 수정함.
  - 배틀 SSE API에 `coinId` 누락 `400` 처리와 스트림 중 `error` 이벤트를 추가함.
  - `useBattleStream`과 `useBattleSnapshot`에 snapshot 버전/저장 시각과 에러 처리 흐름을 추가함.
  - `/api/characters`를 `{ characters: [...] }` shape 기준으로 유지하고, external 실패 시 local fallback하도록 수정함.
  - 관련 테스트를 추가/보강함.
- 해결된 것:
  - S1-2 결과 하이라이트 기준 고정
  - S1-3 선택 화면 설득력 강화
  - S2-1~S2-4 실데이터 우선 사용과 fallback 유지, 테스트 보강
  - S2-6 SSE 실패 정책의 실제 구현 시작
  - S3-1 fallback 메시지 품질 개선
  - S3-2 외부 캐릭터 API 실패 fallback
  - S3-4 `/api/characters` 응답 계약 정리
- 해결되지 않은 것:
  - S1-1에서 문서가 가리킨 "깨진 한글"은 현재 주요 대상 파일에서 재현이 크지 않아 전체 정리 범위는 추가 확인이 필요함.
  - S2-5 필드 출처 매트릭스는 문서화됐지만 코드 주석/메타 모델 수준으로는 아직 분리하지 않았음.
  - S3-3 preview asset 전략은 문서 기준만 유지했고 코드 구조 자체를 더 확장하지는 않았음.
  - 전체 `pnpm lint`는 `pptx/ant-gravity-report/*` 하위 기존 CommonJS 파일 때문에 실패함. 이번 변경 파일 기준 개별 eslint는 통과함.

