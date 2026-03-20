# battle wall-clock 재실측과 gemini 시드 경로 확인

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- `pick-ready`, 병렬 라운드, recovery 축소 적용 뒤 `/battle/bitcoin` 체감 시간이 얼마나 줄었는지 재실측
- 제미니 보고서가 토론 입력에 실제 시드 소스로 들어가는지 확인

## 이번에 확인한 것

- webpack dev 서버 기준 서버 로그에 `POST /api/battle 200 in 7.7min` 기록이 남아 있었고, 변경 후에는 `POST /api/battle 200 in 4.2s` 기록이 확인됨
- fresh 브라우저 진입 기준 첫 발언 도착 시간은 `15.2초`로 표시됨
- 같은 fresh run에서 20초를 더 기다렸을 때 `5/8 발언` 상태와 함께 `battle_pick_ready` CTA가 노출됨
- 즉 이번 실측에서 선택 가능 시점은 대략 `35초 이내`까지 내려온 것으로 확인됨

## gemini 시드 경로 판단

- 제미니 보고서 본문 자체가 토론 프롬프트에 raw text로 직접 들어가지는 않음
- 대신 결과 정산 이후 만들어진 `ReusableBattleMemo`의 `globalLessons`, `characterLessons`가 다음 토론의 재사용 시드로 들어감
- 이 memo는 `synthesizeBattleLessonsWithGemini` 결과가 있으면 제미니 합성 결과를 우선 사용하고, 없으면 fallback 문장으로 채워짐
- 따라서 제미니는 \"보고서 본문 직접 주입\"이 아니라 \"교훈/요약 seed 주입\" 형태로 토론에 영향을 주고 있음

## 아직 남은 것

- pick-ready 발생 시점을 초 단위로 더 촘촘하게 계측하는 전용 로그가 아직 없음
- live OpenRouter 상태에 따라 편차가 큰 만큼 1회 실측만으로 최종 결론을 내리긴 이름
- 필요하면 `pickReadyAt` 메트릭을 timing metrics에 추가하는 게 좋음

