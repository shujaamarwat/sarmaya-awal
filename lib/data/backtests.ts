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
  completed_at?: Date
}

export async function getBacktestsByUserId(userId: number): Promise<Backtest[]> {
  return await sql`
    SELECT * FROM backtests 
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `
}

export async function getBacktestById(id: number, userId: number): Promise<Backtest | null> {
  const result = await sql`
    SELECT * FROM backtests 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.length > 0 ? result[0] : null
}

export async function createBacktest(
  backtest: Omit<Backtest, "id" | "created_at" | "completed_at">,
): Promise<Backtest> {
  const result = await sql`
    INSERT INTO backtests (
      user_id, strategy_id, name, asset, start_date, end_date, status,
      parameters
    ) VALUES (
      ${backtest.user_id}, ${backtest.strategy_id}, ${backtest.name}, 
      ${backtest.asset}, ${backtest.start_date}, ${backtest.end_date}, 
      ${backtest.status}, ${backtest.parameters ? JSON.stringify(backtest.parameters) : null}
    )
    RETURNING *
  `
  return result[0]
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
  const updateFields = ["status = $3"]
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
}

export async function deleteBacktest(id: number, userId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM backtests 
    WHERE id = ${id} AND user_id = ${userId}
  `
  return result.count > 0
}

export async function getBacktestSummaryStats(userId: number) {
  const result = await sql`
    SELECT 
      COUNT(*) as total_backtests,
      AVG(total_return) as avg_return,
      MAX(sharpe_ratio) as best_sharpe,
      COUNT(CASE WHEN status = 'completed' THEN 1 END)::float / COUNT(*)::float * 100 as success_rate
    FROM backtests
    WHERE user_id = ${userId}
  `
  return result[0]
}
