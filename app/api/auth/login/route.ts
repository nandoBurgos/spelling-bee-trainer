import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Correo y contraseña son requeridos" }, { status: 400 })
    }

    // Authenticate user with Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })

    if (error || !data.user || !data.session) {
      console.error("Auth error:", error)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("users")
      .select("id, email, name")
      .eq("id", data.user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json({ error: "Error al obtener perfil de usuario" }, { status: 500 })
    }

    // Set session cookies
    const cookieStore = await cookies()
    cookieStore.set("sb-access-token", data.session.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    cookieStore.set("sb-refresh-token", data.session.refresh_token || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
    })

    return NextResponse.json({
      success: true,
      user: { id: userProfile.id, name: userProfile.name, email: userProfile.email },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error al iniciar sesión" }, { status: 500 })
  }
}
