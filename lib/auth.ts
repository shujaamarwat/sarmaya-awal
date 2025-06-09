"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createHash, randomBytes } from "crypto"
import { getUserByEmail, createUser, updateLastLogin, getUserById } from "./data/users"

// Simple password hashing (in production, use a proper library like bcrypt)
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

// Generate a session token
function generateSessionToken(): string {
  return randomBytes(32).toString("hex")
}

export async function signUp(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return { success: false, message: "User already exists" }
  }

  // Create user
  const hashedPassword = hashPassword(password)
  const user = await createUser({
    email,
    password_hash: hashedPassword,
    name,
    timezone: "UTC-5",
    theme: "dark",
    language: "en",
    currency: "USD",
    date_format: "MM/DD/YYYY",
    is_active: true,
  })

  // Create session
  const sessionToken = generateSessionToken()
  const cookieStore = await cookies()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  cookieStore.set("user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  await updateLastLogin(user.id)

  return { success: true, user }
}

export async function signIn(email: string, password: string) {
  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, message: "Invalid credentials" }
  }

  const hashedPassword = hashPassword(password)
  if (user.password_hash !== hashedPassword) {
    return { success: false, message: "Invalid credentials" }
  }

  // Create session
  const sessionToken = generateSessionToken()
  const cookieStore = await cookies()
  cookieStore.set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  cookieStore.set("user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  await updateLastLogin(user.id)

  return { success: true, user }
}

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete("session_token")
  cookieStore.delete("user_id")
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("session_token")?.value
  const userId = cookieStore.get("user_id")?.value

  if (!sessionToken || !userId) {
    return null
  }

  const user = await getUserById(parseInt(userId))
  return user
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/login")
  }
  return session
}

// Client-side hook for getting user data
export async function getCurrentUser() {
  try {
    const session = await getSession()
    return session
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
