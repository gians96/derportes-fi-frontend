<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">Eventos</h1>
      <button
        class="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20"
        @click="openCreate"
      >
        Nuevo evento
      </button>
    </div>

    <AppModal v-model="showForm" title="Nuevo evento">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="create">
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input v-model="form.name" required class="input" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Descripción</span>
          <textarea v-model="form.description" rows="2" class="input"></textarea>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Facultad</span>
          <select v-model.number="form.facultyId" required class="input">
            <option :value="0" disabled>Selecciona una facultad</option>
            <option v-for="f in faculties" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Escuela (opcional)</span>
          <select v-model.number="form.schoolId" class="input">
            <option :value="0">Todas las escuelas</option>
            <option v-for="s in schoolsOfFaculty" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Inicio</span>
          <input v-model="form.startDate" type="date" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Fin</span>
          <input v-model="form.endDate" type="date" required class="input" />
        </label>
        <p v-if="error" class="text-sm text-red-400 sm:col-span-2">{{ error }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400 sm:col-span-2"
        >
          Guardar evento
        </button>
      </form>
    </AppModal>

    <div class="mt-6 space-y-3">
      <div
        v-for="event in events"
        :key="event.id"
        class="flex items-center justify-between rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
      >
        <div>
          <p class="font-semibold text-white">{{ event.name }}</p>
          <p class="text-xs text-oscuro-400">
            {{ formatDateUtc(event.startDate) }} — {{ formatDateUtc(event.endDate) }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              event.isOpen
                ? 'bg-green-500/10 text-green-300'
                : 'bg-oscuro-700 text-oscuro-300'
            "
          >
            {{ event.isOpen ? 'Abierto' : 'Cerrado' }}
          </span>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/10"
            @click="openEdit(event)"
          >
            Editar
          </button>
          <button
            class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
            @click="askDelete(event)"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <!-- Editar evento -->
    <AppModal v-model="editOpen" title="Editar evento">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="saveEdit">
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input v-model="editForm.name" required class="input" />
        </label>
        <label class="block sm:col-span-2">
          <span class="text-sm text-oscuro-200">Descripción</span>
          <textarea v-model="editForm.description" rows="2" class="input"></textarea>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Facultad</span>
          <select v-model.number="editForm.facultyId" required class="input">
            <option :value="0" disabled>Selecciona una facultad</option>
            <option v-for="f in faculties" :key="f.id" :value="f.id">
              {{ f.name }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Escuela (opcional)</span>
          <select v-model.number="editForm.schoolId" class="input">
            <option :value="0">Todas las escuelas</option>
            <option v-for="s in editSchoolsOfFaculty" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </select>
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Inicio</span>
          <input v-model="editForm.startDate" type="date" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Fin</span>
          <input v-model="editForm.endDate" type="date" required class="input" />
        </label>
        <label class="flex items-center gap-2 sm:col-span-2">
          <input v-model="editForm.isOpen" type="checkbox" class="h-4 w-4" />
          <span class="text-sm text-oscuro-200">Inscripciones abiertas</span>
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

    <!-- Confirmación de borrado -->
    <AppConfirm
      v-model="confirmOpen"
      title="Eliminar evento"
      :message="confirmMessage"
      :loading="confirmLoading"
      :error="modalError"
      @confirm="runDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { SportEvent } from '~/types/domain'
import { formatDateUtc } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const auth = useAuthStore()
const { faculties, load: loadFaculties } = useFaculties()
const events = ref<SportEvent[]>([])
const showForm = ref(false)
const error = ref('')
const form = reactive({
  name: '',
  description: '',
  facultyId: 0,
  schoolId: 0,
  startDate: '',
  endDate: '',
})

const schoolsOfFaculty = computed(
  () => faculties.value.find((f) => f.id === form.facultyId)?.schools ?? [],
)

watch(
  () => form.facultyId,
  () => {
    form.schoolId = 0
  },
)

const modalError = ref('')

function showModalError(err: unknown, fallback: string) {
  modalError.value =
    (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
    fallback
}

function toDateInput(value: string) {
  return value ? value.slice(0, 10) : ''
}

// --- Editar evento ---
const editOpen = ref(false)
const editId = ref<number | null>(null)
const editForm = reactive({
  name: '',
  description: '',
  facultyId: 0,
  schoolId: 0,
  startDate: '',
  endDate: '',
  isOpen: true,
})

const editSchoolsOfFaculty = computed(
  () => faculties.value.find((f) => f.id === editForm.facultyId)?.schools ?? [],
)

function openEdit(event: SportEvent) {
  modalError.value = ''
  editId.value = event.id
  Object.assign(editForm, {
    name: event.name,
    description: event.description ?? '',
    facultyId: event.facultyId,
    schoolId: event.schoolId ?? 0,
    startDate: toDateInput(event.startDate),
    endDate: toDateInput(event.endDate),
    isOpen: event.isOpen,
  })
  editOpen.value = true
}

async function saveEdit() {
  modalError.value = ''
  if (!editForm.facultyId) {
    modalError.value = 'Selecciona una facultad'
    return
  }
  try {
    await api.patch(`/events/${editId.value}`, {
      name: editForm.name,
      description: editForm.description || undefined,
      facultyId: editForm.facultyId,
      schoolId: editForm.schoolId || null,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
      isOpen: editForm.isOpen,
    })
    editOpen.value = false
    await load()
  } catch (err) {
    showModalError(err, 'No se pudo actualizar el evento')
  }
}

// --- Eliminar evento ---
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const confirmMessage = ref('')
const deleteId = ref<number | null>(null)

function askDelete(event: SportEvent) {
  modalError.value = ''
  deleteId.value = event.id
  confirmMessage.value = `¿Eliminar el evento "${event.name}"? Esta acción no se puede deshacer.`
  confirmOpen.value = true
}

async function runDelete() {
  if (!deleteId.value) return
  confirmLoading.value = true
  modalError.value = ''
  try {
    await api.del(`/events/${deleteId.value}`)
    confirmOpen.value = false
    deleteId.value = null
    await load()
  } catch (err) {
    showModalError(err, 'No se pudo eliminar el evento')
  } finally {
    confirmLoading.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    name: '',
    description: '',
    facultyId: auth.user?.facultyId ?? 0,
    schoolId: 0,
    startDate: '',
    endDate: '',
  })
}

function openCreate() {
  error.value = ''
  resetForm()
  showForm.value = true
}

async function load() {
  try {
    events.value = await api.get<SportEvent[]>('/events')
  } catch {
    events.value = []
  }
}

async function create() {
  error.value = ''
  if (!form.facultyId) {
    error.value = 'Selecciona una facultad'
    return
  }
  try {
    await api.post('/events', {
      name: form.name,
      description: form.description || undefined,
      facultyId: form.facultyId,
      schoolId: form.schoolId || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
    })
    showForm.value = false
    resetForm()
    await load()
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
      'No se pudo crear el evento'
  }
}

onMounted(async () => {
  await Promise.all([load(), loadFaculties()])
  resetForm()
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
