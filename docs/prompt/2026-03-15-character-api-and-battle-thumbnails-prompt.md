# 캐릭터 API 스키마 분리와 배틀 썸네일 연결 프롬프트

- 작성시각: 2026-03-15 12:10 KST
- 해결하고자 한 문제: 캐릭터 API 응답 스키마를 따로 빼고, 나중에 DB나 외부 API로 바꾸기 쉬운 구조를 만들고 싶었어. 그리고 배틀 화면 `TeamBoard`, `SpeakerSpotlight`에도 실제 캐릭터 이미지를 붙이고 싶었어.
- 사용한 프롬프트:
  - 이 구조 기준으로 캐릭터 API 응답 스키마까지 따로 빼서, 나중에 DB나 외부 API로 바꾸기 더 쉽게 한 단계 더 정리, 배틀 화면 TeamBoard나 SpeakerSpotlight에도 이 8명 이미지 썸네일까지 이어서 붙여줘. 단 붙히기전에 shade랑 aira 이미지를 바꾸려한다. shade는 "C:\Users\khc\Desktop\fastcampus\ant_gravity_coin\design\character\u2232487955_httpss.mj.runw_uqNSpuRoU_AntGravity_mascot_stock__e2d0e08e-7f23-4c07-ac30-05911bf5a85f_2.png"  aira는 "C:\Users\khc\Desktop\fastcampus\ant_gravity_coin\design\character\u2232487955_httpss.mj.runI9PyyxZcob4_AntGravity_fintech_masco_98d50a44-08e8-47b6-a5c4-5f9dc34371a4_2.png"
- 해결된 것:
  - 이미지 교체, API 스키마 분리, 배틀 썸네일 연결을 한 번에 반영했어.
  - 관련 테스트와 운영 문서를 같이 업데이트했어.
- 해결되지 않은 것:
  - 없음
