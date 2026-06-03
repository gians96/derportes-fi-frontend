# Overview — Frontend

## 1. Qué hace

Interfaz web para estudiantes y administradores del sistema deportivo de la
Facultad de Ingeniería. Cubre dos grandes experiencias:

### Público / estudiante (layout `default`)
- **Inicio** (`index.vue`): eventos deportivos aperturados.
- **Eventos** (`eventos/`): listado y detalle de un evento con sus disciplinas.
- **Disciplinas** (`disciplinas/`): detalle de una disciplina y sus bases.
- **Inscripción** (`inscripcion/[id].vue`): el delegado arma su equipo buscando
  integrantes por DNI/código (validados contra el padrón), define delegado y
  sube el voucher si la disciplina es pagada.
- **Estado de inscripción** (`estado-inscripcion.vue`): seguimiento de los
  equipos del usuario (pendiente/aprobado/rechazado).
- **Historial / resultados** (`historial.vue`, `resultados/`): participaciones y
  resultados del usuario.
- **Login** (`login.vue`) con Google y **completar perfil**
  (`completar-perfil.vue`) en el primer ingreso del estudiante.
- **403** (`403.vue`) para accesos no autorizados.

### Administración (layout `admin`, middleware `admin`)
- **Dashboard** (`admin/dashboard.vue`): métricas con Chart.js.
- **Facultades** (`admin/facultades.vue`): CRUD de facultades y escuelas.
- **Eventos** (`admin/eventos.vue`): CRUD de eventos.
- **Disciplinas** (`admin/disciplinas.vue`): CRUD + filtros (evento/facultad/
  escuela).
- **Inscripciones** (`admin/inscripciones.vue`): aprobar/rechazar equipos y
  **crear equipos manualmente** (con voucher).
- **Vouchers** (`admin/vouchers.vue`): validar/rechazar comprobantes.
- **Usuarios** (`admin/usuarios.vue`): CRUD, roles y habilitar/inhabilitar.

## 2. Qué se quiere lograr

Un frontend **desplegable de forma independiente** (servicio propio en Dokploy)
que reutilice la identidad visual oscura/neón de la referencia
`undc-sistema-deportes`, con SSR para buena carga inicial, y que centralice el
consumo de la API mediante un único composable (`useApi`) con manejo de sesión y
errores 401.

## 3. Lo planteado (roadmap)

### Implementado
- Sesión persistente con `useCookie` (sobrevive a refresh, compatible con SSR).
- Login Google + flujo de completar perfil (facultad/escuela) para estudiantes.
- Panel admin completo: facultades, eventos, disciplinas, inscripciones,
  vouchers, usuarios, dashboard.
- Componentes reutilizables `AppModal` y `AppConfirm` para formularios y
  confirmaciones de borrado en todo el panel.
- Creación manual de equipos por admin/owner (con búsqueda de integrantes y
  voucher) y **prevención de integrantes duplicados** (admin y página pública).
- Filtros de disciplinas por evento/facultad/escuela.

### Pendiente / futuro
- Vistas de **brackets** y avance de partidos (depende de endpoints del backend).
- Registro/visualización de **resultados** que alimenten posiciones.
- Mejoras de accesibilidad y estados de carga/skeletons.

## 4. Convenciones

- Componentes y composables **auto-importados** por Nuxt (no requieren `import`
  para `AppModal`, `AppConfirm`, `useApi`, `useFaculties`, etc.).
- `<script setup lang="ts">` siempre (Composition API).
- Clase utilitaria `.input` (definida en `<style scoped>`) reutilizada en los
  formularios del panel.
- Locale: español. Tema oscuro forzado (`html class="dark"`).
