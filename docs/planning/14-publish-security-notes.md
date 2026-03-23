# 공개 저장소 보안 메모

- 작성시각: 2026-03-23 00:00 KST
- 목적: 공개 브랜치에 남는 보안 관점 리스크를 명시

## 현재 확인된 상태

- `.env`, `.env.local`은 `.gitignore`에 포함되어 있고 추적되지 않는다.
- 추적 파일 검색 기준 실제 API 키 하드코딩 흔적은 발견하지 못했다.
- 런타임 데이터, 내부 작업 기록, 산출물, hover preview mp4는 공개 브랜치에서 제외한다.

## 공개 코드에 남는 리스크

### 1. `/admin/*` 접근 제어 미구현

- `/admin/battles`, `/admin/memos` 화면과 관련 API가 존재한다.
- 현재는 화면에 `Internal Only` 문구만 있고 실질 인증/권한 가드가 없다.
- 공개 저장소 기준으로는 구현 의도가 드러나므로, 실제 배포 전에는 운영자 인증과 접근 제어가 필요하다.

### 2. in-memory rate limit 한계

- `/api/battle`
- `/api/battle/outcome`
- `/api/admin/cache/prewarm`

위 route에는 메모리 기반 rate limit이 적용돼 있다.

- 단일 인스턴스 기준 보호에는 유효하다.
- 다중 인스턴스나 서버리스 분산 환경에서는 우회 가능성이 있다.
- 운영 배포 전에는 Redis 같은 공용 저장소 기반 제한으로 교체하는 게 안전하다.

## 이번 공개 브랜치 정책

- 공개 브랜치에는 아래를 포함하지 않는다.
  - `database/data/*`
  - `docs/prompt/*`
  - `docs/개발일지/*`
  - `out/*`
  - `public/characters/previews/*`
  - `tmp/*`
  - `memory.md`

## 후속 권장 작업

1. `/admin/*` 인증/권한 제어 추가
2. rate limit 공용 저장소 기반 전환
3. 비공개 산출물 디렉터리 정책을 README 또는 운영 문서에 명시
