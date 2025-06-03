import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a SQL client with the connection string
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Helper function for transactions
export async function withTransaction<T>(callback: (db: any) => Promise<T>): Promise<T> {
  try {
    await sql`BEGIN`
    const result = await callback(db)
    await sql`COMMIT`
    return result
  } catch (error) {
    await sql`ROLLBACK`
    throw error
  }
}

// Raw SQL execution helper
export async function executeRawQuery(query: string, params: any[] = []) {
  return sql.query(query, params)
}

// Export the raw SQL client for direct usage
export { sql }
