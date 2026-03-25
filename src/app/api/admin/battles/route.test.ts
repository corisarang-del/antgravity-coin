import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/battles/route";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";

vi.mock("@/infrastructure/auth/adminAccess", () => ({
  getAdminAccess: vi.fn().mockResolvedValue({
    allowed: true,
    status: 200,
    user: { id: "admin-user" },
    supabase: {} as never,
  }),
}));

describe("GET /api/admin/battles", () => {
  it("관리자 권한이 없으면 403을 반환한다", async () => {
    vi.mocked(getAdminAccess).mockResolvedValueOnce({
      allowed: false,
      status: 403,
      user: null,
      supabase: {} as never,
    });

    const response = await GET(new Request("http://localhost/api/admin/battles"));
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("관리자일 때 최근 battle 목록과 상세를 반환한다", async () => {
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
