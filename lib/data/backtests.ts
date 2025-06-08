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
