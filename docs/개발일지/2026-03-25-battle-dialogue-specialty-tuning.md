# 토론 발언 직전 맥락 노출 제거와 전문 분야 강화

- 작성시각: 2026-03-25 14:47 KST
- 해결하고자 한 문제:
  - 배틀 피드 발언에서 `직전 발언`, `방금`, 다른 캐릭터 이름 같은 직전 맥락 노출이 보여 대화창이 산만해졌음.
  - Judy, Clover, Ledger, Vela 같은 캐릭터가 맡은 전문 분야가 발언에 충분히 선명하게 드러나지 않았음.

## 진행 내용

- `src/application/prompts/characterPrompts.ts`
  - 이전 발언을 `내부 참고용 이전 발언`으로만 전달하도록 수정함.
  - 다른 캐릭터 이름, 직전 발언, `방금`, `앞에서` 같은 표현을 summary/detail에 직접 쓰지 말라고 규칙을 강화함.
  - Judy, Clover, Ledger, Vela의 voice/lens/guardrail을 실제 전문 분야에 맞게 더 구체화함.
    - Judy: 공시, 정책 일정, 승인/규제 이벤트
    - Clover: 공포탐욕, 커뮤니티 반응, 군중 심리
    - Ledger: 지갑 이동, 거래소 입출금, 온체인 수급
    - Vela: 대형 자금 이동, 미결제약정, 거래 강도
- `src/application/useCases/generateBattleDebate.ts`
  - fallback 발언에서 `직전 발언 ... 참고했어` 같은 문장을 제거함.
  - unavailable fallback도 직전 맥락 인용 대신 각 캐릭터 역할과 specialty 중심 문장으로 변경함.
  - 이전 발언 요약을 LLM에 넘길 때도 캐릭터 이름 대신 `불리시 논지`, `베어리시 논지`, `공통 요약` 형태로 압축함.
  - Judy, Clover, Ledger, Vela fallback detail을 전문 분야 중심 문장으로 재작성함.
- `src/application/useCases/generateBattleDebate.test.ts`
  - fallback 메시지가 직전 발언을 직접 노출하지 않는 테스트 추가
  - Judy, Clover, Ledger, Vela fallback이 분야 키워드를 드러내는 테스트 추가
  - 프롬프트가 이전 발언을 내부 참고용으로만 다루고 직접 언급을 금지하는 테스트 추가

## 해결된 것

- 발언 생성 규칙상 직전 맥락을 대화창 문장에 직접 노출하지 않도록 정리했음.
- 주요 캐릭터의 전문 분야가 fallback과 prompt에서 더 선명하게 드러나게 조정했음.
- 대상 파일 `eslint`와 `pnpm.cmd typecheck` 통과함.

## 아직 안 된 것

- `node_modules\.bin\vitest.cmd run src\application\useCases\generateBattleDebate.test.ts` 는 이 환경의 `spawn EPERM` 문제로 실행하지 못했음.
- 전체 `pnpm.cmd lint` 는 현재 `tmp/` 산출물의 `require()` 오류 때문에 실패했고, 이번 변경 파일 자체는 대상 `eslint`로 통과 확인함.
