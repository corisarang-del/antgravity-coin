# battle pick-ready 분리와 병렬 라운드 프롬프트

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- 8명 토론을 빠르게 하는 구조 업그레이드

## 사용한 프롬프트 요약

- `pick-ready를 8명 완료와 분리해`
- `8명 직렬을 4라운드 병렬로 바꿔`
- `recovery model 풀을 전부 도는 구조를 끊어`
- `previousMessages를 전체 누적 대신 압축해`

## 해결된 것

- `battle_pick_ready` 이벤트 추가
- 4라운드 병렬 토론 구조 적용
- recovery 시도 횟수 축소
- 이전 발언 압축 적용
- 관련 회귀 테스트 추가 및 갱신

## 아직 안 된 것

- live 환경 wall-clock 실측 비교
- pick-ready 이후 남은 토론을 어떻게 더 자연스럽게 이어갈지 UX 조정

