import * as XLSX from "xlsx"

export interface ParsedWord {
  word: string
  definition: string
  example: string
  difficulty?: "easy" | "medium" | "hard"
}

export interface ParseResult {
  words: ParsedWord[]
  errors: string[]
}

export function parseCSV(content: string): ParseResult {
  const words: ParsedWord[] = []
  const errors: string[] = []

  const lines = content.split(/\r?\n/).filter((line) => line.trim())

  // Skip header if present
  const startIndex = lines[0]?.toLowerCase().includes("word") ? 1 : 0

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    // Handle quoted CSV values
    const parts = parseCSVLine(line)

    if (parts.length >= 2) {
      const word = parts[0]?.trim()
      const definition = parts[1]?.trim()
      const example = parts[2]?.trim() || ""
      const difficulty = parseDifficulty(parts[3]?.trim())

      if (word && definition) {
        words.push({ word, definition, example, difficulty })
      } else {
        errors.push(`Línea ${i + 1}: Palabra o definición vacía`)
      }
    } else if (line.trim()) {
      errors.push(`Línea ${i + 1}: Formato inválido (se esperan al menos 2 columnas)`)
    }
  }

  return { words, errors }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"'
      i++ // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      result.push(current)
      current = ""
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function parseExcel(buffer: ArrayBuffer): ParseResult {
  const words: ParsedWord[] = []
  const errors: string[] = []

  try {
    const workbook = XLSX.read(buffer, { type: "array" })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

    // Skip header if present
    const startIndex = data[0]?.[0]?.toString().toLowerCase().includes("word") ? 1 : 0

    for (let i = startIndex; i < data.length; i++) {
      const row = data[i]
      if (!row || row.length === 0) continue

      const word = row[0]?.toString().trim()
      const definition = row[1]?.toString().trim()
      const example = row[2]?.toString().trim() || ""
      const difficulty = parseDifficulty(row[3]?.toString().trim())

      if (word && definition) {
        words.push({ word, definition, example, difficulty })
      } else if (word || definition) {
        errors.push(`Fila ${i + 1}: Palabra o definición vacía`)
      }
    }
  } catch (e) {
    errors.push("Error al leer el archivo Excel")
    console.error(e)
  }

  return { words, errors }
}

function parseDifficulty(value?: string): "easy" | "medium" | "hard" | undefined {
  if (!value) return undefined
  const lower = value.toLowerCase()
  if (lower === "easy" || lower === "fácil" || lower === "facil") return "easy"
  if (lower === "medium" || lower === "medio" || lower === "media") return "medium"
  if (lower === "hard" || lower === "difícil" || lower === "dificil") return "hard"
  return undefined
}
