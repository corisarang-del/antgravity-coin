# Supabase Auth와 유저 페이지 구현 프롬프트

작성시각: 2026-03-20 15:10 KST

## 프롬프트 요약

Prisma 없이 Supabase Auth 기반으로 Google/Kakao 로그인, 로그인 페이지, 유저 페이지 `/me`, 계정 API, local 익명 기록 병합, 배틀 데이터 DB 저장 흐름을 현재 페이지 디자인을 그대로 따르면서 구현하기.

## 해결하려고 한 문제

- 익명 쿠키 기반의 한계
- 계정 로그인과 유저 페이지 부재
- 계정 배틀 기록 영구 저장 부재

## 해결된 것

- Supabase SSR 인증 골격과 유저 페이지 흐름을 추가했다.
- snapshot/session/outcome의 로그인 사용자 DB 저장을 연결했다.
- planning 문서를 현재 구조에 맞게 갱신했다.

## 아직 안 된 것

- OAuth provider 실서비스 비밀값 설정은 별도 운영 단계가 남아 있다.

