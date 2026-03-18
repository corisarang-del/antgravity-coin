"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CharacterCard } from "@/presentation/components/CharacterCard";
import { characters, type Character } from "@/shared/constants/characters";

const CharacterDetailModal = dynamic(
  () =>
    import("@/presentation/components/CharacterDetailModal").then(
      (module) => module.CharacterDetailModal,
    ),
  {
    loading: () => null,
  },
);

export function CharactersPageClient() {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [sourceNotice, setSourceNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCharacterSourceStatus() {
      try {
        const response = await fetch("/api/characters", {
          method: "GET",
          credentials: "include",
        });

        if (cancelled) {
          return;
        }

        const source = response.headers.get("x-characters-source");
        const fallbackUsed = response.headers.get("x-characters-fallback") === "true";

        if (fallbackUsed) {
          setSourceNotice("외부 캐릭터 소스 연결이 불안정해서 지금은 기본 라인업을 보여주고 있어.");
          return;
        }

        if (source === "external") {
          setSourceNotice("외부 캐릭터 소스 기준으로 동기화된 라인업을 확인 중이야.");
          return;
        }

        setSourceNotice(null);
      } catch {
        if (!cancelled) {
          setSourceNotice("캐릭터 목록 상태를 다시 확인하지 못했어. 기본 라인업을 보여주고 있어.");
        }
      }
    }

    void loadCharacterSourceStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="mb-6 rounded-[28px] border border-border bg-[linear-gradient(180deg,hsl(var(--card))_0%,hsl(var(--surface-3))_100%)] p-5 shadow-[0_18px_44px_rgba(17,29,61,0.06)]">
        <h1 className="font-display text-4xl font-bold tracking-[-0.05em]">캐릭터 도감</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          8명의 캐릭터가 각자 다른 분석 관점으로 참여해. 카드를 누르면 성격과 고른 이유까지
          바로 확인할 수 있어.
        </p>
        {sourceNotice ? (
          <p className="mt-4 rounded-[18px] border border-border bg-[hsl(var(--surface-2))] px-4 py-3 text-sm text-muted-foreground">
            {sourceNotice}
          </p>
        ) : null}
      </section>
      <section className="grid gap-5 sm:grid-cols-2">
        {characters.map((character, index) => (
          <CharacterCard
            key={character.id}
            character={character}
            imagePriority={index < 2}
            imageSizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1023px) calc(50vw - 1.625rem), 31.5rem"
            onClick={() => setSelectedCharacter(character)}
          />
        ))}
      </section>
      <CharacterDetailModal
        character={selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
      />
    </>
  );
}
