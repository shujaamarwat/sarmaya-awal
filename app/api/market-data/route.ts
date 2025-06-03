import { type NextRequest, NextResponse } from "next/server"
import { getMarketData } from "@/lib/data/market-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!symbol || !startDate || !endDate) {
      return NextResponse.json({ error: "Symbol, startDate, and endDate are required" }, { status: 400 })
    }

    const marketData = await getMarketData(symbol, new Date(startDate), new Date(endDate))

    return NextResponse.json(marketData)
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
