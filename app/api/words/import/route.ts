import { NextResponse } from "next/server"
import pool from "@/lib/db"
import { getSession } from "@/lib/auth"
import type { ResultSetHeader } from "mysql2"
import type { ParsedWord } from "@/lib/parse-import"

export async function POST(request: Request) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "Debes iniciar sesión para importar palabras" }, { status: 401 })
    }

    const { words, listName } = (await request.json()) as {
      words: ParsedWord[]
      listName?: string
    }

    if (!words || words.length === 0) {
      return NextResponse.json({ error: "No hay palabras para importar" }, { status: 400 })
    }

    const userId = session.user.id
    let listId: number | null = null

    // Create word list if name provided
    if (listName) {
      const [listResult] = await pool.execute<ResultSetHeader>("INSERT INTO word_lists (name, user_id) VALUES (?, ?)", [
        listName,
        userId,
      ])
      listId = listResult.insertId
    }

    // Insert words
    let imported = 0
    let skipped = 0

    for (const word of words) {
      try {
        const [result] = await pool.execute<ResultSetHeader>(
          `INSERT INTO words (word, definition, example, difficulty, user_id, is_custom) 
           VALUES (?, ?, ?, ?, ?, TRUE)
           ON DUPLICATE KEY UPDATE id=id`,
          [word.word, word.definition, word.example || "", word.difficulty || "medium", userId],
        )

        if (result.insertId && listId) {
          // Add to list
          await pool.execute("INSERT IGNORE INTO word_list_items (list_id, word_id) VALUES (?, ?)", [
            listId,
            result.insertId,
          ])
        }

        if (result.affectedRows > 0) {
          imported++
        } else {
          skipped++
        }
      } catch {
        skipped++
      }
    }

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: words.length,
      listId,
    })
  } catch (error) {
    console.error("Import error:", error)
    return NextResponse.json({ error: "Error al importar palabras" }, { status: 500 })
  }
}
