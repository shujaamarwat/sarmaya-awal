import { type NextRequest, NextResponse } from "next/server"
import { getBacktestsByUserId, createBacktest } from "@/lib/data/backtests"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const backtests = await getBacktestsByUserId(Number.parseInt(userId))

    // Serialize the data to ensure JSON compatibility
    const serializedBacktests = backtests.map((backtest) => ({
      ...backtest,
      created_at: backtest.created_at ? new Date(backtest.created_at).toISOString() : null,
      updated_at: backtest.updated_at ? new Date(backtest.updated_at).toISOString() : null,
      start_date: backtest.start_date ? new Date(backtest.start_date).toISOString() : null,
      end_date: backtest.end_date ? new Date(backtest.end_date).toISOString() : null,
    }))

    return NextResponse.json(serializedBacktests)
  } catch (error) {
    console.error("Error fetching backtests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backtest = await createBacktest(body)

    // Serialize the response
    const serializedBacktest = {
      ...backtest,
      created_at: backtest.created_at ? new Date(backtest.created_at).toISOString() : null,
      updated_at: backtest.updated_at ? new Date(backtest.updated_at).toISOString() : null,
      start_date: backtest.start_date ? new Date(backtest.start_date).toISOString() : null,
      end_date: backtest.end_date ? new Date(backtest.end_date).toISOString() : null,
    }

    return NextResponse.json(serializedBacktest)
  } catch (error) {
    console.error("Error creating backtest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
