<template>
  <div>
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-white">Inscripciones</h1>
        <p class="mt-1 text-sm text-oscuro-300">
          Aprueba o rechaza los equipos inscritos.
        </p>
      </div>
      <button
        class="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20"
        @click="openCreate"
      >
        Crear equipo
      </button>
    </div>

    <div class="mt-4 flex gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="
          filter === f.value
            ? 'bg-green-500/15 text-green-300'
            : 'bg-oscuro-850 text-oscuro-300 hover:bg-oscuro-800'
        "
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="mt-6 space-y-3">
      <div
        v-for="team in filtered"
        :key="team.id"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-5"
      >
        <div class="flex items-start justify-between">
          <div>
            <p class="font-semibold text-white">{{ team.name }}</p>
            <p class="text-xs text-oscuro-400">
              {{ team.disciplineName }} · {{ team.participants.length }} integrantes
            </p>
          </div>
          <StatusBadge :status="team.status" />
        </div>

        <ul class="mt-3 grid gap-1 text-sm text-oscuro-300 sm:grid-cols-2">
          <li v-for="p in team.participants" :key="p.studentCode || p.dni || p.fullName">
            {{ p.fullName }}
            <span v-if="p.isDelegate" class="text-green-400">(Delegado)</span>
          </li>
        </ul>

        <div
          v-if="team.status === 'PENDING'"
          class="mt-4 flex flex-wrap items-center gap-3"
        >
          <button
            class="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-oscuro-900 hover:bg-green-400"
            @click="approve(team)"
          >
            Aprobar
          </button>
          <input
            v-model="reasons[team.id]"
            placeholder="Motivo de rechazo"
            class="flex-1 rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2 text-sm text-white"
          />
          <button
            class="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25"
            @click="reject(team)"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>

    <!-- Crear equipo manual -->
    <AppModal v-model="createOpen" title="Crear equipo manualmente">
      <form class="grid gap-4" @submit.prevent="submitCreate">
        <label class="block">
          <span class="text-sm text-oscuro-200">Disciplina</span>
          <select v-model.number="createForm.disciplineId" required class="input">
            <option :value="0" disabled>Selecciona…</option>
            <option v-for="d in disciplines" :key="d.id" :value="d.id">
              {{ d.name }}{{ d.isPaid ? ` · ${formatCurrency(d.cost)}` : ' · Gratuito' }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="text-sm text-oscuro-200">Nombre del equipo</span>
          <input v-model="createForm.teamName" required class="input" />
        </label>

        <label class="block">
          <span class="text-sm text-oscuro-200">Teléfono (opcional)</span>
          <input v-model="createForm.phone" class="input" />
        </label>

        <div class="rounded-lg border border-oscuro-700 p-3">
          <span class="text-sm font-semibold text-oscuro-200">Integrantes</span>
          <p class="mt-1 text-xs text-oscuro-400">
            El integrante marcado como delegado es el responsable del equipo.
          </p>
          <div class="mt-2 flex gap-2">
            <input
              v-model="participantSearch"
              placeholder="DNI o código de estudiante"
              class="input flex-1"
              @keydown.enter.prevent="searchParticipant"
            />
            <button
              type="button"
              class="rounded-lg bg-green-500/15 px-3 text-sm font-semibold text-green-300 hover:bg-green-500/25"
              :disabled="searching"
              @click="searchParticipant"
            >
              Agregar
            </button>
          </div>
          <p v-if="participantError" class="mt-1 text-xs text-red-400">{{ participantError }}</p>
          <ul v-if="createForm.participants.length" class="mt-2 space-y-1">
            <li
              v-for="(p, i) in createForm.participants"
              :key="p.studentCode || p.dni || p.fullName"
              class="flex items-center justify-between rounded px-2 py-1 text-sm text-oscuro-200"
            >
              <span>
                {{ p.fullName }}
                <span v-if="p.isDelegate" class="text-green-400">(Delegado)</span>
              </span>
              <div class="flex items-center gap-3">
                <button
                  v-if="!p.isDelegate"
                  type="button"
                  class="text-xs text-sky-300 hover:text-sky-200"
                  @click="setDelegate(i)"
                >
                  Hacer delegado
                </button>
                <button
                  type="button"
                  class="text-xs text-red-400 hover:text-red-300"
                  @click="removeParticipant(i)"
                >
                  Quitar
                </button>
              </div>
            </li>
          </ul>
        </div>

        <template v-if="selectedDiscipline?.isPaid">
          <label class="block">
            <span class="text-sm text-oscuro-200">Número de operación</span>
            <input v-model="createForm.operationNumber" class="input" />
          </label>
          <label class="block">
            <span class="text-sm text-oscuro-200">Comprobante de pago</span>
            <input type="file" accept="image/*" class="input" @change="onVoucher" />
          </label>
        </template>

        <p v-if="modalError" class="text-sm text-red-400">{{ modalError }}</p>
        <button
          type="submit"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 hover:bg-green-400 disabled:opacity-50"
          :disabled="submitting"
        >
          {{ submitting ? 'Creando…' : 'Crear equipo' }}
        </button>
      </form>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import type {
  AcademicStudent,
  Discipline,
  Participant,
  RegistrationStatus,
  Team,
} from '~/types/domain'
import { formatCurrency } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const teams = ref<Team[]>([])
const reasons = reactive<Record<number, string>>({})
const filter = ref<RegistrationStatus | 'ALL'>('PENDING')

const filters: { label: string; value: RegistrationStatus | 'ALL' }[] = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Aprobados', value: 'APPROVED' },
  { label: 'Rechazados', value: 'REJECTED' },
  { label: 'Todos', value: 'ALL' },
]

const filtered = computed(() =>
  filter.value === 'ALL'
    ? teams.value
    : teams.value.filter((t) => t.status === filter.value),
)

async function load() {
  try {
    teams.value = await api.get<Team[]>('/registrations')
  } catch {
    teams.value = []
  }
}

async function approve(team: Team) {
  await api.patch(`/registrations/${team.id}/approve`, {})
  await load()
}

async function reject(team: Team) {
  const reason = reasons[team.id]?.trim()
  if (!reason) return
  await api.patch(`/registrations/${team.id}/reject`, { reason })
  await load()
}

// --- Crear equipo manual ---
const createOpen = ref(false)
const submitting = ref(false)
const modalError = ref('')
const disciplines = ref<Discipline[]>([])
const participantSearch = ref('')
const participantError = ref('')
const searching = ref(false)

const createForm = reactive({
  disciplineId: 0,
  teamName: '',
  phone: '',
  operationNumber: '',
  participants: [] as Participant[],
  voucherFile: null as File | null,
})

const selectedDiscipline = computed(() =>
  disciplines.value.find((d) => d.id === createForm.disciplineId),
)

function setDelegate(index: number) {
  createForm.participants.forEach((p, i) => (p.isDelegate = i === index))
}

function removeParticipant(index: number) {
  const wasDelegate = createForm.participants[index]?.isDelegate
  createForm.participants.splice(index, 1)
  // Si se quitó al delegado, el primer integrante restante asume el rol.
  if (wasDelegate && createForm.participants.length) {
    createForm.participants.forEach((p, i) => (p.isDelegate = i === 0))
  }
}

function onVoucher(e: Event) {
  const target = e.target as HTMLInputElement
  createForm.voucherFile = target.files?.[0] ?? null
}

async function openCreate() {
  modalError.value = ''
  participantError.value = ''
  Object.assign(createForm, {
    disciplineId: 0,
    teamName: '',
    phone: '',
    operationNumber: '',
    participants: [],
    voucherFile: null,
  })
  participantSearch.value = ''
  createOpen.value = true
  if (!disciplines.value.length) {
    try {
      disciplines.value = await api.get<Discipline[]>('/disciplines')
    } catch {
      disciplines.value = []
    }
  }
}

async function searchParticipant() {
  const q = participantSearch.value.trim()
  if (!q) return
  searching.value = true
  participantError.value = ''
  try {
    const student = await api.get<AcademicStudent>('/academic/student', {
      buscador: q,
    })
    const dni = /^\d{8}$/.test(q) ? q : null
    const already = createForm.participants.some(
      (p) =>
        (student.codEstu && p.studentCode === student.codEstu) ||
        (dni && p.dni === dni),
    )
    if (already) {
      participantError.value = 'Ese estudiante ya fue agregado.'
      return
    }
    createForm.participants.push({
      fullName: student.estudiante.replace(/\s+/g, ' ').trim(),
      studentCode: student.codEstu,
      dni,
      gender: 'O',
      isDelegate: createForm.participants.length === 0,
    })
    participantSearch.value = ''
  } catch {
    participantError.value =
      'No se encontró un estudiante único con ese DNI/código.'
  } finally {
    searching.value = false
  }
}

async function submitCreate() {
  modalError.value = ''
  if (!createForm.disciplineId) {
    modalError.value = 'Selecciona una disciplina.'
    return
  }
  if (!createForm.participants.length) {
    modalError.value = 'Agrega al menos un integrante.'
    return
  }
  if (selectedDiscipline.value?.isPaid && !createForm.voucherFile) {
    modalError.value = 'Esta disciplina requiere adjuntar el comprobante de pago.'
    return
  }
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('disciplineId', String(createForm.disciplineId))
    fd.append('teamName', createForm.teamName)
    fd.append('phone', createForm.phone)
    fd.append('participants', JSON.stringify(createForm.participants))
    if (selectedDiscipline.value?.isPaid) {
      fd.append('operationNumber', createForm.operationNumber)
      if (createForm.voucherFile) fd.append('voucher', createForm.voucherFile)
    }
    await api.upload('/registrations', fd)
    createOpen.value = false
    await load()
  } catch (err) {
    modalError.value =
      (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
      'No se pudo crear el equipo.'
  } finally {
    submitting.value = false
  }
}

onMounted(load)
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
