import { type NextRequest, NextResponse } from "next/server"
import { updateStrategy, deleteStrategy } from "@/lib/data/strategies"
import { getSession } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const strategyId = Number.parseInt(params.id)

    const strategy = await updateStrategy(strategyId, session.id, body)

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    // Serialize the response
    const serializedStrategy = {
      ...strategy,
      created_at: strategy.created_at ? new Date(strategy.created_at).toISOString() : null,
      updated_at: strategy.updated_at ? new Date(strategy.updated_at).toISOString() : null,
      last_run: strategy.last_run ? new Date(strategy.last_run).toISOString() : null,
    }

    return NextResponse.json(serializedStrategy)
  } catch (error) {
    console.error("Error updating strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const strategyId = Number.parseInt(params.id)

    const success = await deleteStrategy(strategyId, session.id)

    if (!success) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting strategy:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
