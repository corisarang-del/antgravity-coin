import { ResultPageClient } from "@/app/battle/[coinId]/result/ResultPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";

interface ResultPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return <ResultPageClient coinId={coinId} initialCurrentUserSnapshot={initialCurrentUserSnapshot} />;
}
