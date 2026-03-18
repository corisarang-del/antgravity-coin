export interface CoinSummary {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change24h: number;
  marketCap: string;
  thesis: string;
  thumb: string;
}

export const topCoins: CoinSummary[] = [
  {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
    price: "$84,120",
    change24h: 2.84,
    marketCap: "$1.66T",
    thesis: "ETF 자금 흐름과 안전자산 서사가 여전히 강하다.",
    thumb: "₿",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: "$4,140",
    change24h: 1.72,
    marketCap: "$498B",
    thesis: "레이어2 확장과 네트워크 수수료 회복 기대가 유지된다.",
    thumb: "◆",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: "$214",
    change24h: -1.41,
    marketCap: "$104B",
    thesis: "온체인 활동은 강하지만 단기 과열 피로가 보인다.",
    thumb: "◎",
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: "$2.67",
    change24h: 3.33,
    marketCap: "$145B",
    thesis: "규제 불확실성 완화 기대가 다시 가격에 반영된다.",
    thumb: "✕",
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB",
    price: "$642",
    change24h: 0.62,
    marketCap: "$91B",
    thesis: "거래소 생태계 수요가 견조하고 공급 감소가 이어진다.",
    thumb: "⬢",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: "$0.21",
    change24h: -2.17,
    marketCap: "$31B",
    thesis: "소셜 열기는 강하지만 변동성 리스크가 다시 커졌다.",
    thumb: "Ð",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: "$0.81",
    change24h: 1.06,
    marketCap: "$28B",
    thesis: "개발 로드맵 기대감이 느리게 반영되는 구간이다.",
    thumb: "A",
  },
  {
    id: "toncoin",
    symbol: "TON",
    name: "Toncoin",
    price: "$6.84",
    change24h: 4.11,
    marketCap: "$23B",
    thesis: "메신저 기반 유입 기대가 다시 모멘텀을 만든다.",
    thumb: "T",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: "$19.37",
    change24h: -0.48,
    marketCap: "$11B",
    thesis: "실사용 서사는 좋지만 단기 순환매에서는 밀릴 수 있다.",
    thumb: "∞",
  },
  {
    id: "sui",
    symbol: "SUI",
    name: "Sui",
    price: "$1.73",
    change24h: 5.28,
    marketCap: "$5B",
    thesis: "신규 생태계 기대와 투기 수요가 동시에 붙는 구간이다.",
    thumb: "S",
  },
];
