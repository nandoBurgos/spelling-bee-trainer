"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PracticeHeader } from "@/components/layout/practice-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getOfflineWords, clearOfflineWords, saveSetting, getSetting } from "@/lib/offline-db"
import { Fingerprint, Trash2, Download, CheckCircle2, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | undefined>()
  const [offlineWordCount, setOfflineWordCount] = useState(0)
  const [defaultSpeed, setDefaultSpeed] = useState(0.8)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [biometricAvailable, setBiometricAvailable] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Check auth
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name)
        } else {
          router.push("/login")
        }
      })
      .catch(() => router.push("/login"))

    // Load offline word count
    getOfflineWords().then((words) => setOfflineWordCount(words.length))

    // Load settings
    getSetting<number>("defaultSpeed").then((val) => {
      if (val !== null) setDefaultSpeed(val)
    })
    getSetting<boolean>("autoSpeak").then((val) => {
      if (val !== null) setAutoSpeak(val)
    })

    // Check biometric
    const credId = localStorage.getItem("biometric_credential_id")
    setBiometricEnabled(!!credId)

    if (typeof window !== "undefined" && window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(setBiometricAvailable)
    }
  }, [router])

  const handleClearOffline = async () => {
    setIsClearing(true)
    await clearOfflineWords()
    setOfflineWordCount(0)
    setIsClearing(false)
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    await saveSetting("defaultSpeed", defaultSpeed)
    await saveSetting("autoSpeak", autoSpeak)
    setSaved(true)
    setIsSaving(false)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleEnableBiometric = async () => {
    if (!biometricAvailable) return

    try {
      // Generate a simple credential ID for this device
      const credentialId = crypto.randomUUID()

      // Store locally
      localStorage.setItem("biometric_credential_id", credentialId)

      // Register on server
      const res = await fetch("/api/auth/biometric/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credentialId }),
      })

      if (res.ok) {
        setBiometricEnabled(true)
      }
    } catch (error) {
      console.error("Error enabling biometric:", error)
    }
  }

  const handleDisableBiometric = () => {
    localStorage.removeItem("biometric_credential_id")
    setBiometricEnabled(false)
  }

  const handleDownloadWords = async () => {
    try {
      const res = await fetch("/api/words?limit=1000&random=false")
      const data = await res.json()

      if (data.words) {
        const offlineWords = await getOfflineWords()
        const existingIds = new Set(offlineWords.map((w) => w.id))
        const newWords = data.words.filter((w: { id: number }) => !existingIds.has(w.id))

        if (newWords.length > 0) {
          const { saveWordsOffline } = await import("@/lib/offline-db")
          await saveWordsOffline([...offlineWords, ...newWords])
          setOfflineWordCount(offlineWords.length + newWords.length)
        }
      }
    } catch (error) {
      console.error("Error downloading words:", error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PracticeHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Configuración</h1>

          {saved && (
            <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700 dark:text-green-400">
                Configuración guardada correctamente
              </AlertDescription>
            </Alert>
          )}

          {/* Practice Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de práctica</CardTitle>
              <CardDescription>Configura cómo quieres practicar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Velocidad de voz predeterminada</Label>
                  <span className="text-sm text-muted-foreground">{defaultSpeed.toFixed(2)}x</span>
                </div>
                <Slider
                  value={[defaultSpeed]}
                  onValueChange={([val]) => setDefaultSpeed(val)}
                  min={0.25}
                  max={1.5}
                  step={0.05}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pronunciar automáticamente</Label>
                  <p className="text-sm text-muted-foreground">Reproducir la palabra al cambiar de tarjeta</p>
                </div>
                <Switch checked={autoSpeak} onCheckedChange={setAutoSpeak} />
              </div>

              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar preferencias"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Offline Data */}
          <Card>
            <CardHeader>
              <CardTitle>Datos offline</CardTitle>
              <CardDescription>Gestiona las palabras guardadas para usar sin conexión</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{offlineWordCount} palabras</p>
                  <p className="text-sm text-muted-foreground">Guardadas localmente</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleDownloadWords} className="bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar más
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearOffline}
                    disabled={isClearing}
                    className="bg-transparent text-destructive hover:text-destructive"
                  >
                    {isClearing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpiar
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Biometric */}
          {biometricAvailable && (
            <Card>
              <CardHeader>
                <CardTitle>Autenticación biométrica</CardTitle>
                <CardDescription>Usa huella dactilar o Face ID para iniciar sesión rápidamente</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Fingerprint className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Biometría</p>
                      <p className="text-sm text-muted-foreground">
                        {biometricEnabled ? "Habilitado en este dispositivo" : "No configurado"}
                      </p>
                    </div>
                  </div>
                  {biometricEnabled ? (
                    <Button variant="outline" onClick={handleDisableBiometric} className="bg-transparent">
                      Deshabilitar
                    </Button>
                  ) : (
                    <Button onClick={handleEnableBiometric}>Habilitar</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
