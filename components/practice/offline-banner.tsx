"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface OfflineBannerProps {
  wordCount: number
  onSync: () => void
  isSyncing: boolean
}

export function OfflineBanner({ wordCount, onSync, isSyncing }: OfflineBannerProps) {
  return (
    <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <WifiOff className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Modo Offline</p>
            <p className="text-sm text-amber-700 dark:text-amber-300">{wordCount} palabras disponibles localmente</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing} className="bg-transparent">
          <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Sincronizando..." : "Sincronizar"}
        </Button>
      </div>
    </div>
  )
}
