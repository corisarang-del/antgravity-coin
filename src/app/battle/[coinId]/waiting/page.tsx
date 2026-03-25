import { WaitingPageClient } from "@/app/battle/[coinId]/waiting/WaitingPageClient";

interface WaitingPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function WaitingPage({ params }: WaitingPageProps) {
  const { coinId } = await params;
  return <WaitingPageClient coinId={coinId} />;
}
