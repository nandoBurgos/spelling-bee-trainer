"use client"

import { useState, useCallback, useEffect } from "react"

interface UseSpeechOptions {
  defaultRate?: number
  defaultPitch?: number
  defaultVolume?: number
}

export function useSpeech(options: UseSpeechOptions = {}) {
  const { defaultRate = 0.8, defaultPitch = 1, defaultVolume = 1 } = options

  const [rate, setRate] = useState(defaultRate)
  const [pitch, setPitch] = useState(defaultPitch)
  const [volume, setVolume] = useState(defaultVolume)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true)

      const loadVoices = () => {
        const availableVoices = speechSynthesis.getVoices()
        const englishVoices = availableVoices.filter((v) => v.lang.startsWith("en"))
        setVoices(englishVoices)
      }

      loadVoices()
      speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return

      // Cancel any ongoing speech
      speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume
      utterance.lang = "en-US"

      // Prefer US English voice
      const usVoice = voices.find((v) => v.lang === "en-US")
      if (usVoice) {
        utterance.voice = usVoice
      }

      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)

      speechSynthesis.speak(utterance)
    },
    [isSupported, rate, pitch, volume, voices],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    rate,
    setRate,
    pitch,
    setPitch,
    volume,
    setVolume,
    voices,
  }
}
