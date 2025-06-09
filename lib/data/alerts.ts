"use server"

import { sql } from "../db"

export type Alert = {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  data?: Record<string, any>
  is_read: boolean
  created_at: Date
}

export type AlertSubscription = {
  id: number
  user_id: number
  symbol: string
  alert_type: string
  conditions: Record<string, any>
  is_active: boolean
  created_at: Date
}

export async function getAlertsByUserId(
  userId: number,
  options?: {
    limit?: number
    offset?: number
    unreadOnly?: boolean
    types?: string[]
  },
): Promise<Alert[]> {
  try {
    let query = `SELECT * FROM alerts WHERE user_id = $1`
    const params = [userId]
    let paramIndex = 2

    if (options?.unreadOnly) {
      query += ` AND is_read = false`
    }

    if (options?.types && options.types.length > 0) {
      const typePlaceholders = options.types.map(() => `$${paramIndex++}`).join(", ")
      query += ` AND type IN (${typePlaceholders})`
      params.push(...options.types)
    }

    query += ` ORDER BY created_at DESC`

    if (options?.limit) {
      query += ` LIMIT $${paramIndex++}`
      params.push(options.limit)
    }

    if (options?.offset) {
      query += ` OFFSET $${paramIndex++}`
      params.push(options.offset)
    }

    const result = await sql.query(query, params)
    return Array.isArray(result.rows) ? result.rows : []
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return []
  }
}

export async function createAlert(alert: Omit<Alert, "id" | "created_at">): Promise<Alert> {
  const result = await sql`
    INSERT INTO alerts (
      user_id, type, title, message, data, is_read
    ) VALUES (
      ${alert.user_id}, ${alert.type}, ${alert.title}, 
      ${alert.message}, ${alert.data ? JSON.stringify(alert.data) : null}, ${alert.is_read}
    )
    RETURNING *
  `
  return result[0]
}

export async function markAlertAsRead(id: number, userId: number): Promise<boolean> {
  const result = await sql`
    UPDATE alerts 
    SET is_read = true
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.count > 0
}

export async function markAllAlertsAsRead(userId: number): Promise<number> {
  const result = await sql`
    UPDATE alerts 
    SET is_read = true
    WHERE user_id = ${userId} AND is_read = false
  `
  return result.count
}

export async function getAlertSubscriptionsByUserId(userId: number): Promise<AlertSubscription[]> {
  try {
    const result = await sql`
      SELECT * FROM alert_subscriptions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("Error fetching alert subscriptions:", error)
    return []
  }
}

export async function createAlertSubscription(
  subscription: Omit<AlertSubscription, "id" | "created_at">,
): Promise<AlertSubscription> {
  const result = await sql`
    INSERT INTO alert_subscriptions (
      user_id, symbol, alert_type, conditions, is_active
    ) VALUES (
      ${subscription.user_id}, ${subscription.symbol}, ${subscription.alert_type}, 
      ${JSON.stringify(subscription.conditions)}, ${subscription.is_active}
    )
    RETURNING *
  `
  return result[0]
}

export async function updateAlertSubscription(
  id: number,
  userId: number,
  updates: Partial<Omit<AlertSubscription, "id" | "user_id" | "created_at">>,
): Promise<AlertSubscription | null> {
  const updateFields = []
  const params = [id, userId]
  let paramIndex = 3

  if (updates.symbol !== undefined) {
    updateFields.push(`symbol = $${paramIndex++}`)
    params.push(updates.symbol)
  }
  if (updates.alert_type !== undefined) {
    updateFields.push(`alert_type = $${paramIndex++}`)
    params.push(updates.alert_type)
  }
  if (updates.conditions !== undefined) {
    updateFields.push(`conditions = $${paramIndex++}`)
    params.push(JSON.stringify(updates.conditions))
  }
  if (updates.is_active !== undefined) {
    updateFields.push(`is_active = $${paramIndex++}`)
    params.push(updates.is_active)
  }

  if (updateFields.length === 0) return null

  const query = `
    UPDATE alert_subscriptions 
    SET ${updateFields.join(", ")}
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `

  const result = await sql.query(query, params)
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function deleteAlertSubscription(id: number, userId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM alert_subscriptions 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.count > 0
}
