import type { ReactNode } from "react";
import { getInitialCurrentUserSnapshot } from "@/infrastructure/auth/getInitialCurrentUserSnapshot";
import { AppHeader } from "@/presentation/components/AppHeader";

interface BattleLayoutProps {
  children: ReactNode;
  params: Promise<{
    coinId: string;
  }>;
}

export default async function BattleLayout({ children, params }: BattleLayoutProps) {
  const [{ coinId }, initialCurrentUserSnapshot] = await Promise.all([
    params,
    getInitialCurrentUserSnapshot(),
  ]);

  return (
    <>
      <AppHeader
        currentPath={`/battle/${coinId}`}
        initialCurrentUserSnapshot={initialCurrentUserSnapshot}
      />
      {children}
    </>
  );
}
