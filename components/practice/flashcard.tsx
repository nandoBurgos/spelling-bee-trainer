"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2, VolumeX, RotateCcw, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Word } from "@/lib/types"

interface FlashcardProps {
  word: Word
  onSpeak: (text: string) => void
  isSpeaking: boolean
  autoSpeak?: boolean
  showDefinition?: boolean
}

export function Flashcard({ word, onSpeak, isSpeaking, autoSpeak = true, showDefinition = true }: FlashcardProps) {
  const [revealed, setRevealed] = useState(showDefinition)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    setRevealed(showDefinition)
    if (autoSpeak && word) {
      // Small delay to allow UI to update
      const timer = setTimeout(() => {
        onSpeak(word.word)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [word, autoSpeak, onSpeak, showDefinition])

  const handleFlip = () => {
    setIsFlipping(true)
    setTimeout(() => {
      setRevealed(!revealed)
      setIsFlipping(false)
    }, 150)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
      case "hard":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "Fácil"
      case "medium":
        return "Medio"
      case "hard":
        return "Difícil"
      default:
        return difficulty
    }
  }

  return (
    <Card
      className={cn(
        "w-full max-w-2xl mx-auto overflow-hidden transition-all duration-300",
        "bg-card border-2 shadow-lg hover:shadow-xl",
        isFlipping && "scale-95",
      )}
    >
      <CardContent className="p-6 md:p-8">
        {/* Header with difficulty badge and controls */}
        <div className="flex items-center justify-between mb-6">
          <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getDifficultyColor(word.difficulty))}>
            {getDifficultyLabel(word.difficulty)}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onSpeak(word.word)}
              disabled={isSpeaking}
              className="hover:bg-primary/10"
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5 text-primary animate-pulse" />
              ) : (
                <Volume2 className="h-5 w-5 text-primary" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFlip} className="hover:bg-primary/10">
              {revealed ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Main word display */}
        <div className="text-center py-8">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-2 font-mono">{word.word}</h2>
          {word.category && <p className="text-sm text-muted-foreground italic">{word.category}</p>}
        </div>

        {/* Definition and example */}
        <div
          className={cn(
            "space-y-4 transition-all duration-300",
            revealed ? "opacity-100 max-h-96" : "opacity-0 max-h-0 overflow-hidden",
          )}
        >
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Definición</h3>
            <p className="text-lg text-foreground leading-relaxed">{word.definition}</p>
          </div>

          {word.example && (
            <div className="pt-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Ejemplo</h3>
              <p className="text-lg text-muted-foreground italic leading-relaxed">"{word.example}"</p>
            </div>
          )}
        </div>

        {/* Reveal hint */}
        {!revealed && (
          <div className="text-center pt-4">
            <button onClick={handleFlip} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              <RotateCcw className="inline h-4 w-4 mr-1" />
              Toca para ver definición
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
