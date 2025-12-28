import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 })
    }

    // Create user in Supabase Auth
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
    })

    if (authError || !data.user) {
      console.error("Auth error:", authError)
      return NextResponse.json({ error: "Error al crear usuario" }, { status: 400 })
    }

    // Create user profile in public.users table
    const { error: profileError } = await supabaseAdmin.from("users").insert({
      id: data.user.id,
      email,
      name,
    })

    if (profileError) {
      console.error("Profile error:", profileError)
      // Try to cleanup user from auth
      await supabaseAdmin.auth.admin.deleteUser(data.user.id)
      return NextResponse.json({ error: "Error al crear perfil de usuario" }, { status: 500 })
    }

    return NextResponse.json({ success: true, userId: data.user.id })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Error al registrar usuario" }, { status: 500 })
  }
}
