import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"
import type { RowDataPacket } from "mysql2"

export async function GET() {
  try {
    const session = await getSession()
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ lists: [] })
    }

    const query = `SELECT id, name, user_id FROM word_lists WHERE user_id = ? ORDER BY name ASC`
    const [rows] = await pool.execute<RowDataPacket[]>(query, [userId])

    return NextResponse.json({ lists: rows })
  } catch (error) {
    console.error("Get lists error:", error)
    return NextResponse.json({ error: "Error al obtener listas" }, { status: 500 })
  }
}
