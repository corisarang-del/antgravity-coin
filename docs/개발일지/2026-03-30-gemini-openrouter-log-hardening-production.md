# Gemini/OpenRouter 보안 후속 production 반영

- 작성시각: 2026-03-30 23:45 KST

## 해결하고자 한 문제

- Gemini 호출이 API 키를 URL 쿼리스트링에 남기고 있었음
- OpenRouter 실패 로그가 upstream response body 일부를 그대로 남기고 있었음

## 해결된 것

- Gemini 일반 호출과 synthesis 호출 모두 `x-goog-api-key` 헤더 방식으로 전환했음
- OpenRouter 실패 로그는 raw body 대신 `responseBodyLength`만 남기게 변경했음
- 관련 테스트 3개를 production 기준 worktree에 추가/보강했음

## 아직 안 된 것

- 추가적인 battle/provider 디버그 로그 축소는 별도 정리 대상으로 남아 있음
