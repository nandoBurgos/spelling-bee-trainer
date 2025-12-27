"use client"

import type React from "react"

import { useServiceWorker } from "@/hooks/use-service-worker"
import { InstallPrompt } from "./install-prompt"
import { UpdatePrompt } from "./update-prompt"

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const { hasUpdate, updateServiceWorker } = useServiceWorker()

  return (
    <>
      {children}
      <InstallPrompt />
      {hasUpdate && <UpdatePrompt onUpdate={updateServiceWorker} />}
    </>
  )
}
