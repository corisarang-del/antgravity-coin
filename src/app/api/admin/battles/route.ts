import { NextResponse } from "next/server";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const battleId = url.searchParams.get("battleId");
  const limit = Number(url.searchParams.get("limit") ?? "20");

  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();

  if (battleId) {
    const battleOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
    const characterMemorySeeds = await seedRepository.getCharacterMemorySeeds(battleId);
    const playerDecisionSeed = await seedRepository.getPlayerDecisionSeed(battleId);
    const report = await reportRepository.getByBattleId(battleId);

    if (!battleOutcomeSeed) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      battleOutcomeSeed,
      characterMemorySeeds,
      playerDecisionSeed,
      report,
      reportSource: report?.reportSource ?? "fallback",
    });
  }

  const outcomes = await seedRepository.listBattleOutcomeSeeds(Number.isFinite(limit) ? limit : 20);
  const battles = await Promise.all(
    outcomes.map(async (outcome) => {
      const report = await reportRepository.getByBattleId(outcome.battleId);

      return {
        battleId: outcome.battleId,
        coinId: outcome.coinId,
        coinSymbol: outcome.coinSymbol,
        timeframe: outcome.timeframe,
        winningTeam: outcome.winningTeam,
        priceChangePercent: outcome.priceChangePercent,
        userWon: outcome.userWon,
        ruleVersion: outcome.ruleVersion,
        createdAt: outcome.createdAt,
        hasReport: report !== null,
        reportSource: report?.reportSource ?? "fallback",
      };
    }),
  );

  return NextResponse.json({
    ok: true,
    battles,
  });
}
