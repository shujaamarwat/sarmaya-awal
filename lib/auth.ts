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

  // Create new user
  const hashedPassword = hashPassword(password)
  const user = await createUser({
    email,
    password_hash: hashedPassword,
    name,
    timezone: "UTC",
    theme: "dark",
    language: "en",
    currency: "USD",
    date_format: "MM/DD/YYYY",
    is_active: true,
  })

  // Create session
  const sessionToken = generateSessionToken()
  cookies().set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  // Store user ID in a separate cookie for easy access
  cookies().set("user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true, user }
}

export async function signIn(email: string, password: string) {
  // Find user
  const user = await getUserByEmail(email)
  if (!user) {
    return { success: false, message: "Invalid email or password" }
  }

  // Check password
  const hashedPassword = hashPassword(password)
  if (user.password_hash !== hashedPassword) {
    return { success: false, message: "Invalid email or password" }
  }

  // Update last login
  await updateLastLogin(user.id)

  // Create session
  const sessionToken = generateSessionToken()
  cookies().set("session_token", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  // Store user ID in a separate cookie for easy access
  cookies().set("user_id", user.id.toString(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  })

  return { success: true, user }
}

export async function signOut() {
  cookies().delete("session_token")
  cookies().delete("user_id")
  redirect("/login")
}

export async function getSession() {
  const sessionToken = cookies().get("session_token")?.value
  const userId = cookies().get("user_id")?.value

  if (!sessionToken || !userId) {
    return null
  }

  try {
    // Get user from database
    const user = await getUserById(Number.parseInt(userId))
    if (!user || !user.is_active) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatar_url,
    }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
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
