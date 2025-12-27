export interface Word {
  id: number
  word: string
  definition: string
  example: string
  difficulty: "easy" | "medium" | "hard"
  category?: string
  user_id?: number
  is_custom: boolean
  created_at: Date
}

export interface User {
  id: number
  email: string
  name: string
  password_hash: string
  biometric_credential_id?: string
  created_at: Date
  updated_at: Date
}

export interface Session {
  id: string
  user_id: number
  expires_at: Date
  created_at: Date
}

export interface WordList {
  id: number
  name: string
  user_id: number
  word_count: number
  created_at: Date
}

export interface PracticeSession {
  id: number
  user_id: number
  words_practiced: number
  correct_count: number
  started_at: Date
  ended_at?: Date
}

export interface OfflineWord {
  id: string
  word: string
  definition: string
  example: string
  synced: boolean
}
