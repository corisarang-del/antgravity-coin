import { WaitingPageClient } from "@/app/battle/[coinId]/waiting/WaitingPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";

interface WaitingPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function WaitingPage({ params }: WaitingPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return (
    <>
      <AppHeader
        currentPath={`/battle/${coinId}`}
        initialCurrentUserSnapshot={initialCurrentUserSnapshot}
      />
      <WaitingPageClient coinId={coinId} />
    </>
  );
}
