# live battle 이후 선택/결과 화면 테스트

작성시각: 2026-03-21 KST

## 해결하려고 한 문제

- 캐릭터 토론 이후 실제 선택 화면으로 이어지는지 확인
- waiting/result 페이지에서 승패 계산과 결과 렌더링이 제대로 되는지 확인

## 이번에 확인한 것

- `http://localhost:3002`에서 webpack dev 서버 기준 홈 진입과 코인 선택은 정상 동작함
- `/battle/bitcoin/pick` 선택 화면은 로컬 snapshot이 있으면 정상 렌더링되고, 팀 선택/라운드 확정 후 `/battle/bitcoin/waiting`으로 이동함
- waiting 페이지에서 선택한 팀과 타임프레임, countdown, 결과 페이지 링크가 정상 표시됨
- 결과 페이지는 hydration 뒤 localStorage의 `userBattle`를 읽고, 기존 `battleOutcomeSeed`가 있으면 승패/XP/리포트까지 정상 렌더링됨

## 이번 테스트에서 발견한 문제

- live 토론 경로에서 `/battle/bitcoin`은 65초 시점에도 2/8 발언만 도착했음
- 그래서 \"실제 live 토론 완료 -> 자동 선택 화면 진입\"은 이번 환경에서 끝까지 확인하지 못했음
- 원인 후보는 무료 OpenRouter 모델 응답 지연 또는 순차 토론 구조의 누적 시간임
- `next dev`의 기본 Turbopack 경로는 panic이 나서 실제 테스트는 `next dev --webpack -p 3002`로 우회했음

## 해결된 것

- 선택 화면 렌더링과 저장 흐름 확인
- waiting 화면 렌더링 확인
- 결과 화면의 승패/XP/리포트 표시 확인

## 아직 안 된 것

- live 토론 8명 완료 후 선택 화면으로 자연 전이되는 E2E 확인
- Turbopack panic 원인 분석
- live 토론 wall-clock 병목의 정량 측정

