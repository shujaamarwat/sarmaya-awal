import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)

    const result = await sql`
      SELECT 
        u.timezone, u.theme, u.language, u.currency, u.date_format,
        up.default_assets, up.notification_backtest_complete, 
        up.notification_market_alerts, up.notification_system_updates, 
        up.notification_weekly_reports
      FROM users u
      LEFT JOIN user_preferences up ON u.id = up.user_id
      WHERE u.id = ${userId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching user settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = Number.parseInt(params.id)
    const body = await request.json()

    // Update user table fields
    const userUpdates = []
    const userParams = [userId]
    let paramIndex = 2

    if (body.timezone !== undefined) {
      userUpdates.push(`timezone = $${paramIndex++}`)
      userParams.push(body.timezone)
    }
    if (body.theme !== undefined) {
      userUpdates.push(`theme = $${paramIndex++}`)
      userParams.push(body.theme)
    }
    if (body.language !== undefined) {
      userUpdates.push(`language = $${paramIndex++}`)
      userParams.push(body.language)
    }
    if (body.currency !== undefined) {
      userUpdates.push(`currency = $${paramIndex++}`)
      userParams.push(body.currency)
    }
    if (body.date_format !== undefined) {
      userUpdates.push(`date_format = $${paramIndex++}`)
      userParams.push(body.date_format)
    }

    if (userUpdates.length > 0) {
      userUpdates.push(`updated_at = CURRENT_TIMESTAMP`)
      const userQuery = `
        UPDATE users 
        SET ${userUpdates.join(", ")}
        WHERE id = $1
      `
      await sql.query(userQuery, userParams)
    }

    // Update user preferences
    const prefUpdates = []
    const prefParams = [userId]
    let prefParamIndex = 2

    if (body.default_assets !== undefined) {
      prefUpdates.push(`default_assets = $${prefParamIndex++}`)
      prefParams.push(body.default_assets)
    }
    if (body.notification_backtest_complete !== undefined) {
      prefUpdates.push(`notification_backtest_complete = $${prefParamIndex++}`)
      prefParams.push(body.notification_backtest_complete)
    }
    if (body.notification_market_alerts !== undefined) {
      prefUpdates.push(`notification_market_alerts = $${prefParamIndex++}`)
      prefParams.push(body.notification_market_alerts)
    }
    if (body.notification_system_updates !== undefined) {
      prefUpdates.push(`notification_system_updates = $${prefParamIndex++}`)
      prefParams.push(body.notification_system_updates)
    }
    if (body.notification_weekly_reports !== undefined) {
      prefUpdates.push(`notification_weekly_reports = $${prefParamIndex++}`)
      prefParams.push(body.notification_weekly_reports)
    }

    if (prefUpdates.length > 0) {
      const prefQuery = `
        INSERT INTO user_preferences (user_id, ${prefUpdates.map((_, i) => Object.keys(body)[i]).join(", ")})
        VALUES ($1, ${prefParams
          .slice(1)
          .map((_, i) => `$${i + 2}`)
          .join(", ")})
        ON CONFLICT (user_id) DO UPDATE SET
        ${prefUpdates.join(", ")}
      `
      await sql.query(prefQuery, prefParams)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user settings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
