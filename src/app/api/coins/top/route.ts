import { NextResponse } from "next/server";
import { fetchTopCoins } from "@/application/useCases/fetchTopCoins";
import { CoinGeckoRepository } from "@/infrastructure/db/coinGeckoRepository";

export async function GET() {
  const repository = new CoinGeckoRepository();
  const coins = await fetchTopCoins(repository);

  return NextResponse.json({ coins });
}
