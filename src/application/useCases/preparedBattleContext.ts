import { characters } from "@/shared/constants/characters";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import type { ReusableDebateContext } from "@/application/useCases/getReusableDebateContext";
import { getBattleMarketSnapshot } from "@/application/useCases/getBattleMarketSnapshot";
import { generateCharacterMessage } from "@/application/useCases/generateBattleDebate";
import { getReusableDebateContext } from "@/application/useCases/getReusableDebateContext";
import { FilePreparedBattleContextRepository } from "@/infrastructure/db/filePreparedBattleContextRepository";
import { FileReportRepository } from "@/infrastructure/db/fileReportRepository";
import { cachePolicy } from "@/shared/constants/cachePolicy";

interface BattleSummary {
  headline: string;
  bias: string;
  indicators: Array<{
    label: string;
    value: string;
  }>;
}

export interface PreparedBattleContext {
  coinId: string;
  marketData: MarketData;
  summary: BattleSummary;
  reusableDebateContext: ReusableDebateContext;
  preparedEvidence: Record<string, string[]>;
  firstTurnDrafts: Record<string, DebateMessage>;
  preparedAt: string;
}

export interface PreparedBattleContextLookupResult {
  context: PreparedBattleContext;
  preparedContextHit: boolean;
  preparedFirstTurnHit: boolean;
  preparedAtAgeMs: number | null;
}

export interface PreparedBattleContextPrewarmResult extends PreparedBattleContextLookupResult {
  refreshQueued: boolean;
}

function isFresh(preparedAt: string, ttlMs: number) {
  return Date.now() - Date.parse(preparedAt) <= ttlMs;
}

function getOpeningRoundCharacters() {
  const firstBullCharacter = characters.find((character) => character.team === "bull") ?? null;
  const firstBearCharacter = characters.find((character) => character.team === "bear") ?? null;

  return [firstBullCharacter, firstBearCharacter].filter(
    (character): character is (typeof characters)[number] => Boolean(character),
  );
}

function getPreparedAtAgeMs(preparedAt: string) {
  return Math.max(0, Date.now() - Date.parse(preparedAt));
}

function hasPreparedFirstTurn(context: PreparedBattleContext) {
  return getOpeningRoundCharacters().some((character) => Boolean(context.firstTurnDrafts[character.id]));
}

function buildPreparedEvidenceFromDraft(
  draft: DebateMessage,
  fallback: string[],
) {
  const evidenceFromDraft = draft.detail
    .split("[원소스:")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => `[원소스:${item}`);

  return evidenceFromDraft.length > 0 ? evidenceFromDraft : fallback;
}

const inFlightBuilds = new Map<string, Promise<PreparedBattleContext>>();

async function buildAndSavePreparedBattleContext(
  repository: FilePreparedBattleContextRepository,
  coinId: string,
) {
  const existing = inFlightBuilds.get(coinId);
  if (existing) {
    return existing;
  }

  const task = (async () => {
    const fresh = await buildPreparedBattleContext(coinId);
    await repository.save(fresh);
    return fresh;
  })();

  inFlightBuilds.set(coinId, task);

  try {
    return await task;
  } finally {
    if (inFlightBuilds.get(coinId) === task) {
      inFlightBuilds.delete(coinId);
    }
  }
}

async function buildPreparedBattleContext(coinId: string) {
  const [{ marketData, summary }, reusableDebateContext] = await Promise.all([
    getBattleMarketSnapshot(coinId),
    getReusableDebateContext(new FileReportRepository(), coinId),
  ]);

  const preparedEvidence: Record<string, string[]> = {};
  const firstTurnDrafts: Record<string, DebateMessage> = {};

  const openingRoundDrafts = await Promise.all(
    getOpeningRoundCharacters().map(async (firstCharacter) => ({
      characterId: firstCharacter.id,
      draft: await generateCharacterMessage(
        marketData,
        firstCharacter,
        [],
        reusableDebateContext,
      ),
    })),
  );

  for (const openingRoundDraft of openingRoundDrafts) {
    firstTurnDrafts[openingRoundDraft.characterId] = openingRoundDraft.draft;
    preparedEvidence[openingRoundDraft.characterId] = buildPreparedEvidenceFromDraft(
      openingRoundDraft.draft,
      [],
    );
  }

  return {
    coinId,
    marketData,
    summary,
    reusableDebateContext,
    preparedEvidence,
    firstTurnDrafts,
    preparedAt: new Date().toISOString(),
  } satisfies PreparedBattleContext;
}

export async function getPreparedBattleContext(coinId: string): Promise<PreparedBattleContextLookupResult> {
  const repository = new FilePreparedBattleContextRepository();
  const cached = await repository.getByCoinId(coinId);

  if (cached && isFresh(cached.preparedAt, cachePolicy.battlePrep.softTtlMs)) {
    return {
      context: cached,
      preparedContextHit: true,
      preparedFirstTurnHit: hasPreparedFirstTurn(cached),
      preparedAtAgeMs: getPreparedAtAgeMs(cached.preparedAt),
    };
  }

  try {
    const fresh = await buildAndSavePreparedBattleContext(repository, coinId);

    return {
      context: fresh,
      preparedContextHit: false,
      preparedFirstTurnHit: false,
      preparedAtAgeMs: 0,
    };
  } catch (error) {
    if (cached && isFresh(cached.preparedAt, cachePolicy.battlePrep.hardTtlMs)) {
      return {
        context: cached,
        preparedContextHit: true,
        preparedFirstTurnHit: hasPreparedFirstTurn(cached),
        preparedAtAgeMs: getPreparedAtAgeMs(cached.preparedAt),
      };
    }

    throw error;
  }
}

export async function prewarmPreparedBattleContext(
  coinId: string,
): Promise<PreparedBattleContextPrewarmResult> {
  const repository = new FilePreparedBattleContextRepository();
  const cached = await repository.getByCoinId(coinId);

  if (cached && isFresh(cached.preparedAt, cachePolicy.battlePrep.softTtlMs)) {
    return {
      context: cached,
      preparedContextHit: true,
      preparedFirstTurnHit: hasPreparedFirstTurn(cached),
      preparedAtAgeMs: getPreparedAtAgeMs(cached.preparedAt),
      refreshQueued: false,
    };
  }

  if (cached && isFresh(cached.preparedAt, cachePolicy.battlePrep.hardTtlMs)) {
    void buildAndSavePreparedBattleContext(repository, coinId).catch((error) => {
      console.warn(
        `[battle-prewarm:refresh_failed] coin=${coinId} reason=${error instanceof Error ? error.message : "unknown_error"}`,
      );
    });

    return {
      context: cached,
      preparedContextHit: true,
      preparedFirstTurnHit: hasPreparedFirstTurn(cached),
      preparedAtAgeMs: getPreparedAtAgeMs(cached.preparedAt),
      refreshQueued: true,
    };
  }

  const fresh = await buildAndSavePreparedBattleContext(repository, coinId);

  return {
    context: fresh,
    preparedContextHit: false,
    preparedFirstTurnHit: false,
    preparedAtAgeMs: 0,
    refreshQueued: false,
  };
}
