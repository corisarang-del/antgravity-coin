# memory.md 완독 후 research 갱신

- 작성시각: 2026-03-23 22:07 KST
- 해결하고자 한 문제:
  - `memory.md`를 표면 요약이 아니라 최근 세션의 운영 메모로 완전히 이해해야 했음
  - 인코딩이 깨진 `research.md`를 다음 세션에서도 바로 읽을 수 있는 상태로 다시 정리할 필요가 있었음

## 해결된 것

- `memory.md` 전체를 읽고 아래 핵심 축으로 이해를 정리했음
  - battle 병렬 구조와 `battle_pick_ready` 중심 UX
  - prepared context / prewarm / timing 지표의 우선순위
  - opening round 모델 분산과 prompt / parser 보강 방향
  - `/me`의 guest -> auth 병합 역할
  - result pending UI의 맥락
  - 더러운 워크트리와 런타임 산출물 분리 필요성
- `research.md`를 깨진 상태에서 덧붙이는 대신 전체 재작성해서 최신 운영 기준 문서로 갱신했음
- 이번 요청 내용도 `docs/prompt`, `docs/개발일지` 기록 흐름에 맞춰 남겼음

## 해결되지 않은 것

- `memory.md`에 적힌 모든 최신 판단을 코드와 1:1 대조 검증한 건 아님
- 무료 모델 가용성, `pickReadyAt` 지표 반영 여부, UTF-8 잔여 깨짐 같은 실제 제품 과제는 그대로 남아 있음
- 현재 워크트리의 다른 변경들(`database/data/*`, `tmp/*`, 이미지 산출물 등)은 이번 작업 범위에서 정리하지 않았음
