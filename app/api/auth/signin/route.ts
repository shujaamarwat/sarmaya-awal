import { NextResponse } from "next/server"
import { signIn } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const result = await signIn(email, password)

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, user: result.user })
  } catch (error) {
    console.error("Error signing in:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 