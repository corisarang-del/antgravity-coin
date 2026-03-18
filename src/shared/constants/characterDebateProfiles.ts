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
  summaryTargets: ["배틀 피드 카드", "현재 스포트라이트", "승리 팀 핵심 발언 후보", "CharacterMemorySeed"],
  detailTargets: ["배틀 피드 카드", "현재 스포트라이트", "CharacterMemorySeed"],
  indicatorTargets: ["배틀 피드 우측 상단 지표", "승리 팀 핵심 발언 뱃지", "CharacterMemorySeed"],
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
      roleInstruction: "기술분석가처럼 RSI, MACD, 볼린저, 추세와 거래량 패턴을 우선해서 본다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "RSI", field: "rsi", source: "CoinGecko 30일 가격 히스토리 기반 계산", formatter: "fixed1" },
      { kind: "market", label: "MACD", field: "macd", source: "CoinGecko 30일 가격 히스토리 기반 계산", formatter: "fixed2" },
      { kind: "market", label: "볼린저 상단", field: "bollingerUpper", source: "CoinGecko 30일 가격 히스토리 기반 계산", formatter: "fixed0" },
      { kind: "market", label: "24h 변화율", field: "priceChange24h", source: "CoinGecko", formatter: "percent" },
    ],
    fallback: {
      bull: {
        summary: "차트 구조가 아직 완전히 무너지지 않았어.",
        detail: "추세선과 RSI 흐름을 같이 보면 단기 흔들림은 있어도 기술적 방어가 남아 있어.",
      },
      bear: {
        summary: "기술 지표가 방어 실패 쪽으로 기울고 있어.",
        detail: "추세와 모멘텀이 같이 약해지면 반등보다 추가 조정을 먼저 봐야 해.",
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
      roleInstruction: "뉴스 스카우터처럼 뉴스, 공시, 일정, 정책 변화가 가격을 밀 수 있는지 본다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "뉴스 감성", field: "sentimentScore", source: "뉴스 감성 파이프라인(Alpha Vantage -> GDELT -> NewsAPI)", formatter: "fixed2" },
      { kind: "market", label: "24h 변화율", field: "priceChange24h", source: "CoinGecko", formatter: "percent" },
      { kind: "market", label: "7d 변화율", field: "priceChange7d", source: "CoinGecko 7일 변화율", formatter: "percent" },
    ],
    fallback: {
      bull: {
        summary: "재료 흐름이 가격을 다시 밀어줄 여지가 있어.",
        detail: "헤드라인의 온도와 일정 변수를 같이 보면 아직 긍정 재료가 남아 있어.",
      },
      bear: {
        summary: "재료보다 피로감이 더 빨리 쌓이고 있어.",
        detail: "뉴스가 많아도 후속 동력이 약하면 가격은 기대를 못 따라갈 수 있어.",
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
      roleInstruction: "심리 센티먼트 분석가처럼 공포탐욕과 군중 심리, 커뮤니티 온도를 읽는다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "공포탐욕", field: "fearGreedIndex", source: "Alternative.me", formatter: "fixed0" },
      { kind: "market", label: "공포탐욕 라벨", field: "fearGreedLabel", source: "Alternative.me", formatter: "raw" },
      { kind: "market", label: "뉴스 감성", field: "sentimentScore", source: "뉴스 감성 파이프라인(Alpha Vantage -> GDELT -> NewsAPI)", formatter: "fixed2" },
    ],
    fallback: {
      bull: {
        summary: "군중 심리가 아직 완전히 식지 않았어.",
        detail: "공포탐욕과 커뮤니티 온도를 같이 보면 매수 심리가 버티는 구간이야.",
      },
      bear: {
        summary: "심리 과열이 되돌림 압력으로 이어질 수 있어.",
        detail: "군중 열기가 높아질수록 작은 악재에도 되감기가 크게 나올 수 있어.",
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
      roleInstruction: "모멘텀 트레이더처럼 속도, 변동률, 거래량, 돌파 지속 가능성을 본다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "24h 변화율", field: "priceChange24h", source: "CoinGecko", formatter: "percent" },
      { kind: "market", label: "7d 변화율", field: "priceChange7d", source: "CoinGecko 7일 변화율", formatter: "percent" },
      { kind: "market", label: "거래량", field: "volume24h", source: "CoinGecko", formatter: "fixed0" },
    ],
    fallback: {
      bull: {
        summary: "속도가 붙는 구간이라 추세 추종이 유효해 보여.",
        detail: "변동률과 거래량이 같이 받쳐주면 짧은 모멘텀은 한 번 더 이어질 수 있어.",
      },
      bear: {
        summary: "속도는 붙었지만 과열 피로도 같이 올라왔어.",
        detail: "모멘텀 구간일수록 꺾이는 순간 낙폭이 빠를 수 있어서 방어가 먼저야.",
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
      roleInstruction: "온체인 분석가처럼 현재 v1에서는 거래량과 가격 변화로 체력과 기대의 균형을 본다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "거래량", field: "volume24h", source: "CoinGecko", formatter: "fixed0" },
      { kind: "market", label: "24h 변화율", field: "priceChange24h", source: "CoinGecko", formatter: "percent" },
      { kind: "market", label: "7d 변화율", field: "priceChange7d", source: "CoinGecko 7일 변화율", formatter: "percent" },
    ],
    fallback: {
      bull: {
        summary: "온체인 수치만 보면 자금 이탈이 확정적이지는 않아.",
        detail: "거래량과 시가총액 구조를 같이 보면 아직 급격한 붕괴 신호는 약해.",
      },
      bear: {
        summary: "온체인 구조는 아직 조심 쪽이 맞아.",
        detail: "시총 대비 움직임이 과하면 체력보다 기대가 앞선 상태일 수 있어.",
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
      roleInstruction: "리스크 매니저처럼 롱숏 비율, 미결제약정, 펀딩비를 보고 먼저 방어 관점에서 말한다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "롱숏비율", field: "longShortRatio", source: "Bybit 계정 비율", formatter: "ratio" },
      { kind: "market", label: "미결제약정", field: "openInterest", source: "Hyperliquid Asset Context", formatter: "usd_millions" },
      { kind: "market", label: "펀딩비", field: "fundingRate", source: "Hyperliquid Asset Context", formatter: "percent" },
      { kind: "market", label: "24h 변화율", field: "priceChange24h", source: "CoinGecko", formatter: "percent" },
    ],
    fallback: {
      bull: {
        summary: "리스크는 있지만 아직 통제 가능한 범위야.",
        detail: "롱숏 비율과 청산 강도가 버티면 바로 붕괴보다 변동성 관리 구간으로 봐야 해.",
      },
      bear: {
        summary: "리스크 지표가 먼저 경고를 보내고 있어.",
        detail: "과열 포지션이 쌓인 상태라면 작은 충격에도 청산이 연쇄적으로 나올 수 있어.",
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
      roleInstruction: "고래 추적자처럼 whaleScore, 거래 강도, 미결제약정 변화를 읽는다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "너의 역할에 맞는 해석만 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "고래점수", field: "whaleScore", source: "Hyperliquid 실데이터 기반 계산", formatter: "fixed0" },
      { kind: "market", label: "거래량", field: "volume24h", source: "CoinGecko", formatter: "fixed0" },
      { kind: "market", label: "미결제약정", field: "openInterest", source: "Hyperliquid Asset Context", formatter: "usd_millions" },
    ],
    fallback: {
      bull: {
        summary: "큰 손 흐름이 완전히 빠져나간 건 아니야.",
        detail: "고래성 매수 흔적이 남아 있으면 단기 눌림 이후 재유입을 볼 수 있어.",
      },
      bear: {
        summary: "큰 손이 방향을 틀면 낙폭이 더 커질 수 있어.",
        detail: "고래 흐름이 약해지면 개인 수급만으로 가격을 지키기 어려워질 수 있어.",
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
      roleInstruction: "역발상 전략가처럼 다른 캐릭터 논리의 허점을 찾아 반대편 가능성을 제기한다.",
      systemRules: [
        "절대 승패를 최종 판정하지 말고, 자기 역할에 맞는 주장만 해.",
        "summary와 detail은 반드시 자연스러운 한글 문장으로만 써. 영어 문장으로 답하지 마.",
      ],
      userInstruction: "다른 캐릭터 요약을 참고해서 역발상 포인트를 짧고 명확하게, 반드시 한글로만 말해.",
    },
    evidenceSources: [
      { kind: "market", label: "공포탐욕", field: "fearGreedIndex", source: "Alternative.me", formatter: "fixed0" },
      { kind: "market", label: "뉴스 감성", field: "sentimentScore", source: "뉴스 감성 파이프라인(Alpha Vantage -> GDELT -> NewsAPI)", formatter: "fixed2" },
      { kind: "previous_messages", label: "다른 캐릭터 요약", source: "이전 DebateMessage", emptyText: "없음" },
    ],
    fallback: {
      bull: {
        summary: "과열처럼 보여도 역으로 더 갈 자리도 남아 있어.",
        detail: "모두가 조정을 말할 때 실제로는 포지션이 덜 정리돼서 한 번 더 튈 수 있어.",
      },
      bear: {
        summary: "지금은 역발상보다 냉정한 되돌림 쪽이 가까워 보여.",
        detail: "낙관이 한쪽으로 쏠릴수록 반대 급변이 더 세게 나올 수 있어.",
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
