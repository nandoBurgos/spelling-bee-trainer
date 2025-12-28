# Migración a Supabase

Esta aplicación ha sido migrada de MySQL a Supabase (PostgreSQL con autenticación integrada).

## Pasos para configurar Supabase

### 1. Crear un proyecto en Supabase

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Haz clic en "New Project"
3. Completa los datos:
   - **Project name**: spelling-bee-app
   - **Database password**: genera una contraseña segura
   - **Region**: elige la más cercana a ti
4. Espera a que se cree el proyecto (5-10 minutos)

### 2. Obtener las credenciales

1. En el proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (secret) → `SUPABASE_SERVICE_KEY`

### 3. Configurar variables de entorno

1. Copia `.env.local.example` a `.env.local`
2. Pega los valores obtenidos en el paso 2
3. Asegúrate de que `.env.local` está en `.gitignore` (no lo commits)

### 4. Crear las tablas

1. Ve a **SQL Editor** en Supabase
2. Copia el contenido de `scripts/003-migrate-to-supabase.sql`
3. Pega en el SQL Editor y ejecuta
4. Acepta que se creen las extensiones si se solicita

### 5. Configurar autenticación

1. Ve a **Authentication** → **Providers**
2. Asegúrate de que "Email" está habilitado
3. (Opcional) Habilita otros proveedores (Google, GitHub, etc.)

### 6. Instalar dependencias y ejecutar

```bash
# Instala nuevas dependencias (remove mysql2, add @supabase/supabase-js)
pnpm install
# o
npm install

# Ejecuta el servidor de desarrollo
pnpm dev
```

## Cambios principales en el código

- **lib/db.ts** → Reemplazado con **lib/supabase.ts**
- **lib/auth.ts** → Ahora usa Supabase Auth en lugar de sesiones manuales
- **API endpoints** → Todos usan `supabaseAdmin` del cliente Supabase
- **Autenticación** → Supabase maneja sesiones automáticamente

## Notas

- Las contraseñas se almacenan de forma segura en Supabase Auth
- Las sesiones se manejan automáticamente con cookies seguras
- Row Level Security (RLS) está habilitado para proteger datos
- Los usuarios solo ven sus propias listas y palabras personalizadas

## Troubleshooting

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"
- Verifica que las variables de entorno estén en `.env.local`
- Reinicia el servidor de desarrollo: `pnpm dev`

### Error: "Permission denied" en queries
- Ve a **Authentication** → **Row Level Security**
- Verifica que las políticas estén habilitadas
- Ejecuta el SQL de RLS nuevamente desde `003-migrate-to-supabase.sql`

### Error en login/registro
- Verifica que Email Auth esté habilitado en **Authentication** → **Providers**
- Comprueba que la tabla `users` se creó correctamente

## Recursos útiles

- [Documentación Supabase](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
