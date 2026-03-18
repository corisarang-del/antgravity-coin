# 캐시 전략 문서화 및 구현

- 작성시각: 2026-03-18 19:55 KST
- 해결하고자 한 문제:
  - 무료 호출량 안에서 운영 가능한 캐시 JSON 스키마, 배치 수집 주기, stale 허용 정책을 문서화하고 실제 코드에도 반영해야 했다.

## 해결된 것

- `docs/planning/09-cache-strategy.md`를 추가했다.
- `database/data/source_cache.json` 기반 파일 캐시 저장소를 구현했다.
- `fetchMarketData`가 캐시 우선 / stale 허용 / 백그라운드 갱신 구조를 사용하도록 바꿨다.
- `POST /api/admin/cache/prewarm`로 인기 코인 prewarm 진입점을 만들었다.

## 아직 안 된 것

- 외부 크론이나 자동 스케줄러는 아직 연결하지 않았다.
- Top 코인/search 전용 캐시는 아직 별도 구현하지 않았다.
