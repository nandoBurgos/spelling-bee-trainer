import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import pool from "./db"
import type { RowDataPacket } from "mysql2"
import type { User, Session } from "./types"

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateSessionId(): string {
  return crypto.randomUUID() + crypto.randomUUID()
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await pool.execute("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)", [sessionId, userId, expiresAt])

  const cookieStore = await cookies()
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  })

  return sessionId
}

export async function getSession(): Promise<{ user: User; session: Session } | null> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (!sessionId) return null

  const [rows] = await pool.execute<RowDataPacket[]>(
    `SELECT u.*, s.id as session_id, s.expires_at 
     FROM sessions s 
     JOIN users u ON s.user_id = u.id 
     WHERE s.id = ? AND s.expires_at > NOW()`,
    [sessionId],
  )

  if (rows.length === 0) return null

  const row = rows[0]
  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.name,
      password_hash: row.password_hash,
      biometric_credential_id: row.biometric_credential_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    session: {
      id: row.session_id,
      user_id: row.id,
      expires_at: row.expires_at,
      created_at: row.created_at,
    },
  }
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value

  if (sessionId) {
    await pool.execute("DELETE FROM sessions WHERE id = ?", [sessionId])
    cookieStore.delete("session_id")
  }
}

export async function generateResetToken(email: string): Promise<string | null> {
  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

  const [result] = await pool.execute("UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?", [
    token,
    expires,
    email,
  ])

  const affected = (result as { affectedRows: number }).affectedRows
  return affected > 0 ? token : null
}

export async function verifyResetToken(token: string): Promise<number | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(
    "SELECT id FROM users WHERE reset_token = ? AND reset_token_expires > NOW()",
    [token],
  )

  return rows.length > 0 ? rows[0].id : null
}

export async function resetPassword(userId: number, newPassword: string): Promise<void> {
  const hash = await hashPassword(newPassword)
  await pool.execute(
    "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
    [hash, userId],
  )
}
