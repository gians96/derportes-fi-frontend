<template>
  <div>
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-white">Inscripciones</h1>
        <p class="mt-1 text-sm text-oscuro-300">
          Equipos de disciplinas <span class="text-green-300">gratuitas</span>.
          Los de pago se gestionan en Vouchers.
        </p>
      </div>
      <button
        class="shrink-0 rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 hover:bg-green-500/20"
        @click="openCreate"
      >
        Crear equipo
      </button>
    </div>

    <!-- Filtros de estado -->
    <div class="mt-4 flex flex-wrap gap-2">
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

    <!-- Filtros por evento / facultad / escuela / disciplina -->
    <div class="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <label class="block">
        <span class="text-xs text-oscuro-400">Evento</span>
        <select v-model.number="adv.eventId" class="input">
          <option :value="0">Todos</option>
          <option v-for="e in events" :key="e.id" :value="e.id">{{ e.name }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-oscuro-400">Facultad</span>
        <select v-model.number="adv.facultyId" class="input">
          <option :value="0">Todas</option>
          <option v-for="f in faculties" :key="f.id" :value="f.id">{{ f.name }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-oscuro-400">Escuela profesional</span>
        <select v-model.number="adv.schoolId" class="input">
          <option :value="0">Todas</option>
          <option v-for="s in filterSchools" :key="s.id" :value="s.id">{{ s.name }}</option>
        </select>
      </label>
      <label class="block">
        <span class="text-xs text-oscuro-400">Disciplina</span>
        <select v-model.number="adv.disciplineId" class="input">
          <option :value="0">Todas</option>
          <option v-for="d in disciplines" :key="d.id" :value="d.id">{{ d.name }}</option>
        </select>
      </label>
    </div>

    <p v-if="!filtered.length" class="mt-8 text-center text-sm text-oscuro-400">
      No hay equipos que coincidan con los filtros.
    </p>

    <!-- Tarjetas de equipos -->
    <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="team in filtered"
        :key="team.id"
        class="flex flex-col rounded-3xl border border-oscuro-700 bg-oscuro-850 p-5 transition-all hover:border-green-700/40 hover:shadow-2xl hover:shadow-green-900/10"
      >
        <!-- Cabecera -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              :class="getSportMeta(team.discipline?.name).bg"
            >
              <component
                :is="getSportMeta(team.discipline?.name).icon"
                class="h-6 w-6"
                :class="getSportMeta(team.discipline?.name).color"
              />
            </span>
            <div class="min-w-0">
              <p class="truncate text-lg font-bold text-white">{{ team.name }}</p>
              <p class="truncate text-xs text-oscuro-400">
                {{ team.discipline?.name || team.disciplineName }}
              </p>
            </div>
          </div>
          <StatusBadge :status="team.status" />
        </div>

        <!-- Metadatos -->
        <div class="mt-4 space-y-1.5 text-xs text-oscuro-300">
          <p class="flex items-center gap-2">
            <CalendarRange class="h-3.5 w-3.5 text-oscuro-500" />
            <span class="truncate">{{ team.discipline?.event?.name || '—' }}</span>
          </p>
          <p class="flex items-center gap-2">
            <Building2 class="h-3.5 w-3.5 text-oscuro-500" />
            <span class="truncate">{{ team.discipline?.event?.faculty?.name || '—' }}</span>
          </p>
          <p class="flex items-center gap-2">
            <GraduationCap class="h-3.5 w-3.5 text-oscuro-500" />
            <span class="truncate">{{ team.discipline?.event?.school?.name || 'Todas las escuelas' }}</span>
          </p>
        </div>

        <!-- Cuerpo: participantes + validación -->
        <div class="my-5 flex items-center justify-between gap-4">
          <div class="text-center">
            <p class="text-xs text-green-400">Integrantes</p>
            <p class="text-4xl font-bold text-green-400">{{ team.participants.length }}</p>
          </div>
          <div class="h-14 w-px bg-oscuro-700" />
          <div class="flex-1 text-center">
            <p class="text-xs text-oscuro-400">Validación de reglas</p>
            <p
              class="mt-1 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold"
              :class="
                rulesCheck(team).ok
                  ? 'bg-green-500/10 text-green-300'
                  : 'bg-red-500/10 text-red-300'
              "
            >
              <component :is="rulesCheck(team).ok ? CheckCircle2 : AlertTriangle" class="h-3.5 w-3.5" />
              {{ rulesCheck(team).ok ? 'Cumple' : 'Revisar' }}
            </p>
          </div>
        </div>

        <!-- Detalle de validación -->
        <ul
          v-if="rulesCheck(team).messages.length"
          class="mb-3 space-y-1 rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-300"
        >
          <li v-for="m in rulesCheck(team).messages" :key="m" class="flex items-center gap-1.5">
            <AlertTriangle class="h-3 w-3 shrink-0" />
            {{ m }}
          </li>
        </ul>

        <!-- Ver jugadores -->
        <button
          class="flex w-full items-center justify-between rounded-2xl border border-oscuro-700 bg-oscuro-900/50 px-4 py-2.5 text-sm font-semibold text-oscuro-300 transition-all hover:border-green-500/40 hover:text-green-300"
          @click="openPlayers(team)"
        >
          <span class="flex items-center gap-2">
            <Users class="h-4 w-4" />
            Ver jugadores
          </span>
          <ChevronRight class="h-4 w-4" />
        </button>

        <!-- Acciones (solo pendientes) -->
        <div
          v-if="team.status === 'PENDING'"
          class="mt-4 space-y-2 border-t border-oscuro-700 pt-4"
        >
          <button
            class="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-oscuro-900 hover:bg-green-400"
            @click="approve(team)"
          >
            Aprobar
          </button>
          <div class="flex items-center gap-2">
            <input
              v-model="reasons[team.id]"
              placeholder="Motivo de rechazo"
              class="min-w-0 flex-1 rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2 text-sm text-white"
            />
            <button
              class="shrink-0 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25"
              @click="reject(team)"
            >
              Rechazar
            </button>
          </div>
        </div>

        <p
          v-else-if="team.status === 'REJECTED' && team.rejectionReason"
          class="mt-3 rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-300"
        >
          Motivo: {{ team.rejectionReason }}
        </p>
      </div>
    </div>

    <!-- Modal jugadores -->
    <AppModal v-model="playersOpen" :title="playersTeam?.name || 'Jugadores'">
      <ul v-if="playersTeam" class="space-y-1.5 text-sm">
        <li
          v-for="(p, i) in playersTeam.participants"
          :key="p.studentCode || p.dni || p.fullName"
          class="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-white/5"
        >
          <span class="flex items-center gap-2 text-oscuro-100">
            <span class="text-xs text-oscuro-500">{{ i + 1 }}.</span>
            {{ p.fullName }}
            <span v-if="p.isDelegate" class="text-xs text-green-400">(Delegado)</span>
          </span>
          <span class="font-mono text-xs text-oscuro-400">{{ p.studentCode || p.dni || '—' }}</span>
        </li>
      </ul>
    </AppModal>

    <!-- Crear equipo manual -->
    <AppModal v-model="createOpen" title="Crear equipo manualmente">
      <form class="grid gap-4" @submit.prevent="submitCreate">
        <label class="block">
          <span class="text-sm text-oscuro-200">Disciplina</span>
          <select v-model.number="createForm.disciplineId" required class="input">
            <option :value="0" disabled>Selecciona…</option>
            <option v-for="d in disciplines" :key="d.id" :value="d.id">
              {{ d.name }} ·
              {{ d.participantType === 'OTHER' ? 'Otros' : 'Solo estudiantes' }}
              · {{ d.isPaid ? formatCurrency(d.cost) : 'Gratuito' }}
              <template v-if="d.event"> · {{ d.event.name }}</template>
            </option>
          </select>
          <span
            v-if="!disciplines.length"
            class="mt-1 block text-xs text-amber-400"
          >
            No hay disciplinas activas para el filtro seleccionado. Ajusta el
            evento/facultad en los filtros de arriba.
          </span>
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
            {{
              participantMode === 'OTHER'
                ? 'Busca por DNI (8 dígitos) en RENIEC.'
                : 'Busca por código de estudiante en el padrón.'
            }}
            El integrante marcado como delegado es el responsable del equipo.
          </p>
          <div class="mt-2 flex gap-2">
            <input
              v-model="participantSearch"
              :placeholder="
                participantMode === 'OTHER'
                  ? 'DNI (8 dígitos)'
                  : 'Código de estudiante'
              "
              :inputmode="participantMode === 'OTHER' ? 'numeric' : 'text'"
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
                <span class="text-xs text-oscuro-400">
                  · {{ p.studentCode || p.dni || 's/d' }}
                </span>
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

        <div
          v-if="selectedDiscipline?.isPaid"
          class="grid gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"
        >
          <span class="text-sm font-semibold text-amber-300">
            Comprobante de pago ({{ formatCurrency(selectedDiscipline.cost) }})
          </span>
          <label class="block">
            <span class="text-xs text-oscuro-300">N° de operación</span>
            <input v-model="createForm.operationNumber" class="input" />
          </label>
          <label class="block">
            <span class="text-xs text-oscuro-300">Imagen del voucher</span>
            <input
              type="file"
              accept="image/*"
              class="input"
              @change="onVoucher"
            />
          </label>
        </div>

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
import {
  AlertTriangle,
  Building2,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Users,
} from 'lucide-vue-next'
import type {
  AcademicStudent,
  Discipline,
  Participant,
  RegistrationStatus,
  SportEvent,
  Team,
} from '~/types/domain'
import { formatCurrency } from '~/utils/format'
import { getSportMeta } from '~/utils/sports'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const teams = ref<Team[]>([])
const reasons = reactive<Record<number, string>>({})
const filter = ref<RegistrationStatus | 'ALL'>('PENDING')

const events = ref<SportEvent[]>([])
const { faculties, load: loadFaculties } = useFaculties()

const adv = reactive({
  eventId: 0,
  facultyId: 0,
  schoolId: 0,
  disciplineId: 0,
})

const filterSchools = computed(
  () => faculties.value.find((f) => f.id === adv.facultyId)?.schools ?? [],
)

watch(
  () => adv.facultyId,
  () => {
    adv.schoolId = 0
  },
)

watch(
  () => [adv.eventId, adv.facultyId, adv.schoolId, adv.disciplineId],
  () => {
    loadTeams()
    loadDisciplines()
  },
)

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

function rulesCheck(team: Team): { ok: boolean; messages: string[] } {
  const messages: string[] = []
  const d = team.discipline
  const count = team.participants.length
  if (d) {
    if (count < d.minPlayers)
      messages.push(`Mínimo ${d.minPlayers} integrantes (tiene ${count}).`)
    if (count > d.maxPlayers)
      messages.push(`Máximo ${d.maxPlayers} integrantes (tiene ${count}).`)
    if (d.genderPolicy === 'MALE' && team.participants.some((p) => p.gender === 'F'))
      messages.push('La disciplina es solo varones.')
    if (d.genderPolicy === 'FEMALE' && team.participants.some((p) => p.gender === 'M'))
      messages.push('La disciplina es solo mujeres.')
  }
  const hasDelegate = team.participants.some((p) => p.isDelegate)
  if (!hasDelegate) messages.push('Falta designar un delegado.')
  return { ok: messages.length === 0, messages }
}

async function loadTeams() {
  // En esta vista solo se gestionan equipos de disciplinas gratuitas.
  // Los equipos de pago se validan en la sección de Vouchers.
  const query: Record<string, number | boolean> = { isPaid: false }
  if (adv.eventId) query.eventId = adv.eventId
  if (adv.facultyId) query.facultyId = adv.facultyId
  if (adv.schoolId) query.schoolId = adv.schoolId
  if (adv.disciplineId) query.disciplineId = adv.disciplineId
  try {
    teams.value = await api.get<Team[]>('/registrations', query)
  } catch {
    teams.value = []
  }
}

async function loadDisciplines() {
  const query: Record<string, number> = {}
  if (adv.eventId) query.eventId = adv.eventId
  if (adv.facultyId) query.facultyId = adv.facultyId
  if (adv.schoolId) query.schoolId = adv.schoolId
  try {
    disciplines.value = await api.get<Discipline[]>('/disciplines', query)
  } catch {
    disciplines.value = []
  }
}

async function load() {
  try {
    events.value = await api.get<SportEvent[]>('/events')
    await Promise.all([loadFaculties(), loadDisciplines(), loadTeams()])
  } catch {
    teams.value = []
  }
}

async function approve(team: Team) {
  await api.patch(`/registrations/${team.id}/approve`, {})
  await loadTeams()
}

async function reject(team: Team) {
  const reason = reasons[team.id]?.trim()
  if (!reason) return
  await api.patch(`/registrations/${team.id}/reject`, { reason })
  await loadTeams()
}

// --- Modal de jugadores ---
const playersOpen = ref(false)
const playersTeam = ref<Team | null>(null)
function openPlayers(team: Team) {
  playersTeam.value = team
  playersOpen.value = true
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

const participantMode = computed<'STUDENT' | 'OTHER'>(
  () => selectedDiscipline.value?.participantType ?? 'STUDENT',
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
  // Las disciplinas ya vienen filtradas por el evento/facultad seleccionados.
  if (!disciplines.value.length) {
    await loadDisciplines()
  }
}

async function searchParticipant() {
  const q = participantSearch.value.trim()
  if (!q) return
  if (!createForm.disciplineId) {
    participantError.value = 'Primero selecciona una disciplina.'
    return
  }
  searching.value = true
  participantError.value = ''
  try {
    let person: AcademicStudent
    if (participantMode.value === 'OTHER') {
      if (!/^\d{8}$/.test(q)) {
        participantError.value = 'Ingresa un DNI válido de 8 dígitos.'
        return
      }
      person = await api.get<AcademicStudent>('/academic/dni', { numero: q })
    } else {
      person = await api.get<AcademicStudent>('/academic/student', {
        buscador: q,
      })
    }
    const code = person.studentCode?.trim() || null
    const dni = person.dni?.trim() || (/^\d{8}$/.test(q) ? q : null)
    const already = createForm.participants.some(
      (p) =>
        (code && p.studentCode === code) ||
        (dni && p.dni === dni) ||
        (p.fullName.toLowerCase() === person.fullName.toLowerCase() &&
          (!code || !p.studentCode) &&
          (!dni || !p.dni)),
    )
    if (already) {
      participantError.value = 'Esa persona ya fue agregada.'
      return
    }
    createForm.participants.push({
      fullName: person.fullName.replace(/\s+/g, ' ').trim(),
      studentCode: code,
      dni,
      gender: 'O',
      isDelegate: createForm.participants.length === 0,
    })
    participantSearch.value = ''
  } catch {
    participantError.value =
      participantMode.value === 'OTHER'
        ? 'No se encontró una persona con ese DNI.'
        : 'No se encontró un estudiante único con ese código.'
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
    modalError.value =
      'Esta disciplina tiene costo: adjunta el comprobante de pago.'
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
    await loadTeams()
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
