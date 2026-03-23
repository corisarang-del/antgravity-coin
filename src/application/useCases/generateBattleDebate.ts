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
      summary: "내 눈엔 차트 구조가 아직 위쪽으로 열려 있어.",
      detail: "차트상 RSI랑 MACD 흐름을 같이 보면 기술적 방어가 아직 먼저 보여. 뉴스보다 차트가 지금은 더 또렷하게 말하고 있어.",
    },
    bear: {
      summary: "내 눈엔 차트가 버티는 척하지만 힘은 약해지고 있어.",
      detail: "차트상 추세랑 모멘텀이 같이 식는 쪽이라 반등 기대보다 추가 조정을 먼저 보는 게 맞아 보여.",
    },
  },
  judy: {
    bull: {
      summary: "헤드라인만 보면 지금 재료는 아직 더 갈 수 있어.",
      detail: "헤드라인이랑 이벤트를 먼저 보면 지금 들어온 재료 결이 아직 살아 있어. 뉴스 쪽 온도가 생각보다 덜 식었어.",
    },
    bear: {
      summary: "헤드라인은 많은데 재료 힘은 생각보다 약해 보여.",
      detail: "이벤트는 보이는데 시장이 그 재료를 오래 붙잡을 만큼 들떠 있진 않아 보여. 지금 재료는 반짝하고 끝날 가능성도 커.",
    },
  },
  clover: {
    bull: {
      summary: "분위기상 군중 심리가 아직 완전히 꺾이진 않았어.",
      detail: "심리적으로 보면 공포가 있어도 기대가 미세하게 남아 있으면 반등이 붙는 구간이 생겨. 지금은 그 문이 완전히 닫힌 건 아니야.",
    },
    bear: {
      summary: "분위기상 심리 불안이 다시 커지면 흔들림이 빨라질 수 있어.",
      detail: "심리적으로 보면 지금은 숫자보다 군중의 떨림이 더 신경 쓰여. 작은 충격에도 공포 쪽으로 금방 기울 수 있어 보여.",
    },
  },
  blaze: {
    bull: {
      summary: "지금은 속도가 붙는 구간이라 한 번 더 위로 칠 수 있어.",
      detail: "이 구간은 속도랑 거래량이 아직 같이 받쳐줘. 그래서 추세 추종이 한 번 더 먹힐 만한 장면이야.",
    },
    bear: {
      summary: "지금은 속도는 좋은데 과열이라 식는 순간도 빠를 수 있어.",
      detail: "이 구간은 모멘텀 장이라 꺾일 때도 급하게 무너져. 지금은 추격보다 되돌림 위험을 먼저 보는 쪽이 맞아.",
    },
  },
  ledger: {
    bull: {
      summary: "숫자상 거래 구조 체력이 아직 완전히 비진 않았어.",
      detail: "구조적으로 보면 지금 보이는 거래량이랑 버팀이 같이 남아 있어. 그래서 쉽게 무너질 자리는 아직 아니야.",
    },
    bear: {
      summary: "숫자상 거래 구조는 아직 조심 쪽으로 기울어 있어.",
      detail: "구조적으로 보면 가격이 버티는 척해도 체력이 비면 아래로 밀릴 수 있어. 지금은 구조가 먼저 흔들리는 쪽이 더 신경 쓰여.",
    },
  },
  shade: {
    bull: {
      summary: "내 기준엔 리스크는 있지만 아직 통제 가능한 범위야.",
      detail: "리스크 쪽에선 지금이 바로 붕괴라기보다 관리 가능한 변동성 구간에 더 가까워 보여. 겁낼 자리라기보다 선을 지켜야 할 자리야.",
    },
    bear: {
      summary: "내 기준엔 리스크 지표가 먼저 경고를 보내고 있어.",
      detail: "리스크 쪽에선 과열 포지션이 쌓이면 작은 충격도 청산 쪽으로 번질 수 있어. 지금은 공격보다 방어가 먼저야.",
    },
  },
  vela: {
    bull: {
      summary: "밑에서 보면 숨은 자금 흐름이 아직 완전히 꺾인 건 아니야.",
      detail: "자금 흐름상 수면 아래를 보면 대형 자금이 급하게 도망가는 그림까진 아니야. 아직 관망이랑 재진입이 같이 섞여 보여.",
    },
    bear: {
      summary: "밑에서 보면 자금 방향이 흔들리면 개인만 남는 장이 될 수 있어.",
      detail: "자금 흐름상 고래 방향이 선명하지 않으면 가격을 오래 미는 힘도 약해져. 지금은 그 공백이 은근히 커 보여.",
    },
  },
  flip: {
    bull: {
      summary: "근데 난 다들 조정을 말할수록 오히려 한 번 더 튈 자리도 남아 있다고 봐.",
      detail: "오히려 지금은 합의가 너무 빨리 조정 쪽으로 쏠렸어. 그러면 짧게 반대로 튀면서 숏을 먼저 털 수도 있어.",
    },
    bear: {
      summary: "근데 난 오히려 너무 낙관적이라 반대로 꺾일 쪽이 더 가까워 보여.",
      detail: "오히려 지금은 모두가 위만 보고 있어서 작은 균열 하나도 크게 번지기 쉬워. 난 그 반전이 더 가깝다고 봐.",
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

function compressPreviousMessages(
  previousMessages: DebateMessage[],
  currentTeam: "bull" | "bear",
) {
  if (previousMessages.length === 0) {
    return [];
  }

  const lastMessage = previousMessages.at(-1) ?? null;
  const latestOpposingMessage =
    [...previousMessages].reverse().find((message) => message.team !== currentTeam) ?? null;
  const latestSameTeamMessage =
    [...previousMessages].reverse().find((message) => message.team === currentTeam) ?? null;
  const latestBullMessage =
    [...previousMessages].reverse().find((message) => message.team === "bull") ?? null;
  const latestBearMessage =
    [...previousMessages].reverse().find((message) => message.team === "bear") ?? null;

  const commonSummaryParts = [
    latestBullMessage ? `불리시 최근: ${latestBullMessage.summary}` : null,
    latestBearMessage ? `베어리시 최근: ${latestBearMessage.summary}` : null,
  ].filter(Boolean);

  const commonSummaryMessage: DebateMessage | null =
    commonSummaryParts.length > 0
      ? {
          id: `context-summary-${previousMessages.length}`,
          characterId: "context-summary",
          characterName: "공통 요약",
          team: currentTeam,
          stance: currentTeam === "bull" ? "bullish" : "bearish",
          summary: commonSummaryParts.join(" / "),
          detail: commonSummaryParts.join(" / "),
          indicatorLabel: "요약",
          indicatorValue: "압축",
          provider: "system",
          model: "compressed-context",
          fallbackUsed: false,
          createdAt: new Date().toISOString(),
        }
      : null;

  const companionMessage =
    latestOpposingMessage && latestOpposingMessage.id !== lastMessage?.id
      ? latestOpposingMessage
      : latestSameTeamMessage && latestSameTeamMessage.id !== lastMessage?.id
        ? latestSameTeamMessage
        : null;

  const uniqueMessages = new Map<string, DebateMessage>();

  for (const message of [lastMessage, companionMessage, commonSummaryMessage]) {
    if (!message) {
      continue;
    }

    uniqueMessages.set(message.id, message);
  }

  return [...uniqueMessages.values()];
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
    summary: "지금은 이 역할답게 말할 만큼 근거가 부족해서 섣불리 결론 내리기 어려워.",
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
  const compressedPreviousMessages = compressPreviousMessages(previousMessages, character.team);
  const roleEvidence = buildRoleEvidence(
    marketData,
    character.id,
    compressedPreviousMessages,
  );

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
        previousMessages: compressedPreviousMessages,
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
