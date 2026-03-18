# Alpha Vantage 키 연결

- 작성시각: 2026-03-18 00:05 KST
- 해결하고자 한 문제:
  - 사용자가 전달한 `Alpha Vantage` 키를 로컬 실행 환경에 연결해서 실호출 테스트가 가능하게 해야 했다.

## 해결된 것

- `.env.local`에 `ALPHA_VANTAGE_API_KEY`를 추가했다.
- 추가 직후 `Alpha Vantage` 라이브 테스트를 다시 돌려 실제 호출 가능 여부를 확인할 준비를 마쳤다.

## 아직 안 된 것

- `NewsAPI` 키는 아직 비어 있어서 뉴스 감성 파이프라인의 3순위 소스는 현재 skip 대상이다.
