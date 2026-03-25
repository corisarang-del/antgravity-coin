import { ResultPageClient } from "@/app/battle/[coinId]/result/ResultPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";

interface ResultPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return (
    <>
      <AppHeader
        currentPath={`/battle/${coinId}`}
        initialCurrentUserSnapshot={initialCurrentUserSnapshot}
      />
      <ResultPageClient coinId={coinId} />
    </>
  );
}
