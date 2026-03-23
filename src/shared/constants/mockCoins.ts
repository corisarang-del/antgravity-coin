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
    thesis: "ETF 자금 유입과 안전자산 서사가 동시에 강해지는 흐름이야.",
    thumb: "B",
  },
  {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
    price: "$4,140",
    change24h: 1.72,
    marketCap: "$498B",
    thesis: "레이어 확장과 스테이킹 수요 회복 기대가 다시 붙는 구간이야.",
    thumb: "E",
  },
  {
    id: "solana",
    symbol: "SOL",
    name: "Solana",
    price: "$214",
    change24h: -1.41,
    marketCap: "$104B",
    thesis: "온체인 활력은 강하지만 단기 과열 피로가 같이 보이는 흐름이야.",
    thumb: "S",
  },
  {
    id: "xrp",
    symbol: "XRP",
    name: "XRP",
    price: "$2.67",
    change24h: 3.33,
    marketCap: "$145B",
    thesis: "규제 불확실성 완화 기대가 다시 가격에 반영되는 구간이야.",
    thumb: "X",
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB",
    price: "$642",
    change24h: 0.62,
    marketCap: "$91B",
    thesis: "거래소 생태계 수요와 공급 감소 효과가 꾸준히 이어지는 편이야.",
    thumb: "N",
  },
  {
    id: "dogecoin",
    symbol: "DOGE",
    name: "Dogecoin",
    price: "$0.21",
    change24h: -2.17,
    marketCap: "$31B",
    thesis: "밈 수급은 강하지만 변동성 리스크도 다시 커질 수 있어.",
    thumb: "D",
  },
  {
    id: "cardano",
    symbol: "ADA",
    name: "Cardano",
    price: "$0.81",
    change24h: 1.06,
    marketCap: "$28B",
    thesis: "개발 로드맵 기대감이 천천히 가격에 반영되는 구간이야.",
    thumb: "A",
  },
  {
    id: "avalanche-2",
    symbol: "AVAX",
    name: "Avalanche",
    price: "$41.28",
    change24h: 2.47,
    marketCap: "$16B",
    thesis: "서브넷과 기관 협업 기대가 다시 붙으면 반등 탄력이 커질 수 있는 구간이야.",
    thumb: "A",
  },
  {
    id: "chainlink",
    symbol: "LINK",
    name: "Chainlink",
    price: "$19.37",
    change24h: -0.48,
    marketCap: "$11B",
    thesis: "오라클 수요는 견조하지만 단기 순환매에서는 쉬어갈 수 있어.",
    thumb: "L",
  },
  {
    id: "sui",
    symbol: "SUI",
    name: "Sui",
    price: "$1.73",
    change24h: 5.28,
    marketCap: "$5B",
    thesis: "신규 생태계 기대와 단기 수급이 동시에 붙는 구간이야.",
    thumb: "S",
  },
];
