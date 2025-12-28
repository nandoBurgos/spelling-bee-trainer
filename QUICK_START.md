# Quick Start: Migración a Supabase (5 minutos)

## ⚡ TL;DR

```bash
# 1. Crea proyecto en Supabase.com
# 2. Copia credenciales a .env.local
cp .env.local.example .env.local
# 3. Pega credenciales (3 valores)
# 4. Crea tablas: SQL Editor → 003-migrate-to-supabase.sql
# 5. Email Auth: Authentication → Providers → ON
# 6. Instala y ejecuta
pnpm install && pnpm dev
```

## 📍 Paso 1: Crear Supabase

1. Ve a https://app.supabase.com
2. Click "New Project"
3. Nombre: `spelling-bee-app`
4. Password: genera uno fuerte
5. Region: la más cercana
6. Click "Create new project" (espera 5-10 min)

## 🔑 Paso 2: Obtener credenciales

En tu proyecto recién creado:

1. **Menú izquierdo** → Settings → API
2. Copia estos 3 valores:

```
NEXT_PUBLIC_SUPABASE_URL = "https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJ..."
SUPABASE_SERVICE_KEY = "eyJ..." (en "service_role secret")
```

## 🔧 Paso 3: Configurar variables

```bash
# En la raíz del proyecto
cp .env.local.example .env.local
```

Edita `.env.local` y pega las 3 credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📊 Paso 4: Crear base de datos

1. En Supabase: **SQL Editor** (menú izquierdo)
2. Click **"New query"**
3. Abre el archivo: `scripts/003-migrate-to-supabase.sql`
4. **Copia todo** el contenido
5. **Pega** en SQL Editor
6. Click **Run**
7. Si pide crear extensión: click "OK"

## 🔐 Paso 5: Activar autenticación

1. Menú izquierdo: **Authentication**
2. Ir a **Providers**
3. Buscar "Email"
4. Switch a **ON**

Done! ✅

## 💻 Paso 6: Instalar y ejecutar

```bash
# Instala dependencias (usa npm si prefieres)
pnpm install

# Inicia servidor
pnpm dev
```

Abre http://localhost:3000 en el navegador.

---

## ✅ Verificar que funciona

1. Intenta **Registrarse** con un email
2. Intenta **Login** con ese email
3. En práctica: **Importa palabras** (crear lista)
4. En práctica: **Filtra por lista** (selector)

Si todo funciona: ¡Migración completada! 🎉

---

## 🆘 Si algo falla

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
```bash
# Reinicia el servidor
Ctrl+C  # Detén el servidor
pnpm dev  # Inicia de nuevo
```

### Error 401 en login
- ¿Ejecutaste el SQL? (Paso 4)
- ¿Habilitaste Email Auth? (Paso 5)

### Error 403 "Permission denied"
- Re-ejecuta el SQL desde `003-migrate-to-supabase.sql`
- Asegúrate que **Row Level Security** está ON

### Tabla no existe
- Verifica en Supabase: **Database** → **Tables**
- Si no ves tablas: el SQL del paso 4 no se ejecutó

---

## 📖 Documentación completa

Para más detalles:
- **MIGRATION_SUMMARY.md** - Resumen completo
- **SUPABASE_MIGRATION.md** - Guía paso a paso
- **MIGRATION_CHECKLIST.md** - Checklist y recursos

---

¡Listo! Solo 6 pasos rápidos. 🚀
