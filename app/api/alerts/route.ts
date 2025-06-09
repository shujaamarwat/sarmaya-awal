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

    // Ensure alerts is an array and handle null/undefined
    const alertsArray = Array.isArray(alerts) ? alerts : []

    // Serialize the data to ensure JSON compatibility
    const serializedAlerts = alertsArray.map((alert) => ({
      ...alert,
      created_at: alert.created_at ? new Date(alert.created_at).toISOString() : null,
    }))

    return NextResponse.json(serializedAlerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
