"use client"

import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface UpdatePromptProps {
  onUpdate: () => void
}

export function UpdatePrompt({ onUpdate }: UpdatePromptProps) {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-primary text-primary-foreground rounded-lg p-4 shadow-lg flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">Nueva versión disponible</p>
          <p className="text-sm opacity-90">Actualiza para obtener las últimas mejoras</p>
        </div>
        <Button variant="secondary" size="sm" onClick={onUpdate}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>
    </div>
  )
}
