"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Gauge } from "lucide-react"

interface SpeedControlProps {
  rate: number
  onRateChange: (rate: number) => void
}

export function SpeedControl({ rate, onRateChange }: SpeedControlProps) {
  const getSpeedLabel = (rate: number) => {
    if (rate <= 0.5) return "Muy lenta"
    if (rate <= 0.75) return "Lenta"
    if (rate <= 1) return "Normal"
    if (rate <= 1.25) return "Rápida"
    return "Muy rápida"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2 text-sm font-medium">
          <Gauge className="h-4 w-4" />
          Velocidad de voz
        </Label>
        <span className="text-sm text-muted-foreground">
          {rate.toFixed(2)}x - {getSpeedLabel(rate)}
        </span>
      </div>
      <Slider
        value={[rate]}
        onValueChange={([value]) => onRateChange(value)}
        min={0.25}
        max={1.5}
        step={0.05}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0.25x</span>
        <span>1.5x</span>
      </div>
    </div>
  )
}
