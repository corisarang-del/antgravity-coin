# 개발일지 - Ant Gravity 발표용 PPTX 제작

- 작성시각: 2026-03-16 00:00:00 +09:00
- 해결하고자 한 문제:
  - 현재 프로젝트를 발표할 수 있도록 웹앱의 목적, 사용자 흐름, 캐릭터 구조를 담은 보고서형 PPTX가 필요했음.
  - 홈페이지 디자인 톤을 참고해 발표 자료도 같은 브랜드 인상을 유지해야 했음.
- 진행 내용:
  - 홈페이지 토큰과 랜딩 디자인 톤을 확인해 딥 네이비, 블러시, 버터 포인트 중심의 발표 스타일을 설계함.
  - `pptxgenjs`를 devDependency로 추가하고 `pptx/ant-gravity-report/build-report.js`를 작성함.
  - 캐릭터 WebP 자산을 발표용 PNG로 변환해 `pptx/ant-gravity-report/assets`에 복사함.
  - 표지, 문제/해법, 사용자 흐름, 캐릭터 8인, 시스템 구조, MVP/로드맵, 클로징까지 7장 슬라이드로 구성함.
- 해결된 것:
  - 발표용 PPTX `pptx/ant-gravity-report/ant-gravity-report.pptx`가 생성됨.
  - 재생성 가능한 소스 파일 `pptx/ant-gravity-report/build-report.js`도 함께 남김.
  - 캐릭터 이미지를 포함한 브랜드 일관형 보고서 초안이 준비됨.
- 해결되지 않은 것:
  - `render_slides.py`는 `pdf2image` 미설치로 실행되지 않았음.
  - `detect_font.py`는 LibreOffice 미설치로 실행되지 않았음.
  - 헬퍼 레이아웃 경고는 배경 글로우와 레이어형 디자인 때문에 많이 발생했지만 시각 렌더 검증은 이번 환경에서 완료하지 못했음.

