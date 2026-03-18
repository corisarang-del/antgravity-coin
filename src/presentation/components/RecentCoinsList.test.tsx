import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { RecentCoinsList } from "@/presentation/components/RecentCoinsList";

vi.mock("@/presentation/hooks/useRecentCoins", () => ({
  useRecentCoins: () => ({
    recentCoins: [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        thumb: "B",
      },
    ],
  }),
}));

describe("RecentCoinsList", () => {
  it("최근 본 코인 카피와 다시 보기 CTA를 보여준다", () => {
    render(<RecentCoinsList />);

    expect(screen.getByText("최근 본 코인")).toBeInTheDocument();
    expect(screen.getByText("로컬스토리지 기준 최근 5개까지 보여줘")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /다시 보기/i })).toHaveAttribute(
      "href",
      "/battle/bitcoin",
    );
  });
});
