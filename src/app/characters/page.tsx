import { CharactersPageClient } from "@/app/characters/CharactersPageClient";
import { AppHeader } from "@/presentation/components/AppHeader";

export default function CharactersPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-6">
        <CharactersPageClient />
      </main>
    </div>
  );
}
