export interface BattleListItem {
  battleId: string;
  coinId: string;
  coinSymbol: string;
  timeframe: "24h" | "7d";
  winningTeam: "bull" | "bear" | "draw";
  priceChangePercent: number;
  userWon: boolean;
  ruleVersion: "v1";
  createdAt: string;
  hasReport: boolean;
  reportSource: "gemini" | "fallback";
}

export interface AdminBattleDetail {
  battleOutcomeSeed: {
    battleId: string;
    coinId: string;
    coinSymbol: string;
    timeframe: "24h" | "7d";
    winningTeam: "bull" | "bear" | "draw";
    priceChangePercent: number;
    userSelectedTeam: "bull" | "bear";
    userWon: boolean;
    strongestWinningArgument: string;
    weakestLosingArgument: string;
    ruleVersion: "v1";
    createdAt: string;
  };
  characterMemorySeeds: Array<{
    id: string;
    characterName: string;
    team: "bull" | "bear";
    indicatorLabel: string;
    indicatorValue: string;
    summary: string;
    provider: string;
    model: string;
    fallbackUsed: boolean;
    wasCorrect: boolean;
  }>;
  playerDecisionSeed: {
    selectedTeam: "bull" | "bear";
    selectedPrice: number;
  } | null;
  report: {
    report: string;
  } | null;
  reportSource: "gemini" | "fallback";
  reusableMemo: {
    reportSummary: string;
    globalLessons: string[];
    characterLessons: Array<{
      characterId: string;
      characterName: string;
      lesson: string;
      wasCorrect: boolean;
    }>;
  } | null;
}

export interface AdminBattleEventLogEntry {
  id: string;
  type: string;
  createdAt: string;
  payload?: Record<string, unknown>;
}
