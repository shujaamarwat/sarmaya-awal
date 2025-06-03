"use server"

import { sql } from "../db"

export type SentimentData = {
  id: number
  symbol: string
  source: string
  content: string
  sentiment_score?: number
  confidence_score?: number
  relevance_score?: number
  url?: string
  author?: string
  timestamp: Date
  created_at: Date
}

export async function getSentimentData(
  symbol: string,
  options?: {
    startDate?: Date
    endDate?: Date
    sources?: string[]
    limit?: number
    offset?: number
  },
): Promise<SentimentData[]> {
  let query = `
    SELECT * FROM sentiment_data 
    WHERE symbol = ${symbol}
  `

  if (options?.startDate && options?.endDate) {
    query += ` AND timestamp BETWEEN ${options.startDate} AND ${options.endDate}`
  }

  if (options?.sources && options.sources.length > 0) {
    const sourceList = options.sources.map((s) => `'${s}'`).join(", ")
    query += ` AND source IN (${sourceList})`
  }

  query += ` ORDER BY timestamp DESC`

  if (options?.limit) {
    query += ` LIMIT ${options.limit}`
  }

  if (options?.offset) {
    query += ` OFFSET ${options.offset}`
  }

  return await sql<SentimentData[]>(query)
}

export async function insertSentimentData(data: Omit<SentimentData, "id" | "created_at">): Promise<SentimentData> {
  const result = await sql<SentimentData[]>`
    INSERT INTO sentiment_data (
      symbol, source, content, sentiment_score, confidence_score,
      relevance_score, url, author, timestamp
    ) VALUES (
      ${data.symbol}, ${data.source}, ${data.content}, 
      ${data.sentiment_score}, ${data.confidence_score}, ${data.relevance_score}, 
      ${data.url}, ${data.author}, ${data.timestamp}
    )
    RETURNING *
  `
  return result[0]
}

export async function bulkInsertSentimentData(dataArray: Omit<SentimentData, "id" | "created_at">[]): Promise<number> {
  if (dataArray.length === 0) return 0

  // Build values part of the query
  const values = dataArray
    .map(
      (data) => `(
    ${data.symbol}, ${data.source}, ${data.content}, 
    ${data.sentiment_score}, ${data.confidence_score}, ${data.relevance_score}, 
    ${data.url}, ${data.author}, ${data.timestamp}
  )`,
    )
    .join(", ")

  const query = `
    INSERT INTO sentiment_data (
      symbol, source, content, sentiment_score, confidence_score,
      relevance_score, url, author, timestamp
    ) VALUES ${values}
  `

  const result = await sql(query)
  return result.count
}

export async function getSentimentSummary(symbol: string, startDate: Date, endDate: Date) {
  return await sql`
    SELECT 
      source,
      AVG(sentiment_score) as avg_sentiment,
      AVG(confidence_score) as avg_confidence,
      COUNT(*) as count
    FROM sentiment_data
    WHERE symbol = ${symbol}
      AND timestamp BETWEEN ${startDate} AND ${endDate}
    GROUP BY source
    ORDER BY count DESC
  `
}
