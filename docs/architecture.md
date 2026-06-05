# Arquitectura — Frontend

Proyecto Nuxt 4 con directorio `app/`. Estructura principal:

```
app/
├─ assets/css/main.css      # tema oscuro/neón, Tailwind 4, Rajdhani
├─ components/
│  ├─ AppModal.vue          # modal reutilizable (Teleport + Transition)
│  ├─ AppConfirm.vue        # confirmación (usa AppModal) para borrados/toggles
│  └─ ...                   # StatusBadge, etc.
├─ composables/
│  ├─ useApi.ts             # cliente HTTP centralizado (Bearer, 401)
│  └─ useFaculties.ts       # carga/caché de facultades+escuelas (useState)
├─ layouts/
│  ├─ default.vue           # vista pública/estudiante
│  └─ admin.vue             # panel admin (sidebar desktop + bottom nav mobile)
├─ middleware/
│  ├─ auth.ts               # requiere sesión
│  ├─ admin.ts              # requiere rol OWNER/ADMIN
│  └─ profile.global.ts     # fuerza perfil incompleto según rol
├─ pages/                   # ruteo basado en archivos
│  ├─ index.vue, login.vue, completar-perfil.vue, 403.vue
│  ├─ eventos/, disciplinas/, inscripcion/, resultados/
│  ├─ estado-inscripcion.vue, historial.vue
│  └─ admin/                # dashboard, facultades, eventos, disciplinas,
│                           # inscripciones, vouchers, usuarios
├─ plugins/
│  └─ auth.client.ts        # restaura sesión al cargar (async)
├─ stores/
│  └─ auth.ts               # Pinia: token (cookie), user, getters de rol
└─ types/
   └─ domain.ts             # tipos compartidos (AuthUser, Discipline, Team, ...)
```

## Sesión y autenticación

- `stores/auth.ts` guarda el token en `useCookie('deportes_fi_token')`
  (`maxAge` 7d, `sameSite: 'lax'`), compatible con SSR.
- `plugins/auth.client.ts` es `async`: si hay token y no hay `user`, hace
  `await auth.fetchProfile()` y limpia la sesión si falla.
- Getters de rol: `isOwner`, además de `user` (`id`, `role`, `facultyId`,
  `schoolId`, `dni`). `needsProfile` indica si `STUDENT` debe completar
  facultad/escuela o si `OTHER` debe completar DNI.

## Middleware

- `auth.ts`: redirige a `login` si no hay sesión.
- `admin.ts`: bloquea el panel a quien no sea `OWNER_SYSTEM`/`ADMIN_SYSTEM`.
- `profile.global.ts`: redirige a `completar-perfil` a `STUDENT` sin
  facultad/escuela y a `OTHER` sin DNI.

## Componentes reutilizables

- **`AppModal`** — props `modelValue: boolean`, `title: string`; emite
  `update:modelValue`. Cierra con backdrop, botón X o `Escape`. Usa `Teleport`.
- **`AppConfirm`** — envuelve `AppModal`; props `title`, `message`,
  `confirmText`, `cancelText`, `loading`, `error`; emite `confirm`/`cancel`.
  Patrón estándar para borrados e inhabilitaciones.

## Estado compartido

- `useFaculties()` expone `faculties` (con `schools`) y `load()`, cacheado con
  `useState` para reutilizar en eventos, disciplinas, perfil y usuarios.
