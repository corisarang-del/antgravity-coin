# 코딩 컨벤션

- 작성시각: 2026-03-21 18:27 KST
- 기준: AGENTS 규칙 + 현재 저장소 관행

## 기본 원칙

1. 모르면 가정하지 않고 현재 코드 기준으로 확인한다.
2. 필요한 만큼만 구현한다.
3. 단일 용도 코드는 과한 추상화를 만들지 않는다.
4. TDD 흐름을 우선한다.

## 네이밍

### 컴포넌트 파일

- `PascalCase` 사용

### 변수와 함수

- `camelCase` 사용

### 라우트/저장 키

- 기존 구현 규칙을 유지한다.
- 예:
  - `ant_gravity_battle_snapshot`
  - `battle_pick_ready`
  - `battle-outcome-post`

## UI 텍스트

- 사용자 노출 텍스트는 한글 기준
- battle 캐릭터 발화는 반말, 대화체 우선
- 보고서 톤, 번역투, 이름표 남발은 피한다

## 민감 정보

- GPS 같은 민감 정보는 저장하지 않는다.
- owner 계산은 auth user id 또는 guest cookie id만 사용한다.

## 문서화 규칙

- 단계마다 `docs/개발일지` 기록
- 단계마다 `docs/prompt` 기록
- 포함 항목:
  - 작성시각
  - 해결하려던 문제
  - 해결된 것
  - 아직 안 된 것

## 패키지와 명령어

- 패키지 매니저는 `pnpm`만 사용
- 주요 명령:
  - `pnpm run dev`
  - `pnpm run lint`
  - `pnpm typecheck`
  - `pnpm test`

## 현재 저장소에서 특히 지킬 것

1. battle 결과는 `battleId` 단위 직렬화 흐름을 깨지 않는다.
2. owner 검증이 들어간 조회 route는 우회 경로를 만들지 않는다.
3. 무료 모델 불안정성을 가정하고 fallback 경로를 유지한다.
4. 문서 수정 시에도 현재 구현 상태와 어긋나는 낙관적 표현을 쓰지 않는다.
