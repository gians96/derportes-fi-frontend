# Documentación — Frontend (deportes-fi)

Aplicación web del **Sistema de Deportes de la Facultad de Ingeniería (UNDC)**,
construida con Nuxt 4 + Vue 3 + Tailwind CSS 4. Consume la API del backend
(`/api/v1`).

## Índice

- [overview.md](./overview.md) — Qué hace, qué se quiere lograr y lo planteado.
- [architecture.md](./architecture.md) — Estructura Nuxt, composables, stores.
- [api-consumption.md](./api-consumption.md) — Cómo se consume el backend.
- [deployment.md](./deployment.md) — Despliegue (Docker / Dokploy), variables.

## Stack

| Capa          | Tecnología                          |
| ------------- | ----------------------------------- |
| Framework     | Nuxt 4 (Vue 3, SSR/Nitro)           |
| Lenguaje      | TypeScript (`<script setup>`)       |
| Runtime / PM  | Bun                                 |
| Estilos       | Tailwind CSS 4 (`@tailwindcss/vite`), tema oscuro/neón, fuente Rajdhani |
| Estado        | Pinia (`@pinia/nuxt`)               |
| Gráficos      | Chart.js + vue-chartjs              |
| Iconos        | lucide-vue-next                     |
| Auth          | Google Identity (`@types/google.accounts`) |

## Arranque local

```powershell
bun install
bun run dev        # http://localhost:3000
```

Requiere el backend corriendo en `http://localhost:3001/api/v1` (configurable por
`NUXT_PUBLIC_API_BASE`).
