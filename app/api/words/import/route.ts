import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import { getSession } from "@/lib/auth"
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
      const { data: newList, error: listError } = await supabaseAdmin
        .from("word_lists")
        .insert({ name: listName, user_id: userId })
        .select("id")
        .single()

      if (listError || !newList) {
        console.error("List creation error:", listError)
        return NextResponse.json({ error: "Error al crear lista" }, { status: 500 })
      }

      listId = newList.id
    }

    // Insert words
    let imported = 0
    let skipped = 0

    for (const word of words) {
      try {
        // Insert word (Supabase handles duplicates via constraints)
        const { data: existingWord, error: checkError } = await supabaseAdmin
          .from("words")
          .select("id")
          .eq("word", word.word)
          .eq("user_id", userId)
          .eq("is_custom", true)
          .single()

        let wordId: number

        if (!checkError && existingWord) {
          // Word exists
          wordId = existingWord.id
          skipped++
        } else {
          // Insert new word
          const { data: newWord, error: insertError } = await supabaseAdmin
            .from("words")
            .insert({
              word: word.word,
              definition: word.definition,
              example: word.example || "",
              difficulty: word.difficulty || "medium",
              user_id: userId,
              is_custom: true,
            })
            .select("id")
            .single()

          if (insertError || !newWord) {
            skipped++
            continue
          }

          wordId = newWord.id
          imported++
        }

        // Add to list if listId exists
        if (listId) {
          await supabaseAdmin.from("word_list_items").insert({
            list_id: listId,
            word_id: wordId,
          })
        }
      } catch (error) {
        console.error("Word import error:", error)
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
