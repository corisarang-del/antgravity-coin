# research 구조 보강

- 작성시각: 2026-03-17 03:25 KST
- 해결하고자 한 문제: 루트 `research.md`가 제품 흐름 중심으로는 잘 정리돼 있었지만, 실제 코드베이스 구조와 운영용 구현 범위가 빠져 있어서 프로젝트 전체 구조를 한 번에 이해하기 어려웠다.

## 해결된 것

- 루트 `research.md`의 기존 내용과 겹치지 않도록 실제 구현 기준 구조 정보만 추가했다.
- `src`가 `app / presentation / application / domain / infrastructure / features / shared / styles`로 나뉜 layered 구조라는 점을 정리했다.
- 문서에 없던 운영 API와 내부 페이지(`/api/battle/outcome`, `/api/battle/events`, `/api/admin/battles`, `/api/providers/routes`, `/admin/battles`)를 정리했다.
- `database/data` 아래 JSON 저장소가 `battle_result_applications`, `seed_store`, `report_store`, `event_log`로 분리돼 있다는 점을 정리했다.
- 런타임 provider 라우팅이 상수 + override 맵 구조라는 점과, 테스트가 계층별 co-located 방식이라는 점을 정리했다.
- 루트 외 `backup-worktree`, `bootstrap-app`, `skill-staging`, `pptx`, `tools/ffmpeg` 같은 보조 작업공간 성격 폴더도 구조 메모에 반영했다.

## 아직 안 된 것

- `backup-worktree/`와 `bootstrap-app/`의 정확한 생성 배경이나 현재 운영상 역할까지는 확인하지 않았다.
- 모든 구현 세부를 줄 단위로 역추적한 것은 아니고, 구조 파악에 필요한 핵심 라우트/저장소/설정 파일 위주로 확인했다.
- 이번 단계에서는 코드 수정이 아니라 문서 보강만 수행했다.

