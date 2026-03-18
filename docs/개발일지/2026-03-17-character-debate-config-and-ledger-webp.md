# 캐릭터 토론 설정 파일화 및 ledger.webp 복구

- 작성시각: 2026-03-17 14:25 KST
- 해결하고자 한 문제:
  - 8명 캐릭터 각각의 모델, 정보 소스, 프롬프트, 표시 위치를 한 번에 파악하고 수정할 수 있는 단일 설정 파일이 필요했다.
  - `ledger.webp`가 없어 다른 캐릭터와 자산 형식이 어긋나 있었고, 동일한 `webp` 경로로 통일할 필요가 있었다.

## 해결된 것

- `src/shared/constants/characterDebateProfiles.ts`를 추가해서 8명 전원의
  - 모델 라우팅
  - 근거 소스
  - 역할 프롬프트
  - fallback 문구
  - 표시 위치 설명
  을 한 파일에 모았다.
- `characterModelRoutes`, `characterPrompts`, `generateBattleDebate`가 위 설정 파일을 읽도록 연결했다.
- 사람이 읽기 쉬운 기준 문서로 `docs/planning/08-character-debate-reference.md`를 추가했다.
- `ledger.png`를 `ledger.webp`로 변환해서 `public/characters/ledger.webp`를 만들고, 런타임 참조도 다시 `ledger.webp`로 통일했다.
- 설정 파일용 테스트를 추가했다.

## 아직 안 된 것

- `characterDebateProfiles.ts`를 자동으로 문서화하거나 UI에서 직접 편집하는 기능은 없다.
- Claude direct client는 현재 이름 소문자 매핑으로 설정을 읽도록 맞췄고, 향후 `characterId`를 직접 넘기면 더 명시적일 수 있다.
