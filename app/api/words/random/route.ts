import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"
import type { RowDataPacket } from "mysql2"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const difficulty = searchParams.get("difficulty")
    const count = Math.min(Number.parseInt(searchParams.get("count") || "1"), 100)

    const session = await getSession()
    const userId = session?.user?.id

    let query = `
      SELECT id, word, definition, example, difficulty, category, is_custom 
      FROM words 
      WHERE (is_custom = FALSE OR user_id = ?)
    `
    const params: (string | number | null)[] = [userId || null]

    if (difficulty && difficulty !== "all") {
      query += " AND difficulty = ?"
      params.push(difficulty)
    }

    query += " ORDER BY RAND() LIMIT ?"
    params.push(count)

    const [rows] = await pool.execute<RowDataPacket[]>(query, params)

    return NextResponse.json({ words: rows })
  } catch (error) {
    console.error("Get random word error:", error)
    return NextResponse.json({ error: "Error al obtener palabra" }, { status: 500 })
  }
}
