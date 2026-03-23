import { WaitingPageClient } from "@/app/battle/[coinId]/waiting/WaitingPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";

interface WaitingPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function WaitingPage({ params }: WaitingPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return <WaitingPageClient coinId={coinId} initialCurrentUserSnapshot={initialCurrentUserSnapshot} />;
}
