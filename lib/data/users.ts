"use server"

import { sql } from "../db"

export type User = {
  id: number
  email: string
  password_hash: string
  name: string
  avatar_url?: string
  timezone: string
  theme: string
  language: string
  currency: string
  date_format: string
  created_at: Date
  updated_at: Date
  last_login?: Date
  is_active: boolean
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE id = ${id}`
  return result.length > 0 ? result[0] : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result.length > 0 ? result[0] : null
}

export async function createUser(user: Omit<User, "id" | "created_at" | "updated_at">): Promise<User> {
  const result = await sql`
    INSERT INTO users (
      email, password_hash, name, avatar_url, timezone, theme, language, currency, date_format, is_active
    ) VALUES (
      ${user.email}, ${user.password_hash}, ${user.name}, ${user.avatar_url}, 
      ${user.timezone}, ${user.theme}, ${user.language}, ${user.currency}, 
      ${user.date_format}, ${user.is_active}
    )
    RETURNING *
  `
  return result[0]
}

export async function updateUser(id: number, updates: Partial<Omit<User, "id" | "created_at">>): Promise<User | null> {
  // Build dynamic update query using individual updates
  const updateFields = []
  const values = []

  if (updates.name !== undefined) {
    updateFields.push("name = $" + (values.length + 2))
    values.push(updates.name)
  }
  if (updates.email !== undefined) {
    updateFields.push("email = $" + (values.length + 2))
    values.push(updates.email)
  }
  if (updates.avatar_url !== undefined) {
    updateFields.push("avatar_url = $" + (values.length + 2))
    values.push(updates.avatar_url)
  }
  if (updates.timezone !== undefined) {
    updateFields.push("timezone = $" + (values.length + 2))
    values.push(updates.timezone)
  }
  if (updates.theme !== undefined) {
    updateFields.push("theme = $" + (values.length + 2))
    values.push(updates.theme)
  }
  if (updates.language !== undefined) {
    updateFields.push("language = $" + (values.length + 2))
    values.push(updates.language)
  }
  if (updates.currency !== undefined) {
    updateFields.push("currency = $" + (values.length + 2))
    values.push(updates.currency)
  }
  if (updates.date_format !== undefined) {
    updateFields.push("date_format = $" + (values.length + 2))
    values.push(updates.date_format)
  }
  if (updates.is_active !== undefined) {
    updateFields.push("is_active = $" + (values.length + 2))
    values.push(updates.is_active)
  }

  if (updateFields.length === 0) return null

  const query = `
    UPDATE users 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *
  `

  const result = await sql.query(query, [id, ...values])
  return result.rows.length > 0 ? result.rows[0] : null
}

export async function updateLastLogin(id: number): Promise<void> {
  await sql`
    UPDATE users 
    SET last_login = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `
}

export async function deleteUser(id: number): Promise<boolean> {
  const result = await sql`DELETE FROM users WHERE id = ${id}`
  return result.count > 0
}
