<template>
  <div>
    <NuxtLink
      to="/admin/disciplinas"
      class="inline-flex items-center gap-1 text-sm text-oscuro-300 hover:text-white"
    >
      <ChevronLeft class="h-4 w-4" /> Volver a disciplinas
    </NuxtLink>

    <div class="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-normal text-green-300">
          Fixture / Resultados
        </p>
        <h1 class="mt-1 text-2xl font-bold text-white">
          {{ fixture?.discipline.name || 'Disciplina' }}
        </h1>
        <p v-if="fixture" class="mt-1 text-sm text-oscuro-300">
          {{ fixture.discipline.format === 'POINTS' ? 'Sistema por puntos' : 'Eliminación simple' }}
          · {{ fixture.approvedTeams.length }} equipos aprobados
        </p>
      </div>
      <button
        v-if="auth.isAdmin"
        class="rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-oscuro-900 hover:bg-green-400 disabled:opacity-60"
        :disabled="loading || generating || !fixture || fixture.approvedTeams.length < 2"
        @click="askGenerate"
      >
        {{ fixture?.matches.length ? 'Regenerar fixture' : 'Generar fixture' }}
      </button>
    </div>

    <p v-if="auth.isReferee" class="mt-4 rounded-lg bg-sky-500/10 px-3 py-2 text-sm text-sky-200">
      Modo árbitro: puedes editar horarios, estado y marcadores. La generación del fixture queda reservada para administración.
    </p>

    <p v-if="error" class="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {{ error }}
    </p>

    <div v-if="fixture" class="mt-6 grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
      <section class="space-y-4">
        <div class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4">
          <h2 class="font-bold text-white">Equipos aprobados</h2>
          <ul v-if="fixture.approvedTeams.length" class="mt-3 grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-1">
            <li
              v-for="team in fixture.approvedTeams"
              :key="team.id"
              class="rounded-lg bg-oscuro-900/60 px-3 py-2 text-oscuro-200"
            >
              {{ team.name }}
              <span v-if="team.cycle || team.section" class="text-xs text-oscuro-500">
                · {{ team.cycle || 's/ciclo' }} - {{ team.section || 's/sección' }}
              </span>
            </li>
          </ul>
          <p v-else class="mt-3 text-sm text-oscuro-400">
            Aún no hay equipos aprobados.
          </p>
        </div>

        <div
          v-if="
            auth.isAdmin &&
            fixture.discipline.format === 'ELIMINATION' &&
            manualOrder.length >= 2
          "
          class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
        >
          <h2 class="font-bold text-white">Sorteo manual</h2>
          <p class="mt-1 text-xs text-oscuro-400">
            Reordena los equipos para definir manualmente las llaves de la primera ronda.
            Solo se puede aplicar antes de jugar partidos.
          </p>
          <ol class="mt-3 space-y-2">
            <li
              v-for="(team, idx) in manualOrder"
              :key="team.id"
              class="flex items-center gap-2 rounded-lg bg-oscuro-900/60 px-3 py-2 text-sm"
            >
              <span class="w-5 shrink-0 text-xs text-oscuro-500">{{ idx + 1 }}</span>
              <span class="min-w-0 flex-1 truncate text-oscuro-100">{{ team.name }}</span>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-oscuro-300 transition hover:bg-oscuro-800 disabled:opacity-30"
                :disabled="idx === 0"
                title="Subir"
                @click="moveTeam(idx, -1)"
              >
                <ChevronUp class="h-4 w-4" />
              </button>
              <button
                type="button"
                class="inline-flex h-7 w-7 items-center justify-center rounded-md text-oscuro-300 transition hover:bg-oscuro-800 disabled:opacity-30"
                :disabled="idx === manualOrder.length - 1"
                title="Bajar"
                @click="moveTeam(idx, 1)"
              >
                <ChevronDown class="h-4 w-4" />
              </button>
            </li>
          </ol>

          <p class="mt-4 text-xs font-semibold uppercase tracking-normal text-oscuro-300">
            Enfrentamientos resultantes
          </p>
          <ul class="mt-2 space-y-1 text-xs text-oscuro-300">
            <li
              v-for="(pair, i) in previewPairs"
              :key="i"
              class="rounded-md bg-oscuro-900/40 px-2 py-1"
            >
              {{ pair.home }} <span class="text-oscuro-500">vs</span> {{ pair.away }}
            </li>
          </ul>

          <button
            type="button"
            class="mt-3 w-full rounded-lg bg-green-500 px-3 py-2 text-sm font-semibold text-oscuro-900 transition hover:bg-green-400 disabled:opacity-50"
            :disabled="arranging || generating || hasPlayedMatches || !orderChanged"
            @click="askArrange"
          >
            Aplicar sorteo manual
          </button>
          <p v-if="hasPlayedMatches" class="mt-2 text-xs text-yellow-300">
            Hay partidos jugados: regenera el fixture para volver a sortear.
          </p>
        </div>

        <div
          v-if="fixture.discipline.format === 'POINTS'"
          class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <h2 class="font-bold text-white">Tabla</h2>
              <p class="mt-1 text-xs text-oscuro-400">
                Victoria {{ fixture.discipline.winPoints }} · Empate
                {{ fixture.discipline.drawPoints }} · Derrota {{ fixture.discipline.lossPoints }}
              </p>
            </div>
            <button
              v-if="auth.isAdmin"
              class="rounded-lg bg-oscuro-800 px-3 py-2 text-xs font-semibold text-oscuro-200 hover:bg-oscuro-700"
              @click="recalculate"
            >
              Recalcular
            </button>
          </div>
          <div v-if="fixture.standings.length" class="mt-3 overflow-x-auto rounded-lg border border-oscuro-700">
            <table class="w-full min-w-[460px] text-left text-xs">
              <thead class="bg-oscuro-800 text-oscuro-300">
                <tr>
                  <th class="px-3 py-2">Equipo</th>
                  <th class="px-3 py-2 text-center">PJ</th>
                  <th class="px-3 py-2 text-center">G</th>
                  <th class="px-3 py-2 text-center">E</th>
                  <th class="px-3 py-2 text-center">P</th>
                  <th class="px-3 py-2 text-center">Pts</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-oscuro-700 bg-oscuro-900/60">
                <tr v-for="row in fixture.standings" :key="row.teamId">
                  <td class="px-3 py-2 font-semibold text-white">{{ row.teamName }}</td>
                  <td class="px-3 py-2 text-center text-oscuro-300">{{ row.played }}</td>
                  <td class="px-3 py-2 text-center text-green-300">{{ row.won }}</td>
                  <td class="px-3 py-2 text-center text-yellow-300">{{ row.drawn }}</td>
                  <td class="px-3 py-2 text-center text-red-300">{{ row.lost }}</td>
                  <td class="px-3 py-2 text-center font-bold text-white">{{ row.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="space-y-4">
        <div
          v-if="!fixture.matches.length"
          class="rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-8 text-center text-sm text-oscuro-400"
        >
          Genera el fixture para empezar a programar partidos.
        </div>

        <div
          v-for="round in rounds"
          :key="round.round"
          class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
        >
          <h2 class="font-bold text-white">{{ roundTitle(round.round) }}</h2>
          <div class="mt-3 grid gap-3">
            <article
              v-for="match in round.matches"
              :key="match.id"
              class="rounded-xl border border-oscuro-700 bg-oscuro-900/60 p-3"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div class="min-w-0">
                  <p class="font-semibold text-white">
                    {{ slotLabel(match, 'home') }}
                    <span class="text-oscuro-500">vs</span>
                    {{ slotLabel(match, 'away') }}
                  </p>
                  <p class="mt-1 text-xs text-oscuro-400">
                    {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
                    · {{ matchStatusLabel(match.status) }}
                  </p>
                </div>
                <p class="text-2xl font-bold text-white">
                  {{ scoreLabel(match) }}
                </p>
              </div>

              <div class="mt-4 grid gap-2 md:grid-cols-[1fr_0.8fr]">
                <input
                  v-model="matchForms[match.id].scheduledAt"
                  type="datetime-local"
                  class="input !mt-0"
                  @blur="saveMatchDetails(match)"
                />
                <select
                  v-model="matchForms[match.id].status"
                  class="input !mt-0"
                  @change="saveMatchDetails(match)"
                >
                  <option value="PENDING">Pendiente</option>
                  <option value="IN_PROGRESS">En juego</option>
                  <option value="PLAYED">Jugado</option>
                  <option value="POSTPONED">Postergado</option>
                  <option value="CANCELLED">Cancelado</option>
                </select>
              </div>

              <div class="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                <label class="floating-score">
                  <input
                    v-model="matchForms[match.id].homeScore"
                    type="number"
                    min="0"
                    inputmode="numeric"
                    placeholder=" "
                    :disabled="!match.homeTeamId || !match.awayTeamId"
                    @input="queueScoreSave(match)"
                  />
                  <span>{{ teamLabel(match.homeTeamName) }}</span>
                </label>
                <span class="hidden text-center text-sm font-bold text-oscuro-400 sm:block">vs</span>
                <label class="floating-score">
                  <input
                    v-model="matchForms[match.id].awayScore"
                    type="number"
                    min="0"
                    inputmode="numeric"
                    placeholder=" "
                    :disabled="!match.homeTeamId || !match.awayTeamId"
                    @input="queueScoreSave(match)"
                  />
                  <span>{{ teamLabel(match.awayTeamName) }}</span>
                </label>
              </div>

              <div class="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span :class="scoreStateClass(match.id)">
                  {{ scoreStateLabel(match.id) }}
                </span>
                <span v-if="match.winnerTeamName" class="font-semibold text-green-300">
                  Ganador: {{ match.winnerTeamName }}
                </span>
              </div>
              <p v-if="scoreStates[match.id]?.message" class="mt-2 text-xs text-red-300">
                {{ scoreStates[match.id].message }}
              </p>
            </article>
          </div>
        </div>
      </section>
    </div>

    <AppConfirm
      v-model="confirmGenerateOpen"
      title="Regenerar fixture"
      :message="generateMessage"
      confirm-text="Regenerar"
      :loading="generating"
      :error="error"
      @confirm="generateFixture"
    />

    <AppConfirm
      v-model="confirmArrangeOpen"
      title="Aplicar sorteo manual"
      message="Se reemplazarán las llaves actuales con el orden que definiste."
      confirm-text="Aplicar"
      :loading="arranging"
      :error="error"
      @confirm="arrangeFixture"
    />
  </div>
</template>

<script setup lang="ts">
import { ChevronDown, ChevronLeft, ChevronUp } from 'lucide-vue-next'
import type {
  FixtureResponse,
  FixtureTeam,
  MatchStatus,
  MatchSummary,
} from '~/types/domain'
import {
  formatDateTime,
  fromDateTimeLocalInput,
  toDateTimeLocalInput,
} from '~/utils/format'
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  path: '/admin/disciplinas/:id/fixture',
})

type ScoreSaveState = 'idle' | 'saving' | 'saved' | 'error'

const route = useRoute()
const api = useApi()
const auth = useAuthStore()
const disciplineId = Number(route.params.id)
const fixture = ref<FixtureResponse | null>(null)
const loading = ref(false)
const generating = ref(false)
const arranging = ref(false)
const error = ref('')
const confirmGenerateOpen = ref(false)
const confirmArrangeOpen = ref(false)
const manualOrder = ref<FixtureTeam[]>([])
const baselineOrderIds = ref<number[]>([])

const scoreTimers: Record<number, ReturnType<typeof setTimeout> | undefined> = {}
const lastSavedScores = reactive<Record<number, string>>({})
const scoreStates = reactive<Record<number, { state: ScoreSaveState; message?: string }>>({})

const matchForms = reactive<
  Record<
    number,
    {
      scheduledAt: string
      status: MatchStatus
      homeScore: string
      awayScore: string
    }
  >
>({})

const rounds = computed(() => {
  const groups = new Map<number, MatchSummary[]>()
  for (const match of fixture.value?.matches ?? []) {
    groups.set(match.round, [...(groups.get(match.round) ?? []), match])
  }
  return [...groups.entries()].map(([round, matches]) => ({ round, matches }))
})

const hasPlayedMatches = computed(
  () => fixture.value?.matches.some((match) => match.status === 'PLAYED') ?? false,
)

const generateMessage = computed(() =>
  hasPlayedMatches.value
    ? 'Ya hay resultados registrados. Regenerar eliminará también partidos jugados y recalculará todo.'
    : 'Se reemplazarán los partidos pendientes actuales con un fixture nuevo.',
)

const previewPairs = computed(() => {
  const teams = manualOrder.value
  if (teams.length < 2) return [] as { home: string; away: string }[]
  const pairs: { home: string; away: string }[] = []
  for (let i = 0; i < teams.length; i += 2) {
    const home = teams[i]
    const away = teams[i + 1]
    if (home && away) {
      pairs.push({ home: home.name, away: away.name })
    } else {
      pairs.push({ home: home.name, away: 'Bye (pasa directo)' })
    }
  }
  return pairs
})

const orderChanged = computed(() => {
  const ids = manualOrder.value.map((t) => t.id)
  return (
    ids.length !== baselineOrderIds.value.length ||
    ids.some((id, i) => id !== baselineOrderIds.value[i])
  )
})

function deriveSeedOrder(): FixtureTeam[] | null {
  if (fixture.value?.discipline.format !== 'ELIMINATION') return null
  const teams = fixture.value?.approvedTeams ?? []
  const round1 = (fixture.value?.matches ?? [])
    .filter((m) => m.round === 1)
    .sort((a, b) => a.id - b.id)
  if (!round1.length || !teams.length) return null

  const byId = new Map(teams.map((t) => [t.id, t]))
  const result: FixtureTeam[] = []
  for (const match of round1) {
    const home = match.homeTeamId != null ? byId.get(match.homeTeamId) : undefined
    if (home) result.push(home)
    const away = match.awayTeamId != null ? byId.get(match.awayTeamId) : undefined
    if (away) result.push(away)
  }
  return result.length === teams.length ? result : null
}

function initManualOrder() {
  const derived = deriveSeedOrder() ?? [...(fixture.value?.approvedTeams ?? [])]
  manualOrder.value = derived
  baselineOrderIds.value = derived.map((t) => t.id)
}

function moveTeam(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= manualOrder.value.length) return
  const next = [...manualOrder.value]
  const [moved] = next.splice(index, 1)
  next.splice(target, 0, moved)
  manualOrder.value = next
}

async function loadFixture() {
  loading.value = true
  error.value = ''
  try {
    fixture.value = await api.get<FixtureResponse>(`/disciplines/${disciplineId}/fixture`)
    syncMatchForms()
  } catch (err) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ?? 'No se pudo cargar el fixture.'
  } finally {
    loading.value = false
  }
}

function syncMatchForms() {
  for (const match of fixture.value?.matches ?? []) {
    const homeScore = match.homeScore ?? ''
    const awayScore = match.awayScore ?? ''
    matchForms[match.id] = {
      scheduledAt: match.scheduledAt ? toDateTimeLocalInput(match.scheduledAt) : '',
      status: match.status,
      homeScore: String(homeScore),
      awayScore: String(awayScore),
    }
    lastSavedScores[match.id] = scoreKey(String(homeScore), String(awayScore))
    scoreStates[match.id] ??= { state: 'idle' }
  }
  initManualOrder()
}

function askGenerate() {
  error.value = ''
  if (fixture.value?.matches.length) {
    confirmGenerateOpen.value = true
    return
  }
  generateFixture()
}

async function generateFixture() {
  if (!auth.isAdmin) return
  generating.value = true
  error.value = ''
  try {
    fixture.value = await api.post<FixtureResponse>(
      `/disciplines/${disciplineId}/fixture/generate`,
      { resetPlayed: hasPlayedMatches.value },
    )
    confirmGenerateOpen.value = false
    syncMatchForms()
  } catch (err) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ?? 'No se pudo generar el fixture.'
  } finally {
    generating.value = false
  }
}

function askArrange() {
  error.value = ''
  confirmArrangeOpen.value = true
}

async function arrangeFixture() {
  if (!auth.isAdmin) return
  arranging.value = true
  error.value = ''
  try {
    fixture.value = await api.post<FixtureResponse>(
      `/disciplines/${disciplineId}/fixture/arrange`,
      { teamOrder: manualOrder.value.map((t) => t.id) },
    )
    confirmArrangeOpen.value = false
    syncMatchForms()
  } catch (err) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ??
      'No se pudo aplicar el sorteo manual.'
  } finally {
    arranging.value = false
  }
}

async function saveMatchDetails(match: MatchSummary) {
  const form = matchForms[match.id]
  if (!form) return
  error.value = ''
  try {
    await api.patch(`/matches/${match.id}`, {
      scheduledAt: form.scheduledAt ? fromDateTimeLocalInput(form.scheduledAt) : null,
      status: form.status,
    })
    await loadFixture()
  } catch (err) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ?? 'No se pudo actualizar el partido.'
    await loadFixture()
  }
}

function queueScoreSave(match: MatchSummary) {
  const form = matchForms[match.id]
  if (!form) return
  window.clearTimeout(scoreTimers[match.id])
  scoreStates[match.id] = { state: 'idle' }
  if (!form.homeScore || !form.awayScore) return
  scoreTimers[match.id] = window.setTimeout(() => saveResult(match), 800)
}

async function saveResult(match: MatchSummary) {
  const form = matchForms[match.id]
  if (!form) return
  const nextKey = scoreKey(form.homeScore, form.awayScore)
  if (nextKey === lastSavedScores[match.id]) return
  if (!match.homeTeamId || !match.awayTeamId) {
    scoreStates[match.id] = { state: 'error', message: 'El partido debe tener dos equipos.' }
    return
  }
  if (!isScoreValue(form.homeScore) || !isScoreValue(form.awayScore)) {
    scoreStates[match.id] = { state: 'error', message: 'Usa marcadores enteros desde 0.' }
    return
  }

  scoreStates[match.id] = { state: 'saving' }
  try {
    await api.patch(`/matches/${match.id}/result`, {
      homeScore: Number(form.homeScore),
      awayScore: Number(form.awayScore),
    })
    await loadFixture()
    scoreStates[match.id] = { state: 'saved' }
  } catch (err) {
    await loadFixture()
    scoreStates[match.id] = {
      state: 'error',
      message:
        (err as { data?: { message?: string } })?.data?.message ?? 'No se pudo guardar el marcador.',
    }
  }
}

async function recalculate() {
  if (!auth.isAdmin) return
  error.value = ''
  try {
    fixture.value = await api.post<FixtureResponse>(
      `/disciplines/${disciplineId}/standings/recalculate`,
      {},
    )
    syncMatchForms()
  } catch (err) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ?? 'No se pudo recalcular la tabla.'
  }
}

function scoreKey(homeScore: string, awayScore: string) {
  return `${homeScore}:${awayScore}`
}

function isScoreValue(value: string) {
  return /^\d+$/.test(value)
}

function teamLabel(name?: string | null) {
  return name || 'Por definir'
}

function slotLabel(match: MatchSummary, side: 'home' | 'away') {
  const name = side === 'home' ? match.homeTeamName : match.awayTeamName
  if (name) return name
  if (match.status === 'PLAYED' && match.winnerTeamId != null) return 'Libre (bye)'
  return 'Por definir'
}

function roundTitle(round: number) {
  if (fixture.value?.discipline.format === 'POINTS') return `Fecha ${round}`
  return `Ronda ${round}`
}

function scoreLabel(match: MatchSummary) {
  if (match.homeScore === null || match.homeScore === undefined) return '-'
  if (match.awayScore === null || match.awayScore === undefined) return '-'
  return `${match.homeScore} - ${match.awayScore}`
}

function matchStatusLabel(status: MatchStatus) {
  const labels: Record<MatchStatus, string> = {
    PENDING: 'Pendiente',
    IN_PROGRESS: 'En juego',
    PLAYED: 'Jugado',
    CANCELLED: 'Cancelado',
    POSTPONED: 'Postergado',
  }
  return labels[status]
}

function scoreStateLabel(matchId: number) {
  const state = scoreStates[matchId]?.state ?? 'idle'
  if (state === 'saving') return 'Guardando...'
  if (state === 'saved') return 'Guardado'
  if (state === 'error') return 'Error al guardar'
  return 'El marcador se guarda automáticamente'
}

function scoreStateClass(matchId: number) {
  const state = scoreStates[matchId]?.state ?? 'idle'
  return {
    'text-oscuro-400': state === 'idle',
    'text-sky-300': state === 'saving',
    'text-green-300': state === 'saved',
    'text-red-300': state === 'error',
  }
}

onMounted(loadFixture)

onBeforeUnmount(() => {
  for (const timer of Object.values(scoreTimers)) {
    window.clearTimeout(timer)
  }
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
.floating-score {
  position: relative;
  display: block;
}
.floating-score input {
  width: 100%;
  border-radius: 0.65rem;
  border: 1px solid rgba(75, 85, 99, 0.75);
  background-color: rgba(24, 32, 41, 0.9);
  padding: 1.1rem 0.8rem 0.55rem;
  color: white;
  font-size: 1.25rem;
  font-weight: 700;
  outline: none;
}
.floating-score input:disabled {
  opacity: 0.55;
}
.floating-score span {
  pointer-events: none;
  position: absolute;
  left: 0.72rem;
  top: 0.92rem;
  max-width: calc(100% - 1.4rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: #182029;
  padding: 0 0.25rem;
  color: var(--color-oscuro-300);
  font-size: 0.9rem;
  transition:
    top 0.15s ease,
    color 0.15s ease,
    font-size 0.15s ease;
}
.floating-score input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 1px rgba(147, 197, 253, 0.65);
}
.floating-score input:focus + span,
.floating-score input:not(:placeholder-shown) + span {
  top: -0.5rem;
  color: #93c5fd;
  font-size: 0.75rem;
}
</style>
