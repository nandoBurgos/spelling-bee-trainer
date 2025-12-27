"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DifficultyFilterProps {
  selected: string
  onSelect: (difficulty: string) => void
}

const difficulties = [
  { value: "all", label: "Todas", color: "bg-secondary" },
  { value: "easy", label: "Fácil", color: "bg-green-500" },
  { value: "medium", label: "Medio", color: "bg-amber-500" },
  { value: "hard", label: "Difícil", color: "bg-red-500" },
]

export function DifficultyFilter({ selected, onSelect }: DifficultyFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {difficulties.map((d) => (
        <Button
          key={d.value}
          variant={selected === d.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelect(d.value)}
          className={cn("transition-all", selected === d.value ? "" : "bg-transparent hover:bg-muted")}
        >
          <span className={cn("w-2 h-2 rounded-full mr-2", d.value === "all" ? "bg-muted-foreground" : d.color)}></span>
          {d.label}
        </Button>
      ))}
    </div>
  )
}
