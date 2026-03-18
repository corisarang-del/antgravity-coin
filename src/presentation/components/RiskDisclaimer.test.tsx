import { render, screen } from "@testing-library/react";
import { RiskDisclaimer } from "@/presentation/components/RiskDisclaimer";

describe("RiskDisclaimer", () => {
  it("항상 투자 조언 아님 문구를 보여준다", () => {
    render(<RiskDisclaimer />);

    expect(screen.getByText("투자 조언 아님")).toBeInTheDocument();
    expect(
      screen.getByText(/GPS 같은 민감 정보는 저장하지 않는다/),
    ).toBeInTheDocument();
  });
});
