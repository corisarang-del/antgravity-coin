# react 패키지 손상 복구

- 작성시각: 2026-03-28 11:10 KST
- 해결하고자 한 문제:
  - `next dev`가 `react`, `react-dom`이 없다고 실패했는데, 선언 누락인지 실제 설치본 손상인지 분리해서 원인을 잡아야 했음

## 해결된 것

- `package.json`, `pnpm-lock.yaml`, `node_modules` 상태를 비교해서 선언 누락이 아니라 설치본 이상임을 확인했음
- `react@19.2.3`, `react-dom@19.2.3` 설치본에서 루트 엔트리 파일이 빠져 있는 비정상 상태를 확인했음
  - `index.js`
  - `jsx-runtime.js`
  - `client.js`
  같은 파일이 없어 `next` peer resolution이 깨지고 있었음
- `react`, `react-dom`을 `19.2.4`로 올려 다시 설치했음
- 이후 아래 확인을 마쳤음
  - `react` resolve 정상
  - `react/jsx-runtime` resolve 정상
  - `react-dom` resolve 정상
  - `react-dom/client` resolve 정상
  - `node_modules\\.bin\\next.CMD --version` 정상

## 해결되지 않은 것

- `pnpm run dev`를 오래 띄워 ready 로그까지 끝까지 확인하지는 않았음
- 설치 과정의 `vite`, `jiti` bin warning은 이번 이슈와 직접 관련 없어 보이지만 완전히 검토하진 않았음
