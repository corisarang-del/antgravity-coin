import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import type { UserBattle } from "@/domain/models/UserBattle";
import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import { resolveBattle } from "@/application/useCases/resolveBattle";

function pickWinningArgument(messages: DebateMessage[], winningTeam: "bull" | "bear" | "draw") {
  if (winningTeam === "draw") {
    return "무승부라서 특정 승리 논거를 고르지 않았다.";
  }

  return (
    messages.find((message) => message.team === winningTeam)?.summary ??
    "승리 팀 핵심 논거를 아직 추출하지 못했다."
  );
}

function pickLosingArgument(messages: DebateMessage[], winningTeam: "bull" | "bear" | "draw") {
  if (winningTeam === "draw") {
    return "무승부라서 특정 패배 논거를 고르지 않았다.";
  }

  const losingTeam = winningTeam === "bull" ? "bear" : "bull";
  return (
    messages.find((message) => message.team === losingTeam)?.summary ??
    "패배 팀 핵심 논거를 아직 추출하지 못했다."
  );
}

export function buildBattleOutcomeSeed(input: {
  userBattle: UserBattle;
  messages: DebateMessage[];
  marketData: MarketData;
}): BattleOutcomeSeed {
  const result = resolveBattle(input.userBattle, input.marketData);

  return {
    id: `outcome:${input.userBattle.battleId}`,
    battleId: input.userBattle.battleId,
    coinId: input.userBattle.coinId,
    coinSymbol: input.userBattle.coinSymbol,
    timeframe: input.userBattle.timeframe,
    winningTeam: result.winningTeam,
    priceChangePercent: result.priceChangePercent,
    userSelectedTeam: input.userBattle.selectedTeam,
    userWon: result.userWon,
    strongestWinningArgument: pickWinningArgument(input.messages, result.winningTeam),
    weakestLosingArgument: pickLosingArgument(input.messages, result.winningTeam),
    ruleVersion: result.ruleVersion,
    createdAt: new Date().toISOString(),
  };
}
