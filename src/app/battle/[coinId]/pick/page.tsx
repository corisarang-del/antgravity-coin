import { PickPageClient } from "@/app/battle/[coinId]/pick/PickPageClient";

interface PickPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function PickPage({ params }: PickPageProps) {
  const { coinId } = await params;
  return <PickPageClient coinId={coinId} />;
}
