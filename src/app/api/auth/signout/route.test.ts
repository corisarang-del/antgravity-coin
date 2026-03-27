import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/auth/signout/route";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";

const signOutMock = vi.fn();

vi.mock("@/infrastructure/auth/supabaseServerClient", () => ({
  createSupabaseServerClient: vi.fn(() => ({
    auth: {
      signOut: signOutMock,
    },
  })),
}));

describe("POST /api/auth/signout", () => {
  it("서버 signOut을 호출하고 ok를 반환한다", async () => {
    signOutMock.mockResolvedValueOnce({ error: null });

    const response = await POST();
    const data = (await response.json()) as { ok: boolean };

    expect(createSupabaseServerClient).toHaveBeenCalled();
    expect(signOutMock).toHaveBeenCalled();
    expect(data.ok).toBe(true);
  });
});
