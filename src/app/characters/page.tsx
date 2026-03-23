import { CharactersPageClient } from "@/app/characters/CharactersPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { getCharacterSourceNotice } from "@/infrastructure/db/getCharacterSourceNotice";
import { AppHeader } from "@/presentation/components/AppHeader";

export default async function CharactersPage() {
  const [initialCurrentUserSnapshot, sourceNotice] = await Promise.all([
    getInitialCurrentUserSnapshot(),
    getCharacterSourceNotice(),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader initialCurrentUserSnapshot={initialCurrentUserSnapshot} />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <CharactersPageClient sourceNotice={sourceNotice} />
      </main>
    </div>
  );
}
