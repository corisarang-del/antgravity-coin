import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabaseServerClient";
import { getGuestUserId } from "@/infrastructure/auth/guestSession";
import { FileBattleSnapshotRepository } from "@/infrastructure/db/fileBattleSnapshotRepository";
import { FileEventLog } from "@/infrastructure/db/fileEventLog";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { FileSeedRepository } from "@/infrastructure/db/fileSeedRepository";
import {
  persistAuthenticatedBattleOutcome,
} from "@/infrastructure/db/supabaseBattlePersistence";

function sanitizeRecentCoins(input: unknown) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((coinId): coinId is string => typeof coinId === "string")
    .map((coinId) => coinId.trim().toLowerCase())
    .filter((coinId) => /^[a-z0-9-]{1,32}$/.test(coinId))
    .slice(0, 20);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    recentCoins?: unknown;
  };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const recentCoins = sanitizeRecentCoins(body.recentCoins);
  if (recentCoins.length > 0) {
    await supabase.from("user_recent_coins").upsert(
      recentCoins.map((coinId) => ({
        user_id: user.id,
        coin_id: coinId,
        viewed_at: new Date().toISOString(),
      })),
    );
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
      const battleOutcomeSeed = await seedRepository.getBattleOutcomeSeed(battleId);
      const playerDecisionSeed = await seedRepository.getPlayerDecisionSeed(battleId);
      const characterMemorySeeds = await seedRepository.getCharacterMemorySeeds(battleId);
      const report = await reportRepository.getByBattleId(battleId);

      if (battleOutcomeSeed && playerDecisionSeed && report) {
        const snapshot = await snapshotRepository.getSnapshotByBattleIdForUser(
          battleId,
          guestUserId,
        );

        if (snapshot) {
          await supabase.from("battle_snapshots").upsert({
            snapshot_id: snapshot.snapshotId,
            owner_user_id: user.id,
            battle_id: snapshot.battleId,
            coin_id: snapshot.coinId,
            market_data_json: snapshot.marketData,
            summary_json: snapshot.summary,
            messages_json: snapshot.messages,
            saved_at: snapshot.savedAt,
            expires_at: new Date(
              Date.parse(snapshot.savedAt) + 1000 * 60 * 60 * 24 * 30,
            ).toISOString(),
            import_source: "guest-merge",
            updated_at: new Date().toISOString(),
          });
        }

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
