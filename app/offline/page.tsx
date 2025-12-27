"use client"

import { WifiOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sin conexión</h1>
          <p className="text-muted-foreground">
            No tienes conexión a internet, pero puedes seguir practicando con las palabras guardadas localmente.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/practice">Practicar offline</Link>
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar conexión
          </Button>
        </div>
      </div>
    </div>
  )
}
