# admin event log lazy 분리와 character card 이미지 튜닝 프롬프트

- 작성시각: 2026-03-18 20:55 KST
- 해결하고자 한 문제:
  - admin 상세 내부의 `Event Log`를 더 분리하고, `/characters` 이미지 로딩 전략도 더 다듬고 싶었다.

## 사용한 프롬프트

```text
admin 상세 내부에서 Event Log만 별도 lazy 블록으로 더 쪼개기
/characters 실측 기준으로 CharacterCard 썸네일 priority/sizes 더 다듬기
```

## 해결된 것
- `Event Log`를 별도 lazy 블록으로 분리했고, 캐릭터 카드 이미지 `priority/sizes`를 레이아웃 기준으로 조정했다.

## 아직 해결 안 된 것
- 실제 브라우저 프로파일 기반 추가 이미지 튜닝은 아직 하지 않았다.
