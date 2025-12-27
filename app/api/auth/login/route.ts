import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import type { RowDataPacket } from "mysql2"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son requeridos" }, { status: 400 })
    }

    // Find user
    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = rows[0]

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash)
    if (!isValid) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Create session
    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
