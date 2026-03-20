import { describe, expect, it } from "vitest";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";

describe("runSerializedByKey", () => {
  it("같은 key 작업은 순서대로 직렬 실행한다", async () => {
    const steps: string[] = [];

    const first = runSerializedByKey("battle-1", async () => {
      steps.push("first:start");
      await new Promise((resolve) => setTimeout(resolve, 20));
      steps.push("first:end");
    });

    const second = runSerializedByKey("battle-1", async () => {
      steps.push("second:start");
      steps.push("second:end");
    });

    await Promise.all([first, second]);

    expect(steps).toEqual(["first:start", "first:end", "second:start", "second:end"]);
  });

  it("다른 key 작업은 서로 독립적으로 실행한다", async () => {
    const steps: string[] = [];

    await Promise.all([
      runSerializedByKey("battle-a", async () => {
        steps.push("a:start");
        await new Promise((resolve) => setTimeout(resolve, 10));
        steps.push("a:end");
      }),
      runSerializedByKey("battle-b", async () => {
        steps.push("b:start");
        steps.push("b:end");
      }),
    ]);

    expect(steps).toContain("a:start");
    expect(steps).toContain("a:end");
    expect(steps).toContain("b:start");
    expect(steps).toContain("b:end");
  });
});
