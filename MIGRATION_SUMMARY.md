# Resumen de Migración: MySQL → Supabase

## 🎯 Cambios completados

Tu aplicación ha sido **completamente migrada** de MySQL a Supabase (PostgreSQL + Auth). Aquí está el detalle:

---

## 📦 Dependencias

### Eliminadas
- `mysql2` (v3.16.0) - Cliente MySQL
- `bcryptjs` (v3.0.3) - Hash manual de contraseñas

### Agregadas
- `@supabase/supabase-js` (v2.44.0) - Cliente oficial Supabase

**Por qué:**
- Supabase maneja hash y autenticación de forma segura
- @supabase/supabase-js es más moderno y tiene mejor soporte

---

## 🔧 Archivos modificados

### Configuración
| Archivo | Cambio |
|---------|--------|
| `lib/db.ts` | ⚠️ Deprecado (ahora lanza error) |
| **`lib/supabase.ts`** | ✨ **NUEVO** - Cliente Supabase |
| `lib/auth.ts` | 🔄 Reescrito para Supabase Auth |
| `.env.local.example` | ✨ **NUEVO** - Variables requeridas |

### Endpoints de autenticación
| Endpoint | Cambios |
|----------|---------|
| `/api/auth/login` | Usa `auth.signInWithPassword()` |
| `/api/auth/register` | Usa `auth.admin.createUser()` |
| `/api/auth/logout` | Limpia cookies Supabase |
| `/api/auth/me` | Obtiene sesión desde cookies |
| `/api/auth/reset-password` | Usa `auth.admin.generateLink()` |
| `/api/auth/biometric/register` | Usa queries Supabase |
| `/api/auth/biometric/verify` | Usa queries Supabase |

### Endpoints de datos
| Endpoint | Cambios |
|----------|---------|
| `/api/words` | Queries con `.from("words").select()` |
| `/api/word-lists` | Queries con `.from("word_lists").select()` |
| `/api/words/import` | Insert/update en Supabase |
| `/api/words/random` | Queries Supabase + shuffle en cliente |

---

## 🗄️ Base de datos

### Cambios de esquema

| Cambio | Detalle |
|--------|---------|
| Motor | MySQL → PostgreSQL |
| IDs de usuario | INT → UUID (de auth.users) |
| Contraseñas | Almacenadas en `auth.users` (no en `users.password_hash`) |
| Sesiones | Manejadas por Supabase (no en tabla `sessions`) |
| Autenticación | Via `supabase.auth.*` (no manual) |

### Nuevas características
✅ **Row Level Security (RLS)**: Usuarios ven solo sus datos  
✅ **Autenticación segura**: Supabase maneja tokens JWT  
✅ **Backups automáticos**: Incluido en Supabase  
✅ **Real-time**: Listo para subscripciones en tiempo real  

---

## 🚀 Próximos pasos

### 1️⃣ Crear proyecto Supabase (5 min)
```
https://app.supabase.com → New Project
```

### 2️⃣ Obtener credenciales (2 min)
```
Settings → API → Copiar 3 valores
```

### 3️⃣ Configurar `.env.local` (1 min)
```bash
cp .env.local.example .env.local
# Edita y pega las credenciales
```

### 4️⃣ Crear tablas en Supabase (3 min)
```
SQL Editor → Pega scripts/003-migrate-to-supabase.sql → Run
```

### 5️⃣ Habilitar autenticación (1 min)
```
Authentication → Providers → Email: ON
```

### 6️⃣ Instalar y ejecutar (2 min)
```bash
pnpm install  # o npm install
pnpm dev
```

**Total: ~15 minutos** ⏱️

---

## 🔐 Seguridad

- ✅ Tokens JWT de Supabase (más seguros que sesiones manuales)
- ✅ Cookies `httpOnly` y `secure`
- ✅ Row Level Security activo
- ✅ Sin contraseñas en el cliente
- ✅ Validación en servidor

---

## 📋 Archivos de referencia

| Archivo | Propósito |
|---------|-----------|
| `SUPABASE_MIGRATION.md` | Guía detallada paso a paso |
| `MIGRATION_CHECKLIST.md` | Checklist y troubleshooting |
| `scripts/003-migrate-to-supabase.sql` | Schema PostgreSQL con RLS |
| `.env.local.example` | Variables de entorno necesarias |

---

## ⚙️ Detalles técnicos

### Antes (MySQL)
```typescript
import pool from "@/lib/db"

const [rows] = await pool.execute(
  "SELECT * FROM users WHERE email = ?",
  [email]
)
```

### Ahora (Supabase)
```typescript
import { supabaseAdmin } from "@/lib/supabase"

const { data: users } = await supabaseAdmin
  .from("users")
  .select("*")
  .eq("email", email)
  .single()
```

### Ventajas
| Aspecto | MySQL | Supabase |
|--------|-------|---------|
| Setup | Manual | Hosted |
| Auth | Manual + bcrypt | Integrado |
| Backups | Manual | Automático |
| Escala | Manual | Automático |
| Seguridad | Tu responsabilidad | Supabase |

---

## ❓ Preguntas frecuentes

**¿Pierdo mis datos?**  
No. Los datos existentes deben migrarse manualmente desde MySQL.

**¿Qué pasa con bcrypt?**  
Supabase lo usa internamente, no necesitas importarlo.

**¿Cómo hago backups?**  
Supabase hace backups automáticos (plan Free: 7 días).

**¿Puedo seguir usando MySQL?**  
Sí, pero el código ha sido reescrito para Supabase.

**¿Cuánto cuesta?**  
Plan Free: suficiente para desarrollo. Production: precios pagos.

---

**¡Listo! Sigue los 6 pasos arriba y tu app estará en Supabase.** 🎉

Para dudas: [Docs de Supabase](https://supabase.com/docs) o [Discord](https://discord.supabase.com)
