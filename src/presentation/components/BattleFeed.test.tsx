import { render, screen } from "@testing-library/react";
import { BattleFeed } from "@/presentation/components/BattleFeed";

describe("BattleFeed", () => {
  it("불리시 메시지는 좌측 계열, 베어리시 메시지는 우측 계열로 렌더링한다", () => {
    render(
      <BattleFeed
        messages={[
          {
            id: "1",
            characterId: "chart-ko",
            characterName: "차트코",
            team: "bull",
            stance: "bullish",
            summary: "상승 논리가 살아 있다.",
            detail: "지지선이 유지된다.",
            indicatorLabel: "RSI",
            indicatorValue: "58",
            provider: "openrouter",
            model: "qwen/qwen3.5-9b",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            characterId: "macro-jjang",
            characterName: "매크로짱",
            team: "bear",
            stance: "bearish",
            summary: "거시 리스크가 남아 있다.",
            detail: "달러 강세가 부담이다.",
            indicatorLabel: "공포탐욕",
            indicatorValue: "61",
            provider: "openrouter",
            model: "stepfun/step-3.5-flash:free",
            fallbackUsed: false,
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    expect(screen.getByText("상승 논리가 살아 있다.").closest("article")).toHaveAttribute("data-team", "bull");
    expect(screen.getByText("거시 리스크가 남아 있다.").closest("article")).toHaveAttribute("data-team", "bear");
  });
});
