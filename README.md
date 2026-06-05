# Deportes FI — Frontend

Aplicación web de gestión deportiva para la **Facultad de Ingeniería (UNDC)**.
Construida con **Nuxt 4**, **Tailwind CSS 4** (oficial vía `@tailwindcss/vite`),
**TypeScript**, **Pinia**, **Chart.js** y autenticación con **Google Identity Services**.
Gestor de paquetes: **Bun**.

## Requisitos

- Bun >= 1.2
- Node 22 (runtime para el build de producción)
- Backend corriendo (ver carpeta `../backend`)

## Configuración

Copia las variables de entorno:

```bash
cp .env.example .env
```

| Variable | Descripción |
| --- | --- |
| `NUXT_PUBLIC_API_BASE` | URL del backend, sin slash final (ej. `http://localhost:3001/api/v1`) |
| `NUXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth |

## Desarrollo

```bash
bun install
bun run dev
```

La app queda disponible en `http://localhost:3000`.

## Build de producción

```bash
bun run build
node .output/server/index.mjs
```

## Estructura (`app/`)

- `pages/` — vistas públicas, de estudiante y de administración (`admin/`)
- `layouts/` — `default` (público) y `admin` (panel)
- `components/` — componentes reutilizables (Google sign-in, badges, cards, charts)
- `stores/` — Pinia (`auth`, `events`)
- `composables/` — `useApi` (cliente HTTP con JWT)
- `middleware/` — `auth`, `admin`, `guest`, `profile.global`
- `types/` — tipos de dominio compartidos
- `assets/css/main.css` — tema oscuro/neón (Rajdhani + paleta `oscuro-*` + `verde-primario`)

## Roles y flujo

- `STUDENT`: correo `@undc.edu.pe` numérico. Completa facultad/escuela y puede
  inscribir disciplinas para estudiantes.
- `OTHER`: cualquier otro correo verificado por Google. Completa perfil solo con DNI
  validado por Decolecta; no selecciona facultad ni escuela. Puede ver e
  inscribir disciplinas para estudiantes y para otros.
- `OWNER_SYSTEM` / `ADMIN_SYSTEM`: usan el panel admin y pueden crear equipos
  manualmente, designando delegado.

`/estado-inscripcion` funciona como **Mis inscripciones**: muestra los equipos
donde el usuario es delegado o integrante, con filtros por evento, disciplina,
estado y pago. `/admin/inscripciones` es el panel único para revisar equipos
gratuitos y pagados; muestra el teléfono de contacto del equipo/delegado y el
voucher se valida dentro del modal del equipo.

## Docker / Dokploy

Cada servicio se despliega por separado, **solo con su Dockerfile** (sin docker-compose).

```bash
docker build -t deportes-fi-frontend .
docker run -p 3000:3000 \
  -e NUXT_PUBLIC_API_BASE=https://api.tu-dominio/api/v1 \
  -e NUXT_PUBLIC_GOOGLE_CLIENT_ID=xxxx \
  deportes-fi-frontend
```
