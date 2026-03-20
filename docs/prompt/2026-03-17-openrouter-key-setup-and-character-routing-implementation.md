# 프롬프트 기록 - OpenRouter 키 설정과 캐릭터 라우팅 구현

- 작성시각: 2026-03-17 00:12:00 +09:00
- 해결하고자 한 문제:
  - 사용자가 준 OpenRouter 키를 실제 프로젝트에 연결하고, 문서 기준 구조대로 구현할 필요가 있었음.
- 사용자 요청 요약:
  - OpenRouter 키 설정
  - 캐릭터별 모델 라우팅 반영
  - 시스템 프롬프트 반영
  - tasks 기준 구현 진행
- 이번 작업에서 구현한 핵심:
  - `.env.local` 생성과 OpenRouter 키 설정
  - `.gitignore` 추가
  - OpenRouter 단일 provider 라우팅
  - 캐릭터 시스템 프롬프트와 역할별 evidence 분기
  - Gemini 최종 취합 report 구조 반영
  - 테스트, 타입체크, 린트 통과
- 해결되지 않은 것:
  - Gemini 키가 아직 없어 실제 합성 결과는 추후 확인 필요

