import { NextResponse } from "next/server";
import { getExchangeRates } from "@/lib/exchange";

export const dynamic = "force-dynamic";

export async function GET() {
  const rates = await getExchangeRates();
  return NextResponse.json(rates);
}
