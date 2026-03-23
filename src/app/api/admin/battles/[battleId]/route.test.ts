import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/admin/battles/[battleId]/route";

describe("GET /api/admin/battles/[battleId]", () => {
  it("battleId 상세를 반환하거나 not_found를 반환한다", async () => {
    const response = await GET(new Request("http://localhost/api/admin/battles/battle-1"), {
      params: Promise.resolve({ battleId: "battle-1" }),
    });

    expect([200, 404]).toContain(response.status);
    if (response.status === 200) {
      const data = (await response.json()) as { reportSource: "gemini" | "fallback" };
      expect(["gemini", "fallback"]).toContain(data.reportSource);
    }
  });
});
