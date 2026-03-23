import { render, screen } from "@testing-library/react";
import { SpeakerSpotlight } from "@/presentation/components/SpeakerSpotlight";

describe("SpeakerSpotlight", () => {
  it("현재 발언 캐릭터의 썸네일과 역할을 함께 보여준다", () => {
    render(
      <SpeakerSpotlight
        message={{
          id: "1",
          characterId: "aira",
          characterName: "Aira",
          team: "bull",
          stance: "bullish",
          summary: "상승 흐름이 아직 살아 있어.",
          detail: "RSI와 거래량 모두 방어적이야.",
          indicatorLabel: "RSI",
          indicatorValue: "58",
          provider: "openrouter",
          model: "qwen/qwen3.5-9b",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        }}
      />,
    );

    expect(screen.getByAltText("Aira")).toBeInTheDocument();
    expect(screen.getByText("기술분석가")).toBeInTheDocument();
  });
});
