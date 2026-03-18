import { BattlePageClient } from "@/app/battle/[coinId]/BattlePageClient";

interface BattlePageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { coinId } = await params;
  return <BattlePageClient coinId={coinId} />;
}
