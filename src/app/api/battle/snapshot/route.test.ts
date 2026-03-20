import { describe, expect, it, vi } from "vitest";
import { GET, POST } from "@/app/api/battle/snapshot/route";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";

vi.mock("@/infrastructure/auth/requestOwner", () => ({
  getRequestOwnerId: vi.fn().mockResolvedValue({
    ownerId: "anonymous",
    isAuthenticated: false,
    user: null,
    supabase: null,
  }),
}));

describe("POST /api/battle/snapshot", () => {
  it("snapshot을 저장하고 userId, battleId까지 포함해 다시 조회할 수 있다", async () => {
    const snapshotId = `snapshot-${crypto.randomUUID()}`;
    const battleId = `battle-${crypto.randomUUID()}`;

    const postResponse = await POST(
      new Request("http://localhost/api/battle/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotId,
          battleId,
          coinId: "bitcoin",
          marketData: null,
          summary: null,
          messages: [],
          savedAt: new Date().toISOString(),
        }),
      }),
    );

    const postData = (await postResponse.json()) as {
      ok: boolean;
      snapshotId: string;
      userId: string;
      battleId: string | null;
    };

    expect(postData.ok).toBe(true);
    expect(postData.snapshotId).toBe(snapshotId);
    expect(postData.userId).toBe("anonymous");
    expect(postData.battleId).toBe(battleId);

    const getResponse = await GET(
      new Request(`http://localhost/api/battle/snapshot?snapshotId=${snapshotId}`),
    );
    const data = (await getResponse.json()) as {
      ok: boolean;
      snapshot: { snapshotId: string; userId: string; battleId: string | null; coinId: string };
    };

    expect(data.ok).toBe(true);
    expect(data.snapshot.snapshotId).toBe(snapshotId);
    expect(data.snapshot.userId).toBe("anonymous");
    expect(data.snapshot.battleId).toBe(battleId);
    expect(data.snapshot.coinId).toBe("bitcoin");
  });

  it("battleId로 snapshotId를 조회할 수 있다", async () => {
    const snapshotId = `snapshot-${crypto.randomUUID()}`;
    const battleId = `battle-${crypto.randomUUID()}`;

    await POST(
      new Request("http://localhost/api/battle/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotId,
          battleId,
          coinId: "bitcoin",
          marketData: null,
          summary: null,
          messages: [],
          savedAt: new Date().toISOString(),
        }),
      }),
    );

    const response = await GET(
      new Request(`http://localhost/api/battle/snapshot?battleId=${battleId}`),
    );

    const data = (await response.json()) as {
      ok: boolean;
      snapshotId: string;
      battleId: string | null;
      coinId: string;
      ownerMatched: boolean;
    };

    expect(data.ok).toBe(true);
    expect(data.snapshotId).toBe(snapshotId);
    expect(data.battleId).toBe(battleId);
    expect(data.coinId).toBe("bitcoin");
    expect(data.ownerMatched).toBe(true);
  });

  it("다른 owner가 같은 snapshotId를 덮어쓰려 하면 403을 반환한다", async () => {
    const snapshotId = `snapshot-${crypto.randomUUID()}`;
    vi.mocked(getRequestOwnerId).mockResolvedValue({
      ownerId: "another-owner",
      isAuthenticated: false,
      user: null,
      supabase: {} as never,
    });
    vi.spyOn(FileBattleSnapshotRepository.prototype, "getSnapshot").mockResolvedValueOnce({
      snapshotId,
      userId: "anonymous",
      battleId: null,
      coinId: "bitcoin",
      marketData: null,
      summary: null,
      messages: [],
      savedAt: new Date().toISOString(),
    });

    const response = await POST(
      new Request("http://localhost/api/battle/snapshot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snapshotId,
          battleId: null,
          coinId: "bitcoin",
          marketData: null,
          summary: null,
          messages: [],
          savedAt: new Date().toISOString(),
        }),
      }),
    );

    const data = (await response.json()) as { error: string };

    expect(response.status).toBe(403);
    expect(data.error).toBe("snapshot_owner_mismatch");
  });
});
