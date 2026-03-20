# event log 지연 fetch와 character card sizes 재조정 프롬프트

- 작성시각: 2026-03-18 21:01 KST
- 해결하고자 한 문제:
  - `Event Log`를 진짜 지연 fetch 구조로 바꾸고 `/characters` 이미지 `sizes`를 실제 폭 기준으로 다시 맞추고 싶었다.

## 사용한 프롬프트

```text
Event Log를 진짜 지연 fetch 구조로 재작성
/characters 카드 sizes를 실제 폭 기준으로 재조정
```

## 해결된 것
- `Event Log`는 props 전달이 아니라 서버 내부 지연 fetch로 바꿨고, 캐릭터 카드 `sizes`도 실제 레이아웃 폭 기준으로 다시 맞췄다.

## 아직 해결 안 된 것
- 실브라우저 네트워크 측정 기반 추가 미세 조정은 아직 하지 않았다.

