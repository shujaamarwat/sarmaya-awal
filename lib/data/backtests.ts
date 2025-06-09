import { sql } from "@/lib/db"

export interface Backtest {
  id: number
  user_id: number
  strategy_id: number
  name: string
  start_date: string
  end_date: string
  initial_capital: number
  status: string
  results: any
  created_at: string
  updated_at: string
}

export async function getBacktestsByUserId(userId: number): Promise<Backtest[]> {
  try {
    const result = await sql`
      SELECT * FROM backtests 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `
    return Array.isArray(result) ? result : []
  } catch (error) {
    console.error("Error fetching backtests:", error)
    return []
  }
}

export async function createBacktest(backtest: Omit<Backtest, "id" | "created_at" | "updated_at">): Promise<Backtest> {
  try {
    const result = await sql`
      INSERT INTO backtests (
        user_id, strategy_id, name, start_date, end_date, 
        initial_capital, status, results
      ) VALUES (
        ${backtest.user_id}, ${backtest.strategy_id}, ${backtest.name}, 
        ${backtest.start_date}, ${backtest.end_date}, ${backtest.initial_capital},
        ${backtest.status}, ${JSON.stringify(backtest.results)}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating backtest:", error)
    throw error
  }
}

export async function deleteBacktest(id: number, userId: number): Promise<boolean> {
  try {
    const result = await sql`
      DELETE FROM backtests 
      WHERE id = ${id} AND user_id = ${userId}
    `
    return result.count > 0
  } catch (error) {
    console.error("Error deleting backtest:", error)
    return false
  }
}

export async function getBacktestById(id: number, userId: number): Promise<Backtest | null> {
  try {
    const result = await sql`
      SELECT * FROM backtests 
      WHERE id = ${id} AND user_id = ${userId}
    `
    return result[0] || null
  } catch (error) {
    console.error("Error fetching backtest by ID:", error)
    return null
  }
}

export async function updateBacktest(id: number, userId: number, updates: Partial<Backtest>): Promise<Backtest | null> {
  try {
    const result = await sql`
      UPDATE backtests 
      SET 
        name = COALESCE(${updates.name}, name),
        start_date = COALESCE(${updates.start_date}, start_date),
        end_date = COALESCE(${updates.end_date}, end_date),
        initial_capital = COALESCE(${updates.initial_capital}, initial_capital),
        status = COALESCE(${updates.status}, status),
        results = COALESCE(${updates.results ? JSON.stringify(updates.results) : null}, results),
        updated_at = NOW()
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `
    return result[0] || null
  } catch (error) {
    console.error("Error updating backtest:", error)
    return null
  }
}
