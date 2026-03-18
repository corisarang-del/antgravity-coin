# 캐릭터 도감 실제 이미지 연결

- 작성시각: 2026-03-15 11:45 KST
- 해결하고자 한 문제: `/characters` 화면이 예전 더미 캐릭터 데이터에 머물러 있어서, 새로 선정한 8명의 이미지와 설정을 실제 화면과 문서에 연결해야 했어.
- 해결된 것:
  - `src/shared/constants/characters.ts`를 실제 8인 설정으로 교체했어.
  - `public/characters`에 배포용 WebP 8장을 배치했어.
  - 카드와 모달이 실제 이미지, 담당분야, 성격, 선정 이유를 표시하도록 바꿨어.
  - `docs/planning/06-screens.md`, `docs/planning/03-feature-list.md`, `public/characters/README.md`를 현재 동작 기준으로 업데이트했어.
  - 캐릭터 상수와 상세 모달에 대한 테스트를 추가했어.
- 해결되지 않은 것:
  - 배틀 화면의 스피커 스포트라이트나 팀 보드에 이미지 썸네일을 노출하는 개선은 아직 안 했어.
