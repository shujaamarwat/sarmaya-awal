import { type NextRequest, NextResponse } from "next/server"
import { updateStrategy, deleteStrategy } from "@/lib/data/strategies"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const strategyId = Number.parseInt(params.id)

    // In a real app, you'd get the user ID from the session
    const userId = body.user_id || 1 // Temporary fallback

    const strategy = await updateStrategy(strategyId, userId, body)

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json(strategy)
  } catch (error) {
    console.error("Error updating strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const strategyId = Number.parseInt(params.id)

    // In a real app, you'd get the user ID from the session
    const userId = 1 // Temporary fallback

    const success = await deleteStrategy(strategyId, userId)

    if (!success) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
