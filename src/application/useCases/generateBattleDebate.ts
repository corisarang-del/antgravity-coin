import { characters } from "@/shared/constants/characters";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import type { MarketData } from "@/domain/models/MarketData";
import { generateCharacterDebateChunk } from "@/infrastructure/api/llmRouter";
import {
  characterDebateProfiles,
  type DebateEvidenceSource,
  getCharacterDebateProfile,
} from "@/shared/constants/characterDebateProfiles";
import { sanitizeDisplayText, sanitizeKoreanText } from "@/shared/utils/textIntegrity";

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
      detail: "Aira답게 RSI, MACD, 밴드 흐름만 보면 기술적 방어가 먼저 보여. 뉴스보다 차트가 더 강하게 말하고 있어.",
    },
    bear: {
      summary: "차트가 버티는 척하지만 힘은 약해지고 있어.",
      detail: "Aira 기준으로는 추세와 모멘텀이 함께 식고 있어서 반등 기대보다 추가 조정을 먼저 봐야 해.",
    },
  },
  judy: {
    bull: {
      summary: "Judy: 뉴스 재료 흐름이 아직 가격을 더 밀 수 있어.",
      detail: "Judy는 헤드라인과 이벤트를 먼저 읽어. 지금 들어온 재료 결이 살아 있어서 단기 기대가 아직 꺼지지 않았어.",
    },
    bear: {
      summary: "Judy: 뉴스는 많아도 가격을 끝까지 끌 힘은 약해 보여.",
      detail: "Judy 시선으로 보면 이벤트는 보여도 시장이 그 재료를 오래 붙잡는 분위기는 아니야.",
    },
  },
  clover: {
    bull: {
      summary: "Clover: 군중 심리가 아직 완전히 꺾이지 않았어.",
      detail: "공포가 강해도 기대가 미세하게 남아 있으면 심리 반등이 붙는 구간이 생겨. 지금은 그 가능성이 완전히 닫히진 않았어.",
    },
    bear: {
      summary: "Clover: 심리 불안이 다시 커지면 흔들림이 빨라질 수 있어.",
      detail: "Clover는 숫자보다 군중의 떨림을 봐. 지금 분위기는 작은 충격에도 공포 쪽으로 기울 수 있어.",
    },
  },
  blaze: {
    bull: {
      summary: "Blaze: 속도가 붙는 구간이라 한 번 더 위로 칠 수 있어.",
      detail: "Blaze는 속도와 거래량을 먼저 본다. 지금은 추세 추종이 아직 먹힐 만한 장면이야.",
    },
    bear: {
      summary: "Blaze: 속도는 좋지만 과열이라 식는 순간이 빠를 수 있어.",
      detail: "모멘텀 장은 꺾일 때도 급해. Blaze답게 추격보다 되돌림 위험을 먼저 본다.",
    },
  },
  ledger: {
    bull: {
      summary: "Ledger: 거래 구조 체력이 아직 완전히 비진 않았어.",
      detail: "Ledger는 지금 확보된 거래 구조만 본다. 거래량과 구조적 버팀이 남아 있으면 쉽게 무너질 자리는 아니야.",
    },
    bear: {
      summary: "Ledger: 거래 구조는 아직 조심 쪽으로 기울어 있어.",
      detail: "가격이 버티는 척해도 체력이 비면 아래로 밀릴 수 있어. Ledger답게 구조가 먼저 흔들리는지 본다.",
    },
  },
  shade: {
    bull: {
      summary: "Shade: 리스크는 있지만 아직 통제 가능한 범위야.",
      detail: "Shade는 손익보다 리스크를 먼저 본다. 지금은 바로 붕괴보다 관리 가능한 변동성 구간에 더 가까워.",
    },
    bear: {
      summary: "Shade: 리스크 지표가 먼저 경고를 보내고 있어.",
      detail: "과열 포지션이 쌓이면 작은 충격도 청산 쪽으로 번질 수 있어. Shade 기준에선 방어가 우선이야.",
    },
  },
  vela: {
    bull: {
      summary: "Vela: 숨은 자금 흐름이 아직 완전히 꺾였다고 보긴 어려워.",
      detail: "Vela는 수면 아래 흐름을 본다. 대형 자금이 급하게 도망가는 그림보단 아직 관망과 재진입이 섞여 보여.",
    },
    bear: {
      summary: "Vela: 자금 방향이 흔들리면 개인만 남는 장이 될 수 있어.",
      detail: "고래 흐름이 선명하지 않으면 가격을 오래 미는 힘도 약해져. Vela는 그 공백을 경계해.",
    },
  },
  flip: {
    bull: {
      summary: "Flip: 다들 조정을 말할수록 오히려 한 번 더 튈 자리도 남아 있어.",
      detail: "Flip은 합의의 반대편을 본다. 조심이 과해지면 짧은 반대로 숏을 털 수 있어.",
    },
    bear: {
      summary: "Flip: 오히려 너무 낙관적이라 반대로 꺾일 쪽이 가까워 보여.",
      detail: "모두가 위만 볼 때 작은 균열 하나가 크게 번지기도 해. Flip답게 그 반전을 노린다.",
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

function isKoreanDebateContent(summary: string, detail: string) {
  return summary.trim().length > 0 && detail.trim().length > 0;
}

function formatMarketEvidenceValue(
  marketData: MarketData,
  evidenceSource: Extract<DebateEvidenceSource, { kind: "market" }>,
) {
  const value = marketData[evidenceSource.field];

  if (value == null) {
    return "없음";
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(" | ") : "없음";
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
      const previousSummary =
        previousMessages.map((message) => `${message.characterName}: ${message.summary}`).join(" | ") ||
        evidenceSource.emptyText ||
        "없음";

      return `[원소스: ${evidenceSource.source}] ${evidenceSource.label}: ${previousSummary}`;
    }

    const rawValue = marketData[evidenceSource.field];
    const isMissingArray = Array.isArray(rawValue) && rawValue.length === 0;
    const isMissingString = typeof rawValue === "string" && rawValue.trim().length === 0;

    if (rawValue == null || isMissingArray || isMissingString) {
      hasMissingRequiredEvidence = true;
    }

    return `[원소스: ${evidenceSource.source}] ${evidenceSource.label}: ${formatMarketEvidenceValue(
      marketData,
      evidenceSource,
    )}`;
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
      ? `직전 발언 "${previousMessages.at(-1)?.summary}"까지는 들었지만, 지금은 이 캐릭터가 써야 할 원소스 근거가 비어 있어.`
      : "첫 발언을 준비했지만, 지금은 이 캐릭터가 써야 할 원소스 근거가 부족해.";

  return {
    id: `${character.id}-${Date.now()}-${previousMessages.length}`,
    characterId: character.id,
    characterName: character.name,
    team: character.team,
    stance: character.team === "bull" ? "bullish" : "bearish",
    summary: `${character.name}: 지금은 이 역할답게 말할 만큼 근거가 부족해 섣불리 결론 내리기 어려워.`,
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
      : "첫 발언이라 캐릭터 렌즈를 먼저 세울게.";

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
    ? characterVoiceGuide[character.id]?.bull.summary ?? fallbackTemplates[character.id]?.bull.summary
    : characterVoiceGuide[character.id]?.bear.summary ?? fallbackTemplates[character.id]?.bear.summary;

  const detail = isBull
    ? `${tensionPoint} ${characterVoiceGuide[character.id]?.bull.detail ?? fallbackTemplates[character.id]?.bull.detail}`
    : `${tensionPoint} ${characterVoiceGuide[character.id]?.bear.detail ?? fallbackTemplates[character.id]?.bear.detail}`;

  return {
    id: `${character.id}-${Date.now()}-${previousMessages.length}`,
    characterId: character.id,
    characterName: character.name,
    team: character.team,
    stance: isBull ? "bullish" : "bearish",
    summary: `${character.name}: ${summary}`,
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

        const sanitizedSummary = sanitizeKoreanText(parsed.summary, "");
        const sanitizedDetail = sanitizeKoreanText(parsed.detail, "");

        if (!isKoreanDebateContent(sanitizedSummary, sanitizedDetail)) {
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
          summary: sanitizedSummary,
          detail: sanitizedDetail,
          indicatorLabel: sanitizeDisplayText(parsed.indicatorLabel, "핵심 지표"),
          indicatorValue: sanitizeDisplayText(parsed.indicatorValue, "값 없음"),
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
