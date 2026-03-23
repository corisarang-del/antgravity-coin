# memory refresh after model and result updates

- 작성시각: 2026-03-23 20:21 KST
- 해결하고자 한 문제:
  - 새 세션에서 바로 이어갈 수 있게 오늘 반영한 CTA 복구, Supabase 점검, 모델 재배치, parser/prompt 보강, result pending UX 보강을 `memory.md`와 관련 문서에 누락 없이 남겨야 했음
  - 기존 문서를 덮어쓰지 않고 append 방식으로 현재 상태를 이어 붙여야 했음

## 해결된 것

- `memory.md`에 2026-03-23 추가 기록 섹션을 append했음
- `research.md`에 최신 운영 메모와 다음 우선순위를 append했음
- 아래 planning 문서에도 관련 내용을 append했음
  - `docs/planning/08-character-debate-reference.md`
  - `docs/planning/13-result-settlement-flow.md`
- 이번 세션 기준으로 아래를 문서화했음
  - CTA 복구와 `master` 미반영 원인
  - Supabase RLS / anon live 점검 결과
  - `useBattleStream` abort cleanup fix
  - `aira`, `ledger` primary 재배치와 실측 결과
  - `aira` parse 실패, `ledger` 영문 응답을 줄이기 위한 prompt/parser 보강
  - result pending UI 문맥 보강

## 해결되지 않은 것

- prompt/parser 보강과 result pending UI 보강은 아직 비커밋 상태임
- 런타임 데이터, tmp 산출물, out 산출물은 여전히 많이 남아 있어서 다음 세션에서 코드 변경과 분리해서 봐야 함
