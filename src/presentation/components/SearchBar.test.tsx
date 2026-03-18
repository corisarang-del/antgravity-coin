import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { SearchBar } from "@/presentation/components/SearchBar";
import { topCoins } from "@/shared/constants/mockCoins";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("SearchBar", () => {
  beforeEach(() => {
    pushMock.mockReset();
    window.localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: async () => ({
          coins: [
            {
              id: "bitcoin",
              symbol: "BTC",
              name: "Bitcoin",
              thumb: "B",
            },
          ],
        }),
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('검색창에 "BTC" 입력 시 자동완성 드롭다운에 비트코인이 표시된다', async () => {
    render(<SearchBar initialCoins={topCoins} debounceMs={0} />);

    fireEvent.change(screen.getByLabelText("코인 검색"), {
      target: { value: "BTC" },
    });

    await waitFor(() => {
      expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    });
  });

  it("아래 방향키와 엔터로 자동완성을 선택할 수 있다", async () => {
    render(<SearchBar initialCoins={topCoins} debounceMs={0} />);

    const input = screen.getByRole("combobox", { name: "코인 검색" });
    fireEvent.change(input, {
      target: { value: "BTC" },
    });

    await waitFor(() => {
      expect(screen.getByRole("option", { name: /BTC/i })).toBeInTheDocument();
    });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/battle/bitcoin");
    });
  });
});
