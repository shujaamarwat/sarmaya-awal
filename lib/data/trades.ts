"use server"

import { sql } from "../db"

export type Trade = {
  id: number
  user_id: number
  backtest_id?: number
  strategy_id?: number
  symbol: string
  action: "BUY" | "SELL"
  quantity: number
  price: number
  timestamp: Date
  pnl?: number
  commission?: number
  is_live: boolean
  created_at: Date
}

export async function getTradesByUserId(
  userId: number,
  options?: {
    limit?: number
    offset?: number
    symbol?: string
    isLive?: boolean
    backtestId?: number
  },
): Promise<Trade[]> {
  try {
    let query = `SELECT * FROM trades WHERE user_id = $1`
    const params = [userId]
    let paramIndex = 2

    if (options?.symbol) {
      query += ` AND symbol = $${paramIndex++}`
      params.push(options.symbol)
    }

    if (options?.isLive !== undefined) {
      query += ` AND is_live = $${paramIndex++}`
      params.push(options.isLive)
    }

    if (options?.backtestId) {
      query += ` AND backtest_id = $${paramIndex++}`
      params.push(options.backtestId)
    }

    query += ` ORDER BY timestamp DESC`

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
    console.error("Error fetching trades:", error)
    return []
  }
}

export async function createTrade(trade: Omit<Trade, "id" | "created_at">): Promise<Trade> {
  const result = await sql`
    INSERT INTO trades (
      user_id, backtest_id, strategy_id, symbol, action, quantity,
      price, timestamp, pnl, commission, is_live
    ) VALUES (
      ${trade.user_id}, ${trade.backtest_id}, ${trade.strategy_id}, 
      ${trade.symbol}, ${trade.action}, ${trade.quantity},
      ${trade.price}, ${trade.timestamp}, ${trade.pnl}, 
      ${trade.commission}, ${trade.is_live}
    )
    RETURNING *
  `
  return result[0]
}

export async function bulkInsertTrades(trades: Omit<Trade, "id" | "created_at">[]): Promise<number> {
  if (trades.length === 0) return 0

  // For bulk inserts, we'll use individual inserts in a transaction
  let insertedCount = 0

  for (const trade of trades) {
    await sql`
      INSERT INTO trades (
        user_id, backtest_id, strategy_id, symbol, action, quantity,
        price, timestamp, pnl, commission, is_live
      ) VALUES (
        ${trade.user_id}, ${trade.backtest_id}, ${trade.strategy_id}, 
        ${trade.symbol}, ${trade.action}, ${trade.quantity},
        ${trade.price}, ${trade.timestamp}, ${trade.pnl}, 
        ${trade.commission}, ${trade.is_live}
      )
    `
    insertedCount++
  }

  return insertedCount
}

export async function getTradeStats(userId: number, options?: { symbol?: string; isLive?: boolean }) {
  try {
    let query = `
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN action = 'BUY' THEN 1 ELSE 0 END) as buy_count,
        SUM(CASE WHEN action = 'SELL' THEN 1 ELSE 0 END) as sell_count,
        SUM(pnl) as total_pnl,
        AVG(pnl) as avg_pnl,
        SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END)::float / COUNT(*)::float * 100 as win_rate
      FROM trades
      WHERE user_id = $1
    `
    const params = [userId]
    let paramIndex = 2

    if (options?.symbol) {
      query += ` AND symbol = $${paramIndex++}`
      params.push(options.symbol)
    }

    if (options?.isLive !== undefined) {
      query += ` AND is_live = $${paramIndex++}`
      params.push(options.isLive)
    }

    const result = await sql.query(query, params)
    return result.rows[0] || {}
  } catch (error) {
    console.error("Error fetching trade stats:", error)
    return {}
  }
}
