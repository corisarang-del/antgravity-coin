import { PickPageClient } from "@/app/battle/[coinId]/pick/PickPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";

interface PickPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function PickPage({ params }: PickPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return <PickPageClient coinId={coinId} initialCurrentUserSnapshot={initialCurrentUserSnapshot} />;
}
