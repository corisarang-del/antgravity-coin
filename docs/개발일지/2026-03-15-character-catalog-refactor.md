# 캐릭터 데이터 편집 구조 분리

- 작성시각: 2026-03-15 11:55 KST
- 해결하고자 한 문제: 캐릭터를 나중에 추가하거나 성격, 이미지, 역할을 바꿀 때 여러 파일을 동시에 고쳐야 해서 수정 비용이 컸어.
- 해결된 것:
  - `src/features/characters/catalog.ts`를 캐릭터 단일 편집 파일로 분리했어.
  - 런타임용 데이터는 `src/features/characters/index.ts`에서 파생 생성되게 바꿨어.
  - 기존 import 경로 호환을 위해 `src/shared/constants/characters.ts`는 재수출 레이어로 바꿨어.
  - 이미지 렌더링은 `src/presentation/components/CharacterImage.tsx`로 공통화했어.
  - 이후 API 연결용으로 `getCharacterApiSeed()`도 준비해뒀어.
- 해결되지 않은 것:
  - 실제 외부 API 연동은 아직 안 붙였어. 다만 카탈로그에서 파생할 준비는 끝났어.

