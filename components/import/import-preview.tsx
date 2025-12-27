"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ParsedWord } from "@/lib/parse-import"

interface ImportPreviewProps {
  words: ParsedWord[]
  errors: string[]
}

export function ImportPreview({ words, errors }: ImportPreviewProps) {
  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            Fácil
          </Badge>
        )
      case "medium":
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
            Medio
          </Badge>
        )
      case "hard":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200">
            Difícil
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            Medio
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="font-medium text-destructive mb-2">Errores encontrados ({errors.length}):</p>
          <ul className="list-disc list-inside text-sm text-destructive/80 space-y-1">
            {errors.slice(0, 5).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {errors.length > 5 && <li>...y {errors.length - 5} errores más</li>}
          </ul>
        </div>
      )}

      <div className="border rounded-lg">
        <div className="p-4 border-b bg-muted/50">
          <p className="font-medium">{words.length} palabras encontradas</p>
        </div>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Palabra</TableHead>
                <TableHead>Definición</TableHead>
                <TableHead className="w-[200px]">Ejemplo</TableHead>
                <TableHead className="w-[100px]">Dificultad</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.slice(0, 50).map((word, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium font-mono">{word.word}</TableCell>
                  <TableCell className="text-sm">{word.definition}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{word.example || "-"}</TableCell>
                  <TableCell>{getDifficultyBadge(word.difficulty)}</TableCell>
                </TableRow>
              ))}
              {words.length > 50 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    ...y {words.length - 50} palabras más
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  )
}
