import type { LlmProviderName } from "@/application/ports/LlmProvider";
import type { MarketData } from "@/domain/models/MarketData";

export type DebateEvidenceFormatter =
  | "raw"
  | "fixed0"
  | "fixed1"
  | "fixed2"
  | "percent"
  | "ratio"
  | "usd_millions";

export type DebateEvidenceSource =
  | {
      kind: "market";
      label: string;
      field: keyof MarketData;
      source: string;
      formatter?: DebateEvidenceFormatter;
    }
  | {
      kind: "previous_messages";
      label: string;
      source: string;
      emptyText?: string;
    };

export interface CharacterDebateProfile {
  characterId: string;
  modelRoute: {
    tier: "cheap" | "balanced" | "premium";
    provider: LlmProviderName;
    model: string;
    fallbackProvider: LlmProviderName;
    fallbackModel: string;
    timeoutMs: number;
    cacheTtlSeconds: number;
  };
  prompt: {
    roleInstruction: string;
    systemRules: string[];
    userInstruction: string;
  };
  evidenceSources: DebateEvidenceSource[];
  fallback: {
    bull: {
      summary: string;
      detail: string;
    };
    bear: {
      summary: string;
      detail: string;
    };
  };
  display: {
    summaryTargets: string[];
    detailTargets: string[];
    indicatorTargets: string[];
  };
}

const defaultDisplayTargets = {
  summaryTargets: ["배틀 피드 카드", "현재 스포트라이트", "승리 팀 대표 발언 후보", "CharacterMemorySeed"],
  detailTargets: ["배틀 피드 카드", "현재 스포트라이트", "CharacterMemorySeed"],
  indicatorTargets: ["배틀 피드 우측 상단 지표", "승리 팀 대표 발언 칩", "CharacterMemorySeed"],
};

export const characterDebateProfiles: Record<string, CharacterDebateProfile> = {
  aira: {
    characterId: "aira",
    modelRoute: {
      tier: "balanced",
      provider: "openrouter",
      model: "stepfun/step-3.5-flash:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 9000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "기술분석가처럼 RSI, MACD, 볼린저밴드, 추세와 거래량 패턴을 읽는다.",
      systemRules: [
        "최종 승패를 판정하지 말고, 기술분석가 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "차트 근거를 가장 앞세우고, 역할에 맞는 해석만 짧고 명확하게 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "RSI",
        field: "rsi",
        source: "CoinGecko 30일 가격 히스토리 기반 계산",
        formatter: "fixed1",
      },
      {
        kind: "market",
        label: "MACD",
        field: "macd",
        source: "CoinGecko 30일 가격 히스토리 기반 계산",
        formatter: "fixed2",
      },
      {
        kind: "market",
        label: "볼린저 상단",
        field: "bollingerUpper",
        source: "CoinGecko 30일 가격 히스토리 기반 계산",
        formatter: "fixed0",
      },
      {
        kind: "market",
        label: "24h 변동률",
        field: "priceChange24h",
        source: "CoinGecko",
        formatter: "percent",
      },
    ],
    fallback: {
      bull: {
        summary: "차트 구조가 아직 위쪽으로 열려 있어.",
        detail: "추세와 RSI 흐름을 같이 보면 기술적 방어가 남아 있어서 아직은 위쪽 논리가 살아 있어.",
      },
      bear: {
        summary: "차트가 버티는 척하지만 힘은 약해지고 있어.",
        detail: "추세와 모멘텀이 같이 식고 있어서 반등 기대보다 추가 조정을 먼저 경계해야 해.",
      },
    },
    display: defaultDisplayTargets,
  },
  judy: {
    characterId: "judy",
    modelRoute: {
      tier: "cheap",
      provider: "openrouter",
      model: "minimax/minimax-m2.5:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "뉴스 스카우터처럼 실제 헤드라인과 이벤트성 재료가 가격을 어떻게 밀 수 있는지 읽는다.",
      systemRules: [
        "차트 해설가처럼 RSI/MACD만 반복하지 마.",
        "반드시 실제 뉴스 헤드라인과 이벤트 문장을 근거의 중심에 둬.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "뉴스 헤드라인 2~3개와 이벤트 요약을 먼저 읽고, 재료가 가격에 어떤 방향성을 줄지 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "대표 뉴스 헤드라인",
        field: "newsHeadlines",
        source: "Alpha Vantage / GDELT / NewsAPI",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "이벤트 요약",
        field: "newsEventSummary",
        source: "Alpha Vantage / GDELT / NewsAPI 헤드라인 요약",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "뉴스 감성 점수",
        field: "sentimentScore",
        source: "뉴스 감성 파이프라인",
        formatter: "fixed2",
      },
    ],
    fallback: {
      bull: {
        summary: "재료 흐름이 아직 완전히 식지 않았어.",
        detail: "헤드라인 결은 여전히 가격을 한 번 더 밀 수 있는 뉴스 재료가 남아 있다고 읽혀.",
      },
      bear: {
        summary: "뉴스는 많아도 가격을 끝까지 끌어올릴 만큼 강하진 않아.",
        detail: "이벤트는 보이지만 시장이 받아주는 힘이 약해서 재료가 기대만큼 오래 못 갈 수 있어.",
      },
    },
    display: defaultDisplayTargets,
  },
  clover: {
    characterId: "clover",
    modelRoute: {
      tier: "balanced",
      provider: "openrouter",
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 9000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "심리 센티먼트 분석가처럼 공포탐욕과 군중 심리가 어느 쪽으로 쏠리는지 읽는다.",
      systemRules: [
        "차트 해설보다 심리 요약 문장을 중심으로 말해.",
        "공포탐욕, 뉴스 감성, 군중 심리의 결을 한 문장으로 묶어 설명해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "커뮤니티와 심리 분위기가 공포 쪽인지, 기대 쪽인지 읽고 그 감정의 방향을 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "심리 요약",
        field: "communitySentimentSummary",
        source: "Alternative.me + 뉴스 감성 종합",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "공포탐욕 라벨",
        field: "fearGreedLabel",
        source: "Alternative.me",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "뉴스 감성 점수",
        field: "sentimentScore",
        source: "뉴스 감성 파이프라인",
        formatter: "fixed2",
      },
    ],
    fallback: {
      bull: {
        summary: "군중 심리가 아직 완전히 꺾인 상태는 아니야.",
        detail: "공포가 강해도 기대가 미세하게 살아 있으면 반등 쪽 심리가 버티는 구간이 생겨.",
      },
      bear: {
        summary: "심리 과열보다 불안이 더 빨리 퍼질 수 있어.",
        detail: "군중이 겁먹기 시작하면 작은 충격도 크게 흔들리는 쪽으로 번질 수 있어.",
      },
    },
    display: defaultDisplayTargets,
  },
  blaze: {
    characterId: "blaze",
    modelRoute: {
      tier: "cheap",
      provider: "openrouter",
      model: "openrouter/hunter-alpha",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "모멘텀 트레이더처럼 속도, 돌파, 거래량 확대, 추세 가속 가능성을 본다.",
      systemRules: [
        "분석가처럼 길게 설명하기보다 트레이더처럼 방향을 찍어.",
        "차트와 거래량 속도감이 핵심이야.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "모멘텀이 붙는지, 식는지 빠르게 판단해서 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "24h 변동률",
        field: "priceChange24h",
        source: "CoinGecko",
        formatter: "percent",
      },
      {
        kind: "market",
        label: "7d 변동률",
        field: "priceChange7d",
        source: "CoinGecko 7일 변동률",
        formatter: "percent",
      },
      {
        kind: "market",
        label: "거래량",
        field: "volume24h",
        source: "CoinGecko",
        formatter: "fixed0",
      },
    ],
    fallback: {
      bull: {
        summary: "속도가 붙는 구간이라 추세 추종이 아직 유효해 보여.",
        detail: "변동과 거래량이 같이 받쳐주면 짧게라도 한 번 더 위로 치는 흐름이 나올 수 있어.",
      },
      bear: {
        summary: "속도는 좋지만 과열 구간이라 식을 위험도 같이 커졌어.",
        detail: "모멘텀 구간일수록 꺾이는 순간이 빠르니까 추격보다 되돌림을 먼저 봐야 해.",
      },
    },
    display: defaultDisplayTargets,
  },
  ledger: {
    characterId: "ledger",
    modelRoute: {
      tier: "balanced",
      provider: "openrouter",
      model: "nvidia/nemotron-3-super-120b-a12b:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 9000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "온체인/거래 구조 분석가처럼 현재 확인 가능한 거래 구조와 자금 체력을 해석한다.",
      systemRules: [
        "온체인 직접 추적이 아니라면 거래 구조 관점이라고 분명히 말해.",
        "거래량, 가격 구조, 미결제약정이 가격 체력을 어떻게 받치는지 설명해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "지금 확보된 거래 구조 근거로 체력이 남아 있는지, 속이 비었는지 판단해서 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "거래 구조 요약",
        field: "marketStructureSummary",
        source: "CoinGecko + Hyperliquid 종합",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "거래량",
        field: "volume24h",
        source: "CoinGecko",
        formatter: "fixed0",
      },
      {
        kind: "market",
        label: "미결제약정",
        field: "openInterest",
        source: "Hyperliquid Asset Context",
        formatter: "usd_millions",
      },
    ],
    fallback: {
      bull: {
        summary: "거래 구조만 보면 자금 체력이 아직 완전히 무너진 건 아니야.",
        detail: "거래 강도와 가격 구조를 같이 보면 버티는 힘이 남아 있어서 쉽게 꺾일 자리는 아니야.",
      },
      bear: {
        summary: "거래 구조가 아직은 조심 쪽으로 기울어 있어.",
        detail: "가격이 버티는 척해도 체력이 받쳐주지 않으면 아래로 밀릴 위험이 커져.",
      },
    },
    display: defaultDisplayTargets,
  },
  shade: {
    characterId: "shade",
    modelRoute: {
      tier: "cheap",
      provider: "openrouter",
      model: "openrouter/hunter-alpha",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "리스크 매니저처럼 롱숏 비율, 미결제약정, 펀딩비를 보고 방어 관점에서 말한다.",
      systemRules: [
        "수익보다 손실 관리와 청산 위험을 먼저 말해.",
        "상승 논리를 따라가지 말고 리스크 점검을 최우선으로 둬.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "과열, 청산, 방어 기준을 먼저 설명하고 마지막에 방향을 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "롱숏비율",
        field: "longShortRatio",
        source: "Bybit 계정 비율",
        formatter: "ratio",
      },
      {
        kind: "market",
        label: "미결제약정",
        field: "openInterest",
        source: "Hyperliquid Asset Context",
        formatter: "usd_millions",
      },
      {
        kind: "market",
        label: "펀딩비",
        field: "fundingRate",
        source: "Hyperliquid Asset Context",
        formatter: "percent",
      },
      {
        kind: "market",
        label: "24h 변동률",
        field: "priceChange24h",
        source: "CoinGecko",
        formatter: "percent",
      },
    ],
    fallback: {
      bull: {
        summary: "리스크는 있지만 아직 통제 가능한 범위야.",
        detail: "롱숏 비율과 청산 강도가 버티면 바로 붕괴보다 변동성 관리 구간으로 봐야 해.",
      },
      bear: {
        summary: "리스크 지표가 먼저 경고를 보내고 있어.",
        detail: "과열 포지션이 쌓인 상태라면 작은 충격도 청산 쪽으로 번질 수 있어.",
      },
    },
    display: defaultDisplayTargets,
  },
  vela: {
    characterId: "vela",
    modelRoute: {
      tier: "cheap",
      provider: "openrouter",
      model: "minimax/minimax-m2.5:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 8000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "고래 추적자처럼 고래 점수와 파생 흐름에서 숨은 자금 방향을 읽는다.",
      systemRules: [
        "고래/파생 흐름 요약 문장을 중심으로 말해.",
        "단순 RSI 해설로 흐르지 말고, 자금이 어느 쪽으로 쏠리는지 말해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "보이는 가격보다 수면 아래 자금 흐름이 어느 쪽인지 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "고래/파생 흐름 요약",
        field: "whaleFlowSummary",
        source: "Bybit + Hyperliquid 종합",
        formatter: "raw",
      },
      {
        kind: "market",
        label: "고래 점수",
        field: "whaleScore",
        source: "Hyperliquid 데이터 기반 계산",
        formatter: "fixed0",
      },
      {
        kind: "market",
        label: "미결제약정",
        field: "openInterest",
        source: "Hyperliquid Asset Context",
        formatter: "usd_millions",
      },
    ],
    fallback: {
      bull: {
        summary: "숨은 자금 흐름이 아직 완전히 꺾였다고 보긴 어려워.",
        detail: "고래성 자금이 빠르게 빠져나간 흔적보다 관망과 재진입 사이를 보는 구간이야.",
      },
      bear: {
        summary: "자금 방향이 흔들리면 개인만 남는 장이 될 수 있어.",
        detail: "고래 흐름이 선명하지 않으면 개인 매수만으로 가격을 오래 밀기 어려워 보여.",
      },
    },
    display: defaultDisplayTargets,
  },
  flip: {
    characterId: "flip",
    modelRoute: {
      tier: "balanced",
      provider: "openrouter",
      model: "stepfun/step-3.5-flash:free",
      fallbackProvider: "openrouter",
      fallbackModel: "qwen/qwen3.5-9b",
      timeoutMs: 9000,
      cacheTtlSeconds: 60,
    },
    prompt: {
      roleInstruction: "역발상 전략가처럼 다른 캐릭터들의 논리 빈틈을 찾아 반대 가능성을 제기한다.",
      systemRules: [
        "반드시 이전 발언 중 하나를 짚고 비틀어.",
        "남들과 같은 결론이면 안 된다.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "이전 발언 요약을 참고해서 역발상 포인트를 짚고 명확하게 말해.",
    },
    evidenceSources: [
      {
        kind: "market",
        label: "공포탐욕",
        field: "fearGreedIndex",
        source: "Alternative.me",
        formatter: "fixed0",
      },
      {
        kind: "market",
        label: "뉴스 감성",
        field: "sentimentScore",
        source: "뉴스 감성 파이프라인",
        formatter: "fixed2",
      },
      {
        kind: "previous_messages",
        label: "이전 캐릭터 요약",
        source: "이전 DebateMessage",
        emptyText: "없음",
      },
    ],
    fallback: {
      bull: {
        summary: "과열처럼 보여도 반대로 한 번 더 위로 칠 자리도 남아 있어.",
        detail: "모두가 조정을 말할 때 실제로는 숏 포지션이 먼저 정리되면서 위로 튈 수도 있어.",
      },
      bear: {
        summary: "지금은 역발상보다 정석적으로 흔들릴 쪽이 더 가까워 보여.",
        detail: "합의가 너무 빠르게 굳으면 작은 균열 하나로도 아래 변동성이 커질 수 있어.",
      },
    },
    display: defaultDisplayTargets,
  },
};

export function getCharacterDebateProfile(characterId: string) {
  return characterDebateProfiles[characterId];
}

export function listCharacterDebateProfiles() {
  return Object.values(characterDebateProfiles);
}
