import type { BattleOutcomeSeed } from "@/domain/models/BattleOutcomeSeed";
import type { BattleSnapshotRecord } from "@/domain/models/BattleSnapshotRecord";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";
import type { UserBattle } from "@/domain/models/UserBattle";
import type { BattleReport } from "@/domain/models/BattleReport";
import type { SupabaseClient, User } from "@supabase/supabase-js";

export async function persistAuthenticatedBattleSnapshot(
  supabase: SupabaseClient,
  user: User,
  snapshot: BattleSnapshotRecord,
) {
  await supabase.from("battle_snapshots").upsert({
    snapshot_id: snapshot.snapshotId,
    owner_user_id: user.id,
    battle_id: snapshot.battleId,
    coin_id: snapshot.coinId,
    market_data_json: snapshot.marketData,
    summary_json: snapshot.summary,
    messages_json: snapshot.messages,
    saved_at: snapshot.savedAt,
    expires_at: new Date(Date.parse(snapshot.savedAt) + 1000 * 60 * 60 * 24 * 30).toISOString(),
    import_source: "live",
    updated_at: new Date().toISOString(),
  });
}

export async function persistAuthenticatedBattleSession(
  supabase: SupabaseClient,
  user: User,
  userBattle: UserBattle,
) {
  if (!userBattle.snapshotId) {
    return;
  }

  await supabase.from("battle_sessions").upsert({
    battle_id: userBattle.battleId,
    owner_user_id: user.id,
    snapshot_id: userBattle.snapshotId,
    coin_id: userBattle.coinId,
    coin_symbol: userBattle.coinSymbol,
    selected_team: userBattle.selectedTeam,
    timeframe: userBattle.timeframe,
    selected_price: userBattle.selectedPrice,
    selected_at: userBattle.selectedAt,
    settlement_at: userBattle.settlementAt,
    price_source: userBattle.priceSource,
    market_symbol: userBattle.marketSymbol,
    settled_price: userBattle.settledPrice,
    status: userBattle.settledPrice == null ? "pending" : "settled",
    updated_at: new Date().toISOString(),
  });
}

export async function persistAuthenticatedBattleOutcome(
  supabase: SupabaseClient,
  user: User,
  input: {
    userBattle: UserBattle;
    battleOutcomeSeed: BattleOutcomeSeed;
    playerDecisionSeed: PlayerDecisionSeed;
    characterMemorySeeds: CharacterMemorySeed[];
    report?: BattleReport | null;
  },
) {
  await persistAuthenticatedBattleSession(supabase, user, {
    ...input.userBattle,
    settledPrice: input.battleOutcomeSeed.settledPrice,
  });

  await supabase.from("battle_outcomes").upsert({
    battle_id: input.battleOutcomeSeed.battleId,
    owner_user_id: user.id,
    winning_team: input.battleOutcomeSeed.winningTeam,
    price_change_percent: input.battleOutcomeSeed.priceChangePercent,
    user_won: input.battleOutcomeSeed.userWon,
    strongest_winning_argument: input.battleOutcomeSeed.strongestWinningArgument,
    weakest_losing_argument: input.battleOutcomeSeed.weakestLosingArgument,
    report_json: input.report ?? {},
    rule_version: input.battleOutcomeSeed.ruleVersion,
    created_at: input.battleOutcomeSeed.createdAt,
  });

  await supabase.from("player_decision_seeds").upsert({
    battle_id: input.playerDecisionSeed.battleId,
    owner_user_id: user.id,
    snapshot_id: input.playerDecisionSeed.snapshotId,
    selected_team: input.playerDecisionSeed.selectedTeam,
    timeframe: input.playerDecisionSeed.timeframe,
    selected_price: input.playerDecisionSeed.selectedPrice,
    settlement_at: input.playerDecisionSeed.settlementAt,
    price_source: input.playerDecisionSeed.priceSource,
    market_symbol: input.playerDecisionSeed.marketSymbol,
    settled_price: input.playerDecisionSeed.settledPrice,
    user_won: input.playerDecisionSeed.userWon,
    created_at: input.playerDecisionSeed.createdAt,
  });

  if (input.characterMemorySeeds.length > 0) {
    await supabase.from("character_memory_seeds").upsert(
      input.characterMemorySeeds.map((seed) => ({
        id: seed.id,
        battle_id: seed.battleId,
        owner_user_id: user.id,
        character_id: seed.characterId,
        team: seed.team,
        summary: seed.summary,
        indicator_label: seed.indicatorLabel,
        indicator_value: `${seed.indicatorValue}`,
        provider: seed.provider,
        model: seed.model,
        fallback_used: seed.fallbackUsed,
        was_correct: seed.wasCorrect,
        created_at: seed.createdAt,
      })),
    );
  }
}
