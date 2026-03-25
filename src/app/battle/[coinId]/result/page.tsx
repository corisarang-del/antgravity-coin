import { ResultPageClient } from "@/app/battle/[coinId]/result/ResultPageClient";

interface ResultPageProps {
  params: Promise<{
    coinId: string;
  }>;
}

export default async function ResultPage({ params }: ResultPageProps) {
  const { coinId } = await params;
  return <ResultPageClient coinId={coinId} />;
}
