"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileSpreadsheet, FileText, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void
  accept?: Record<string, string[]>
  maxSize?: number
}

export function FileDropzone({
  onFileAccepted,
  accept = {
    "text/csv": [".csv"],
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    "application/vnd.ms-excel": [".xls"],
  },
  maxSize = 5 * 1024 * 1024, // 5MB
}: FileDropzoneProps) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: unknown[]) => {
      setError(null)

      if (rejectedFiles.length > 0) {
        setError("Archivo no válido. Por favor usa CSV o Excel (.xlsx, .xls)")
        return
      }

      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0]
        setFile(selectedFile)
        onFileAccepted(selectedFile)
      }
    },
    [onFileAccepted],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  })

  const removeFile = () => {
    setFile(null)
    setError(null)
  }

  const getFileIcon = (filename: string) => {
    if (filename.endsWith(".csv")) {
      return <FileText className="h-8 w-8 text-green-600" />
    }
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {file ? (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {getFileIcon(file.name)}
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          <button onClick={removeFile} className="p-2 hover:bg-background rounded-full transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50",
          )}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-lg font-medium">Suelta el archivo aquí...</p>
          ) : (
            <>
              <p className="text-lg font-medium mb-2">Arrastra un archivo aquí o haz clic para seleccionar</p>
              <p className="text-sm text-muted-foreground">CSV o Excel (.xlsx, .xls) - Máximo 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
