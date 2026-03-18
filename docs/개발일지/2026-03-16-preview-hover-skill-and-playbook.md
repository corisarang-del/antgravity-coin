# preview-hover 스킬과 플레이북 문서화

- 작성시각: 2026-03-16 00:00:00 +09:00
- 해결하고자 한 문제:
  - hover preview 구현 과정에서 발생했던 여러 실패 원인과 해결 순서를 재사용 가능하게 남길 필요가 있었음.
  - mp4 변환부터 웹 오디오 정책 대응까지 다음번에도 같은 문제를 반복하지 않게 해야 했음.
- 진행 내용:
  - `docs/preview-hover-playbook.md`에 자산 배치, ffmpeg 변환, preload/cache, 오디오 unlock, 쿨다운, 검증 절차를 정리함.
  - `skill-staging/preview-hover/SKILL.md`에 재사용 가능한 스킬 형태로 workflow를 정리함.
- 해결된 것:
  - 프로젝트 안에 hover preview 구현 플레이북이 남음.
  - 다음번 작업용 스킬 초안이 준비됨.
- 해결되지 않은 것:
  - 글로벌 스킬 폴더 복사 설치는 별도 권한이 필요함.
