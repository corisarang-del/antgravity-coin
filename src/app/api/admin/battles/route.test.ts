import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/admin/battles/route";

describe("GET /api/admin/battles", () => {
  it("최근 battle 목록 또는 상세를 반환한다", async () => {
    const listResponse = await GET(new Request("http://localhost/api/admin/battles"));
    const listData = (await listResponse.json()) as {
      ok: boolean;
      battles: Array<{ reportSource: "gemini" | "fallback" }>;
    };

    expect(listData.ok).toBe(true);
    expect(Array.isArray(listData.battles)).toBe(true);
    if (listData.battles[0]) {
      expect(["gemini", "fallback"]).toContain(listData.battles[0].reportSource);
    }

    const detailResponse = await GET(
      new Request("http://localhost/api/admin/battles?battleId=battle-1"),
    );
    const detailData = (await detailResponse.json()) as { battleOutcomeSeed?: { battleId: string } };

    if (detailData.battleOutcomeSeed) {
      expect(detailData.battleOutcomeSeed.battleId).toBe("battle-1");
    }
  });
});
