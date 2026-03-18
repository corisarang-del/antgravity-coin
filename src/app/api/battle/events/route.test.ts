import { describe, expect, it } from "vitest";
import { GET } from "@/app/api/battle/events/route";

describe("GET /api/battle/events", () => {
  it("battleId 기준 이벤트 목록을 반환한다", async () => {
    const response = await GET(new Request("http://localhost/api/battle/events?battleId=unknown"));
    const data = (await response.json()) as { ok: boolean; events: unknown[] };

    expect(data.ok).toBe(true);
    expect(Array.isArray(data.events)).toBe(true);
  });
});
