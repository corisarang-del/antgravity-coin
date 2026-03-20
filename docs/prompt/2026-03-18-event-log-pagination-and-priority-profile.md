# event log 페이지네이션과 character priority 실측 비교 프롬프트

- 작성시각: 2026-03-18 21:10 KST
- 해결하고자 한 문제:
  - `/characters`에서 priority 개수를 실측 기반으로 비교하고, admin `Event Log`도 길어질 때 대비하고 싶었다.

## 사용한 프롬프트

```text
/characters 실제 브라우저 프로파일링으로 priority 2장 vs 4장 비교
admin Event Log가 길어질 때 가상화나 페이지네이션 추가
지금까지 성능 최적화 묶어서 커밋
```

## 해결된 것
- 실브라우저 비교 후 `priority 2장` 유지로 결정했고, admin `Event Log`에는 서버 페이지네이션을 추가했다.

## 아직 해결 안 된 것
- 네트워크 waterfall/LCP 비교 리포트는 별도로 만들지 않았다.

