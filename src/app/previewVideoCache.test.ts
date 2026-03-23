import { vi } from "vitest";
import { PreviewVideoCache } from "@/app/previewVideoCache";

describe("PreviewVideoCache", () => {
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("같은 id와 src로 preload하면 같은 엔트리를 재사용한다", () => {
    const cache = new PreviewVideoCache();
    const firstEntry = cache.preload("aira", "/characters/previews/aira.mp4");
    const secondEntry = cache.preload("aira", "/characters/previews/aira.mp4");

    expect(secondEntry).toBe(firstEntry);
  });

  it("loadeddata 이후 ready 상태로 바뀐다", async () => {
    const cache = new PreviewVideoCache();
    const entry = cache.preload("judy", "/characters/previews/judy.mp4");

    entry.video.dispatchEvent(new Event("loadeddata"));
    await expect(entry.promise).resolves.toBeUndefined();
    expect(cache.isReady("judy")).toBe(true);
  });

  it("error 이후 error 상태로 바뀐다", async () => {
    const cache = new PreviewVideoCache();
    const entry = cache.preload("flip", "/characters/previews/flip.mp4");

    entry.video.dispatchEvent(new Event("error"));
    await expect(entry.promise).rejects.toThrow("Failed to preload preview video");
    expect(cache.get("flip")?.status).toBe("error");
  });
});
