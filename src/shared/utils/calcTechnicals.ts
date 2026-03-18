function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function standardDeviation(values: number[]) {
  const mean = average(values);
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function ema(values: number[], period: number) {
  const multiplier = 2 / (period + 1);
  return values.slice(1).reduce((prev, value) => value * multiplier + prev * (1 - multiplier), values[0]);
}

export function calcRsi(prices: number[], period = 14) {
  const slicedPrices = prices.slice(-(period + 1));

  if (slicedPrices.length < 2) {
    return 50;
  }

  let gains = 0;
  let losses = 0;

  for (let index = 1; index < slicedPrices.length; index += 1) {
    const diff = slicedPrices[index] - slicedPrices[index - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
  }

  if (losses === 0) {
    return 100;
  }

  const relativeStrength = gains / losses;
  return Number((100 - 100 / (1 + relativeStrength)).toFixed(2));
}

export function calcMacd(prices: number[]) {
  const short = ema(prices.slice(-12), 12);
  const long = ema(prices.slice(-26), 26);
  return Number((short - long).toFixed(2));
}

export function calcBollingerBands(prices: number[], period = 20) {
  const window = prices.slice(-period);
  const mean = average(window);
  const deviation = standardDeviation(window);

  return {
    upper: Number((mean + deviation * 2).toFixed(2)),
    lower: Number((mean - deviation * 2).toFixed(2)),
  };
}
