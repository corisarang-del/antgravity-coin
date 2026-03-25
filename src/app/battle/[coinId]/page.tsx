import { BattlePageClient } from "@/app/battle/[coinId]/BattlePageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";

interface BattlePageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return (
    <>
      <AppHeader
        currentPath={`/battle/${coinId}`}
        initialCurrentUserSnapshot={initialCurrentUserSnapshot}
      />
      <BattlePageClient coinId={coinId} />
    </>
  );
}
