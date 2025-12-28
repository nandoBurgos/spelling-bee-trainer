import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
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

    const { error } = await supabaseAdmin
      .from("users")
      .update({ biometric_credential_id: credentialId })
      .eq("id", session.user.id)

    if (error) {
      console.error("Update error:", error)
      return NextResponse.json({ error: "Error al registrar biometría" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Biometric registration error:", error)
    return NextResponse.json({ error: "Error al registrar biometría" }, { status: 500 })
  }
}
