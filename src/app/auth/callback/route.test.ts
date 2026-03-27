import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/auth/callback/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn(),
}));

describe("GET /auth/callback", () => {
  it("code 교환이 성공하면 next 경로로 리다이렉트한다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    } as never);

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=test-code&next=%2Fbattle%2Fbitcoin"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/battle/bitcoin");
  });

  it("next가 외부 URL이면 /me로 강제한다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: null }),
      },
    } as never);

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=test-code&next=https://evil.example"),
    );

    expect(response.headers.get("location")).toBe("http://localhost:3000/me");
  });

  it("code 교환이 실패하면 로그인 에러 화면으로 보낸다", async () => {
    vi.mocked(createSupabaseServerClient).mockResolvedValueOnce({
      auth: {
        exchangeCodeForSession: vi.fn().mockResolvedValue({ error: { message: "boom" } }),
      },
    } as never);

    const response = await GET(
      new Request("http://localhost:3000/auth/callback?code=test-code&next=%2Fme"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=oauth_callback_failed",
    );
  });

  it("code가 없으면 로그인 에러 화면으로 보낸다", async () => {
    const response = await GET(
      new Request("http://localhost:3000/auth/callback?next=%2Fme"),
    );

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=oauth_callback_failed",
    );
  });
});
