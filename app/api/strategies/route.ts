import { type NextRequest, NextResponse } from "next/server"
import { getStrategiesByUserId, createStrategy } from "@/lib/data/strategies"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const strategies = await getStrategiesByUserId(Number.parseInt(userId))
    return NextResponse.json(strategies)
  } catch (error) {
    console.error("Error fetching strategies:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const strategy = await createStrategy({
      user_id: body.user_id,
      name: body.name,
      type: body.type,
      description: body.description,
      parameters: body.parameters,
      status: body.status,
    })

    return NextResponse.json(strategy)
  } catch (error) {
    console.error("Error creating strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
