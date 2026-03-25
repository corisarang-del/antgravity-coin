import { PickPageClient } from "@/app/battle/[coinId]/pick/PickPageClient";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";

interface PickPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function PickPage({ params }: PickPageProps) {
  const { coinId } = await params;
  const initialCurrentUserSnapshot = await getInitialCurrentUserSnapshot();

  return (
    <>
      <AppHeader
        currentPath={`/battle/${coinId}`}
        initialCurrentUserSnapshot={initialCurrentUserSnapshot}
      />
      <PickPageClient coinId={coinId} />
    </>
  );
}
