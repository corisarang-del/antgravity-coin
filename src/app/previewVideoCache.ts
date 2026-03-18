export type PreviewVideoStatus = "loading" | "ready" | "error";

export interface PreviewVideoEntry {
  id: string;
  src: string;
  status: PreviewVideoStatus;
  video: HTMLVideoElement;
  promise: Promise<void>;
}

export class PreviewVideoCache {
  private readonly entries = new Map<string, PreviewVideoEntry>();

  preload(id: string, src: string) {
    const existingEntry = this.entries.get(id);

    if (existingEntry && existingEntry.src === src) {
      return existingEntry;
    }

    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = src;

    let resolvePromise!: () => void;
    let rejectPromise!: (error: Error) => void;

    const promise = new Promise<void>((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
    });

    const entry: PreviewVideoEntry = {
      id,
      src,
      status: "loading",
      video,
      promise,
    };

    const cleanup = () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("error", handleError);
    };

    const handleLoadedData = () => {
      entry.status = "ready";
      cleanup();
      resolvePromise();
    };

    const handleError = () => {
      entry.status = "error";
      cleanup();
      rejectPromise(new Error(`Failed to preload preview video: ${src}`));
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("error", handleError);
    video.load();

    this.entries.set(id, entry);

    return entry;
  }

  get(id: string) {
    return this.entries.get(id) ?? null;
  }

  isReady(id: string) {
    return this.entries.get(id)?.status === "ready";
  }
}
