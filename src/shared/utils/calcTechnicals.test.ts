import { describe, expect, it } from "vitest";
import { calcBollingerBands, calcMacd, calcRsi } from "@/shared/utils/calcTechnicals";

const samplePrices = [
  100, 102, 101, 103, 105, 104, 108, 110, 112, 111, 114, 116, 118, 120, 119, 121, 123,
  122, 124, 126, 127, 129, 130, 132, 134, 136,
];

describe("calcTechnicals", () => {
  it("RSI 결과가 0에서 100 사이에 있다", () => {
    const rsi = calcRsi(samplePrices);
    expect(rsi).toBeGreaterThanOrEqual(0);
    expect(rsi).toBeLessThanOrEqual(100);
  });

  it("MACD와 볼린저밴드가 숫자를 반환한다", () => {
    const macd = calcMacd(samplePrices);
    const bands = calcBollingerBands(samplePrices);

    expect(macd).toEqual(expect.any(Number));
    expect(bands.upper).toBeGreaterThan(bands.lower);
  });
});
