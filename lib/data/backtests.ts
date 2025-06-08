"use server"

import { sql } from "../db"

export type Backtest = {
  id: number
  user_id: number
  strategy_id: number
  name: string
  asset: string
  start_date: Date
  end_date: Date
  status: "pending" | "running" | "completed" | "failed"
  total_return?: number
  sharpe_ratio?: number
  max_drawdown?: number
  win_rate?: number
  total_trades?: number
  parameters?: Record<string, any>
  results?: Record<string, any>
  error_message?: string
  created_at: Date
  updated_at?: Date
  completed_at?: Date
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

export async function getBacktestById(id: number, userId: number): Promise<Backtest | null> {
  try {
    const result = await sql`
      SELECT * FROM backtests 
      WHERE id = ${id} AND user_id = ${userId}
    `
    return result.length > 0 ? result[0] : null
  } catch (error) {
    console.error("Error fetching backtest:", error)
    return null
  }
}

export async function createBacktest(
  backtest: Omit<Backtest, "id" | "created_at" | "updated_at" | "completed_at">,
): Promise<Backtest> {
  try {
    const result = await sql`
      INSERT INTO backtests (
        user_id, strategy_id, name, asset, start_date, end_date, status,
        parameters, total_return, sharpe_ratio, max_drawdown, win_rate, total_trades, results, error_message
      ) VALUES (
        ${backtest.user_id}, ${backtest.strategy_id}, ${backtest.name}, 
        ${backtest.asset}, ${backtest.start_date}, ${backtest.end_date}, 
        ${backtest.status}, ${backtest.parameters ? JSON.stringify(backtest.parameters) : null},
        ${backtest.total_return || null}, ${backtest.sharpe_ratio || null}, 
        ${backtest.max_drawdown || null}, ${backtest.win_rate || null}, 
        ${backtest.total_trades || null}, ${backtest.results ? JSON.stringify(backtest.results) : null},
        ${backtest.error_message || null}
      )
      RETURNING *
    `
    return result[0]
  } catch (error) {
    console.error("Error creating backtest:", error)
    throw error
  }
}

export async function updateBacktestStatus(
  id: number,
  userId: number,
  status: "pending" | "running" | "completed" | "failed",
  results?: {
    total_return?: number
    sharpe_ratio?: number
    max_drawdown?: number
    win_rate?: number
    total_trades?: number
    results?: Record<string, any>
    error_message?: string
  },
): Promise<Backtest | null> {
  try {
    const updateFields = ["status = $3", "updated_at = CURRENT_TIMESTAMP"]
    const params = [id, userId, status]
    let paramIndex = 4

    if (status === "completed" || status === "failed") {
      updateFields.push("completed_at = CURRENT_TIMESTAMP")
    }

    if (results) {
      if (results.total_return !== undefined) {
        updateFields.push(`total_return = $${paramIndex++}`)
        params.push(results.total_return)
      }
      if (results.sharpe_ratio !== undefined) {
        updateFields.push(`sharpe_ratio = $${paramIndex++}`)
        params.push(results.sharpe_ratio)
      }
      if (results.max_drawdown !== undefined) {
        updateFields.push(`max_drawdown = $${paramIndex++}`)
        params.push(results.max_drawdown)
      }
      if (results.win_rate !== undefined) {
        updateFields.push(`win_rate = $${paramIndex++}`)
        params.push(results.win_rate)
      }
      if (results.total_trades !== undefined) {
        updateFields.push(`total_trades = $${paramIndex++}`)
        params.push(results.total_trades)
      }
      if (results.results) {
        updateFields.push(`results = $${paramIndex++}`)
        params.push(JSON.stringify(results.results))
      }
      if (results.error_message) {
        updateFields.push(`error_message = $${paramIndex++}`)
        params.push(results.error_message)
      }
    }

    const query = `
      UPDATE backtests 
      SET ${updateFields.join(", ")}
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `

    const result = await sql.query(query, params)
    return result.rows.length > 0 ? result.rows[0] : null
  } catch (error) {
    console.error("Error updating backtest:", error)
    return null
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

export async function getBacktestSummaryStats(userId: number) {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) as total_backtests,
        AVG(total_return) as avg_return,
        MAX(sharpe_ratio) as best_sharpe,
        COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float * 100 as success_rate
      FROM backtests
      WHERE user_id = ${userId}
    `
    return (
      result[0] || {
        total_backtests: 0,
        avg_return: 0,
        best_sharpe: 0,
        success_rate: 0,
      }
    )
  } catch (error) {
    console.error("Error fetching backtest summary:", error)
    return {
      total_backtests: 0,
      avg_return: 0,
      best_sharpe: 0,
      success_rate: 0,
    }
  }
}
