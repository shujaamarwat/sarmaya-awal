import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session_token")
    cookieStore.delete("user_id")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
