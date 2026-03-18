import { NextResponse } from "next/server";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";

interface RouteContext {
  params: Promise<{
    battleId: string;
  }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const { battleId } = await context.params;

  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();
  const eventLog = new FileEventLog();

  const battleOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
  if (!battleOutcomeSeed) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const [characterMemorySeeds, playerDecisionSeed, report, events] = await Promise.all([
    seedRepository.getCharacterMemorySeeds(battleId),
    seedRepository.getPlayerDecisionSeed(battleId),
    reportRepository.getByBattleId(battleId),
    eventLog.listByBattleId(battleId),
  ]);

  return NextResponse.json({
    ok: true,
    battleOutcomeSeed,
    characterMemorySeeds,
    playerDecisionSeed,
    report,
    reportSource: report?.reportSource ?? "fallback",
    events,
  });
}
