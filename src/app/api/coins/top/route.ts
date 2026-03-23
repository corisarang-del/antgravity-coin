import { NextResponse } from "next/server";
import { getTopCoinsSnapshot } from "@/application/useCases/getTopCoinsSnapshot";

export async function GET() {
  const coins = await getTopCoinsSnapshot();

  return NextResponse.json({ coins });
}
