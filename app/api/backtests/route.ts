import { type NextRequest, NextResponse } from "next/server"
import { createBacktest } from "@/lib/data/backtests"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const backtest = await createBacktest({
      user_id: body.user_id,
      strategy_id: body.strategy_id,
      name: body.name,
      asset: body.asset,
      start_date: new Date(body.start_date),
      end_date: new Date(body.end_date),
      status: body.status,
      parameters: body.parameters,
    })

    return NextResponse.json(backtest)
  } catch (error) {
    console.error("Error creating backtest:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
