import { type NextRequest, NextResponse } from "next/server"
import { getAlertsByUserId } from "@/lib/data/alerts"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const alerts = await getAlertsByUserId(Number.parseInt(userId), {
      unreadOnly,
      limit,
    })

    // Serialize the data to ensure JSON compatibility
    const serializedAlerts = alerts.map((alert) => ({
      ...alert,
      created_at: alert.created_at?.toISOString(),
      updated_at: alert.updated_at?.toISOString(),
      triggered_at: alert.triggered_at?.toISOString(),
    }))

    return NextResponse.json(serializedAlerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
