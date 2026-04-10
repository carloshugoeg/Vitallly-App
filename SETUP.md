# Vitallly App — Guía de configuración

## Requisitos previos

- **Node.js** >= 20
- **npm** >= 10
- Acceso a la base de datos **Supabase** del proyecto (pedir credenciales al equipo)

## 1. Clonar el repositorio

```bash
git clone https://github.com/carloshugoeg/Vitallly-App.git
cd Vitallly-App
```

## 2. Instalar dependencias

```bash
npm install
```

> Esto también ejecuta `prisma generate` automáticamente gracias al script `postinstall`.

## 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos — Supabase PostgreSQL
# Runtime: pooler en modo sesión (puerto 5432)
DATABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
# Migraciones: conexión directa (sin pooler) — requerida para prisma migrate
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_SECRET="generar-con: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

> Pedir los valores reales de `PROJECT_REF` y `PASSWORD` al equipo.

## 4. Aplicar migraciones

```bash
npm run db:migrate:deploy
```

## 5. Sembrar datos de prueba (opcional)

```bash
npm run db:seed
```

## 6. Ejecutar en desarrollo

```bash
npm run dev
```

La app estará disponible en [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Script               | Descripción                                      |
| -------------------- | ------------------------------------------------ |
| `npm run dev`        | Servidor de desarrollo (Turbopack)               |
| `npm run build`      | Build de producción                              |
| `npm run lint`       | Ejecutar ESLint                                  |
| `npm run db:migrate` | Crear y aplicar migraciones en desarrollo        |
| `npm run db:migrate:deploy` | Aplicar migraciones existentes (sin crear) |
| `npm run db:seed`    | Sembrar datos de prueba                          |
| `npm run db:studio`  | Abrir Prisma Studio (explorador visual de la BD) |
| `npm run db:reset`   | Resetear la BD y re-aplicar migraciones + seed   |

## Stack tecnológico

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**
- **Tailwind CSS 4**
- **Prisma** (ORM) + **Supabase PostgreSQL**
- **NextAuth v5** (autenticación)
- **Recharts** (gráficas)
- **SWR** (fetching de datos)
- **Zod** (validación)
