"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PracticeHeader } from "@/components/layout/practice-header"
import { FileDropzone } from "@/components/import/file-dropzone"
import { ImportPreview } from "@/components/import/import-preview"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseCSV, parseExcel, type ParsedWord } from "@/lib/parse-import"
import { Loader2, CheckCircle2, ArrowLeft, Download } from "lucide-react"
import Link from "next/link"

export default function ImportPage() {
  const router = useRouter()
  const [userName, setUserName] = useState<string | undefined>()
  const [parsedWords, setParsedWords] = useState<ParsedWord[]>([])
  const [parseErrors, setParseErrors] = useState<string[]>([])
  const [listName, setListName] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    imported: number
    skipped: number
    total: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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
  }, [router])

  const handleFileAccepted = async (file: File) => {
    setError(null)
    setImportResult(null)

    try {
      if (file.name.endsWith(".csv")) {
        const text = await file.text()
        const result = parseCSV(text)
        setParsedWords(result.words)
        setParseErrors(result.errors)
      } else {
        const buffer = await file.arrayBuffer()
        const result = parseExcel(buffer)
        setParsedWords(result.words)
        setParseErrors(result.errors)
      }

      // Auto-set list name from file name
      if (!listName) {
        const name = file.name.replace(/\.(csv|xlsx|xls)$/i, "")
        setListName(name)
      }
    } catch (e) {
      setError("Error al procesar el archivo")
      console.error(e)
    }
  }

  const handleImport = async () => {
    if (parsedWords.length === 0) return

    setIsImporting(true)
    setError(null)

    try {
      const res = await fetch("/api/words/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: parsedWords,
          listName: listName || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setImportResult({
        imported: data.imported,
        skipped: data.skipped,
        total: data.total,
      })
    } catch {
      setError("Error de conexión al importar")
    } finally {
      setIsImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `word,definition,example,difficulty
aberration,A departure from what is normal or expected,The warm weather in December was an aberration,medium
eloquent,Fluent and persuasive in speaking,She gave an eloquent speech,easy`

    const blob = new Blob([template], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "spelling_bee_template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (importResult) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <PracticeHeader userName={userName} />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Card className="max-w-xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Importación Completada</CardTitle>
              <CardDescription>Tus palabras han sido importadas exitosamente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                  <p className="text-sm text-muted-foreground">Importadas</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <p className="text-2xl font-bold text-amber-600">{importResult.skipped}</p>
                  <p className="text-sm text-muted-foreground">Omitidas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{importResult.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1 bg-transparent" asChild>
                  <Link href="/import">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Importar más
                  </Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/practice">Practicar ahora</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PracticeHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Importar Palabras</h1>
              <p className="text-muted-foreground">Sube tu lista de palabras en formato CSV o Excel</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              Descargar plantilla
            </Button>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Selecciona tu archivo</CardTitle>
              <CardDescription>
                El archivo debe tener columnas: palabra, definición, ejemplo (opcional), dificultad (opcional)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileDropzone onFileAccepted={handleFileAccepted} />
            </CardContent>
          </Card>

          {parsedWords.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Vista previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <ImportPreview words={parsedWords} errors={parseErrors} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nombre de la lista (opcional)</CardTitle>
                  <CardDescription>Dale un nombre a esta colección de palabras</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="listName">Nombre</Label>
                    <Input
                      id="listName"
                      value={listName}
                      onChange={(e) => setListName(e.target.value)}
                      placeholder="Ej: Lista de competencia regional"
                    />
                  </div>

                  <Button onClick={handleImport} disabled={isImporting || parsedWords.length === 0} className="w-full">
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      `Importar ${parsedWords.length} palabras`
                    )}
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
