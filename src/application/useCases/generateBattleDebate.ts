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

const characterVoiceGuide: Record<
  string,
  {
    bull: { summary: string; detail: string };
    bear: { summary: string; detail: string };
  }
> = {
  aira: {
    bull: {
      summary: "차트 구조가 아직 위쪽으로 열려 있어.",
      detail: "Aira답게 RSI와 추세, 거래량 흐름만 보면 지금은 기술적 방어가 먼저 보여. 뉴스보다 차트가 더 말해주고 있어.",
    },
    bear: {
      summary: "차트가 버티는 척하지만 힘은 약해지고 있어.",
      detail: "Aira 기준으로 보면 추세와 모멘텀이 같이 식고 있어. 지금은 반등 기대보다 지지 이탈 가능성을 먼저 경계해야 해.",
    },
  },
  judy: {
    bull: {
      summary: "가격보다 먼저 움직일 재료가 아직 남아 있어.",
      detail: "Judy는 뉴스와 일정, 정책 변화를 먼저 봐. 지금은 시장이 아직 다 반영하지 않은 재료가 있어서 강세 논리를 만들 수 있어.",
    },
    bear: {
      summary: "재료가 있어 보여도 가격을 끌 만큼 강하진 않아.",
      detail: "Judy 기준으로는 헤드라인 온도보다 실제 영향력이 약해 보여. 뉴스는 많지만 지속 매수로 이어질 확신은 부족해.",
    },
  },
  clover: {
    bull: {
      summary: "심리가 아직 완전히 식지 않았어.",
      detail: "Clover는 공포탐욕과 커뮤니티 온도를 먼저 읽어. 지금은 군중 심리가 아직 risk-on 쪽에 가까워서 쉽게 꺾이지 않는 흐름이야.",
    },
    bear: {
      summary: "심리가 과열 쪽으로 기울어서 되돌림 위험이 커.",
      detail: "Clover 시선으로 보면 기대가 너무 앞서 있어. 이런 구간은 작은 충격에도 분위기가 빠르게 뒤집힐 수 있어.",
    },
  },
  blaze: {
    bull: {
      summary: "속도가 붙은 흐름은 한 번 더 뻗을 수 있어.",
      detail: "Blaze는 돌파와 속도감을 본다. 거래량이 붙은 모멘텀이 살아 있으면 짧게라도 한 번 더 위로 치고 갈 여지가 있어.",
    },
    bear: {
      summary: "속도는 좋지만 과열 구간이라 식는 순간이 빠를 수 있어.",
      detail: "Blaze 관점에서도 모멘텀은 인정하지만, 이런 장은 꺾일 때도 급해. 추격보다 과열 해소를 먼저 봐야 해.",
    },
  },
  ledger: {
    bull: {
      summary: "수급 구조가 아직 무너지진 않았어.",
      detail: "Ledger는 온체인과 거래소 입출금 흐름을 본다. 지금은 체력 자체가 완전히 꺾였다고 보기 어려워서 버티는 힘이 남아 있어.",
    },
    bear: {
      summary: "수급이 약해지면 가격보다 먼저 티가 나.",
      detail: "Ledger 기준으로는 거래 강도와 자금 흐름이 둔해지는 쪽이 더 거슬려. 겉 가격보다 내부 체력이 먼저 흔들리고 있어.",
    },
  },
  shade: {
    bull: {
      summary: "리스크는 있지만 아직 통제 가능한 구간이야.",
      detail: "Shade는 늘 최악의 경우부터 본다. 지금은 경고등이 켜져 있어도 바로 무너질 만큼은 아니라서 방어적으로 버틸 여지는 있어.",
    },
    bear: {
      summary: "지금은 수익보다 손실 관리가 먼저야.",
      detail: "Shade 시선에서는 롱숏 비율과 미결제약정, 펀딩이 경고를 보내고 있어. 한 번 꼬이면 손실이 커질 수 있는 자리야.",
    },
  },
  vela: {
    bull: {
      summary: "큰 손 움직임이 완전히 빠져나간 건 아니야.",
      detail: "Vela는 큰 자금과 고래 신호를 추적해. 지금은 아직 방향을 접었다기보다 관망 또는 재진입 여지를 남긴 흐름으로 보여.",
    },
    bear: {
      summary: "고래가 확신 없이 움직이면 개인만 남을 수 있어.",
      detail: "Vela 관점에서는 큰 자금이 분명하게 붙지 않을 때가 가장 위험해. 개인 심리만으로 밀어 올리기엔 힘이 약해 보여.",
    },
  },
  flip: {
    bull: {
      summary: "다들 과열을 말할 때가 오히려 빈틈일 수 있어.",
      detail: "Flip은 역발상으로 본다. 시장이 너무 한쪽으로 기울어 경계할수록 반대로 더 버티거나 한 번 더 튈 자리도 생겨.",
    },
    bear: {
      summary: "지금은 다들 강세를 믿는 만큼 반대로 꺾일 맛이 나는 구간이야.",
      detail: "Flip 기준으로는 기대가 한쪽에 쏠렸어. 이런 때는 작은 실망도 크게 작용해서 오히려 하방 반전이 더 세게 나올 수 있어.",
    },
  },
};

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
        previousMessages.map((message) => message.summary).join(" | ") ||
        evidenceSource.emptyText ||
        "없음"
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
      ? `직전 발언 "${previousMessages.at(-1)?.summary}"까지는 봤지만, 내 역할에 필요한 근거가 비어 있었어.`
      : "첫 발언을 준비했지만, 내 역할에 꼭 필요한 근거가 부족했어.";

  return {
    id: `${character.id}-${Date.now()}-${previousMessages.length}`,
    characterId: character.id,
    characterName: character.name,
    team: character.team,
    stance: character.team === "bull" ? "bullish" : "bearish",
    summary: `${character.name}: 지금은 내 역할에 맞는 근거가 부족해서 섣불리 결론 내리기 어려워.`,
    detail: `${tensionPoint} 다음 턴에서는 ${character.role}답게 더 분명한 근거로 말할게.`,
    indicatorLabel: "근거 상태",
    indicatorValue: "데이터 부족",
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
      ? `직전 발언 "${previousMessages.at(-1)?.summary}"도 참고했어.`
      : "첫 발언이라 내 역할 기준만 먼저 정리할게.";

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
        : "24h 변동률";

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
    ? `${character.name}: ${characterVoiceGuide[character.id]?.bull.summary ?? fallbackTemplates[character.id]?.bull.summary ?? `${marketData.symbol} 기준으로 아직 강세 논리가 남아 있어.`}`
    : `${character.name}: ${characterVoiceGuide[character.id]?.bear.summary ?? fallbackTemplates[character.id]?.bear.summary ?? `${marketData.symbol} 기준으로 아직 하락 리스크가 더 커 보여.`}`;

  const detail = isBull
    ? `${tensionPoint} ${characterVoiceGuide[character.id]?.bull.detail ?? fallbackTemplates[character.id]?.bull.detail ?? `${character.role} 관점에서는 아직 강세 쪽 근거가 더 분명해.`}`
    : `${tensionPoint} ${characterVoiceGuide[character.id]?.bear.detail ?? fallbackTemplates[character.id]?.bear.detail ?? `${character.role} 관점에서는 지금 하락 가능성을 더 경계해야 해.`}`;

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
  reusableDebateContext: {
    recentBattleLessons: string[];
    characterLessonsById: Record<string, string[]>;
  } = {
    recentBattleLessons: [],
    characterLessonsById: {},
  },
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
        role: character.role,
        team: character.team,
        specialty: character.specialty,
        personality: character.personality,
        selectionReason: character.selectionReason,
        coinSymbol: marketData.symbol,
        focusSummary: marketSummary,
        evidence: roleEvidence.items,
        recentBattleLessons: reusableDebateContext.recentBattleLessons,
        characterLessons: reusableDebateContext.characterLessonsById[character.id] ?? [],
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
      }
    }
  } catch {
    console.warn(`[battle-llm:error] character=${character.id} reason=character_message_failed`);
  }

  return buildFallbackMessage(marketData, character, previousMessages);
}
