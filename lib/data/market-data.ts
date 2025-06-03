"use server"

import { sql } from "../db"

export type MarketData = {
  id: number
  symbol: string
  date: Date
  open_price?: number
  high_price?: number
  low_price?: number
  close_price?: number
  volume?: number
  adjusted_close?: number
  created_at: Date
}

export async function getMarketData(symbol: string, startDate: Date, endDate: Date): Promise<MarketData[]> {
  return await sql`
    SELECT * FROM market_data 
    WHERE symbol = ${symbol}
      AND date BETWEEN ${startDate} AND ${endDate}
    ORDER BY date ASC
  `
}

export async function getLatestMarketData(symbol: string): Promise<MarketData | null> {
  const result = await sql`
    SELECT * FROM market_data 
    WHERE symbol = ${symbol}
    ORDER BY date DESC
    LIMIT 1
  `
  return result.length > 0 ? result[0] : null
}

export async function insertMarketData(data: Omit<MarketData, "id" | "created_at">): Promise<MarketData> {
  const result = await sql`
    INSERT INTO market_data (
      symbol, date, open_price, high_price, low_price,
      close_price, volume, adjusted_close
    ) VALUES (
      ${data.symbol}, ${data.date}, ${data.open_price}, 
      ${data.high_price}, ${data.low_price}, ${data.close_price}, 
      ${data.volume}, ${data.adjusted_close}
    )
    ON CONFLICT (symbol, date) DO UPDATE SET
      open_price = EXCLUDED.open_price,
      high_price = EXCLUDED.high_price,
      low_price = EXCLUDED.low_price,
      close_price = EXCLUDED.close_price,
      volume = EXCLUDED.volume,
      adjusted_close = EXCLUDED.adjusted_close
    RETURNING *
  `
  return result[0]
}

export async function bulkInsertMarketData(dataArray: Omit<MarketData, "id" | "created_at">[]): Promise<number> {
  if (dataArray.length === 0) return 0

  let insertedCount = 0

  for (const data of dataArray) {
    await sql`
      INSERT INTO market_data (
        symbol, date, open_price, high_price, low_price,
        close_price, volume, adjusted_close
      ) VALUES (
        ${data.symbol}, ${data.date}, ${data.open_price}, 
        ${data.high_price}, ${data.low_price}, ${data.close_price}, 
        ${data.volume}, ${data.adjusted_close}
      )
      ON CONFLICT (symbol, date) DO UPDATE SET
        open_price = EXCLUDED.open_price,
        high_price = EXCLUDED.high_price,
        low_price = EXCLUDED.low_price,
        close_price = EXCLUDED.close_price,
        volume = EXCLUDED.volume,
        adjusted_close = EXCLUDED.adjusted_close
    `
    insertedCount++
  }

  return insertedCount
}
