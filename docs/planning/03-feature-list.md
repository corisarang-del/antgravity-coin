# 기능 목록

- 작성시각: 2026-03-21 18:27 KST
- 기준: 현재 구현 우선

## 우선순위 기준

- `P0`: 현재 battle 루프 유지에 필수
- `P1`: 체감 품질과 복기 강화
- `P2`: 운영 고도화 또는 후속 확장

## F1. 탐색과 진입

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F1-1 | 코인 검색 | CoinGecko 검색 기반 진입 | P0 | 구현 |
| F1-2 | Top 코인 진입 | 홈 카드에서 바로 battle 이동 | P0 | 구현 |
| F1-3 | 최근 본 코인 | localStorage 최근 코인 목록 | P1 | 구현 |
| F1-4 | 랜딩 진입 | `/`에서 브랜드 소개 후 `/home` 유도 | P1 | 구현 |
| F1-5 | CTA 가독성 규칙 | 랜딩, 홈, battle 흐름 CTA 대비/크기 통일 | P1 | 구현 |

## F2. battle 스트림

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F2-1 | SSE battle 스트림 | `POST /api/battle` 실시간 송신 | P0 | 구현 |
| F2-2 | 4라운드 병렬 발언 | 2명씩 4라운드 병렬 처리 | P0 | 구현 |
| F2-3 | 현재 화자 강조 | `character_start` 기준 spotlight/board 강조 | P1 | 구현 |
| F2-4 | summary + detail + indicator | 메시지 카드에 핵심 근거 표시 | P0 | 구현 |
| F2-5 | 조기 선택 오픈 | `battle_pick_ready` 후 pick CTA 오픈 | P0 | 구현 |
| F2-6 | waiting primer | 미니 브리핑 + 다음 캐릭터 카드 | P1 | 구현 |
| F2-7 | battle timing 저장 | request, market ready, first character, first message, complete 저장 | P1 | 구현 |
| F2-8 | pick-ready 시점 저장 | `pickReadyAt` metrics 저장 | P1 | 미구현 |

## F3. 선택과 결과

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F3-1 | 팀 선택 | bull / bear 선택 | P0 | 구현 |
| F3-2 | 시간프레임 선택 | `5m`, `30m`, `1h`, `4h`, `24h`, `7d` | P0 | 구현 |
| F3-3 | waiting 카운트다운 | 정산 시각까지 남은 시간 표시 | P0 | 구현 |
| F3-4 | 0초 자동 이동 | countdown 종료 시 `/result` 자동 이동 | P1 | 구현 |
| F3-5 | 실캔들 정산 | Bybit candle close 기반 결과 계산 | P0 | 구현 |
| F3-6 | settlement 선행 계산 | waiting 10초 전 `mode: "settlement"` 호출 | P1 | 구현 |
| F3-7 | verdict 선표시 | XP와 결과를 먼저 보여주고 report 후행 생성 | P1 | 구현 |
| F3-8 | 결과 재방문 복구 | `battleId` 기준 outcome/report 재조회 | P1 | 구현 |
| F3-9 | XP 1회 적용 | local applied set + application 저장 | P0 | 구현 |

## F4. 데이터 수집과 캐시

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F4-1 | CoinGecko 시장 데이터 | 검색, Top 코인, 가격, 거래량, 히스토리 | P0 | 구현 |
| F4-2 | 기술 지표 계산 | RSI, MACD, 볼린저 계산 | P0 | 구현 |
| F4-3 | Fear & Greed | Alternative.me 연동 | P0 | 구현 |
| F4-4 | 뉴스 감성 파이프라인 | Alpha Vantage + GDELT + NewsAPI | P1 | 구현 |
| F4-5 | 파생 지표 수집 | Bybit long/short, Hyperliquid OI/funding | P1 | 구현 |
| F4-6 | prepared context | 시장 요약, reusable context, evidence 준비 | P0 | 구현 |
| F4-7 | opening round prewarm | `Aira`, `Ledger` 초안 예열 | P0 | 구현 |
| F4-8 | prewarm 운영 API | `/api/admin/cache/prewarm` | P1 | 구현 |
| F4-9 | prewarm wall-clock 추가 축소 | 준비 시간 더 줄이기 | P1 | 진행중 |

## F5. 캐릭터 시스템

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F5-1 | 캐릭터 도감 | `/characters`에서 8명 노출 | P1 | 구현 |
| F5-2 | 캐릭터 상세 모달 | 역할, 성격, 선정 이유 표시 | P1 | 구현 |
| F5-3 | 캐릭터 소스 전환 | local / external 저장소 전환 | P1 | 구현 |
| F5-4 | 프리뷰 자산 | 랜딩 hover/preview video 사용 | P1 | 구현 |
| F5-5 | 캐릭터별 evidence 분리 | 역할별 근거와 말투 분리 | P0 | 구현 |
| F5-6 | runtime route override | `/api/providers/routes`로 모델 route 조정 | P1 | 구현 |

## F6. 인증과 아카이브

| 기능 ID | 기능명 | 설명 | 우선순위 | 상태 |
| --- | --- | --- | --- | --- |
| F6-1 | Supabase OAuth 로그인 | Google, Kakao 로그인 | P1 | 구현 |
| F6-2 | guest owner 공존 | `auth user id -> guest cookie id` | P0 | 구현 |
| F6-3 | local 상태 병합 | `/api/auth/merge-local` | P1 | 구현 |
| F6-4 | `/me` battle 아카이브 | battle 목록과 상세 조회 | P1 | 구현 |
| F6-5 | 인증 사용자 미러 저장 | snapshot/session/outcome/seed 저장 | P1 | 구현 |

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
- Bybit 실정산 결과 계산
- XP 1회 반영
- 캐릭터 도감
- 로그인 후 `/me` 아카이브
