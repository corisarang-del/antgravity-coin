# Vitest env 로딩 연결 프롬프트

- 작성시각: 2026-03-18 19:27 KST
- 해결하고자 한 문제:
  - Vitest가 `.env.local`의 `Alpha Vantage` 키를 자동으로 읽지 못하는 문제를 해결해야 했다.

## 사용한 프롬프트

```text
키 자체가 틀린 건 아니고 테스트 러너에 env 로딩을 연결하면 바로 해결돼. 필요하면 다음으로 그 부분까지 붙여줄게.
```

## 해결된 것

- `vitest.config.ts`에서 `.env.local`을 읽어 `process.env`로 주입하도록 연결했다.

## 아직 안 된 것

- `NewsAPI` 키는 아직 연결하지 않았다.
