import { beforeEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { getGuestUserId, getOrCreateGuestUserId } from "@/infrastructure/auth/guestSession";

const getMock = vi.fn();
const setMock = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

describe("guestSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("GUEST_SESSION_SECRET", "test-guest-secret");
    vi.mocked(cookies).mockResolvedValue({
      get: getMock,
      set: setMock,
    } as never);
  });

  it("서명되지 않은 쿠키는 무시한다", async () => {
    getMock.mockReturnValueOnce({ value: "plain-uuid" });

    const guestUserId = await getGuestUserId();

    expect(guestUserId).toBeNull();
  });

  it("유효한 서명 쿠키가 없으면 새 guest id를 발급한다", async () => {
    getMock.mockReturnValueOnce(undefined);

    const guestUserId = await getOrCreateGuestUserId();

    expect(guestUserId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock.mock.calls[0]?.[1]).toContain(".");
  });
});
