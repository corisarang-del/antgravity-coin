import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/admin/battles/[battleId]/route";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";

vi.mock("@/infrastructure/auth/adminAccess", () => ({
  getAdminAccess: vi.fn().mockResolvedValue({
    allowed: true,
    status: 200,
    user: { id: "admin-user" },
    supabase: {} as never,
  }),
}));

describe("GET /api/admin/battles/[battleId]", () => {
  it("관리자 권한이 없으면 403을 반환한다", async () => {
    vi.mocked(getAdminAccess).mockResolvedValueOnce({
      allowed: false,
      status: 403,
      user: null,
      supabase: {} as never,
    });

    const response = await GET(new Request("http://localhost/api/admin/battles/battle-1"), {
      params: Promise.resolve({ battleId: "battle-1" }),
    });
    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("forbidden");
  });

  it("관리자일 때 battleId 상세를 반환하거나 not_found를 반환한다", async () => {
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
