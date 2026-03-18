import { NextResponse } from "next/server";
import { searchCoins } from "@/application/useCases/searchCoins";
import { CoinGeckoRepository } from "@/infrastructure/db/coinGeckoRepository";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const repository = new CoinGeckoRepository();
  const coins = await searchCoins(repository, query);

  return NextResponse.json({ coins });
}
