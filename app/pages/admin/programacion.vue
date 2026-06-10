<template>
  <div>
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-white">Programación de horarios</h1>
    </div>
    <p class="mt-1 max-w-3xl text-sm text-oscuro-300">
      Asigna automáticamente los horarios de la <strong>primera ronda</strong> de las
      disciplinas que se juegan en simultáneo. El sistema evita que un mismo estudiante
      tenga dos partidos a la vez y respeta el número de lozas de cada disciplina.
    </p>

    <!-- Configuración -->
    <div class="mt-6 grid gap-6 xl:grid-cols-[380px_1fr]">
      <div class="rounded-2xl border border-oscuro-700 bg-oscuro-900/60 p-5">
        <h2 class="text-sm font-bold uppercase tracking-wide text-oscuro-300">
          Configuración
        </h2>

        <label class="mt-4 block">
          <span class="text-sm text-oscuro-200">Evento</span>
          <select v-model.number="eventId" class="input">
            <option :value="0" disabled>Selecciona…</option>
            <option v-for="e in events" :key="e.id" :value="e.id">{{ e.name }}</option>
          </select>
        </label>

        <div class="mt-4">
          <span class="text-sm text-oscuro-200">Disciplinas simultáneas</span>
          <p v-if="!eventId" class="mt-2 text-xs text-oscuro-400">
            Elige un evento para listar sus disciplinas.
          </p>
          <p
            v-else-if="!disciplines.length"
            class="mt-2 text-xs text-oscuro-400"
          >
            Este evento no tiene disciplinas.
          </p>
          <ul v-else class="mt-2 space-y-2">
            <li v-for="d in disciplines" :key="d.id">
              <label
                class="flex cursor-pointer items-start gap-3 rounded-lg border border-oscuro-700 bg-oscuro-800/60 px-3 py-2.5"
              >
                <input
                  v-model="selectedIds"
                  type="checkbox"
                  :value="d.id"
                  class="mt-0.5 h-4 w-4 shrink-0"
                />
                <span class="min-w-0 flex-1">
                  <span class="flex flex-wrap items-center gap-2">
                    <span class="text-sm font-semibold text-white">{{ d.name }}</span>
                    <span
                      class="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      :class="
                        d.participantType === 'OTHER'
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-sky-500/10 text-sky-300'
                      "
                    >
                      {{ participantTypeLabel(d.participantType) }}
                    </span>
                  </span>
                  <span class="mt-1 block text-xs text-oscuro-400">
                    {{ genderPolicyLabel(d.genderPolicy) }} ·
                    {{ modalityLabel(d.modality) }} ·
                    {{ formatLabel(d.format) }}
                  </span>
                  <span class="mt-0.5 block text-xs text-oscuro-500">
                    {{ d.courtsCount }} loza{{ d.courtsCount === 1 ? '' : 's' }} ·
                    {{ d.matchDurationMinutes }} min
                  </span>
                </span>
              </label>
            </li>
          </ul>
        </div>

        <label class="mt-4 block">
          <span class="text-sm text-oscuro-200">Inicio de la jornada</span>
          <input v-model="startAt" type="datetime-local" class="input" />
        </label>

        <label class="mt-4 block">
          <span class="text-sm text-oscuro-200">Duración de franja (min)</span>
          <input v-model.number="slotMinutes" type="number" min="1" class="input" />
          <span class="mt-1 block text-xs text-oscuro-400">
            Por defecto usa la mayor duración entre las disciplinas elegidas.
          </span>
        </label>

        <div class="mt-5 flex flex-col gap-2">
          <button
            class="rounded-lg bg-green-500/10 px-4 py-2.5 text-sm font-semibold text-green-300 hover:bg-green-500/20 disabled:opacity-50"
            :disabled="!canSubmit || loading"
            @click="preview"
          >
            {{ loading && pendingAction === 'preview' ? 'Calculando…' : 'Previsualizar' }}
          </button>
          <button
            class="rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-oscuro-900 hover:bg-green-400 disabled:opacity-50"
            :disabled="!result || loading"
            @click="askApply"
          >
            Aplicar horarios
          </button>
        </div>

        <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>
      </div>

      <!-- Resultado -->
      <div class="rounded-2xl border border-oscuro-700 bg-oscuro-900/60 p-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-sm font-bold uppercase tracking-wide text-oscuro-300">
            Propuesta de horarios
          </h2>
          <span
            v-if="result"
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="result.applied ? 'bg-green-500/15 text-green-300' : 'bg-amber-500/15 text-amber-300'"
          >
            {{ result.applied ? 'Aplicada' : 'Vista previa' }}
          </span>
        </div>

        <div
          v-if="result"
          class="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-oscuro-400"
        >
          <span>{{ result.totalMatches }} partidos</span>
          <span>{{ result.slotsUsed }} franjas</span>
          <span>{{ result.slotMinutes }} min/franja</span>
        </div>

        <p v-if="!result" class="mt-6 text-sm text-oscuro-400">
          Configura los parámetros y pulsa «Previsualizar» para ver la asignación.
        </p>
        <p
          v-else-if="!result.matches.length"
          class="mt-6 text-sm text-oscuro-400"
        >
          No hay partidos de primera ronda con ambos equipos definidos en las disciplinas
          seleccionadas.
        </p>

        <div v-else class="mt-5 space-y-5">
          <div
            v-for="block in slots"
            :key="block.slot"
            class="rounded-xl border border-oscuro-700 bg-oscuro-800/40 p-4"
          >
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white">
                Franja {{ block.slot + 1 }}
              </h3>
              <span class="text-xs font-semibold text-green-300">
                {{ formatDateTime(block.time) }}
              </span>
            </div>
            <ul class="mt-3 grid gap-2 md:grid-cols-2">
              <li
                v-for="match in block.matches"
                :key="match.matchId"
                class="rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="min-w-0">
                    <span class="text-[11px] font-semibold uppercase text-oscuro-400">
                      {{ match.disciplineName }}
                    </span>
                    <span
                      v-if="disciplineById.get(match.disciplineId)"
                      class="mt-0.5 block text-[11px] text-oscuro-500"
                    >
                      {{ disciplineMetaLabel(disciplineById.get(match.disciplineId)!) }}
                    </span>
                  </div>
                  <span class="shrink-0 text-[11px] text-oscuro-400">Loza {{ match.court }}</span>
                </div>
                <p class="mt-1 text-sm text-white">
                  {{ match.homeTeamName }}
                  <span class="text-oscuro-400">vs</span>
                  {{ match.awayTeamName }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <AppConfirm
      v-model="confirmOpen"
      title="Aplicar horarios"
      message="Se guardarán los horarios calculados en los partidos de primera ronda, reemplazando cualquier horario previo. ¿Continuar?"
      confirm-text="Aplicar"
      :loading="loading"
      :error="error"
      @confirm="apply"
    />
  </div>
</template>

<script setup lang="ts">
import type {
  Discipline,
  GenderPolicy,
  ScheduleRoundOneResponse,
  ScheduledMatch,
  SportEvent,
} from '~/types/domain'
import { formatDateTime, fromDateTimeLocalInput } from '~/utils/format'
import { participantTypeLabel } from '~/utils/participants'

definePageMeta({ layout: 'admin', middleware: 'admin' })

function genderPolicyLabel(policy: GenderPolicy) {
  const map: Record<GenderPolicy, string> = {
    MALE: 'Varones',
    FEMALE: 'Mujeres',
    MIXED: 'Mixto',
    FREE: 'Libre',
  }
  return map[policy] ?? 'Libre'
}

function modalityLabel(modality: Discipline['modality']) {
  return modality === 'TEAM' ? 'Equipos' : 'Individual'
}

function formatLabel(format: Discipline['format']) {
  return format === 'POINTS' ? 'Puntos' : 'Eliminación'
}

function disciplineMetaLabel(d: Discipline) {
  return [
    participantTypeLabel(d.participantType),
    genderPolicyLabel(d.genderPolicy),
    modalityLabel(d.modality),
    formatLabel(d.format),
  ].join(' · ')
}

const api = useApi()

const events = ref<SportEvent[]>([])
const disciplines = ref<Discipline[]>([])
const eventId = ref(0)
const selectedIds = ref<number[]>([])
const startAt = ref('')
const slotMinutes = ref<number | null>(null)

const result = ref<ScheduleRoundOneResponse | null>(null)
const loading = ref(false)
const error = ref('')
const pendingAction = ref<'preview' | 'apply' | null>(null)
const confirmOpen = ref(false)

const canSubmit = computed(
  () => selectedIds.value.length > 0 && !!startAt.value,
)

const disciplineById = computed(
  () => new Map(disciplines.value.map((d) => [d.id, d])),
)

const slots = computed(() => {
  const map = new Map<number, ScheduledMatch[]>()
  for (const match of result.value?.matches ?? []) {
    map.set(match.slot, [...(map.get(match.slot) ?? []), match])
  }
  return [...map.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([slot, matches]) => ({
      slot,
      time: matches[0]?.scheduledAt ?? result.value?.startAt ?? '',
      matches,
    }))
})

watch(eventId, async (id) => {
  selectedIds.value = []
  result.value = null
  if (!id) {
    disciplines.value = []
    return
  }
  try {
    disciplines.value = await api.get<Discipline[]>('/disciplines', {
      eventId: id,
    })
  } catch {
    disciplines.value = []
  }
})

function buildPayload(dryRun: boolean) {
  return {
    disciplineIds: selectedIds.value,
    startAt: fromDateTimeLocalInput(startAt.value),
    ...(slotMinutes.value ? { slotMinutes: slotMinutes.value } : {}),
    dryRun,
  }
}

async function preview() {
  if (!canSubmit.value) return
  loading.value = true
  pendingAction.value = 'preview'
  error.value = ''
  try {
    result.value = await api.post<ScheduleRoundOneResponse>(
      '/scheduling/round-one',
      buildPayload(true),
    )
  } catch (err) {
    error.value =
      (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
      'No se pudo calcular la programación'
  } finally {
    loading.value = false
    pendingAction.value = null
  }
}

function askApply() {
  if (!result.value) return
  error.value = ''
  confirmOpen.value = true
}

async function apply() {
  loading.value = true
  pendingAction.value = 'apply'
  error.value = ''
  try {
    result.value = await api.post<ScheduleRoundOneResponse>(
      '/scheduling/round-one',
      buildPayload(false),
    )
    confirmOpen.value = false
  } catch (err) {
    error.value =
      (err as { data?: { message?: string | string[] } })?.data?.message?.toString() ??
      'No se pudieron aplicar los horarios'
  } finally {
    loading.value = false
    pendingAction.value = null
  }
}

async function load() {
  try {
    events.value = await api.get<SportEvent[]>('/events')
  } catch {
    events.value = []
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
