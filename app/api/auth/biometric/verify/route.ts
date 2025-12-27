import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { createSession } from "@/lib/auth"
import type { RowDataPacket } from "mysql2"

export async function POST(request: Request) {
  try {
    const { credentialId } = await request.json()

    if (!credentialId) {
      return NextResponse.json({ error: "Credential ID requerido" }, { status: 400 })
    }

    const [rows] = await pool.execute<RowDataPacket[]>(
      "SELECT id, name, email FROM users WHERE biometric_credential_id = ?",
      [credentialId],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Biometría no reconocida" }, { status: 401 })
    }

    const user = rows[0]
    await createSession(user.id)

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error("Biometric verification error:", error)
    return NextResponse.json({ error: "Error al verificar biometría" }, { status: 500 })
  }
}
