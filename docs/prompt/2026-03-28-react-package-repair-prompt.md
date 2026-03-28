# react 패키지 손상 복구

- 작성시각: 2026-03-28 11:10 KST
- 프롬프트:
  - `next dev` 실행 시 `react`, `react-dom`을 못 찾는 오류 원인 확인 및 복구
- 해결하고자 한 문제:
  - `package.json`에는 `react`, `react-dom`이 선언돼 있는데도 `next dev`가 `Cannot find module ... react/index.js`로 실패하는 문제를 해결하는 것
- 해결된 것:
  - `19.2.3` 설치본에서 `react`, `react-dom` 루트 엔트리 파일이 비정상적으로 빠져 있음을 확인
  - `react`, `react-dom`을 `19.2.4`로 상향 설치
  - 설치 후 `react`, `react/jsx-runtime`, `react-dom`, `react-dom/client` resolve 정상 확인
  - `node_modules\\.bin\\next.CMD --version` 정상 확인
- 해결되지 않은 것:
  - `pnpm run dev`를 충분히 길게 띄워 ready 로그까지 확인하지는 않음
  - 설치 과정에서 `vite`, `jiti` bin 생성 경고는 남아 있으므로 필요 시 별도 점검이 필요함
