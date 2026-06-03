<template>
  <div>
    <h1 class="text-xl font-bold text-white">Validación de vouchers</h1>
    <p class="mt-1 text-sm text-oscuro-300">
      Revisa los comprobantes de pago. Aquí se aprueba o rechaza el equipo de pago.
    </p>

    <!-- Tarjetas resumen -->
    <div class="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <button
        v-for="s in stats"
        :key="s.value"
        class="flex items-center gap-3 rounded-2xl border p-4 text-left transition-all"
        :class="
          filter === s.value
            ? 'border-green-500/50 bg-green-500/10'
            : 'border-oscuro-700 bg-oscuro-850 hover:border-oscuro-600'
        "
        @click="filter = s.value"
      >
        <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="s.bg">
          <component :is="s.icon" class="h-6 w-6" :class="s.color" />
        </span>
        <div>
          <p class="text-2xl font-bold text-white">{{ s.count }}</p>
          <p class="text-xs text-oscuro-400">{{ s.label }}</p>
        </div>
      </button>
    </div>

    <!-- Filtros -->
    <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      No hay vouchers que coincidan con los filtros.
    </p>

    <!-- Tarjetas de vouchers -->
    <div class="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <button
        v-for="v in filtered"
        :key="v.id"
        class="group flex flex-col rounded-3xl border border-oscuro-700 bg-oscuro-850 p-5 text-left transition-all hover:border-green-700/40 hover:shadow-2xl hover:shadow-green-900/10"
        @click="openDetail(v)"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex min-w-0 items-start gap-3">
            <span
              class="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              :class="getSportMeta(v.disciplineName).bg"
            >
              <component
                :is="getSportMeta(v.disciplineName).icon"
                class="h-6 w-6"
                :class="getSportMeta(v.disciplineName).color"
              />
            </span>
            <div class="min-w-0">
              <p class="truncate text-lg font-bold text-white">{{ v.teamName }}</p>
              <p class="truncate text-xs text-oscuro-400">{{ v.disciplineName || '—' }}</p>
            </div>
          </div>
          <StatusBadge :status="v.status" />
        </div>

        <!-- Imagen del comprobante -->
        <div class="relative mt-4 overflow-hidden rounded-2xl border border-oscuro-700">
          <img
            v-if="v.imageUrl"
            :src="resolveUrl(v.imageUrl)"
            alt="voucher"
            class="h-40 w-full object-cover transition-transform group-hover:scale-105"
          />
          <div v-else class="flex h-40 w-full items-center justify-center bg-oscuro-900 text-oscuro-500">
            Sin imagen
          </div>
          <div class="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <span class="flex items-center gap-2 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-semibold text-oscuro-900">
              <Eye class="h-4 w-4" /> Ver detalle
            </span>
          </div>
        </div>

        <!-- Monto / operación -->
        <div class="mt-4 grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-oscuro-900/50 px-3 py-2">
            <p class="text-xs text-oscuro-400">Monto</p>
            <p class="font-semibold text-green-400">{{ formatCurrency(v.amount) }}</p>
          </div>
          <div class="rounded-xl bg-oscuro-900/50 px-3 py-2">
            <p class="text-xs text-oscuro-400">Nº operación</p>
            <p class="truncate font-semibold text-white">{{ v.operationNumber || '—' }}</p>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between text-xs text-oscuro-400">
          <span class="flex items-center gap-1.5">
            <Users class="h-3.5 w-3.5" /> {{ v.participantsCount ?? v.participants?.length ?? 0 }} jugadores
          </span>
          <span>{{ formatDate(v.uploadedAt) }}</span>
        </div>
      </button>
    </div>

    <!-- Modal de detalle -->
    <AppModal v-model="detailOpen" :title="detail?.teamName || 'Detalle del voucher'" size="4xl">
      <div v-if="detail" class="grid gap-6 lg:grid-cols-2">
        <!-- Imagen -->
        <div>
          <div
            v-if="detail.imageUrl"
            class="block overflow-hidden rounded-2xl border border-oscuro-700"
          >
            <img :src="resolveUrl(detail.imageUrl)" alt="voucher" class="w-full object-contain" />
          </div>
          <div v-else class="flex h-60 items-center justify-center rounded-2xl border border-oscuro-700 bg-oscuro-900 text-oscuro-500">
            Sin imagen
          </div>
        </div>

        <!-- Detalles -->
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span
              class="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold"
              :class="getSportMeta(detail.disciplineName).bg"
            >
              <component
                :is="getSportMeta(detail.disciplineName).icon"
                class="h-4 w-4"
                :class="getSportMeta(detail.disciplineName).color"
              />
              <span class="text-white">{{ detail.disciplineName || '—' }}</span>
            </span>
            <StatusBadge :status="detail.status" />
          </div>

          <dl class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt class="text-xs text-oscuro-400">Monto</dt>
              <dd class="font-semibold text-green-400">{{ formatCurrency(detail.amount) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Nº operación</dt>
              <dd class="font-semibold text-white">{{ detail.operationNumber || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Evento</dt>
              <dd class="text-oscuro-200">{{ detail.eventName || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Fecha</dt>
              <dd class="text-oscuro-200">{{ formatDate(detail.uploadedAt) }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Facultad</dt>
              <dd class="text-oscuro-200">{{ detail.facultyName || '—' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Escuela</dt>
              <dd class="text-oscuro-200">{{ detail.schoolName || 'Todas' }}</dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Tipo de participante</dt>
              <dd class="text-oscuro-200">
                {{
                  detail.participantType === 'OTHER'
                    ? 'Externos (por DNI)'
                    : 'Estudiantes (por código)'
                }}
              </dd>
            </div>
            <div>
              <dt class="text-xs text-oscuro-400">Celular del delegado</dt>
              <dd class="flex items-center gap-1.5 font-semibold text-white">
                <Phone class="h-3.5 w-3.5 text-green-400" />
                {{ detail.phone || '—' }}
              </dd>
            </div>
          </dl>

          <!-- Validación de reglas -->
          <div
            class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold"
            :class="detailRules.ok ? 'bg-green-500/10 text-green-300' : 'bg-red-500/10 text-red-300'"
          >
            <component :is="detailRules.ok ? CheckCircle2 : AlertTriangle" class="h-4 w-4" />
            {{ detailRules.ok ? 'El equipo cumple las reglas' : 'Revisar reglas del equipo' }}
          </div>
          <ul v-if="detailRules.messages.length" class="space-y-1 text-xs text-red-300">
            <li v-for="m in detailRules.messages" :key="m" class="flex items-center gap-1.5">
              <AlertTriangle class="h-3 w-3 shrink-0" /> {{ m }}
            </li>
          </ul>

          <!-- Jugadores -->
          <div class="rounded-xl border border-oscuro-700">
            <button
              class="flex w-full items-center justify-between px-4 py-2.5 text-sm font-semibold text-oscuro-200"
              @click="playersExpanded = !playersExpanded"
            >
              <span class="flex items-center gap-2">
                <Users class="h-4 w-4" />
                Jugadores ({{ detail.participants?.length ?? 0 }})
              </span>
              <ChevronDown
                class="h-4 w-4 transition-transform"
                :class="playersExpanded ? 'rotate-180' : ''"
              />
            </button>
            <ul v-if="playersExpanded" class="border-t border-oscuro-700 p-2 text-sm">
              <li
                v-for="(p, i) in detail.participants"
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
          </div>

          <p
            v-if="detail.status === 'REJECTED' && detail.rejectionReason"
            class="rounded-lg bg-red-500/5 px-3 py-2 text-xs text-red-300"
          >
            Motivo del rechazo: {{ detail.rejectionReason }}
          </p>
        </div>
      </div>

      <template v-if="detail && detail.status === 'PENDING'" #footer>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <input
              v-model="detailReason"
              placeholder="Motivo de rechazo"
              class="min-w-0 flex-1 rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2 text-sm text-white"
            />
            <button
              class="shrink-0 rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25"
              @click="rejectDetail"
            >
              Rechazar
            </button>
          </div>
          <button
            class="w-full rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-oscuro-900 hover:bg-green-400"
            @click="validateDetail"
          >
            Aprobar equipo
          </button>
        </div>
      </template>
    </AppModal>
  </div>
</template>

<script setup lang="ts">
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  ListChecks,
  Phone,
  Users,
  XCircle,
} from 'lucide-vue-next'
import type { Discipline, Participant, SportEvent, Voucher, VoucherStatus } from '~/types/domain'
import { formatCurrency } from '~/utils/format'
import { getSportMeta } from '~/utils/sports'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const config = useRuntimeConfig()
const vouchers = ref<Voucher[]>([])
const filter = ref<VoucherStatus | 'ALL'>('ALL')

const events = ref<SportEvent[]>([])
const disciplines = ref<Discipline[]>([])
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
    loadVouchers()
    loadDisciplines()
  },
)

const stats = computed(() => [
  {
    label: 'Pendientes',
    value: 'PENDING' as const,
    count: vouchers.value.filter((v) => v.status === 'PENDING').length,
    icon: Clock,
    bg: 'bg-amber-500/10',
    color: 'text-amber-400',
  },
  {
    label: 'Validados',
    value: 'VALIDATED' as const,
    count: vouchers.value.filter((v) => v.status === 'VALIDATED').length,
    icon: CheckCircle2,
    bg: 'bg-green-500/10',
    color: 'text-green-400',
  },
  {
    label: 'Rechazados',
    value: 'REJECTED' as const,
    count: vouchers.value.filter((v) => v.status === 'REJECTED').length,
    icon: XCircle,
    bg: 'bg-red-500/10',
    color: 'text-red-400',
  },
  {
    label: 'Todos',
    value: 'ALL' as const,
    count: vouchers.value.length,
    icon: ListChecks,
    bg: 'bg-sky-500/10',
    color: 'text-sky-400',
  },
])

const filtered = computed(() =>
  filter.value === 'ALL'
    ? vouchers.value
    : vouchers.value.filter((v) => v.status === filter.value),
)

function resolveUrl(path: string) {
  if (path.startsWith('http')) return path
  return config.public.apiBase.replace(/\/api\/v1$/, '') + path
}

function formatDate(value?: string) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function rulesCheck(v: Voucher): { ok: boolean; messages: string[] } {
  const messages: string[] = []
  const list: Participant[] = v.participants ?? []
  const count = list.length || (v.participantsCount ?? 0)
  if (v.minPlayers && count < v.minPlayers)
    messages.push(`Mínimo ${v.minPlayers} integrantes (tiene ${count}).`)
  if (v.maxPlayers && count > v.maxPlayers)
    messages.push(`Máximo ${v.maxPlayers} integrantes (tiene ${count}).`)
  if (v.genderPolicy === 'MALE' && list.some((p) => p.gender === 'F'))
    messages.push('La disciplina es solo varones.')
  if (v.genderPolicy === 'FEMALE' && list.some((p) => p.gender === 'M'))
    messages.push('La disciplina es solo mujeres.')
  return { ok: messages.length === 0, messages }
}

async function loadVouchers() {
  const query: Record<string, number> = {}
  if (adv.eventId) query.eventId = adv.eventId
  if (adv.facultyId) query.facultyId = adv.facultyId
  if (adv.schoolId) query.schoolId = adv.schoolId
  if (adv.disciplineId) query.disciplineId = adv.disciplineId
  try {
    vouchers.value = await api.get<Voucher[]>('/vouchers', query)
  } catch {
    vouchers.value = []
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
    await Promise.all([loadFaculties(), loadDisciplines(), loadVouchers()])
  } catch {
    vouchers.value = []
  }
}

// --- Modal de detalle ---
const detailOpen = ref(false)
const detail = ref<Voucher | null>(null)
const detailReason = ref('')
const playersExpanded = ref(false)

const detailRules = computed(() =>
  detail.value ? rulesCheck(detail.value) : { ok: true, messages: [] },
)

function openDetail(v: Voucher) {
  detail.value = v
  detailReason.value = ''
  playersExpanded.value = false
  detailOpen.value = true
}

async function validateDetail() {
  if (!detail.value) return
  await api.patch(`/vouchers/${detail.value.id}/validate`, {})
  detailOpen.value = false
  await loadVouchers()
}

async function rejectDetail() {
  if (!detail.value) return
  const reason = detailReason.value.trim()
  if (!reason) return
  await api.patch(`/vouchers/${detail.value.id}/reject`, { reason })
  detailOpen.value = false
  await loadVouchers()
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
