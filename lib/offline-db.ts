"use client"

import type { Word } from "./types"

const DB_NAME = "spellmaster-offline"
const DB_VERSION = 1
const WORDS_STORE = "words"
const SETTINGS_STORE = "settings"

let db: IDBDatabase | null = null

export async function initOfflineDB(): Promise<IDBDatabase> {
  if (db) return db

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Words store
      if (!database.objectStoreNames.contains(WORDS_STORE)) {
        const wordsStore = database.createObjectStore(WORDS_STORE, { keyPath: "id" })
        wordsStore.createIndex("word", "word", { unique: false })
        wordsStore.createIndex("difficulty", "difficulty", { unique: false })
      }

      // Settings store
      if (!database.objectStoreNames.contains(SETTINGS_STORE)) {
        database.createObjectStore(SETTINGS_STORE, { keyPath: "key" })
      }
    }
  })
}

export async function saveWordsOffline(words: Word[]): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(WORDS_STORE, "readwrite")
  const store = transaction.objectStore(WORDS_STORE)

  for (const word of words) {
    store.put(word)
  }

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getOfflineWords(): Promise<Word[]> {
  const database = await initOfflineDB()
  const transaction = database.transaction(WORDS_STORE, "readonly")
  const store = transaction.objectStore(WORDS_STORE)
  const request = store.getAll()

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function clearOfflineWords(): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(WORDS_STORE, "readwrite")
  const store = transaction.objectStore(WORDS_STORE)
  store.clear()

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function saveSetting(key: string, value: unknown): Promise<void> {
  const database = await initOfflineDB()
  const transaction = database.transaction(SETTINGS_STORE, "readwrite")
  const store = transaction.objectStore(SETTINGS_STORE)
  store.put({ key, value })

  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
  })
}

export async function getSetting<T>(key: string): Promise<T | null> {
  const database = await initOfflineDB()
  const transaction = database.transaction(SETTINGS_STORE, "readonly")
  const store = transaction.objectStore(SETTINGS_STORE)
  const request = store.get(key)

  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result?.value ?? null)
    request.onerror = () => reject(request.error)
  })
}
