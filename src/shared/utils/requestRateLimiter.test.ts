import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearRequestRateLimitStore,
  consumeRequestRateLimit,
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

describe("requestRateLimiter", () => {
  beforeEach(() => {
    clearRequestRateLimitStore();
    vi.unstubAllEnvs();
  });

  it("같은 윈도우 안에서는 max를 넘기면 차단한다", () => {
    const first = consumeRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      now: 1_000,
    });
    const second = consumeRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      now: 1_001,
    });
    const third = consumeRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      now: 1_002,
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
    expect(third.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("윈도우가 지나면 다시 허용한다", () => {
    consumeRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 1,
      windowMs: 60_000,
      now: 1_000,
    });

    const next = consumeRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 1,
      windowMs: 60_000,
      now: 61_001,
    });

    expect(next.allowed).toBe(true);
    expect(next.remaining).toBe(0);
  });

  it("subject와 ip를 조합해서 요청 키를 만든다", () => {
    const request = new Request("http://localhost/api/battle", {
      headers: {
        "x-forwarded-for": "203.0.113.10, 10.0.0.1",
      },
    });

    expect(getRequestRateLimitKey(request, "battle", "guest-1")).toBe(
      "battle:guest-1:203.0.113.10",
    );
  });

  it("test 환경에서는 shared rpc 에러가 나면 로컬 limiter로 fallback 한다", async () => {
    vi.stubEnv("NODE_ENV", "test");

    const createBrokenSupabase = () => ({
      rpc: async () => ({
        data: null,
        error: { message: "function public.consume_request_rate_limit does not exist" },
      }),
    });

    const first = await consumeSharedRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      supabase: createBrokenSupabase(),
    });
    const second = await consumeSharedRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      supabase: createBrokenSupabase(),
    });
    const third = await consumeSharedRequestRateLimit({
      bucket: "battle",
      key: "owner-1",
      max: 2,
      windowMs: 60_000,
      supabase: createBrokenSupabase(),
    });

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(false);
  });

  it("production 환경에서는 shared rpc 에러가 나면 fail-closed 한다", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const result = await consumeSharedRequestRateLimit({
      bucket: "battle",
      key: "owner-prod",
      max: 2,
      windowMs: 60_000,
      supabase: {
        rpc: async () => ({
          data: null,
          error: { message: "rpc_failed" },
        }),
      },
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("shared_unavailable");
  });

  it("production 환경에서는 shared rpc 자체가 없으면 역시 차단한다", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const result = await consumeSharedRequestRateLimit({
      bucket: "battle",
      key: "owner-prod-missing",
      max: 1,
      windowMs: 60_000,
      supabase: null,
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("shared_unavailable");
  });
});
