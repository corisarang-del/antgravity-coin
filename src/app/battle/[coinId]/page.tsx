import { BattlePageClient } from "@/app/battle/[coinId]/BattlePageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";

interface BattlePageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return <BattlePageClient coinId={coinId} initialCurrentUserSnapshot={initialCurrentUserSnapshot} />;
}
