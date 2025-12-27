"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Volume2 } from "lucide-react"
import type { Word } from "@/lib/types"

interface WritingCardProps {
  word: Word
  onSpeak: (text: string) => void
  isSpeaking: boolean
  autoSpeak?: boolean
  showDefinition?: boolean
  onAnswered?: (correct: boolean) => void
}

export function WritingCard({ word, onSpeak, isSpeaking, autoSpeak = true, showDefinition = false, onAnswered }: WritingCardProps) {
  const [value, setValue] = useState("")
  const [result, setResult] = useState<null | boolean>(null)

  useEffect(() => {
    setValue("")
    setResult(null)
    if (autoSpeak && word) {
      const t = setTimeout(() => onSpeak(word.word), 200)
      return () => clearTimeout(t)
    }
  }, [word, autoSpeak, onSpeak])

  const normalize = (s: string) => s.trim().toLowerCase()

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const correct = normalize(value) === normalize(word.word)
    setResult(correct)
    onAnswered?.(correct)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Modo Escritura</h2>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => onSpeak(word.word)} disabled={isSpeaking}>
              <Volume2 className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {showDefinition && (
            <div>
              <p className="text-sm text-muted-foreground">{word.definition}</p>
              {word.example && <p className="text-sm italic text-muted-foreground">"{word.example}"</p>}
            </div>
          )}

          <div>
            <label className="text-sm mb-2 block">Escribe la palabra:</label>
            <Input value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit">Enviar</Button>
            {result === true && (
              <div className="flex items-center text-green-600"><Check className="mr-1" /> Correcto</div>
            )}
            {result === false && (
              <div className="flex items-center text-red-600"><X className="mr-1" /> Incorrecto — {word.word}</div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
