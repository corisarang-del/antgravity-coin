# 코딩 컨벤션

- 작성시각: 2026-03-21 03:01 KST

## 기술 스택

| 영역 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 App Router |
| 언어 | TypeScript |
| UI | React 19 |
| 스타일 | Tailwind CSS v4 |
| 상태 | Zustand + localStorage |
| 인증/DB | Supabase Auth + Postgres |
| 스키마 | Zod |
| 테스트 | Vitest + Testing Library |
| 패키지 매니저 | pnpm |

## 현재 폴더 구조

```text
src/
  app/
  application/
  domain/
  features/
  infrastructure/
  presentation/
  shared/
  styles/
```

## 계층 역할

- `app`
  - 페이지
  - API route
  - 서버 컴포넌트 진입점
- `application`
  - 유스케이스
  - 프롬프트 조합
  - 포트 인터페이스
- `domain`
  - Zod 스키마
  - 순수 타입/모델
- `infrastructure`
  - 외부 API
  - 파일 저장소
  - Supabase persistence
  - 인증 유틸
- `presentation`
  - UI 컴포넌트
  - hooks
  - client store
- `shared`
  - 상수
  - 공용 유틸

## 네이밍 규칙

- 컴포넌트 파일: `PascalCase.tsx`
- 훅/유틸/서비스 파일: `camelCase.ts`
- 타입/스키마 이름: `PascalCase`
- 변수/함수: `camelCase`
- 상수: `SCREAMING_SNAKE_CASE`

## 코드 품질 규칙

1. `any`는 지양하고 Zod 타입 또는 명시 타입을 우선한다.
2. API 계약이 바뀌면 `docs/planning`, `research.md`, 관련 spec도 같이 갱신한다.
3. 외부 API 실패 시 가능한 fallback 경로를 남긴다.
4. 로컬 저장 책임과 서버 영속화 책임을 섞지 않는다.
5. battle 자산 저장은 owner 계산과 idempotency 규칙을 지킨다.
6. 사용자 노출 문구는 자연스러운 한글을 유지하고 깨진 문자열을 남기지 않는다.

## 상태와 저장 규칙

- 세션/owner
  - `auth user id` 우선
  - 비로그인은 guest cookie id 사용
- 로컬 저장
  - 최근 본 코인
  - 현재 snapshot
  - 현재 userBattle
  - 사용자 레벨
  - 결과 적용 여부
  - timing metrics
- 서버 저장
  - snapshot
  - prep cache
  - outcome/report/memo/seed/event/application

## 테스트 원칙

- 도메인 모델: Zod schema 테스트
- 유스케이스: 입력/출력 단위 테스트
- 컴포넌트: 핵심 상호작용 테스트
- API route: 계약과 에러 경계 테스트
- battle 저장: idempotency와 복구 경로 우선 테스트

## 품질 게이트

```bash
pnpm lint
pnpm typecheck
pnpm test
```

## 보안과 개인정보

- GPS 등 민감 정보 저장 금지
- API 키는 서버 환경변수로만 사용
- 운영 페이지는 내부 전용으로 취급하되, 실제 접근 제어는 후속 보강 대상
- 주요 화면에 리스크 고지 유지

## 문서 운영 규칙

- 구현과 planning 문서 차이를 오래 방치하지 않는다.
- 작업 단위마다 `docs/개발일지`, `docs/prompt` 기록을 남긴다.
- AGENTS 기준 문서 경로가 실제 저장소와 다르면 드리프트를 문서에 명시한다.
