import { type NextRequest, NextResponse } from "next/server"
import { getTradesByUserId } from "@/lib/data/trades"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const symbol = searchParams.get("symbol") || undefined

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const trades = await getTradesByUserId(Number.parseInt(userId), {
      limit,
      symbol: symbol && symbol !== "" ? symbol : undefined,
    })

    // Ensure trades is an array and handle null/undefined
    const tradesArray = Array.isArray(trades) ? trades : []

    // Serialize the data to ensure JSON compatibility
    const serializedTrades = tradesArray.map((trade) => ({
      ...trade,
      timestamp: trade.timestamp ? new Date(trade.timestamp).toISOString() : null,
      created_at: trade.created_at ? new Date(trade.created_at).toISOString() : null,
    }))

    return NextResponse.json(serializedTrades)
  } catch (error) {
    console.error("Error fetching trades:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
