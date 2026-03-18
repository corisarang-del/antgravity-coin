import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { appendSeedEvents } from "@/application/useCases/appendSeedEvents";
import { buildBattleOutcomeSeed } from "@/application/useCases/buildBattleOutcomeSeed";
import { buildMemorySeeds } from "@/application/useCases/buildMemorySeeds";
import { buildReusableBattleMemo } from "@/application/useCases/buildReusableBattleMemo";
import { generateBattleReport } from "@/application/useCases/generateBattleReport";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import type { UserBattle } from "@/domain/models/UserBattle";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";
import { synthesizeBattleLessonsWithGemini } from "@/infrastructure/api/geminiSynthesisClient";

const SESSION_COOKIE_NAME = "ant_gravity_user_id";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userBattle?: UserBattle;
    marketData?: MarketData;
    messages?: DebateMessage[];
  };

  if (!body.userBattle || !body.marketData || !body.messages) {
    return NextResponse.json({ error: "missing_payload" }, { status: 400 });
  }

  let userId = "anonymous";
  try {
    const cookieStore = await cookies();
    userId = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? "anonymous";
  } catch {
    userId = "anonymous";
  }

  const battleOutcomeSeed = buildBattleOutcomeSeed({
    userBattle: body.userBattle,
    messages: body.messages,
    marketData: body.marketData,
  });

  const { characterMemorySeeds, playerDecisionSeed } = buildMemorySeeds({
    battleOutcomeSeed,
    messages: body.messages,
    userBattle: body.userBattle,
  });

  const report = await generateBattleReport({
    battleOutcomeSeed,
    characterMemorySeeds,
    playerDecisionSeed,
  });
  const synthesizedLessons = await synthesizeBattleLessonsWithGemini({
    battleOutcomeSeed,
    characterMemorySeeds,
    playerDecisionSeed,
    report: report.report,
  });

  const reusableMemo = buildReusableBattleMemo({
    battleOutcomeSeed,
    characterMemorySeeds,
    report,
    synthesizedLessons,
  });

  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();
  const eventLog = new FileEventLog();

  const existingOutcomeSeed = await seedRepository.getBattleOutcomeSeed(body.userBattle.battleId);
  const existingPlayerDecisionSeed = await seedRepository.getPlayerDecisionSeed(body.userBattle.battleId);
  const existingCharacterMemorySeeds = await seedRepository.getCharacterMemorySeeds(body.userBattle.battleId);
  const existingReport = await reportRepository.getByBattleId(body.userBattle.battleId);

  if (existingOutcomeSeed && existingPlayerDecisionSeed && existingReport) {
    return NextResponse.json({
      ok: true,
      battleOutcomeSeed: existingOutcomeSeed,
      characterMemorySeeds: existingCharacterMemorySeeds,
      playerDecisionSeed: existingPlayerDecisionSeed,
      report: existingReport,
      reportSource: existingReport.reportSource ?? "fallback",
      recovered: true,
    });
  }

  try {
    await seedRepository.saveBattleOutcomeSeed(battleOutcomeSeed);
    await seedRepository.saveCharacterMemorySeeds(characterMemorySeeds);
    await seedRepository.savePlayerDecisionSeed(playerDecisionSeed);
    await reportRepository.saveReport(report);
    await reportRepository.saveReusableMemo(reusableMemo);

    await eventLog.append({
      id: `event:battle_start:${battleOutcomeSeed.battleId}`,
      battleId: battleOutcomeSeed.battleId,
      userId,
      type: "battle_start",
      createdAt: new Date().toISOString(),
      payload: {
        coinId: battleOutcomeSeed.coinId,
        timeframe: battleOutcomeSeed.timeframe,
      },
    });

    await eventLog.append({
      id: `event:debate_complete:${battleOutcomeSeed.battleId}`,
      battleId: battleOutcomeSeed.battleId,
      userId,
      type: "debate_complete",
      createdAt: new Date().toISOString(),
      payload: {
        messageCount: body.messages.length,
        messages: body.messages.map((message) => ({
          characterId: message.characterId,
          provider: message.provider,
          model: message.model,
          fallbackUsed: message.fallbackUsed,
        })),
      },
    });

    await appendSeedEvents({
      eventLog,
      battleId: battleOutcomeSeed.battleId,
      userId,
      characterMemorySeeds,
      playerDecisionSeed,
    });

    await eventLog.append({
      id: `event:result_applied:${battleOutcomeSeed.battleId}`,
      battleId: battleOutcomeSeed.battleId,
      userId,
      type: "result_applied",
      createdAt: new Date().toISOString(),
      payload: {
        winningTeam: battleOutcomeSeed.winningTeam,
        userWon: battleOutcomeSeed.userWon,
        ruleVersion: battleOutcomeSeed.ruleVersion,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "outcome_persist_failed", retryable: true },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    battleOutcomeSeed,
    characterMemorySeeds,
    playerDecisionSeed,
    report,
    reportSource: report.reportSource ?? "fallback",
  });
}

export async function GET(request: Request) {
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();

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
