import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"
import type { RowDataPacket } from "mysql2"

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

    let query = `
      SELECT w.id, w.word, w.definition, w.example, w.difficulty, w.category, w.is_custom 
      FROM words w
      WHERE (w.is_custom = FALSE OR w.user_id = ?)
    `
    const params: (string | number | null)[] = [userId || null]

    // If listId provided, join through word_list_items
    if (listId) {
      query = `
        SELECT w.id, w.word, w.definition, w.example, w.difficulty, w.category, w.is_custom
        FROM words w
        JOIN word_list_items li ON li.word_id = w.id
        WHERE li.list_id = ? AND (w.is_custom = FALSE OR w.user_id = ?)
      `
      params.length = 0
      params.push(listId, userId || null)
    }

    if (difficulty && difficulty !== "all") {
      query += " AND difficulty = ?"
      params.push(difficulty)
    }

    if (random) {
      query += " ORDER BY RAND()"
    } else {
      query += " ORDER BY word ASC"
    }

    query += " LIMIT ? OFFSET ?"
    params.push(limit, offset)

    const [rows] = await pool.execute<RowDataPacket[]>(query, params)

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM words w
      WHERE (w.is_custom = FALSE OR w.user_id = ?)
    `
    const countParams: (string | number | null)[] = [userId || null]

    if (listId) {
      countQuery = `
        SELECT COUNT(*) as total
        FROM words w
        JOIN word_list_items li ON li.word_id = w.id
        WHERE li.list_id = ? AND (w.is_custom = FALSE OR w.user_id = ?)
      `
      countParams.length = 0
      countParams.push(listId, userId || null)
    }

    if (difficulty && difficulty !== "all") {
      countQuery += " AND difficulty = ?"
      countParams.push(difficulty)
    }

    const [countResult] = await pool.execute<RowDataPacket[]>(countQuery, countParams)
    const total = countResult[0].total

    return NextResponse.json({ words: rows, total })
  } catch (error) {
    console.error("Get words error:", error)
    return NextResponse.json({ error: "Error al obtener palabras" }, { status: 500 })
  }
}
