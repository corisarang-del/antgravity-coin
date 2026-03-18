# ledger 이미지 경로 수정

- 작성시각: 2026-03-17 04:01 KST
- 해결하고자 한 문제:
  - `ledger.webp` 요청이 404가 나면서 `next/image`가 유효하지 않은 이미지라고 에러를 내고 있었다.
  - 실제 퍼블릭 자산은 `public/characters/ledger.png`였는데, 캐릭터 카탈로그와 테스트는 여전히 `ledger.webp`를 가리키고 있었다.

## 해결된 것

- `src/features/characters/catalog.ts`에서 `Ledger`의 `imageFileName`을 `ledger.png`로 수정했다.
- `src/shared/constants/characters.test.ts`를 `png | webp` 자산 구조에 맞게 고쳤고, `Ledger`는 `png`를 기대하도록 수정했다.
- `public/characters/README.md`의 현재 사용 파일 목록도 실제 상태에 맞게 `ledger.png`로 맞췄다.

## 아직 안 된 것

- 기존 2026-03-15 문서들에는 `ledger.webp` 복구 이력이 남아 있다.
- 이번 수정은 현재 런타임 경로만 바로잡은 것이고, 추후 자산을 다시 `webp`로 통일할지는 별도 판단이 필요하다.
