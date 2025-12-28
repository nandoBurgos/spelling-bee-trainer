import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

const REDIRECT_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json()

    // Request password reset (send magic link)
    if (email && !token) {
      try {
        const { error } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: {
            redirectTo: `${REDIRECT_URL}/auth/reset-password?token=RECOVERY_TOKEN`,
          },
        })

        // Always return success message for security (don't reveal if email exists)
        console.log(`Password reset requested for: ${email}`)

        return NextResponse.json({
          success: true,
          message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
        })
      } catch (error) {
        console.error("Generate recovery link error:", error)
        return NextResponse.json({
          success: true,
          message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
        })
      }
    }

    // Reset password with token (from recovery email)
    if (token && newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "La contraseña debe tener al menos 8 caracteres" },
          { status: 400 },
        )
      }

      try {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(token, {
          password: newPassword,
        })

        if (error) {
          console.error("Update password error:", error)
          return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
        }

        return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
      } catch (error) {
        console.error("Reset password error:", error)
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
      }
    }

    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}
