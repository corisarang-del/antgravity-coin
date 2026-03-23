import { renderHook, waitFor } from "@testing-library/react";
import { useBattleStream } from "@/presentation/hooks/useBattleStream";

describe("useBattleStream", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("스트림이 열린 뒤 unmount되면 reader.cancel로 정리하고 abort는 호출하지 않는다", async () => {
    const abortSpy = vi.spyOn(AbortController.prototype, "abort");
    const cancel = vi.fn().mockResolvedValue(undefined);
    const read = vi.fn(
      () =>
        new Promise<ReadableStreamReadResult<Uint8Array>>(() => {
          // cleanup 시 cancel로만 정리되는지 보기 위해 read를 pending 상태로 둔다.
        }),
    );

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        headers: new Headers(),
        body: {
          getReader: () => ({
            read,
            cancel,
          }),
        },
      }),
    );

    const { unmount } = renderHook(() => useBattleStream({ coinId: "bitcoin" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
      expect(read).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(cancel).toHaveBeenCalledTimes(1);
    });
    expect(abortSpy).not.toHaveBeenCalled();
  });
});
