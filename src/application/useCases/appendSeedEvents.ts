import type { EventLog } from "@/application/ports/EventLog";
import type { CharacterMemorySeed } from "@/domain/models/CharacterMemorySeed";
import type { PlayerDecisionSeed } from "@/domain/models/PlayerDecisionSeed";

export async function appendSeedEvents(input: {
  eventLog: EventLog;
  battleId: string;
  userId: string;
  characterMemorySeeds: CharacterMemorySeed[];
  playerDecisionSeed: PlayerDecisionSeed;
}) {
  for (const seed of input.characterMemorySeeds) {
    await input.eventLog.append({
      id: `event:${seed.id}`,
      battleId: input.battleId,
      userId: input.userId,
      type: "seed_saved",
      createdAt: new Date().toISOString(),
      payload: seed,
    });
  }

  await input.eventLog.append({
    id: `event:${input.playerDecisionSeed.id}`,
    battleId: input.battleId,
    userId: input.userId,
    type: "choice_saved",
    createdAt: new Date().toISOString(),
    payload: input.playerDecisionSeed,
  });
}
