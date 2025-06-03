import { type NextRequest, NextResponse } from "next/server"
import { getMarketDataBySymbol } from "@/lib/data/market-data"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get("symbol")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 })
    }

    const marketData = await getMarketDataBySymbol(symbol, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    })

    // Serialize the data to ensure JSON compatibility
    const serializedData = marketData.map((data) => ({
      ...data,
      date: data.date?.toISOString(),
      created_at: data.created_at?.toISOString(),
    }))

    return NextResponse.json(serializedData)
  } catch (error) {
    console.error("Error fetching market data:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
