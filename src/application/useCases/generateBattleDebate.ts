import { characters } from "@/shared/constants/characters";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import { generateCharacterDebateChunk } from "@/infrastructure/api/llmRouter";
import {
  characterDebateProfiles,
  type DebateEvidenceSource,
  getCharacterDebateProfile,
} from "@/shared/constants/characterDebateProfiles";

const fallbackTemplates: Record<
  string,
  { bull: { summary: string; detail: string }; bear: { summary: string; detail: string } }
> = Object.fromEntries(
  Object.values(characterDebateProfiles).map((profile) => [profile.characterId, profile.fallback]),
);

function extractJsonBlock(rawText: string) {
  const fencedMatch =
    rawText.match(/```json\s*([\s\S]*?)```/i) ?? rawText.match(/```\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1] : rawText;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return null;
  }

  return candidate.slice(start, end + 1);
}

function hasHangul(text: string) {
  return /[가-힣]/.test(text);
}

function isKoreanDebateContent(summary: string, detail: string) {
  return hasHangul(summary) && hasHangul(detail);
}

function formatMarketEvidenceValue(
  marketData: MarketData,
  evidenceSource: Extract<DebateEvidenceSource, { kind: "market" }>,
) {
  const value = marketData[evidenceSource.field];

  if (value == null) {
    return "없음";
  }

  if (typeof value === "string") {
    return value;
  }

  switch (evidenceSource.formatter) {
    case "fixed0":
      return value.toFixed(0);
    case "fixed1":
      return value.toFixed(1);
    case "fixed2":
      return value.toFixed(2);
    case "percent":
      return `${value.toFixed(2)}%`;
    case "ratio":
      return value.toFixed(2);
    case "usd_millions":
      return `$${Math.round(value / 1_000_000)}M`;
    default:
      return `${value}`;
  }
}

function buildRoleEvidence(
  marketData: MarketData,
  characterId: string,
  previousMessages: DebateMessage[],
) {
  const profile = getCharacterDebateProfile(characterId);
  if (!profile) {
    return {
      items: [] as string[],
      hasMissingRequiredEvidence: false,
    };
  }

  let hasMissingRequiredEvidence = false;

  const items = profile.evidenceSources.map((evidenceSource) => {
    if (evidenceSource.kind === "previous_messages") {
      return `${evidenceSource.label} ${
        previousMessages.map((message) => message.summary).join(" | ") || evidenceSource.emptyText || "없음"
      }`;
    }

    const rawValue = marketData[evidenceSource.field];
    if (rawValue == null) {
      hasMissingRequiredEvidence = true;
    }

    return `${evidenceSource.label} ${formatMarketEvidenceValue(marketData, evidenceSource)}`;
  });

  return {
    items,
    hasMissingRequiredEvidence,
  };
}

function buildUnavailableEvidenceMessage(
  character: (typeof characters)[number],
  previousMessages: DebateMessage[],
): DebateMessage {
  const tensionPoint =
    previousMessages.length > 0
      ? `직전 논거인 "${previousMessages.at(-1)?.summary}"에 반응하지 못했어.`
      : "첫 발언을 준비했지만 근거 데이터가 부족했어.";

  return {
    id: `${character.id}-${Date.now()}-${previousMessages.length}`,
    characterId: character.id,
    characterName: character.name,
    team: character.team,
    stance: character.team === "bull" ? "bullish" : "bearish",
    summary: `${character.name}: 지금 의견을 제시하지 못해서 죄송합니다.`,
    detail: `${tensionPoint} 다음번에 하겠습니다.`,
    indicatorLabel: "근거 상태",
    indicatorValue: "실데이터 부족",
    provider: "fallback",
    model: "live-evidence-unavailable",
    fallbackUsed: true,
    createdAt: new Date().toISOString(),
  };
}

function buildFallbackMessage(
  marketData: MarketData,
  character: (typeof characters)[number],
  previousMessages: DebateMessage[],
): DebateMessage {
  const isBull = character.team === "bull";
  const tensionPoint =
    previousMessages.length > 0
      ? `직전 논거인 "${previousMessages.at(-1)?.summary}"에 반응한다.`
      : "첫 발언으로 흐름을 연다.";

  const indicatorLabel = isBull
    ? marketData.rsi >= 50
      ? "RSI"
      : marketData.fearGreedIndex !== null
        ? "공포탐욕"
        : "RSI"
    : marketData.longShortRatio !== null && marketData.longShortRatio >= 1
      ? "롱숏 비율"
      : marketData.fundingRate !== null
        ? "펀딩비"
        : "24h 변화율";

  const indicatorValue =
    indicatorLabel === "RSI"
      ? marketData.rsi.toFixed(1)
      : indicatorLabel === "공포탐욕"
        ? `${marketData.fearGreedIndex ?? "없음"}`
        : indicatorLabel === "롱숏 비율"
          ? marketData.longShortRatio?.toFixed(2) ?? "없음"
          : indicatorLabel === "펀딩비"
            ? `${marketData.fundingRate?.toFixed(4) ?? "없음"}%`
            : `${marketData.priceChange24h.toFixed(2)}%`;

  const summary = isBull
    ? `${character.name}: ${fallbackTemplates[character.id]?.bull.summary ?? `${marketData.symbol}는 ${character.specialty} 관점에서 아직 상승 논리가 살아 있다.`}`
    : `${character.name}: ${fallbackTemplates[character.id]?.bear.summary ?? `${marketData.symbol}는 ${character.specialty} 기준으로 아직 하락 리스크가 남아 있다.`}`;

  const detail = isBull
    ? `${tensionPoint} ${fallbackTemplates[character.id]?.bull.detail ?? `RSI와 거래량이 방어되고 있고, ${character.specialty} 해석상 추세가 완전히 꺾이지 않았다.`}`
    : `${tensionPoint} ${fallbackTemplates[character.id]?.bear.detail ?? `과열 구간과 청산 리스크가 같이 보이고, ${character.specialty} 기준으로 단기 조정 가능성이 높다.`}`;

  return {
    id: `${character.id}-${Date.now()}-${previousMessages.length}`,
    characterId: character.id,
    characterName: character.name,
    team: character.team,
    stance: isBull ? "bullish" : "bearish",
    summary,
    detail,
    indicatorLabel,
    indicatorValue,
    provider: "fallback",
    model: "character-fallback",
    fallbackUsed: true,
    createdAt: new Date().toISOString(),
  };
}

export async function generateBattleDebate(marketData: MarketData) {
  const messages: DebateMessage[] = [];

  for (const character of characters) {
    const message = await generateCharacterMessage(marketData, character, messages);
    messages.push(message);
  }

  return messages;
}

export async function generateCharacterMessage(
  marketData: MarketData,
  character: (typeof characters)[number],
  previousMessages: DebateMessage[],
) {
  const marketSummary = `${marketData.symbol} 24h ${marketData.priceChange24h}% / 7d ${marketData.priceChange7d}% / RSI ${marketData.rsi}`;
  const roleEvidence = buildRoleEvidence(marketData, character.id, previousMessages);

  if (roleEvidence.hasMissingRequiredEvidence) {
    return buildUnavailableEvidenceMessage(character, previousMessages);
  }

  try {
    const aiResult = await generateCharacterDebateChunk({
      coinId: marketData.coinId,
      characterId: character.id,
      llmInput: {
        characterId: character.id,
        characterName: character.name,
        team: character.team,
        specialty: character.specialty,
        coinSymbol: marketData.symbol,
        focusSummary: marketSummary,
        evidence: roleEvidence.items,
        previousMessages,
      },
    });

    if (aiResult?.content) {
      try {
        const normalizedJson = extractJsonBlock(aiResult.content);
        if (!normalizedJson) {
          throw new Error("json_block_not_found");
        }

        const parsed = JSON.parse(normalizedJson) as {
        summary: string;
        detail: string;
        indicatorLabel: string;
        indicatorValue: string;
        stance: "bullish" | "bearish";
      };

        if (!isKoreanDebateContent(parsed.summary, parsed.detail)) {
          console.warn(
            `[battle-llm:error] character=${character.id} provider=${aiResult.provider} model=${aiResult.model} reason=non_korean_response fallbackUsed=${aiResult.fallbackUsed}`,
          );
          return buildFallbackMessage(marketData, character, previousMessages);
        }

        return {
          id: `${character.id}-${Date.now()}-${previousMessages.length}`,
          characterId: character.id,
          characterName: character.name,
          team: character.team,
          stance: parsed.stance,
          summary: parsed.summary,
          detail: parsed.detail,
          indicatorLabel: parsed.indicatorLabel,
          indicatorValue: parsed.indicatorValue,
          provider: aiResult.provider,
          model: aiResult.model,
          fallbackUsed: aiResult.fallbackUsed,
          createdAt: new Date().toISOString(),
        } satisfies DebateMessage;
      } catch {
        console.warn(
          `[battle-llm:error] character=${character.id} provider=${aiResult.provider} model=${aiResult.model} reason=message_parse_failed fallbackUsed=${aiResult.fallbackUsed}`,
        );
        // fallback below
      }
    }
  } catch {
    console.warn(`[battle-llm:error] character=${character.id} reason=character_message_failed`);
  }

  return buildFallbackMessage(marketData, character, previousMessages);
}
