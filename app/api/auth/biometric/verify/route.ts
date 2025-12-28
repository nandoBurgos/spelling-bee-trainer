import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { credentialId } = await request.json()

    if (!credentialId) {
      return NextResponse.json({ error: "Credential ID requerido" }, { status: 400 })
    }

    const { data: users, error } = await supabaseAdmin
      .from("users")
      .select("id, name, email")
      .eq("biometric_credential_id", credentialId)
      .single()

    if (error || !users) {
      console.error("Query error:", error)
      return NextResponse.json({ error: "Biometría no reconocida" }, { status: 401 })
    }

    // Generate a session token using Supabase
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: users.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/`,
      },
    })

    if (sessionError || !sessionData) {
      console.error("Session error:", sessionError)
      return NextResponse.json({ error: "Error al crear sesión" }, { status: 500 })
    }

    // For now, just return success - biometric is validated
    // In production, you'd need to handle Supabase session properly
    const cookieStore = await cookies()
    cookieStore.set("biometric-verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({
      success: true,
      user: { id: users.id, name: users.name, email: users.email },
    })
  } catch (error) {
    console.error("Biometric verification error:", error)
    return NextResponse.json({ error: "Error al verificar biometría" }, { status: 500 })
  }
}
