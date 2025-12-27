"use client"

import { useState, useEffect, useCallback } from "react"
import { Flashcard } from "@/components/practice/flashcard"
import { PracticeControls } from "@/components/practice/practice-controls"
import { SpeedControl } from "@/components/practice/speed-control"
import { DifficultyFilter } from "@/components/practice/difficulty-filter"
import { OfflineBanner } from "@/components/practice/offline-banner"
import { PracticeHeader } from "@/components/layout/practice-header"
import { WritingCard } from "@/components/practice/writing-card"
import { useSpeech } from "@/hooks/use-speech"
import { useOnlineStatus } from "@/hooks/use-online-status"
import { getOfflineWords, saveWordsOffline } from "@/lib/offline-db"
import { Loader2 } from "lucide-react"
import type { Word } from "@/lib/types"

export default function PracticePage() {
  const [words, setWords] = useState<Word[]>([])
  const [lists, setLists] = useState<any[]>([])
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [writingMode, setWritingMode] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [difficulty, setDifficulty] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [autoSpeak, setAutoSpeak] = useState(true)
  const [showDefinition, setShowDefinition] = useState(true)
  const [userName, setUserName] = useState<string | undefined>()
  const [isSyncing, setIsSyncing] = useState(false)

  const { speak, isSpeaking, rate, setRate, isSupported } = useSpeech({ defaultRate: 0.8 })
  const isOnline = useOnlineStatus()

  // Fetch user info
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserName(data.user.name)
        }
      })
      .catch(() => {})
  }, [])

  // Fetch words
  const fetchWords = useCallback(async () => {
    setIsLoading(true)

    if (isOnline) {
      try {
        const params = new URLSearchParams({
          difficulty,
          random: "true",
          limit: "100",
        })
        if (selectedList) params.set("listId", selectedList)

        const res = await fetch(`/api/words?${params}`)
        const data = await res.json()

        if (data.words && data.words.length > 0) {
          setWords(data.words)
          setCurrentIndex(0)
          // Save for offline use
          saveWordsOffline(data.words).catch(console.error)
        }
      } catch (error) {
        console.error("Error fetching words:", error)
        // Fall back to offline
        const offlineWords = await getOfflineWords()
        if (offlineWords.length > 0) {
          const filtered = difficulty === "all" ? offlineWords : offlineWords.filter((w) => w.difficulty === difficulty)
          setWords(filtered)
          setCurrentIndex(0)
        }
      }
    } else {
      // Offline mode
      const offlineWords = await getOfflineWords()
      const filtered = difficulty === "all" ? offlineWords : offlineWords.filter((w) => w.difficulty === difficulty)
      setWords(filtered)
      setCurrentIndex(0)
    }

    setIsLoading(false)
  }, [difficulty, isOnline])

  // Fetch user lists
  useEffect(() => {
    fetch("/api/word-lists")
      .then((r) => r.json())
      .then((d) => {
        if (d.lists) setLists(d.lists)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchWords()
  }, [fetchWords])

  const handleSync = async () => {
    if (!isOnline) return
    setIsSyncing(true)
    await fetchWords()
    setIsSyncing(false)
  }

  const handleShuffle = () => {
    const shuffled = [...words].sort(() => Math.random() - 0.5)
    setWords(shuffled)
    setCurrentIndex(0)
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  const handleSpeak = useCallback(
    (text: string) => {
      if (isSupported) {
        speak(text)
      }
    },
    [speak, isSupported],
  )

  const currentWord = words[currentIndex]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PracticeHeader userName={userName} />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6">
        {/* Offline banner */}
        {!isOnline && <OfflineBanner wordCount={words.length} onSync={handleSync} isSyncing={isSyncing} />}

        {/* Filters and controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <DifficultyFilter selected={difficulty} onSelect={setDifficulty} />

            <div className="flex items-center space-x-2">
              <label className="text-sm">Lista:</label>
              <select
                className="rounded-md bg-input px-2 py-1"
                value={selectedList ?? ""}
                onChange={(e) => setSelectedList(e.target.value || null)}
              >
                <option value="">Todas</option>
                {lists.map((l) => (
                  <option key={l.id} value={String(l.id)}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isSupported && (
            <div className="w-full md:w-64">
              <SpeedControl rate={rate} onRateChange={setRate} />
            </div>
          )}
        </div>

        {/* Main content */}
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Cargando palabras...</p>
            </div>
          </div>
        ) : words.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <p className="text-xl font-medium">No hay palabras disponibles</p>
              <p className="text-muted-foreground">Intenta cambiar el filtro de dificultad o sincronizar.</p>
            </div>
          </div>
        ) : (
          <>
            {/* Flashcard */}
            <div className="py-4">
                  {currentWord && !writingMode && (
                    <Flashcard
                      word={currentWord}
                      onSpeak={handleSpeak}
                      isSpeaking={isSpeaking}
                      autoSpeak={autoSpeak}
                      showDefinition={showDefinition}
                    />
                  )}

                  {currentWord && writingMode && (
                    <WritingCard
                      word={currentWord}
                      onSpeak={handleSpeak}
                      isSpeaking={isSpeaking}
                      autoSpeak={autoSpeak}
                      showDefinition={showDefinition}
                      onAnswered={(correct) => {
                        // move to next after short delay
                        setTimeout(() => {
                          if (currentIndex < words.length - 1) setCurrentIndex(currentIndex + 1)
                        }, 700)
                      }}
                    />
                  )}
            </div>

            {/* Controls */}
            <PracticeControls
              onPrevious={handlePrevious}
              onNext={handleNext}
              onShuffle={handleShuffle}
              autoSpeak={autoSpeak}
              onAutoSpeakChange={setAutoSpeak}
              showDefinition={showDefinition}
              onShowDefinitionChange={setShowDefinition}
              writingMode={writingMode}
              onWritingModeChange={setWritingMode}
              canGoPrevious={currentIndex > 0}
              canGoNext={currentIndex < words.length - 1}
              currentIndex={currentIndex}
              total={words.length}
            />
          </>
        )}
      </main>
    </div>
  )
}
