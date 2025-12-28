# Checklist de Migración a Supabase

## ✅ Cambios completados en el código

- [x] Actualizado `package.json`: removido `mysql2`, añadido `@supabase/supabase-js`
- [x] Creado `lib/supabase.ts`: cliente Supabase (server y client)
- [x] Actualizado `lib/auth.ts`: usa Supabase Auth en lugar de sesiones manuales
- [x] Migrado `/api/auth/login/route.ts`: usa `supabaseAdmin.auth.signInWithPassword`
- [x] Migrado `/api/auth/register/route.ts`: usa `supabaseAdmin.auth.admin.createUser`
- [x] Migrado `/api/auth/logout/route.ts`: limpia cookies de sesión
- [x] Migrado `/api/words/route.ts`: usa Supabase queries
- [x] Migrado `/api/word-lists/route.ts`: usa Supabase queries
- [x] Migrado `/api/words/import/route.ts`: usa Supabase queries
- [x] Migrado `/api/words/random/route.ts`: usa Supabase queries
- [x] Migrado `/api/auth/biometric/register/route.ts`: usa Supabase queries
- [x] Migrado `/api/auth/biometric/verify/route.ts`: usa Supabase queries
- [x] Creado `scripts/003-migrate-to-supabase.sql`: esquema PostgreSQL con RLS
- [x] Creado `.env.local.example`: variables de entorno necesarias
- [x] Creado `SUPABASE_MIGRATION.md`: guía detallada de configuración

## 📋 Pasos que debes hacer

### 1. Crear proyecto Supabase
1. Ve a https://app.supabase.com
2. Haz clic en "New Project"
3. Llena los formularios y espera 5-10 minutos

### 2. Obtener credenciales
1. Settings → API
2. Copia:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_KEY`

### 3. Configurar variables de entorno
1. Copia `.env.local.example` → `.env.local`
2. Pega las 3 credenciales obtenidas

### 4. Crear esquema en Supabase
1. Ve a SQL Editor en Supabase
2. Copia todo de `scripts/003-migrate-to-supabase.sql`
3. Pega en SQL Editor y ejecuta
4. Confirma si pide crear extensiones

### 5. Configurar autenticación
1. Ve a Authentication → Providers
2. Asegúrate que "Email" esté ON
3. (Opcional) Habilita Google, GitHub, etc.

### 6. Instalar dependencias y probar
```bash
# Limpia node_modules (opcional pero recomendado)
rm -rf node_modules pnpm-lock.yaml
# o para npm:
rm -rf node_modules package-lock.json

# Instala dependencias
pnpm install
# o
npm install

# Inicia servidor dev
pnpm dev
# o
npm run dev
```

## 🔍 Qué cambió en cada archivo

### Autenticación
- **Login**: Ahora usa `supabaseAdmin.auth.signInWithPassword()`
- **Registro**: Usa `supabaseAdmin.auth.admin.createUser()` + crea perfil en tabla `users`
- **Logout**: Limpia cookies `sb-access-token` y `sb-refresh-token`
- **Session**: Obtenida desde cookies (Supabase las maneja)

### Datos
- **Words**: Queries ahora usan `.from("words").select()` en lugar de `pool.execute()`
- **Word Lists**: Mismo patrón con `.from("word_lists").select()`
- **Biometrics**: Almacenadas en columna `biometric_credential_id`

### Base de datos
- **PostgreSQL** en lugar de MySQL
- **UUIDs** para usuarios (de auth.users)
- **Row Level Security**: Usuarios ven solo sus datos
- **Tablas**: idénticas en estructura, sintaxis PostgreSQL

## ⚠️ Importantes

- **NO commits**: Asegúrate que `.env.local` está en `.gitignore`
- **Service Key**: Guarda `SUPABASE_SERVICE_KEY` en lugar seguro
- **RLS**: Si tienes problemas, ejecuta nuevamente el SQL de RLS
- **Sessions**: Supabase maneja las sesiones automáticamente

## 🆘 Si algo falla

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifica que `.env.local` existe y tiene las variables
- Reinicia: `Ctrl+C` y `pnpm dev`

### Error 401 en login/registro
- Verifica que Email Auth esté ON en Authentication → Providers
- Comprueba que la tabla `users` se creó en SQL Editor

### Error 403 "Permission denied"
- Ve a Authentication → Row Level Security
- Ejecuta el SQL de RLS nuevamente desde `003-migrate-to-supabase.sql`

### Errores en import de palabras
- Verifica que `word_lists` tabla existe
- Revisa que tienes permisos RLS para insertar

## 📚 Recursos útiles

- Supabase Docs: https://supabase.com/docs
- JS Client: https://supabase.com/docs/reference/javascript
- PostgreSQL: https://www.postgresql.org/docs/

---

**Una vez completados estos pasos, la app estará lista con Supabase.** ✨
