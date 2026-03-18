import { render, screen } from "@testing-library/react";
import { TopCoinsGrid } from "@/presentation/components/TopCoinsGrid";
import { topCoins } from "@/shared/constants/mockCoins";

describe("TopCoinsGrid", () => {
  it("시가총액 라벨과 배틀 입장 CTA를 보여준다", () => {
    render(<TopCoinsGrid coins={topCoins.slice(0, 1)} />);

    expect(screen.getByText(/시가총액/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "배틀 입장" })).toHaveAttribute(
      "href",
      "/battle/bitcoin",
    );
  });
});
