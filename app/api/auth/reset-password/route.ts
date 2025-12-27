import { NextResponse } from "next/server"
import { generateResetToken, verifyResetToken, resetPassword } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json()

    // Request password reset
    if (email && !token) {
      const resetToken = await generateResetToken(email)

      if (resetToken) {
        // In a real app, send email with reset link
        // For now, we'll return the token (only for development)
        console.log(`Reset token for ${email}: ${resetToken}`)
        return NextResponse.json({
          success: true,
          message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
        })
      }

      return NextResponse.json({
        success: true,
        message: "Si el correo existe, recibirás instrucciones para restablecer tu contraseña",
      })
    }

    // Reset password with token
    if (token && newPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
      }

      const userId = await verifyResetToken(token)

      if (!userId) {
        return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
      }

      await resetPassword(userId, newPassword)

      return NextResponse.json({ success: true, message: "Contraseña actualizada correctamente" })
    }

    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Error al procesar solicitud" }, { status: 500 })
  }
}
