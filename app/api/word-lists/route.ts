import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ lists: [] })
    }

    const { data: lists, error } = await supabaseAdmin
      .from("word_lists")
      .select("id, name, user_id")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Query error:", error)
      return NextResponse.json({ error: "Error al obtener listas" }, { status: 500 })
    }

    return NextResponse.json({ lists: lists || [] })
  } catch (error) {
    console.error("Get lists error:", error)
    return NextResponse.json({ error: "Error al obtener listas" }, { status: 500 })
  }
}

