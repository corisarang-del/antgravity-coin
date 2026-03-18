# admin 상세 lazy 분리와 character card 이미지 최적화 프롬프트

- 작성시각: 2026-03-18 20:49 KST
- 해결하고자 한 문제:
  - admin 상세 패널을 더 쪼개고 `CharacterCard` 렌더 비용도 줄이고 싶었다.

## 사용한 프롬프트

```text
admin 상세 패널까지 lazy chunk로 한 번 더 분리
CharacterCard 이미지 3중 렌더 최적화
```

## 해결된 것
- admin 상세를 lazy chunk로 분리했고 캐릭터 카드 이미지 렌더를 1장으로 줄였다.

## 아직 해결 안 된 것
- admin 상세 내부를 더 작은 블록 단위까지 lazy split 하지는 않았다.
