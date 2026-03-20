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

function isFresh(preparedAt: string, ttlMs: number) {
  return Date.now() - Date.parse(preparedAt) <= ttlMs;
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

async function buildPreparedBattleContext(coinId: string) {
  const [{ marketData, summary }, reusableDebateContext] = await Promise.all([
    getBattleMarketSnapshot(coinId),
    getReusableDebateContext(new FileReportRepository(), coinId),
  ]);

  const preparedEvidence: Record<string, string[]> = {};
  const firstTurnDrafts: Record<string, DebateMessage> = {};

  for (const character of characters) {
    const draft = await generateCharacterMessage(
      marketData,
      character,
      [],
      reusableDebateContext,
    );
    firstTurnDrafts[character.id] = draft;
    preparedEvidence[character.id] = buildPreparedEvidenceFromDraft(draft, []);
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
  const firstCharacterId = characters[0]?.id ?? null;

  if (cached && isFresh(cached.preparedAt, cachePolicy.battlePrep.softTtlMs)) {
    return {
      context: cached,
      preparedContextHit: true,
      preparedFirstTurnHit: firstCharacterId ? Boolean(cached.firstTurnDrafts[firstCharacterId]) : false,
      preparedAtAgeMs: Math.max(0, Date.now() - Date.parse(cached.preparedAt)),
    };
  }

  try {
    const fresh = await buildPreparedBattleContext(coinId);
    await repository.save(fresh);

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
        preparedFirstTurnHit: firstCharacterId ? Boolean(cached.firstTurnDrafts[firstCharacterId]) : false,
        preparedAtAgeMs: Math.max(0, Date.now() - Date.parse(cached.preparedAt)),
      };
    }

    throw error;
  }
}

export async function prewarmPreparedBattleContext(coinId: string) {
  const repository = new FilePreparedBattleContextRepository();
  const context = await buildPreparedBattleContext(coinId);
  await repository.save(context);
  return context;
}
