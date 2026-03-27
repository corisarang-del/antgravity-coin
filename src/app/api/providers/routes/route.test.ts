import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/providers/routes/route";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";

vi.mock("@/infrastructure/auth/adminAccess", () => ({
  getAdminAccess: vi.fn().mockResolvedValue({
    allowed: true,
    status: 200,
    user: null,
    supabase: {} as never,
  }),
}));

describe("provider routes api", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getAdminAccess).mockResolvedValue({
      allowed: true,
      status: 200,
      user: null,
      supabase: {} as never,
    });
  });

  it("관리자 권한이 없으면 GET 요청을 차단한다", async () => {
    vi.mocked(getAdminAccess).mockResolvedValueOnce({
      allowed: false,
      status: 403,
      user: null,
      supabase: {} as never,
    });

    const response = await GET();
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("현재 라우팅표를 반환한다", async () => {
    const response = await GET();
    const data = (await response.json()) as {
      routes: Array<{ characterId: string; provider: string; fallbackProvider: string }>;
    };

    expect(data.routes.find((route) => route.characterId === "aira")).toBeTruthy();
    expect(data.routes.every((route) => route.provider === "openrouter")).toBe(true);
    expect(data.routes.every((route) => route.fallbackProvider === "openrouter")).toBe(true);
  });

  it("평가 결과를 받아 라우팅표를 갱신한다", async () => {
    const response = await POST(
      new Request("http://localhost/api/providers/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          evaluations: [
            {
              characterId: "judy",
              candidateRoute: {
                characterId: "judy",
                tier: "cheap",
                provider: "openrouter",
                model: "arcee-ai/trinity-large-preview:free",
                fallbackProvider: "openrouter",
                fallbackModel: "qwen/qwen3.5-9b",
                timeoutMs: 10000,
                cacheTtlSeconds: 60,
              },
              failureRate: 0.05,
              averageLatencyMs: 9000,
              shadowMatched: true,
            },
          ],
        }),
      }),
    );

    const data = (await response.json()) as {
      ok: boolean;
      routes: Array<{ characterId: string; provider: string }>;
    };

    expect(data.ok).toBe(true);
    expect(data.routes.find((route) => route.characterId === "judy")?.provider).toBe("openrouter");
  });

  it("관리자 권한이 없으면 POST 요청을 차단한다", async () => {
    vi.mocked(getAdminAccess).mockResolvedValueOnce({
      allowed: false,
      status: 403,
      user: null,
      supabase: {} as never,
    });

    const response = await POST(
      new Request("http://localhost/api/providers/routes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ evaluations: [] }),
      }),
    );
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });
});
