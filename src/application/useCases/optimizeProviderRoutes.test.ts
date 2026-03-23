import { describe, expect, it } from "vitest";
import { optimizeProviderRoutes } from "@/application/useCases/optimizeProviderRoutes";
import { getCharacterModelRoute } from "@/shared/constants/characterModelRoutes";

describe("optimizeProviderRoutes", () => {
  it("후보가 실패율과 지연 시간 기준을 통과하면 승격한다", () => {
    const currentRoute = getCharacterModelRoute("aira");
    const candidateRoute = getCharacterModelRoute("judy");

    if (!currentRoute || !candidateRoute) {
      throw new Error("missing routes");
    }

    const [nextRoute] = optimizeProviderRoutes([
      {
        characterId: "aira",
        currentRoute,
        candidateRoute: { ...candidateRoute, characterId: "aira" },
        failureRate: 0.05,
        averageLatencyMs: 9000,
        shadowMatched: true,
      },
    ]);

    expect(nextRoute?.provider).toBe("openrouter");
  });
});
