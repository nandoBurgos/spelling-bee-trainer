import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")
    const count = Math.min(Number.parseInt(searchParams.get("count") || "1"), 100)

    const session = await getSession()
    const userId = session?.user?.id

    let query = supabaseAdmin
      .from("words")
      .select("id, word, definition, example, difficulty, category, is_custom")

    // Filter by difficulty if specified
    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty", difficulty)
    }

    // Show public words OR user's custom words
    if (userId) {
      query = query.or(`is_custom.eq.false,user_id.eq.${userId}`)
    } else {
      query = query.eq("is_custom", false)
    }

    // Get random words - Supabase doesn't have RAND(), so we'll fetch and shuffle
    const { data: words, error } = await query.limit(count * 2) // Fetch more to account for filtering

    if (error) {
      console.error("Query error:", error)
      return NextResponse.json({ error: "Error al obtener palabra" }, { status: 500 })
    }

    // Shuffle and limit
    const shuffled = (words || [])
      .sort(() => Math.random() - 0.5)
      .slice(0, count)

    return NextResponse.json({ words: shuffled })
  } catch (error) {
    console.error("Get random word error:", error)
    return NextResponse.json({ error: "Error al obtener palabra" }, { status: 500 })
  }
}
