# 코딩 컨벤션

## 기술 스택

| 영역 | 선택 |
|------|------|
| 프레임워크 | Next.js 16 |
| 언어 | TypeScript |
| 스타일 | Tailwind CSS v4 |
| 상태 | Zustand + 로컬스토리지 |
| 검증 | Zod |
| 테스트 | Vitest + Testing Library |
| 패키지 매니저 | pnpm |

---

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

### 계층 역할
- `app`: 라우트와 API 핸들러
- `application`: 유스케이스
- `domain`: Zod 스키마와 도메인 모델
- `features`: 캐릭터 기능 묶음
- `infrastructure`: 외부 API, 저장소, 매퍼
- `presentation`: 컴포넌트, 훅, 스토어
- `shared`: 상수와 공용 유틸

---

## 네이밍 규칙

- 컴포넌트 파일: `PascalCase.tsx`
- 훅/유틸/서비스 파일: `camelCase.ts`
- 타입/스키마 이름: `PascalCase`
- 변수/함수: `camelCase`
- 상수: `SCREAMING_SNAKE_CASE`

---

## 코드 품질 규칙

1. `any`를 쓰지 않는다.
2. 직접 뮤테이션보다 불변 업데이트를 우선한다.
3. 외부 API 실패 시 가능한 fallback을 둔다.
4. 로컬 상태와 서버 파일 상태의 책임을 섞지 않는다.
5. UI 문구와 데이터 계약이 바뀌면 문서도 같이 갱신한다.

---

## 테스트 원칙

- 도메인 모델은 Zod 스키마 테스트로 검증
- 유스케이스는 입력/출력 단위 테스트 우선
- 컴포넌트는 핵심 상호작용만 테스트
- API 라우트는 계약 중심 테스트

---

## 품질 게이트

```bash
pnpm lint
pnpm typecheck
pnpm test
```

---

## 보안과 개인정보

- GPS 같은 민감정보 저장 금지
- API 키는 서버 환경변수로만 사용
- 세션은 익명 `userId` 쿠키 기반
- 결과 화면과 주요 진입 화면에는 리스크 고지 유지

---

## 문서 운영 규칙

- 개발 변경 시 `docs/planning`과 구현 간 차이를 바로 줄인다.
- 작업 단위마다 `docs/개발일지`, `docs/prompt` 기록을 남긴다.
