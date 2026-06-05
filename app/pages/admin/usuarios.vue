<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-white">Usuarios</h1>
        <p class="mt-1 text-sm text-oscuro-300">
          Gestiona el acceso, los roles y el estado de las cuentas.
        </p>
      </div>
      <button
        class="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20"
        @click="openCreate"
      >
        Nuevo usuario
      </button>
    </div>

    <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>

    <div class="mt-6 overflow-x-auto rounded-xl border border-oscuro-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-oscuro-800 text-oscuro-300">
          <tr>
            <th class="px-4 py-3">Nombre</th>
            <th class="px-4 py-3">Correo</th>
            <th class="px-4 py-3">Facultad / Escuela</th>
            <th class="px-4 py-3">Rol</th>
            <th class="px-4 py-3">Estado</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-oscuro-700 bg-oscuro-850">
          <tr v-for="u in users" :key="u.id">
            <td class="px-4 py-3 font-semibold text-white">{{ u.fullName }}</td>
            <td class="px-4 py-3 text-oscuro-300">{{ u.email }}</td>
            <td class="px-4 py-3 text-oscuro-300">
              <span v-if="u.facultyId">{{ facultyName(u.facultyId) }}</span>
              <span v-else class="text-oscuro-500">—</span>
              <span v-if="u.schoolId" class="block text-xs text-oscuro-500">
                {{ schoolName(u.schoolId) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <select
                v-model="u.role"
                class="rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-2 py-1 text-sm text-white disabled:opacity-50"
                :disabled="!canEdit(u)"
                @change="updateRole(u)"
              >
                <option value="STUDENT">Estudiante</option>
                <option value="OTHER">Otro</option>
                <option v-if="auth.isOwner" value="ADMIN_SYSTEM">
                  Administrador
                </option>
                <option v-if="auth.isOwner" value="OWNER_SYSTEM">Owner</option>
              </select>
            </td>
            <td class="px-4 py-3">
              <span
                class="rounded-full px-2.5 py-1 text-xs font-semibold"
                :class="
                  u.isActive
                    ? 'bg-green-500/10 text-green-300'
                    : 'bg-red-500/10 text-red-300'
                "
              >
                {{ u.isActive ? 'Activo' : 'Inhabilitado' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div v-if="canEdit(u)" class="flex items-center gap-3">
                <button
                  class="text-sm font-semibold text-sky-300 hover:text-sky-200"
                  @click="openEdit(u)"
                >
                  Editar
                </button>
                <button
                  class="text-sm font-semibold hover:opacity-80"
                  :class="u.isActive ? 'text-red-400' : 'text-green-400'"
                  @click="askToggleActive(u)"
                >
                  {{ u.isActive ? 'Inhabilitar' : 'Habilitar' }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Crear usuario -->
    <AppModal v-model="createOpen" title="Nuevo usuario">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="createUser">
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Nombre completo</span>
          <input v-model="createForm.fullName" required class="input" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Correo</span>
          <input v-model="createForm.email" type="email" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Rol</span>
          <select v-model="createForm.role" class="input">
            <option value="STUDENT">Estudiante</option>
            <option value="OTHER">Otro</option>
            <option v-if="auth.isOwner" value="ADMIN_SYSTEM">Administrador</option>
            <option v-if="auth.isOwner" value="OWNER_SYSTEM">Owner</option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">DNI (opcional)</span>
          <input v-model="createForm.dni" class="input" />
        </label>
        <label v-if="createForm.role !== 'OTHER'" class="block">
          <span class="text-sm text-oscuro-200">Facultad (opcional)</span>
          <select v-model.number="createForm.facultyId" class="input">
            <option :value="0">Sin facultad</option>
            <option v-for="f in faculties" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select>
        </label>
        <label v-if="createForm.role !== 'OTHER'" class="block">
          <span class="text-sm text-oscuro-200">Escuela (opcional)</span>
          <select v-model.number="createForm.schoolId" class="input">
            <option :value="0">Sin escuela</option>
            <option v-for="s in createSchools" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </label>
        <p v-if="modalError" class="text-sm text-red-400 sm:col-span-2">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400 sm:col-span-2"
        >
          Crear usuario
        </button>
      </form>
      <p class="mt-3 text-xs text-oscuro-400">
        El acceso se activa cuando la persona inicia sesión con Google usando este correo.
      </p>
    </AppModal>

    <!-- Editar usuario -->
    <AppModal v-model="editOpen" title="Editar usuario">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveUser">
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Nombre completo</span>
          <input v-model="editForm.fullName" required class="input" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Correo</span>
          <input v-model="editForm.email" type="email" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">DNI</span>
          <input v-model="editForm.dni" class="input" />
        </label>
        <label v-if="editForm.role !== 'OTHER'" class="block">
          <span class="text-sm text-oscuro-200">Facultad</span>
          <select v-model.number="editForm.facultyId" class="input">
            <option :value="0">Sin facultad</option>
            <option v-for="f in faculties" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select>
        </label>
        <label v-if="editForm.role !== 'OTHER'" class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Escuela</span>
          <select v-model.number="editForm.schoolId" class="input">
            <option :value="0">Sin escuela</option>
            <option v-for="s in editSchools" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </label>
        <p v-if="modalError" class="text-sm text-red-400 sm:col-span-2">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400 sm:col-span-2"
        >
          Guardar cambios
        </button>
      </form>
    </AppModal>

    <!-- Confirmar inhabilitar/habilitar -->
    <AppConfirm
      v-model="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :confirm-text="confirmText"
      :loading="confirmLoading"
      :error="modalError"
      @confirm="runToggleActive"
    />
  </div>
</template>

<script setup lang="ts">
import type { AuthUser } from '~/types/domain'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const auth = useAuthStore()
const { faculties, load: loadFaculties } = useFaculties()
const users = ref<AuthUser[]>([])
const error = ref('')
const modalError = ref('')

function facultyName(id: number) {
  return faculties.value.find((f) => f.id === id)?.name ?? `#${id}`
}

function schoolName(id: number) {
  for (const f of faculties.value) {
    const s = f.schools?.find((sc) => sc.id === id)
    if (s) return s.name
  }
  return `#${id}`
}

function schoolsOf(facultyId: number) {
  return faculties.value.find((f) => f.id === facultyId)?.schools ?? []
}

function showModalError(err: unknown, fallback: string) {
  modalError.value =
    (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
    fallback
}

// Un owner puede editar a cualquiera salvo otros owners.
// Un admin solo puede editar usuarios no administrativos.
function canEdit(u: AuthUser) {
  if (u.role === 'OWNER_SYSTEM') return false
  if (u.id === auth.user?.id) return false
  if (auth.isOwner) return true
  return u.role === 'STUDENT' || u.role === 'OTHER'
}

async function load() {
  try {
    users.value = await api.get<AuthUser[]>('/users')
  } catch {
    users.value = []
  }
}

async function updateRole(u: AuthUser) {
  error.value = ''
  try {
    await api.patch(`/users/${u.id}/role`, { role: u.role })
    await load()
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ??
      'No se pudo actualizar el rol'
    await load()
  }
}

// --- Crear usuario ---
const createOpen = ref(false)
const createForm = reactive({
  fullName: '',
  email: '',
  role: 'STUDENT' as AuthUser['role'],
  dni: '',
  facultyId: 0,
  schoolId: 0,
})
const createSchools = computed(() => schoolsOf(createForm.facultyId))
watch(
  () => createForm.role,
  (role) => {
    if (role === 'OTHER') {
      createForm.facultyId = 0
      createForm.schoolId = 0
    }
  },
)
watch(
  () => createForm.facultyId,
  () => {
    createForm.schoolId = 0
  },
)

function openCreate() {
  modalError.value = ''
  Object.assign(createForm, {
    fullName: '',
    email: '',
    role: 'STUDENT',
    dni: '',
    facultyId: 0,
    schoolId: 0,
  })
  createOpen.value = true
}

async function createUser() {
  modalError.value = ''
  try {
    await api.post('/users', {
      fullName: createForm.fullName,
      email: createForm.email,
      role: createForm.role,
      dni: createForm.dni || undefined,
      facultyId: createForm.role === 'OTHER' ? undefined : createForm.facultyId || undefined,
      schoolId: createForm.role === 'OTHER' ? undefined : createForm.schoolId || undefined,
    })
    createOpen.value = false
    await load()
  } catch (err) {
    showModalError(err, 'No se pudo crear el usuario')
  }
}

// --- Editar usuario ---
const editOpen = ref(false)
const editId = ref<number | null>(null)
const editForm = reactive({
  fullName: '',
  email: '',
  role: 'STUDENT' as AuthUser['role'],
  dni: '',
  facultyId: 0,
  schoolId: 0,
})
const editSchools = computed(() => schoolsOf(editForm.facultyId))
watch(
  () => editForm.role,
  (role) => {
    if (role === 'OTHER') {
      editForm.facultyId = 0
      editForm.schoolId = 0
    }
  },
)
watch(
  () => editForm.facultyId,
  (nv, ov) => {
    if (ov !== 0) editForm.schoolId = 0
  },
)

function openEdit(u: AuthUser) {
  modalError.value = ''
  editId.value = u.id
  Object.assign(editForm, {
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    dni: u.dni ?? '',
    facultyId: u.facultyId ?? 0,
    schoolId: u.schoolId ?? 0,
  })
  editOpen.value = true
}

async function saveUser() {
  modalError.value = ''
  try {
    await api.patch(`/users/${editId.value}`, {
      fullName: editForm.fullName,
      email: editForm.email,
      dni: editForm.dni || null,
      facultyId: editForm.role === 'OTHER' ? null : editForm.facultyId || null,
      schoolId: editForm.role === 'OTHER' ? null : editForm.schoolId || null,
    })
    editOpen.value = false
    await load()
  } catch (err) {
    showModalError(err, 'No se pudo actualizar el usuario')
  }
}

// --- Inhabilitar / habilitar ---
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const confirmText = ref('')
const toggleTarget = ref<AuthUser | null>(null)

function askToggleActive(u: AuthUser) {
  modalError.value = ''
  toggleTarget.value = u
  if (u.isActive) {
    confirmTitle.value = 'Inhabilitar usuario'
    confirmMessage.value = `¿Inhabilitar a "${u.fullName}"? No podrá iniciar sesión hasta reactivarlo.`
    confirmText.value = 'Inhabilitar'
  } else {
    confirmTitle.value = 'Habilitar usuario'
    confirmMessage.value = `¿Habilitar nuevamente a "${u.fullName}"?`
    confirmText.value = 'Habilitar'
  }
  confirmOpen.value = true
}

async function runToggleActive() {
  if (!toggleTarget.value) return
  confirmLoading.value = true
  modalError.value = ''
  try {
    await api.patch(`/users/${toggleTarget.value.id}/active`, {
      isActive: !toggleTarget.value.isActive,
    })
    confirmOpen.value = false
    toggleTarget.value = null
    await load()
  } catch (err) {
    showModalError(err, 'No se pudo cambiar el estado')
  } finally {
    confirmLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([load(), loadFaculties()])
})
</script>

<style scoped>
.input {
  margin-top: 0.25rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(55, 65, 81, 0.4);
  background-color: #182029;
  padding: 0.625rem 0.75rem;
  color: white;
  outline: none;
}
.input:focus {
  border-color: #4ade80;
  box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.4);
}
</style>
