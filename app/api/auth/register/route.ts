import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"
import type { ResultSetHeader, RowDataPacket } from "mysql2"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Check if email already exists
    const [existing] = await pool.execute<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [email])

    if (existing.length > 0) {
      return NextResponse.json({ error: "Este correo ya está registrado" }, { status: 400 })
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [name, email, passwordHash],
    )

    const userId = result.insertId

    // Create session
    await createSession(userId)

    return NextResponse.json({ success: true, userId })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
