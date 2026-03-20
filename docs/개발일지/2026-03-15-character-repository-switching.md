# 캐릭터 저장소 스위칭 구조 추가

- 작성시각: 2026-03-15 12:28 KST
- 해결하고자 한 문제: `/api/characters`가 로컬 데이터에 직접 묶여 있어서, 나중에 DB나 외부 API로 바꾸기 어려웠어.
- 해결된 것:
  - `CharacterRepository` 포트와 `fetchCharacters` 유스케이스를 추가했어.
  - 로컬 카탈로그 저장소와 외부 API 저장소를 분리했어.
  - `characterRepositoryFactory`로 `CHARACTERS_SOURCE` 환경값에 따라 저장소를 스위칭하게 만들었어.
  - `/api/characters` 라우트가 저장소 인터페이스만 보도록 정리했어.
  - 외부 API 스위칭 테스트와 팩토리 테스트를 추가했어.
- 해결되지 않은 것:
  - 실제 운영용 외부 캐릭터 API는 아직 연결하지 않았어.

