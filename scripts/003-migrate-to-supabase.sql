-- Crear extensiones necesarias (opcional, pero útil)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (gestionada por Supabase Auth, pero podemos tener perfil custom)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    biometric_credential_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de palabras
CREATE TABLE IF NOT EXISTS public.words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(255) NOT NULL,
    definition TEXT NOT NULL,
    example TEXT,
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    category VARCHAR(100),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(word, user_id, is_custom)
);

CREATE INDEX idx_words_difficulty ON public.words(difficulty);
CREATE INDEX idx_words_user_custom ON public.words(user_id, is_custom);

-- Tabla de listas de palabras personalizadas
CREATE TABLE IF NOT EXISTS public.word_lists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_word_lists_user ON public.word_lists(user_id);

-- Tabla de relación lista-palabras
CREATE TABLE IF NOT EXISTS public.word_list_items (
    id SERIAL PRIMARY KEY,
    list_id INT REFERENCES public.word_lists(id) ON DELETE CASCADE NOT NULL,
    word_id INT REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    UNIQUE(list_id, word_id)
);

CREATE INDEX idx_word_list_items_list ON public.word_list_items(list_id);
CREATE INDEX idx_word_list_items_word ON public.word_list_items(word_id);

-- Tabla de sesiones de práctica
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    words_practiced INT DEFAULT 0,
    correct_count INT DEFAULT 0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_practice_sessions_user ON public.practice_sessions(user_id);

-- Tabla de progreso por palabra
CREATE TABLE IF NOT EXISTS public.word_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    word_id INT REFERENCES public.words(id) ON DELETE CASCADE NOT NULL,
    times_seen INT DEFAULT 0,
    times_correct INT DEFAULT 0,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, word_id)
);

CREATE INDEX idx_word_progress_user ON public.word_progress(user_id);

-- Enable RLS (Row Level Security) if desired
ALTER TABLE public.words ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow users to see their own data and public data)
CREATE POLICY "Users can see public words or their own words" ON public.words
    FOR SELECT USING (is_custom = false OR user_id = auth.uid());

CREATE POLICY "Users can create words" ON public.words
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own words" ON public.words
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own words" ON public.words
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can see their own lists" ON public.word_lists
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create lists" ON public.word_lists
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own lists" ON public.word_lists
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own lists" ON public.word_lists
    FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can manage their list items" ON public.word_list_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.word_lists WHERE id = list_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can see their practice sessions" ON public.practice_sessions
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create practice sessions" ON public.practice_sessions
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their progress" ON public.word_progress
    FOR ALL USING (user_id = auth.uid());
