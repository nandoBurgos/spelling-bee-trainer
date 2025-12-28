import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getSession } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const random = searchParams.get("random") === "true"
    const listId = searchParams.get("listId")

    const session = await getSession()
    const userId = session?.user?.id

    let query = supabaseAdmin
      .from("words")
      .select("id, word, definition, example, difficulty, category, is_custom")

    // Filter by difficulty if specified
    if (difficulty && difficulty !== "all") {
      query = query.eq("difficulty", difficulty)
    }

    // Filter by list if specified
    if (listId) {
      query = query.in(
        "id",
        supabaseAdmin.from("word_list_items").select("word_id").eq("list_id", listId),
      )
    }

    // Show public words OR user's custom words
    if (userId) {
      query = query.or(`is_custom.eq.false,user_id.eq.${userId}`)
    } else {
      query = query.eq("is_custom", false)
    }

    // Apply ordering
    if (random) {
      query = query.order("id", { ascending: false }) // Pseudo-random
    } else {
      query = query.order("word", { ascending: true })
    }

    // Apply limit and offset
    query = query.range(offset, offset + limit - 1)

    const { data: words, error } = await query

    if (error) {
      console.error("Query error:", error)
      return NextResponse.json({ error: "Error al obtener palabras" }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabaseAdmin
      .from("words")
      .select("id", { count: "exact", head: true })

    if (difficulty && difficulty !== "all") {
      countQuery = countQuery.eq("difficulty", difficulty)
    }

    if (listId) {
      countQuery = countQuery.in(
        "id",
        supabaseAdmin.from("word_list_items").select("word_id").eq("list_id", listId),
      )
    }

    if (userId) {
      countQuery = countQuery.or(`is_custom.eq.false,user_id.eq.${userId}`)
    } else {
      countQuery = countQuery.eq("is_custom", false)
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error("Count query error:", countError)
    }

    return NextResponse.json({ words: words || [], total: (count as number) || 0 })
  } catch (error) {
    console.error("Get words error:", error)
    return NextResponse.json({ error: "Error al obtener palabras" }, { status: 500 })
  }
}
