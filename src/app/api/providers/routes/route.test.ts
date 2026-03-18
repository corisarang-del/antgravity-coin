import { describe, expect, it } from "vitest";
import { GET, POST } from "@/app/api/providers/routes/route";

describe("provider routes api", () => {
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
                model: "minimax/minimax-m2.5:free",
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
});
