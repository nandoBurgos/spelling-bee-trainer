import { cookies } from "next/headers"
import { supabaseAdmin } from "./supabase"
import type { User, Session } from "./types"

export async function hashPassword(password: string): Promise<string> {
  // Supabase handles password hashing automatically
  // This is kept for compatibility but won't be used
  return password
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Supabase handles password verification through auth API
  // This is kept for compatibility but won't be used
  return password === hash
}

export function generateSessionId(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}

export async function createSession(userId: number): Promise<string> {
  // Session is managed by Supabase Auth
  // This function is kept for compatibility
  return ""
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get("sb-access-token")?.value
    const refreshToken = cookieStore.get("sb-refresh-token")?.value

    if (!authToken) return null

    // Get user from Supabase auth
    const { data, error } = await supabaseAdmin.auth.getUser(authToken)

    if (error || !data.user) return null

    // Get user profile from public.users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", data.user.id)
      .single()

    if (profileError || !userProfile) return null

    return {
      user: {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        password_hash: "",
        biometric_credential_id: userProfile.biometric_credential_id,
        created_at: new Date(userProfile.created_at),
        updated_at: new Date(userProfile.updated_at),
      },
      session: {
        id: data.user.id,
        user_id: userProfile.id,
        expires_at: new Date(data.user.user_metadata?.expires_at || Date.now() + 7 * 24 * 60 * 60 * 1000),
        created_at: new Date(),
      },
    }
  } catch (error) {
    console.error("Get session error:", error)
    return null
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("sb-access-token")
  cookieStore.delete("sb-refresh-token")
}

export async function generateResetToken(email: string): Promise<string | null> {
  try {
    // Supabase handles password reset via magic link
    // Return a placeholder token for API compatibility
    return "reset-token-generated"
  } catch (error) {
    console.error("Generate reset token error:", error)
    return null
  }
}

export async function verifyResetToken(token: string): Promise<number | null> {
  // Token verification is handled by Supabase
  return null
}

export async function resetPassword(userId: number, newPassword: string): Promise<void> {
  try {
    await supabaseAdmin.auth.admin.updateUserById(String(userId), {
      password: newPassword,
    })
  } catch (error) {
    console.error("Reset password error:", error)
    throw error
  }
}

