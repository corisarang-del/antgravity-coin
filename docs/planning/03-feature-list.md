# 기능 목록

- 작성시각: 2026-03-21 14:50 KST
- 기준: 현재 구현 상태를 우선 기록

## 우선순위 기준

- `P0`: 현재 battle 루프 유지에 필수
- `P1`: 체감 품질과 복기 경험 강화
- `P2`: 운영 고도화 또는 후속 확장

## F1. 탐색과 진입

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F1-1 | 코인 검색 | CoinGecko 검색 API 기반 검색 | P0 | 구현 |
| F1-2 | Top 코인 진입 | 홈 Top 코인 카드에서 바로 battle 이동 | P0 | 구현 |
| F1-3 | 최근 본 코인 | localStorage 기반 최근 본 목록 | P1 | 구현 |
| F1-4 | 랜딩에서 홈 진입 | `/` 브랜드 소개 후 `/home` 진입 | P1 | 구현 |
| F1-5 | 핵심 CTA 가독성 규칙 | 랜딩/홈 CTA에 최소 터치 타깃과 대비 규칙 적용 | P1 | 구현 |

## F2. battle 스트림

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F2-1 | SSE battle 스트림 | `POST /api/battle` SSE 송신 | P0 | 구현 |
| F2-2 | 4라운드 병렬 발언 | `Aira+Ledger`, `Judy+Shade`, `Clover+Vela`, `Blaze+Flip` | P0 | 구현 |
| F2-3 | 현재 화자 강조 | `character_start` 기준 spotlight/board 강조 | P1 | 구현 |
| F2-4 | 요약 + detail + indicator | 각 메시지 카드에 핵심 근거 표시 | P0 | 구현 |
| F2-5 | 조기 선택 오픈 | `battle_pick_ready` 후 pick CTA 오픈 | P0 | 구현 |
| F2-6 | 배틀 전 프라이머 | 미니 브리핑 + 곧 등장할 캐릭터 카드 | P1 | 구현 |
| F2-7 | battle timing 저장 | prepared context, 첫 발언, 완료 시점 저장 | P1 | 구현 |
| F2-8 | pick-ready 시점 저장 | `pickReadyAt`까지 local metrics 저장 | P1 | 미구현 |

## F3. 선택과 결과

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F3-1 | 팀 선택 | bull / bear 선택 | P0 | 구현 |
| F3-2 | 시간프레임 선택 | `5m`, `30m`, `1h`, `4h`, `24h`, `7d` | P0 | 구현 |
| F3-3 | waiting 카운트다운 | 정산 시각까지 남은 시간 표시 | P0 | 구현 |
| F3-4 | 실캔들 정산 | Bybit entry/settlement candle close로 결과 계산 | P0 | 구현 |
| F3-5 | XP 1회 적용 | local applied set + 서버 application 저장 | P0 | 구현 |
| F3-6 | 결과 하이라이트 | 승리 팀 핵심 메시지와 XP 변화 표시 | P1 | 구현 |
| F3-7 | 결과 재방문 복구 | battleId 기준 outcome/report 재조회 | P1 | 구현 |
| F3-8 | 0초 자동 결과 이동 | waiting countdown이 0초가 되면 `/result` 자동 이동 | P1 | 구현 |
| F3-9 | 정산 결과 선표시 | 승패, 변화율, XP를 먼저 보여주고 report는 후행 생성 | P1 | 구현 |

## F4. 데이터 수집과 캐시

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F4-1 | CoinGecko 시장 데이터 | 검색, Top 코인, 가격, 거래량, 기본 스냅샷 | P0 | 구현 |
| F4-2 | 기술 지표 계산 | RSI, MACD, 볼린저 계산 | P0 | 구현 |
| F4-3 | Fear & Greed | Alternative.me 연동 | P0 | 구현 |
| F4-4 | 뉴스 감성 파이프라인 | Alpha Vantage + GDELT + NewsAPI | P1 | 구현 |
| F4-5 | 파생 지표 수집 | Bybit long/short, Hyperliquid OI/funding | P1 | 구현 |
| F4-6 | opening round prewarm | prepared context와 `Aira`, `Ledger` 초안 예열 | P0 | 구현 |
| F4-7 | prewarm 운영 API | `/api/admin/cache/prewarm`과 coin 목록 예열 | P1 | 구현 |
| F4-8 | prewarm wall-clock 최적화 | 준비 시간 더 줄이기 | P1 | 진행중 |

## F5. 캐릭터 시스템

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F5-1 | 캐릭터 도감 | `/characters`에서 8명 노출 | P1 | 구현 |
| F5-2 | 캐릭터 상세 모달 | 역할, 성격, 선정 이유 표시 | P1 | 구현 |
| F5-3 | 캐릭터 소스 전환 | local / external 저장소 전환 | P1 | 구현 |
| F5-4 | 프리뷰 자산 | landing hover/preview video 사용 | P1 | 구현 |
| F5-5 | 캐릭터별 evidence 분리 | 역할별 근거 소스와 말투 분리 | P0 | 구현 |
| F5-6 | 런타임 모델 route override | `/api/providers/routes`로 조정 | P1 | 구현 |

## F6. 인증과 아카이브

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F6-1 | Supabase OAuth 로그인 | Google, Kakao | P1 | 구현 |
| F6-2 | guest owner 공존 | `auth user id -> guest cookie id` 우선순위 | P0 | 구현 |
| F6-3 | local 상태 병합 | `/api/auth/merge-local`로 계정 병합 | P1 | 구현 |
| F6-4 | `/me` battle 아카이브 | 최근 battle 목록과 상세 조회 | P1 | 구현 |
| F6-5 | 인증 사용자 Supabase 미러 저장 | snapshot/session/outcome/seed/report 자산 저장 | P1 | 구현 |

## F7. 운영 도구

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F7-1 | 운영 battle 목록 | `/admin/battles` recent outcome 조회 | P1 | 구현 |
| F7-2 | 운영 battle 상세 | outcome, seed, report, event log 조회 | P1 | 구현 |
| F7-3 | 운영 memo 아카이브 | `/admin/memos` reusable memo 조회 | P1 | 구현 |
| F7-4 | 운영 페이지 접근 제어 | 내부 전용 보호 | P1 | 미구현 |

## 현재 MVP 정의

- 코인 탐색
- 실시간 battle 시청
- 조기 선택 또는 전체 시청 후 pick
- 실정산 결과 계산
- XP 1회 반영
- 캐릭터 도감
- 로그인 후 `/me` 아카이브

## 2026-03-23 인증 / `/me` 고도화 추가 항목

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F6-6 | 통합 OAuth 로그인/가입 UX | `/login`에서 Google, Kakao 버튼으로 로그인과 첫 가입을 같이 처리 | P1 | 예정 |
| F6-7 | `/me` 요약 대시보드 상단 카드 | 프로필, XP, 등급, 승패 기록을 첫 화면 상단에 고정 노출 | P1 | 예정 |
| F6-8 | 등급 노출 강화 | 기존 XP 5단계와 개미 타이틀을 더 분명하게 표시 | P1 | 예정 |
| F6-9 | `/me` 기록 압축 리스트 | 최근 battle은 기본 5개 안팎 요약으로 먼저 보여주고 상세는 선택 시 확장 | P1 | 예정 |

## 2026-03-23 진행 메모

- `F6-6`
  - 로그인/회원가입 통합 카피와 callback 실패 문구까지 반영되어 부분 구현 상태
- `F6-7`
  - `/me` 상단에서 프로필, XP, 등급, 승패 노출까지 반영되어 부분 구현 상태
- `F6-8`
  - 기존 XP 5단계 등급 노출은 화면에 반영됐고, 새 체계는 만들지 않음
- `F6-9`
  - 최근 battle 5개 압축 리스트 방향까지 반영됐고 상세 확장 구조는 유지함
- 남은 핵심 확인
  - dev 서버 재기동 후 실제 브라우저 체감 확인
  - 로그인 시 Supabase env 로딩 상태 재확인

## 2026-03-23 홈 / 검색 / 캐릭터도감 가독성 추가 항목

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F1-6 | 홈 hero one-line 안정화 | `불리시팀 vs 베어리시팀` headline을 한 줄로 유지하면서 검색 카드 overflow를 막는 레이아웃 조정 | P1 | 구현 |
| F1-7 | 검색 카드 headline 정리 | `어떤 코인으로 붙을지 골라줘` 기준으로 한 줄 headline과 내부 정렬 정리 | P1 | 구현 |
| F1-8 | 설명문 가독성 규칙 | `Pretendard` body + `16px` + 강화 대비를 설명문에 선택 적용 | P1 | 구현 |
| F5-7 | 캐릭터도감 설명문 동기화 | 카드, 상단 소개, 상세 모달 설명문을 같은 규칙으로 정리 | P1 | 구현 |
| F1-9 | 추천 코인 구성 정리 | 홈 추천 코인 목록에 `AVAX` 포함 | P2 | 구현 |
| F1-10 | curated top coin live merge | 추천 코인 셋은 curated 목록 기준으로 유지하고 가격 / 변동률 / 시총만 CoinGecko live 응답으로 덮기 | P1 | 구현 |
