<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">Facultades y Escuelas</h1>
      <button
        class="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20"
        @click="openCreateFaculty"
      >
        Nueva facultad
      </button>
    </div>

    <AppModal v-model="showFacultyForm" title="Nueva facultad">
      <form class="grid gap-4 sm:grid-cols-2" @submit.prevent="createFaculty">
        <label class="block">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input v-model="facultyForm.name" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Siglas (opcional)</span>
          <input v-model="facultyForm.acronym" class="input" />
        </label>
        <p v-if="modalError" class="text-sm text-red-400 sm:col-span-2">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400 sm:col-span-2"
        >
          Guardar facultad
        </button>
      </form>
    </AppModal>

    <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>

    <div class="mt-6 space-y-4">
      <div
        v-for="faculty in faculties"
        :key="faculty.id"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-semibold text-white">
              {{ faculty.name }}
              <span v-if="faculty.acronym" class="text-oscuro-400">
                ({{ faculty.acronym }})
              </span>
            </p>
            <p class="text-xs text-oscuro-400">
              {{ faculty.schools?.length ?? 0 }} escuela(s)
            </p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-semibold text-green-300 hover:bg-green-500/10"
              @click="openSchoolForm(faculty.id)"
            >
              + Escuela
            </button>
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-semibold text-sky-300 hover:bg-sky-500/10"
              @click="openEditFaculty(faculty)"
            >
              Editar
            </button>
            <button
              class="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10"
              @click="askDeleteFaculty(faculty)"
            >
              Eliminar
            </button>
          </div>
        </div>

        <ul v-if="faculty.schools?.length" class="mt-3 space-y-1.5">
          <li
            v-for="school in faculty.schools"
            :key="school.id"
            class="flex items-center justify-between rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2"
          >
            <span class="text-sm text-oscuro-100">{{ school.name }}</span>
            <div class="flex items-center gap-3">
              <button
                class="text-xs font-semibold text-sky-300 hover:text-sky-200"
                @click="openEditSchool(school)"
              >
                Editar
              </button>
              <button
                class="text-xs font-semibold text-red-400 hover:text-red-300"
                @click="askDeleteSchool(school)"
              >
                Quitar
              </button>
            </div>
          </li>
        </ul>
      </div>

      <p
        v-if="!faculties.length"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-6 text-center text-sm text-oscuro-400"
      >
        Aún no hay facultades registradas.
      </p>
    </div>

    <!-- Editar facultad -->
    <AppModal v-model="editFacultyOpen" title="Editar facultad">
      <form class="grid gap-4" @submit.prevent="saveFaculty">
        <label class="block">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input v-model="editFacultyForm.name" required class="input" />
        </label>
        <label class="block">
          <span class="text-sm text-oscuro-200">Siglas (opcional)</span>
          <input v-model="editFacultyForm.acronym" class="input" />
        </label>
        <p v-if="modalError" class="text-sm text-red-400">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400"
        >
          Guardar cambios
        </button>
      </form>
    </AppModal>

    <!-- Crear escuela -->
    <AppModal v-model="schoolCreateOpen" title="Nueva escuela profesional">
      <form class="grid gap-4" @submit.prevent="createSchool">
        <label class="block">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input
            v-model="schoolName"
            required
            placeholder="Nombre de la escuela profesional"
            class="input"
          />
        </label>
        <p v-if="modalError" class="text-sm text-red-400">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400"
        >
          Añadir escuela
        </button>
      </form>
    </AppModal>

    <!-- Editar escuela -->
    <AppModal v-model="editSchoolOpen" title="Editar escuela profesional">
      <form class="grid gap-4" @submit.prevent="saveSchool">
        <label class="block">
          <span class="text-sm text-oscuro-200">Nombre</span>
          <input v-model="editSchoolForm.name" required class="input" />
        </label>
        <p v-if="modalError" class="text-sm text-red-400">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400"
        >
          Guardar cambios
        </button>
      </form>
    </AppModal>

    <!-- Confirmación de borrado -->
    <AppConfirm
      v-model="confirmOpen"
      :title="confirmTitle"
      :message="confirmMessage"
      :loading="confirmLoading"
      :error="modalError"
      @confirm="runDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Faculty, ProfessionalSchool } from '~/types/domain'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const { faculties, load } = useFaculties()

const showFacultyForm = ref(false)
const facultyForm = reactive({ name: '', acronym: '' })
const schoolFormFor = ref<number | null>(null)
const schoolName = ref('')
const error = ref('')
const modalError = ref('')
const schoolCreateOpen = ref(false)

function openSchoolForm(facultyId: number) {
  modalError.value = ''
  schoolFormFor.value = facultyId
  schoolName.value = ''
  schoolCreateOpen.value = true
}

function openCreateFaculty() {
  modalError.value = ''
  facultyForm.name = ''
  facultyForm.acronym = ''
  showFacultyForm.value = true
}

function showModalError(err: unknown, fallback: string) {
  modalError.value =
    (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
    fallback
}

async function createFaculty() {
  error.value = ''
  modalError.value = ''
  try {
    await api.post('/faculties', {
      name: facultyForm.name,
      acronym: facultyForm.acronym || undefined,
    })
    facultyForm.name = ''
    facultyForm.acronym = ''
    showFacultyForm.value = false
    await load(true)
  } catch (err) {
    showModalError(err, 'No se pudo crear la facultad')
  }
}

async function createSchool() {
  error.value = ''
  modalError.value = ''
  const fid = schoolFormFor.value
  if (!fid) return
  try {
    await api.post('/schools', { name: schoolName.value, facultyId: fid })
    schoolName.value = ''
    schoolFormFor.value = null
    schoolCreateOpen.value = false
    await load(true)
  } catch (err) {
    showModalError(err, 'No se pudo crear la escuela')
  }
}

// --- Editar facultad ---
const editFacultyOpen = ref(false)
const editFacultyId = ref<number | null>(null)
const editFacultyForm = reactive({ name: '', acronym: '' })

function openEditFaculty(faculty: Faculty) {
  modalError.value = ''
  editFacultyId.value = faculty.id
  editFacultyForm.name = faculty.name
  editFacultyForm.acronym = faculty.acronym ?? ''
  editFacultyOpen.value = true
}

async function saveFaculty() {
  modalError.value = ''
  try {
    await api.patch(`/faculties/${editFacultyId.value}`, {
      name: editFacultyForm.name,
      acronym: editFacultyForm.acronym || undefined,
    })
    editFacultyOpen.value = false
    await load(true)
  } catch (err) {
    showModalError(err, 'No se pudo actualizar la facultad')
  }
}

// --- Editar escuela ---
const editSchoolOpen = ref(false)
const editSchoolId = ref<number | null>(null)
const editSchoolForm = reactive({ name: '' })

function openEditSchool(school: ProfessionalSchool) {
  modalError.value = ''
  editSchoolId.value = school.id
  editSchoolForm.name = school.name
  editSchoolOpen.value = true
}

async function saveSchool() {
  modalError.value = ''
  try {
    await api.patch(`/schools/${editSchoolId.value}`, { name: editSchoolForm.name })
    editSchoolOpen.value = false
    await load(true)
  } catch (err) {
    showModalError(err, 'No se pudo actualizar la escuela')
  }
}

// --- Confirmación de borrado ---
const confirmOpen = ref(false)
const confirmLoading = ref(false)
const confirmTitle = ref('')
const confirmMessage = ref('')
const pendingDelete = ref<{ type: 'faculty' | 'school'; id: number } | null>(null)

function askDeleteFaculty(faculty: Faculty) {
  modalError.value = ''
  pendingDelete.value = { type: 'faculty', id: faculty.id }
  confirmTitle.value = 'Eliminar facultad'
  confirmMessage.value = `¿Eliminar la facultad "${faculty.name}"? Esta acción no se puede deshacer.`
  confirmOpen.value = true
}

function askDeleteSchool(school: ProfessionalSchool) {
  modalError.value = ''
  pendingDelete.value = { type: 'school', id: school.id }
  confirmTitle.value = 'Eliminar escuela'
  confirmMessage.value = `¿Eliminar la escuela "${school.name}"? Esta acción no se puede deshacer.`
  confirmOpen.value = true
}

async function runDelete() {
  if (!pendingDelete.value) return
  confirmLoading.value = true
  modalError.value = ''
  try {
    const { type, id } = pendingDelete.value
    await api.del(type === 'faculty' ? `/faculties/${id}` : `/schools/${id}`)
    confirmOpen.value = false
    pendingDelete.value = null
    await load(true)
  } catch (err) {
    showModalError(err, 'No se pudo eliminar')
  } finally {
    confirmLoading.value = false
  }
}

onMounted(() => load(true))
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
