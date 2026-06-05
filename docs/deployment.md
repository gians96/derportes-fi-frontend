# Despliegue — Frontend

El frontend se despliega como **servicio independiente** (sin docker-compose),
pensado para **Dokploy**. Es una app Nuxt 4 con SSR (Nitro).

## Imagen Docker

Build multi-stage (Bun para construir, Node 22 alpine para ejecutar). Ver
[`Dockerfile`](../Dockerfile).

- Expone el puerto **3000** y arranca con `node .output/server/index.mjs`.
- `NUXT_HOST=0.0.0.0`, `NUXT_PORT=3000`.

```powershell
docker build -t deportes-fi-frontend .
docker run -p 3000:3000 --env-file .env deportes-fi-frontend
```

## Variables de entorno

| Variable                          | Descripción | Ejemplo |
| --------------------------------- | ----------- | ------- |
| `NUXT_PUBLIC_API_BASE`            | Base de la API del backend | `https://api.deportes-fi.undc.edu.pe/api/v1` |
| `NUXT_PUBLIC_GOOGLE_CLIENT_ID`    | Client ID de Google (mismo que el backend) | |

> Estas variables son **públicas** (`runtimeConfig.public`): se exponen al
> cliente. No pongas secretos aquí.

## Pasos en Dokploy

1. Crear una **Application** apuntando al repositorio del frontend (build por
   Dockerfile).
2. Definir `NUXT_PUBLIC_API_BASE` con la URL pública del backend (`.../api/v1`).
3. Definir `NUXT_PUBLIC_GOOGLE_CLIENT_ID` (idéntico al del backend).
4. Exponer el puerto **3000** y mapear el dominio público.

## Google Cloud Console

En las credenciales OAuth del proyecto, agregar como **orígenes de JavaScript
autorizados**:
- `http://localhost:3000` (desarrollo)
- `https://<dominio-frontend>` (producción)

Sin esto, el botón de inicio de sesión con Google no funcionará.

## Checklist de producción

- [ ] `NUXT_PUBLIC_API_BASE` apunta al backend correcto (con `/api/v1`).
- [ ] `NUXT_PUBLIC_GOOGLE_CLIENT_ID` coincide con el backend.
- [ ] Orígenes JS autorizados en Google Cloud incluyen el dominio del frontend.
- [ ] El backend tiene este dominio en su `CORS_ORIGIN`.
