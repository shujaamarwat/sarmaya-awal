"use server"

import { sql } from "../db"

export type Strategy = {
  id: number
  user_id: number
  name: string
  type: string
  description?: string
  parameters: Record<string, any>
  status: "draft" | "active" | "paused"
  created_at: Date
  updated_at: Date
  last_run?: Date
}

export async function getStrategiesByUserId(userId: number): Promise<Strategy[]> {
  return await sql`
    SELECT * FROM strategies 
    WHERE user_id = ${userId}
    ORDER BY updated_at DESC
  `
}

export async function getStrategyById(id: number, userId: number): Promise<Strategy | null> {
  const result = await sql`
    SELECT * FROM strategies 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.length > 0 ? result[0] : null
}

export async function createStrategy(strategy: Omit<Strategy, "id" | "created_at" | "updated_at">): Promise<Strategy> {
  const result = await sql`
    INSERT INTO strategies (
      user_id, name, type, description, parameters, status
    ) VALUES (
      ${strategy.user_id}, ${strategy.name}, ${strategy.type}, 
      ${strategy.description}, ${JSON.stringify(strategy.parameters)}, ${strategy.status}
    )
    RETURNING *
  `
  return result[0]
}

export async function updateStrategy(
  id: number,
  userId: number,
  updates: Partial<Omit<Strategy, "id" | "user_id" | "created_at" | "updated_at">>,
): Promise<Strategy | null> {
  const updateFields = ["updated_at = CURRENT_TIMESTAMP"]
  const params = [id, userId]
  let paramIndex = 3

  if (updates.name !== undefined) {
    updateFields.push(`name = $${paramIndex++}`)
    params.push(updates.name)
  }
  if (updates.type !== undefined) {
    updateFields.push(`type = $${paramIndex++}`)
    params.push(updates.type)
  }
  if (updates.description !== undefined) {
    updateFields.push(`description = $${paramIndex++}`)
    params.push(updates.description)
  }
  if (updates.parameters !== undefined) {
    updateFields.push(`parameters = $${paramIndex++}`)
    params.push(JSON.stringify(updates.parameters))
  }
  if (updates.status !== undefined) {
    updateFields.push(`status = $${paramIndex++}`)
    params.push(updates.status)
  }
  if (updates.last_run !== undefined) {
    updateFields.push(`last_run = $${paramIndex++}`)
    params.push(updates.last_run)
  }

  const query = `
    UPDATE strategies 
    SET ${updateFields.join(", ")}
    WHERE id = $1 AND user_id = $2
    RETURNING *
  `

  const result = await sql.query(query, params)
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function deleteStrategy(id: number, userId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM strategies 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.count > 0
}

export async function updateLastRun(id: number, userId: number): Promise<void> {
  await sql`
    UPDATE strategies 
    SET last_run = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id} AND user_id = ${userId}
  `
}
