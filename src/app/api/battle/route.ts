import { generateCharacterMessage } from "@/application/useCases/generateBattleDebate";
import { getPreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import { NextResponse } from "next/server";
import { characters } from "@/shared/constants/characters";

function toSseEvent(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    coinId?: string;
  };

  if (!body.coinId?.trim()) {
    return NextResponse.json({ error: "missing_coin_id", retryable: false }, { status: 400 });
  }

  const coinId = body.coinId;
  const preparedContextResult = await getPreparedBattleContext(coinId);
  const firstCharacter = characters[0] ?? null;
  const preparedFirstTurnDraft = firstCharacter
    ? preparedContextResult.context.firstTurnDrafts[firstCharacter.id] ?? null
    : null;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const { marketData, summary, reusableDebateContext } = preparedContextResult.context;

        controller.enqueue(encoder.encode(toSseEvent("battle_start", { marketData, summary })));

        const messages = [];

        if (firstCharacter) {
          const firstMessage =
            preparedFirstTurnDraft ??
            (await generateCharacterMessage(
              marketData,
              firstCharacter,
              messages,
              reusableDebateContext,
            ));
          messages.push(firstMessage);
          controller.enqueue(
            encoder.encode(
              toSseEvent("character_start", {
                characterId: firstMessage.characterId,
                characterName: firstMessage.characterName,
                team: firstMessage.team,
              }),
            ),
          );
          controller.enqueue(encoder.encode(toSseEvent("message", firstMessage)));
          controller.enqueue(
            encoder.encode(
              toSseEvent("character_done", {
                characterId: firstMessage.characterId,
                provider: firstMessage.provider,
                model: firstMessage.model,
                fallbackUsed: firstMessage.fallbackUsed,
              }),
            ),
          );
        }

        for (const character of characters.slice(1)) {
          const message = await generateCharacterMessage(
            marketData,
            character,
            messages,
            reusableDebateContext,
          );
          messages.push(message);
          controller.enqueue(
            encoder.encode(
              toSseEvent("character_start", {
                characterId: message.characterId,
                characterName: message.characterName,
                team: message.team,
              }),
            ),
          );
          controller.enqueue(encoder.encode(toSseEvent("message", message)));
          controller.enqueue(
            encoder.encode(
              toSseEvent("character_done", {
                characterId: message.characterId,
                provider: message.provider,
                model: message.model,
                fallbackUsed: message.fallbackUsed,
              }),
            ),
          );
        }

        controller.enqueue(
          encoder.encode(
            toSseEvent("battle_complete", {
              count: messages.length,
              completed: true,
            }),
          ),
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            toSseEvent("error", {
              code: "battle_stream_failed",
              message:
                error instanceof Error
                  ? error.message
                  : "배틀 스트림을 이어가지 못했어. 다시 시도해줘.",
              retryable: true,
            }),
          ),
        );
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-battle-prepared-context-hit": `${preparedContextResult.preparedContextHit}`,
      "x-battle-prepared-first-turn-hit": `${preparedContextResult.preparedFirstTurnHit}`,
      "x-battle-prepared-at-age-ms":
        preparedContextResult.preparedAtAgeMs == null
          ? ""
          : `${preparedContextResult.preparedAtAgeMs}`,
    },
  });
}
