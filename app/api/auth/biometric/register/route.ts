import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    const { credentialId } = await request.json()

    if (!credentialId) {
      return NextResponse.json({ error: "Credential ID requerido" }, { status: 400 })
    }

    await pool.execute("UPDATE users SET biometric_credential_id = ? WHERE id = ?", [credentialId, session.user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Biometric registration error:", error)
    return NextResponse.json({ error: "Error al registrar biometría" }, { status: 500 })
  }
}
