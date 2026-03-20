# prewarm wall-clock 추가 개선과 UTF-8 정리 프롬프트

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- prewarm wall-clock 추가 개선
- 남은 UTF-8 깨짐 정리

## 사용한 프롬프트 요약

- `memory.md`에서 정리된 우선순위를 기준으로 prewarm wall-clock 병목을 줄이고 남은 UTF-8 깨짐을 정리해줘`
- 같은 코인 prepared context 중복 빌드는 막고, prewarm은 stale cache를 즉시 재사용할 수 있으면 그렇게 바꿔줘
- 변경 후에는 lint, typecheck, test까지 검증하고 개발일지와 prompt 기록도 남겨줘

## 해결된 것

- stale cache 재사용 + 백그라운드 refresh 구조
- prewarm 제한 동시성 처리
- 문서 UTF-8 BOM 정리
- 회귀 테스트와 검증 완료

## 아직 안 된 것

- 실측 기반 wall-clock 수치 비교 리포트
- 무료 모델 라우팅 안정화 자체

