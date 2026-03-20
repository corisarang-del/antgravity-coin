import { NextResponse } from "next/server";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import type { UserBattle } from "@/domain/models/UserBattle";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { getGuestUserId } from "@/infrastructure/auth/guestSession";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";
import {
  persistAuthenticatedBattleOutcome,
  persistAuthenticatedBattleSession,
  persistAuthenticatedBattleSnapshot,
} from "@/infrastructure/db/supabaseBattlePersistence";

interface MergeBattleSnapshotPayload {
  snapshotId?: string | null;
  coinId: string;
  marketData: MarketData | null;
  summary: {
    headline: string;
    bias: string;
    indicators: Array<{
      label: string;
      value: string;
    }>;
  } | null;
  messages: DebateMessage[];
  savedAt?: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    localUserLevel?: {
      level: number;
      title: string;
      xp: number;
      wins: number;
      losses: number;
    } | null;
    recentCoins?: string[] | null;
    userBattle?: UserBattle | null;
    battleSnapshot?: MergeBattleSnapshotPayload | null;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (body.localUserLevel) {
    await supabase.from("user_progress").upsert({
      user_id: user.id,
      level: body.localUserLevel.level,
      title: body.localUserLevel.title,
      xp: body.localUserLevel.xp,
      wins: body.localUserLevel.wins,
      losses: body.localUserLevel.losses,
      updated_at: new Date().toISOString(),
    });
  }

  if (body.recentCoins && body.recentCoins.length > 0) {
    await supabase.from("user_recent_coins").upsert(
      body.recentCoins.map((coinId) => ({
        user_id: user.id,
        coin_id: coinId,
        viewed_at: new Date().toISOString(),
      })),
    );
  }

  if (body.userBattle) {
    await persistAuthenticatedBattleSession(supabase, user, body.userBattle);
  }

  if (body.battleSnapshot?.snapshotId) {
    await persistAuthenticatedBattleSnapshot(supabase, user, {
      snapshotId: body.battleSnapshot.snapshotId,
      userId: user.id,
      battleId: body.userBattle?.battleId ?? null,
      coinId: body.battleSnapshot.coinId,
      marketData: body.battleSnapshot.marketData,
      summary: body.battleSnapshot.summary,
      messages: body.battleSnapshot.messages,
      savedAt: body.battleSnapshot.savedAt ?? new Date().toISOString(),
    });
  }

  const guestUserId = await getGuestUserId();
  const importedBattleIds = new Set<string>();

  if (guestUserId) {
    const eventLog = new FileEventLog();
    const seedRepository = new FileSeedRepository();
    const reportRepository = new FileReportRepository();
    const snapshotRepository = new FileBattleSnapshotRepository();

    const events = await eventLog.list();
    const battleIds = [...new Set(events.filter((event) => event.userId === guestUserId).map((event) => event.battleId))];

    for (const battleId of battleIds) {
      const snapshot = await snapshotRepository.getSnapshotByBattleId(battleId);
      if (snapshot) {
        await persistAuthenticatedBattleSnapshot(supabase, user, {
          ...snapshot,
          userId: user.id,
        });
      }

      const battleOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
      const playerDecisionSeed = await seedRepository.getPlayerDecisionSeed(battleId);
      const characterMemorySeeds = await seedRepository.getCharacterMemorySeeds(battleId);
      const report = await reportRepository.getByBattleId(battleId);

      if (battleOutcomeSeed && playerDecisionSeed && report) {
        await persistAuthenticatedBattleOutcome(supabase, user, {
          userBattle: {
            battleId,
            coinId: battleOutcomeSeed.coinId,
            coinSymbol: battleOutcomeSeed.coinSymbol,
            selectedTeam: battleOutcomeSeed.userSelectedTeam,
            timeframe: battleOutcomeSeed.timeframe,
            selectedPrice: playerDecisionSeed.selectedPrice,
            selectedAt: playerDecisionSeed.createdAt,
            snapshotId: playerDecisionSeed.snapshotId,
            settlementAt: playerDecisionSeed.settlementAt,
            priceSource: playerDecisionSeed.priceSource,
            marketSymbol: playerDecisionSeed.marketSymbol,
            settledPrice: playerDecisionSeed.settledPrice,
          },
          battleOutcomeSeed,
          playerDecisionSeed,
          characterMemorySeeds,
          report,
        });
        importedBattleIds.add(battleId);
      }
    }
  }

  return NextResponse.json({
    ok: true,
    importedBattleIds: [...importedBattleIds],
  });
}
