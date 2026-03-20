import { generateCharacterMessage } from "@/application/useCases/generateBattleDebate";
import { getPreparedBattleContext } from "@/application/useCases/preparedBattleContext";
import type { DebateMessage } from "@/domain/models/DebateMessage";
import { NextResponse } from "next/server";
import { getRequestOwnerId } from "@/infrastructure/auth/requestOwner";
import { characters } from "@/shared/constants/characters";
import {
  consumeRequestRateLimit,
  getRequestRateLimitKey,
} from "@/shared/utils/requestRateLimiter";

function toSseEvent(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

function buildDebateRounds() {
  const bullCharacters = characters.filter((character) => character.team === "bull");
  const bearCharacters = characters.filter((character) => character.team === "bear");
  const roundCount = Math.max(bullCharacters.length, bearCharacters.length);

  return Array.from({ length: roundCount }, (_, index) =>
    [bullCharacters[index], bearCharacters[index]].filter(Boolean),
  );
}

function getPickReadyPayload(messages: DebateMessage[]) {
  const bullCount = messages.filter((message) => message.team === "bull").length;
  const bearCount = messages.filter((message) => message.team === "bear").length;

  return {
    bullCount,
    bearCount,
    ready: bullCount >= 2 && bearCount >= 2,
  };
}

async function emitMessageLifecycle(
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  message: DebateMessage,
) {
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

export async function POST(request: Request) {
  const body = (await request.json()) as {
    coinId?: string;
  };

  if (!body.coinId?.trim()) {
    return NextResponse.json({ error: "missing_coin_id", retryable: false }, { status: 400 });
  }

  const { ownerId } = await getRequestOwnerId();
  const rateLimit = consumeRequestRateLimit({
    bucket: "battle-post",
    key: getRequestRateLimitKey(request, "battle-post", ownerId),
    max: 5,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", retryable: true },
      {
        status: 429,
        headers: {
          "Retry-After": `${rateLimit.retryAfterSeconds}`,
        },
      },
    );
  }

  const coinId = body.coinId;
  const preparedContextResult = await getPreparedBattleContext(coinId);
  const preparedFirstTurnDrafts = preparedContextResult.context.firstTurnDrafts;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        const { marketData, summary, reusableDebateContext } = preparedContextResult.context;

        controller.enqueue(encoder.encode(toSseEvent("battle_start", { marketData, summary })));

        const messages: DebateMessage[] = [];
        const debateRounds = buildDebateRounds();
        let pickReadySent = false;

        for (const roundCharacters of debateRounds) {
          const pendingTasks = roundCharacters.map((character) => ({
            character,
            promise:
              preparedFirstTurnDrafts[character.id]
                ? Promise.resolve(preparedFirstTurnDrafts[character.id])
                : generateCharacterMessage(
                    marketData,
                    character,
                    messages,
                    reusableDebateContext,
                  ),
          }));

          while (pendingTasks.length > 0) {
            const settled = await Promise.race(
              pendingTasks.map((task) =>
                task.promise.then((message) => ({
                  task,
                  message,
                })),
              ),
            );

            pendingTasks.splice(pendingTasks.indexOf(settled.task), 1);
            messages.push(settled.message);
            await emitMessageLifecycle(controller, encoder, settled.message);

            const pickReadyPayload = getPickReadyPayload(messages);
            if (!pickReadySent && pickReadyPayload.ready) {
              pickReadySent = true;
              controller.enqueue(encoder.encode(toSseEvent("battle_pick_ready", pickReadyPayload)));
            }
          }
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
