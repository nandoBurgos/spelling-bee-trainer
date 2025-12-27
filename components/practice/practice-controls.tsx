"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ChevronLeft, ChevronRight, Shuffle, Volume2 } from "lucide-react"

interface PracticeControlsProps {
  onPrevious: () => void
  onNext: () => void
  onShuffle: () => void
  autoSpeak: boolean
  onAutoSpeakChange: (value: boolean) => void
  showDefinition: boolean
  onShowDefinitionChange: (value: boolean) => void
  writingMode: boolean
  onWritingModeChange: (value: boolean) => void
  canGoPrevious: boolean
  canGoNext: boolean
  currentIndex: number
  total: number
}

export function PracticeControls({
  onPrevious,
  onNext,
  onShuffle,
  autoSpeak,
  onAutoSpeakChange,
  showDefinition,
  onShowDefinitionChange,
  writingMode,
  onWritingModeChange,
  canGoPrevious,
  canGoNext,
  currentIndex,
  total,
}: PracticeControlsProps) {
  return (
    <div className="space-y-6">
      {/* Navigation buttons */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="lg" onClick={onPrevious} disabled={!canGoPrevious} className="bg-transparent">
          <ChevronLeft className="h-5 w-5 mr-1" />
          Anterior
        </Button>

        <div className="px-4 py-2 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {currentIndex + 1} / {total}
          </span>
        </div>

        <Button variant="outline" size="lg" onClick={onNext} disabled={!canGoNext} className="bg-transparent">
          Siguiente
          <ChevronRight className="h-5 w-5 ml-1" />
        </Button>
      </div>

      {/* Shuffle button */}
      <div className="flex justify-center">
        <Button variant="secondary" onClick={onShuffle}>
          <Shuffle className="h-4 w-4 mr-2" />
          Mezclar palabras
        </Button>
      </div>

      {/* Toggle options */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Switch id="auto-speak" checked={autoSpeak} onCheckedChange={onAutoSpeakChange} />
          <Label htmlFor="auto-speak" className="flex items-center gap-2 cursor-pointer">
            <Volume2 className="h-4 w-4" />
            Pronunciar automáticamente
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="show-definition" checked={showDefinition} onCheckedChange={onShowDefinitionChange} />
          <Label htmlFor="show-definition" className="cursor-pointer">
            Mostrar definición
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch id="writing-mode" checked={writingMode} onCheckedChange={onWritingModeChange} />
          <Label htmlFor="writing-mode" className="cursor-pointer">
            Modo escritura
          </Label>
        </div>
      </div>
    </div>
  )
}
