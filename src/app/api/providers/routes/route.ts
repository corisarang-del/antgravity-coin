import { NextResponse } from "next/server";
import { optimizeProviderRoutes } from "@/application/useCases/optimizeProviderRoutes";
import { getAdminAccess } from "@/infrastructure/auth/adminAccess";
import {
  listRuntimeCharacterModelRoutes,
  setRuntimeCharacterModelRoute,
} from "@/infrastructure/config/providerRuntimeConfig";
import { getCharacterModelRoute } from "@/shared/constants/characterModelRoutes";

export async function GET() {
  const adminAccess = await getAdminAccess();
  if (!adminAccess.allowed) {
    return NextResponse.json({ error: "forbidden" }, { status: adminAccess.status });
  }

  return NextResponse.json({
    routes: listRuntimeCharacterModelRoutes(),
  });
}

export async function POST(request: Request) {
  const adminAccess = await getAdminAccess();
  if (!adminAccess.allowed) {
    return NextResponse.json({ error: "forbidden" }, { status: adminAccess.status });
  }

  const body = (await request.json()) as {
    evaluations?: Array<{
      characterId: string;
      candidateRoute: ReturnType<typeof getCharacterModelRoute>;
      failureRate: number;
      averageLatencyMs: number;
      shadowMatched: boolean;
    }>;
  };

  const evaluations =
    body.evaluations?.flatMap((evaluation) => {
      const currentRoute = getCharacterModelRoute(evaluation.characterId);
      const candidateRoute = evaluation.candidateRoute;

      if (!currentRoute || !candidateRoute) {
        return [];
      }

      return [
        {
          characterId: evaluation.characterId,
          currentRoute,
          candidateRoute,
          failureRate: evaluation.failureRate,
          averageLatencyMs: evaluation.averageLatencyMs,
          shadowMatched: evaluation.shadowMatched,
        },
      ];
    }) ?? [];

  const optimizedRoutes = optimizeProviderRoutes(evaluations);
  for (const route of optimizedRoutes) {
    setRuntimeCharacterModelRoute(route);
  }

  return NextResponse.json({
    ok: true,
    routes: listRuntimeCharacterModelRoutes(),
  });
}
