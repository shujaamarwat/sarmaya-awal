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

    // Safe serialization with proper error handling
    const serializedBacktests = backtests.map((backtest) => {
      try {
        return {
          ...backtest,
          created_at: backtest.created_at ? new Date(backtest.created_at).toISOString() : null,
          updated_at: backtest.updated_at ? new Date(backtest.updated_at).toISOString() : null,
          start_date: backtest.start_date ? new Date(backtest.start_date).toISOString() : null,
          end_date: backtest.end_date ? new Date(backtest.end_date).toISOString() : null,
          completed_at: backtest.completed_at ? new Date(backtest.completed_at).toISOString() : null,
        }
      } catch (dateError) {
        console.error("Date serialization error for backtest:", backtest.id, dateError)
        return {
          ...backtest,
          created_at: null,
          updated_at: null,
          start_date: null,
          end_date: null,
          completed_at: null,
        }
      }
    })

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

    // Safe serialization
    const serializedBacktest = {
      ...backtest,
      created_at: backtest.created_at ? new Date(backtest.created_at).toISOString() : null,
      updated_at: backtest.updated_at ? new Date(backtest.updated_at).toISOString() : null,
      start_date: backtest.start_date ? new Date(backtest.start_date).toISOString() : null,
      end_date: backtest.end_date ? new Date(backtest.end_date).toISOString() : null,
      completed_at: backtest.completed_at ? new Date(backtest.completed_at).toISOString() : null,
    }

    return NextResponse.json(serializedBacktest)
  } catch (error) {
    console.error("Error creating backtest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
