import { NextResponse } from "next/server";
import { appendSeedEvents } from "@/application/useCases/appendSeedEvents";
import { buildBattleOutcomeSeed } from "@/application/useCases/buildBattleOutcomeSeed";
import { buildMemorySeeds } from "@/application/useCases/buildMemorySeeds";
import { buildReusableBattleMemo } from "@/application/useCases/buildReusableBattleMemo";
import { fetchBattleSettlement } from "@/application/useCases/fetchBattleSettlement";
import { generateBattleReport } from "@/application/useCases/generateBattleReport";
import {
  sanitizeBattleOutcomeSeed,
  sanitizeBattleReport,
  sanitizeCharacterMemorySeeds,
  sanitizeReusableBattleMemo,
} from "@/application/useCases/sanitizeBattlePersistenceArtifacts";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { UserBattle } from "@/domain/models/UserBattle";
import { synthesizeBattleLessonsWithGemini } from "@/infrastructure/api/geminiSynthesisClient";
import { FileBattleResultApplicationRepository } from "@/infrastructure/db/fileBattleResultApplicationRepository";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";
import { persistAuthenticatedBattleOutcome } from "@/infrastructure/db/supabaseBattlePersistence";
import { runSerializedByKey } from "@/shared/utils/keyedSerialExecutor";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import {
  consumeSharedRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userBattle?: UserBattle;
    messages?: DebateMessage[];
    mode?: "settlement" | "full";
  };
  const mode = body.mode === "settlement" ? "settlement" : "full";

  if (!body.userBattle) {
    return NextResponse.json({ error: "missing_payload" }, { status: 400 });
  }

  const userBattle = body.userBattle;

  const { ownerId: userId, user, supabase } = await getRequestOwnerId();
  const rateLimit = await consumeSharedRequestRateLimit({
    supabase,
    bucket: "battle-outcome-post",
    key: getRequestRateLimitKey(request, "battle-outcome-post", userId),
    max: 10,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", retryable: true },
      {
        status: 429,
        headers: {
          "Retry-After": `${rateLimit.retryAfterSeconds}`,
        },
      },
    );
  }

  const battleId = userBattle.battleId;

  return runSerializedByKey(`battle-outcome:${battleId}`, async () => {
    const seedRepository = new FileSeedRepository();
    const reportRepository = new FileReportRepository();
    const snapshotRepository = new FileBattleSnapshotRepository();
    const eventLog = new FileEventLog();
    const applicationRepository = new FileBattleResultApplicationRepository();

    const existingOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
    const existingPlayerDecisionSeed = await seedRepository.getPlayerDecisionSeed(battleId);
    const existingCharacterMemorySeeds = await seedRepository.getCharacterMemorySeeds(battleId);
    const existingReport = await reportRepository.getByBattleId(battleId);

    if (existingOutcomeSeed && existingPlayerDecisionSeed && existingReport) {
      await applicationRepository.markApplied({
        battleId,
        userId,
        appliedAt: new Date().toISOString(),
      });

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

    if (existingOutcomeSeed && existingPlayerDecisionSeed && mode === "settlement") {
      await applicationRepository.markApplied({
        battleId,
        userId,
        appliedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        battleOutcomeSeed: existingOutcomeSeed,
        characterMemorySeeds: existingCharacterMemorySeeds,
        playerDecisionSeed: existingPlayerDecisionSeed,
        report: existingReport,
        reportSource: existingReport?.reportSource ?? null,
        recovered: true,
        reportPending: !existingReport,
      });
    }

    if (existingOutcomeSeed && existingPlayerDecisionSeed && !existingReport) {
      const report = sanitizeBattleReport(
        await generateBattleReport({
          battleOutcomeSeed: existingOutcomeSeed,
          characterMemorySeeds: existingCharacterMemorySeeds,
          playerDecisionSeed: existingPlayerDecisionSeed,
        }),
        existingOutcomeSeed,
        existingCharacterMemorySeeds,
      );

      const synthesizedLessons = await synthesizeBattleLessonsWithGemini({
        battleOutcomeSeed: existingOutcomeSeed,
        characterMemorySeeds: existingCharacterMemorySeeds,
        playerDecisionSeed: existingPlayerDecisionSeed,
        report: report.report,
      });

      const reusableMemo = sanitizeReusableBattleMemo(
        buildReusableBattleMemo({
          battleOutcomeSeed: existingOutcomeSeed,
          characterMemorySeeds: existingCharacterMemorySeeds,
          report,
          synthesizedLessons,
        }),
      );

      try {
        await reportRepository.saveReport(report);
        await reportRepository.saveReusableMemo(reusableMemo);

        if (user) {
          await persistAuthenticatedBattleOutcome(supabase, user, {
            userBattle,
            battleOutcomeSeed: existingOutcomeSeed,
            playerDecisionSeed: existingPlayerDecisionSeed,
            characterMemorySeeds: existingCharacterMemorySeeds,
            report,
          });
        }
      } catch {
        return NextResponse.json(
          { error: "outcome_persist_failed", retryable: true },
          { status: 500 },
        );
      }

      await applicationRepository.markApplied({
        battleId,
        userId,
        appliedAt: new Date().toISOString(),
      });

      return NextResponse.json({
        ok: true,
        battleOutcomeSeed: existingOutcomeSeed,
        characterMemorySeeds: existingCharacterMemorySeeds,
        playerDecisionSeed: existingPlayerDecisionSeed,
        report,
        reportSource: report.reportSource ?? "fallback",
        recovered: true,
      });
    }

    const snapshot = userBattle.snapshotId
      ? await snapshotRepository.getSnapshotForUser(userBattle.snapshotId, userId)
      : null;

    if (userBattle.snapshotId && !snapshot) {
      return NextResponse.json({ error: "snapshot_not_found" }, { status: 404 });
    }

    if (snapshot?.battleId && snapshot.battleId !== battleId) {
      return NextResponse.json({ error: "snapshot_battle_mismatch" }, { status: 409 });
    }

    const messages = body.messages ?? snapshot?.messages ?? [];

    if (messages.length === 0) {
      return NextResponse.json({ error: "missing_snapshot_messages" }, { status: 400 });
    }

    const settlementSnapshot = await fetchBattleSettlement(userBattle);

    if (settlementSnapshot.status === "pending") {
      return NextResponse.json(
        {
          error: "settlement_pending",
          settlementAt: settlementSnapshot.settlementAt,
          priceSource: settlementSnapshot.priceSource,
          marketSymbol: settlementSnapshot.marketSymbol,
        },
        { status: 409 },
      );
    }

    const battleOutcomeSeed = sanitizeBattleOutcomeSeed(
      buildBattleOutcomeSeed({
        userBattle,
        messages,
        settlementSnapshot,
      }),
    );

    const { characterMemorySeeds: rawCharacterMemorySeeds, playerDecisionSeed } = buildMemorySeeds({
      battleOutcomeSeed,
      messages,
      userBattle,
    });

    const characterMemorySeeds = sanitizeCharacterMemorySeeds(rawCharacterMemorySeeds);

    try {
      await seedRepository.saveBattleOutcomeSeed(battleOutcomeSeed);
      await seedRepository.saveCharacterMemorySeeds(characterMemorySeeds);
      await seedRepository.savePlayerDecisionSeed(playerDecisionSeed);

      await eventLog.append({
        id: `event:battle_start:${battleOutcomeSeed.battleId}`,
        battleId: battleOutcomeSeed.battleId,
        userId,
        type: "battle_start",
        createdAt: new Date().toISOString(),
        payload: {
          coinId: battleOutcomeSeed.coinId,
          timeframe: battleOutcomeSeed.timeframe,
          settlementAt: battleOutcomeSeed.settlementAt,
          marketSymbol: battleOutcomeSeed.marketSymbol,
          priceSource: battleOutcomeSeed.priceSource,
        },
      });

      await eventLog.append({
        id: `event:debate_complete:${battleOutcomeSeed.battleId}`,
        battleId: battleOutcomeSeed.battleId,
        userId,
        type: "debate_complete",
        createdAt: new Date().toISOString(),
        payload: {
          messageCount: messages.length,
          messages: messages.map((message) => ({
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
          settledPrice: battleOutcomeSeed.settledPrice,
        },
      });

      await applicationRepository.markApplied({
        battleId,
        userId,
        appliedAt: new Date().toISOString(),
      });

      if (user) {
        await persistAuthenticatedBattleOutcome(supabase, user, {
          userBattle,
          battleOutcomeSeed,
          playerDecisionSeed,
          characterMemorySeeds,
        });
      }
    } catch {
      return NextResponse.json(
        { error: "outcome_persist_failed", retryable: true },
        { status: 500 },
      );
    }

    if (mode === "settlement") {
      return NextResponse.json({
        ok: true,
        battleOutcomeSeed,
        characterMemorySeeds,
        playerDecisionSeed,
        report: null,
        reportSource: null,
        reportPending: true,
      });
    }

    const report = sanitizeBattleReport(
      await generateBattleReport({
        battleOutcomeSeed,
        characterMemorySeeds,
        playerDecisionSeed,
      }),
      battleOutcomeSeed,
      characterMemorySeeds,
    );

    const synthesizedLessons = await synthesizeBattleLessonsWithGemini({
      battleOutcomeSeed,
      characterMemorySeeds,
      playerDecisionSeed,
      report: report.report,
    });

    const reusableMemo = sanitizeReusableBattleMemo(
      buildReusableBattleMemo({
        battleOutcomeSeed,
        characterMemorySeeds,
        report,
        synthesizedLessons,
      }),
    );

    try {
      await reportRepository.saveReport(report);
      await reportRepository.saveReusableMemo(reusableMemo);

      if (user) {
        await persistAuthenticatedBattleOutcome(supabase, user, {
          userBattle,
          battleOutcomeSeed,
          playerDecisionSeed,
          characterMemorySeeds,
          report,
        });
      }
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
  });
}

export async function GET(request: Request) {
  const battleId = new URL(request.url).searchParams.get("battleId");

  if (!battleId) {
    return NextResponse.json({ error: "missing_battle_id" }, { status: 400 });
  }

  const { ownerId } = await getRequestOwnerId();
  const seedRepository = new FileSeedRepository();
  const reportRepository = new FileReportRepository();
  const snapshotRepository = new FileBattleSnapshotRepository();
  const snapshot = await snapshotRepository.getSnapshotByBattleIdForUser(battleId, ownerId);

  if (!snapshot) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

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
    reportSource: report?.reportSource ?? null,
    reportPending: !report,
  });
}
