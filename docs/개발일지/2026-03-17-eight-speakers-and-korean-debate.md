# 8명 발언 보장 및 한글 토론 강제

- 작성시각: 2026-03-17 14:00 KST
- 해결하고자 한 문제:
  - 배틀에서 8명 전체가 아니라 6명만 발언하는 경우가 있었다.
  - `Blaze`, `Clover`를 포함해 일부 모델 응답이 영어로 나와서, 앞으로 모든 토론 내용을 한글로만 유지해야 했다.

## 해결된 것

- `generateCharacterMessage`에서 LLM 호출 예외를 캐릭터 단위로 잡아 한글 fallback 메시지로 대체하도록 수정했다.
- 영어 응답이나 한글이 없는 응답은 정상 메시지로 쓰지 않고 한글 fallback으로 강제 전환하도록 검증을 추가했다.
- OpenRouter, Gemini, OpenAI 호환 provider, Claude prompt에 모두 `summary/detail은 한글 문장만`이라는 지시를 추가했다.
- 회귀 테스트를 추가해서
  - LLM 예외가 나도 8명 메시지가 끝까지 생성되는지
  - `Blaze`, `Clover`의 영어 응답이 한글 fallback으로 바뀌는지
  - `/api/battle` SSE가 8개 `message` 이벤트와 `battle_complete count: 8`을 유지하는지
    확인하게 했다.

## 아직 안 된 것

- 모델이 한글을 섞어 쓰는 애매한 응답 품질까지 세밀하게 교정하는 후처리는 아직 없다.
- 번역기가 아니라 fallback 전환 방식이라, 영어 응답을 보존하지 않고 한글 기본 논거로 교체한다.

