# Korean Only Debate Sanitization

- 작성시각: 2026-03-20 20:20 KST
- 해결하고자 한 문제:
  - 라이브 토론 문장에 중국어, 독일어, 아랍어, 영어 소문자 단어가 섞여 보이는 문제
  - 저장 전 정리뿐 아니라 생성 직후 UI에 올라오는 메시지 단계에서 한글 순도를 보장할 필요

## 해결된 것

- `textIntegrity`에 중국어(Han), 일본어 가나, 아랍어, 키릴 문자, 소문자 영문 단어 혼입 감지를 추가했음
- `generateBattleDebate`에서 LLM 응답을 파싱한 직후 `sanitizeKoreanText`와 `sanitizeDisplayText`를 적용하도록 변경했음
- summary/detail이 정제 기준을 통과하지 못하면 즉시 캐릭터별 fallback 메시지로 대체되게 했음
- 혼합 스크립트와 소문자 영문 혼입 케이스 테스트를 추가했음
- `pnpm lint`, `pnpm typecheck`, `pnpm test` 통과

## 해결되지 않은 것

- 캐릭터 이름이나 시장 심볼처럼 의도적으로 남겨둔 영문 표기는 그대로 유지됨
- 실제 라이브 LLM 호출에서 문장 톤 자체가 부자연스러운 경우는 후속 품질 조정 범위
