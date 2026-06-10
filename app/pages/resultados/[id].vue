<template>
  <div>
    <NuxtLink
      :to="`/disciplinas/${disciplineId}`"
      class="inline-flex items-center gap-1 text-sm text-oscuro-300 transition hover:text-white"
    >
      <ChevronLeft class="h-4 w-4" /> Volver a la disciplina
    </NuxtLink>
    <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white">Resultados y fixture</h1>
        <p class="mt-1 text-oscuro-300">{{ data?.disciplineName }}</p>
      </div>
      <p v-if="data" class="text-sm text-oscuro-400">
        {{ data.format === 'POINTS' ? 'Tabla de posiciones' : 'Llave de eliminación' }}
      </p>
    </div>

    <section
      v-if="data?.format === 'POINTS' && data.standings.length"
      class="mt-6 overflow-x-auto rounded-xl border border-oscuro-700"
    >
      <table class="w-full min-w-[680px] text-left text-sm">
        <thead class="bg-oscuro-800 text-oscuro-300">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">Equipo</th>
            <th class="px-4 py-3 text-center">PJ</th>
            <th class="px-4 py-3 text-center">G</th>
            <th class="px-4 py-3 text-center">E</th>
            <th class="px-4 py-3 text-center">P</th>
            <th class="px-4 py-3 text-center">GF</th>
            <th class="px-4 py-3 text-center">GC</th>
            <th class="px-4 py-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-oscuro-700 bg-oscuro-850">
          <tr v-for="row in data.standings" :key="row.teamId">
            <td class="px-4 py-3 text-oscuro-400">{{ row.position }}</td>
            <td class="px-4 py-3 font-semibold text-white">{{ row.teamName }}</td>
            <td class="px-4 py-3 text-center text-oscuro-200">{{ row.played }}</td>
            <td class="px-4 py-3 text-center text-green-400">{{ row.won }}</td>
            <td class="px-4 py-3 text-center text-yellow-300">{{ row.drawn }}</td>
            <td class="px-4 py-3 text-center text-red-400">{{ row.lost }}</td>
            <td class="px-4 py-3 text-center text-oscuro-200">{{ row.goalsFor ?? 0 }}</td>
            <td class="px-4 py-3 text-center text-oscuro-200">{{ row.goalsAgainst ?? 0 }}</td>
            <td class="px-4 py-3 text-center font-bold text-white">
              {{ row.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </section>

    <section v-if="data?.format === 'ELIMINATION' && rounds.length" class="mt-6">
      <div class="rounded-2xl border border-oscuro-700 bg-gradient-to-br from-oscuro-850 to-black p-4 sm:p-6">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 class="text-xl font-bold text-white">Fixture</h2>
            <p class="text-sm text-oscuro-400">
              <template v-if="fixtureView === 'bracket'">
                Desliza horizontalmente para ver toda la llave.
              </template>
              <template v-else>
                Resultados agrupados por ronda.
              </template>
            </p>
          </div>
          <div class="inline-flex self-start rounded-full border border-oscuro-700 bg-oscuro-900/60 p-1 sm:self-auto">
            <button
              type="button"
              class="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition"
              :class="fixtureView === 'bracket' ? 'bg-green-500/20 text-green-300' : 'text-oscuro-400 hover:text-white'"
              @click="fixtureView = 'bracket'"
            >
              Llave
            </button>
            <button
              type="button"
              class="rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition"
              :class="fixtureView === 'rounds' ? 'bg-green-500/20 text-green-300' : 'text-oscuro-400 hover:text-white'"
              @click="fixtureView = 'rounds'"
            >
              Rondas
            </button>
          </div>
        </div>

        <div v-if="fixtureView === 'bracket'" class="bracket-scroll mt-5">
          <div class="bracket">
            <section
              v-for="round in rounds"
              :key="round.round"
              class="bracket-round"
            >
              <h3 class="round-title">
                {{ eliminationRoundLabel(round.round, rounds.length) }}
              </h3>
              <div class="round-body">
                <div
                  v-for="match in round.matches"
                  :key="match.id"
                  class="match-slot"
                  :class="{ 'has-winner': match.winnerTeamId != null }"
                >
                  <article
                    class="bracket-match"
                    :class="{ 'bracket-match-played': match.status === 'PLAYED' }"
                  >
                    <p class="match-time">
                      {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
                    </p>
                    <div class="team-line" :class="{ winner: match.winnerTeamId === match.homeTeamId }">
                      <span>{{ slotLabel(match, 'home') }}</span>
                      <strong>{{ match.homeScore ?? '-' }}</strong>
                    </div>
                    <div class="team-line" :class="{ winner: match.winnerTeamId === match.awayTeamId }">
                      <span>{{ slotLabel(match, 'away') }}</span>
                      <strong>{{ match.awayScore ?? '-' }}</strong>
                    </div>
                    <p class="mt-2 text-[11px] font-semibold text-oscuro-400">
                      {{ matchStatusLabel(match.status) }}
                      <span v-if="match.winnerTeamName" class="text-green-300">
                        · Ganador: {{ match.winnerTeamName }}
                      </span>
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div v-else class="mt-5 flex flex-col gap-6">
          <section v-for="round in rounds" :key="round.round" class="rounds-group">
            <h3 class="round-title">
              {{ eliminationRoundLabel(round.round, rounds.length) }}
            </h3>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <article
                v-for="match in round.matches"
                :key="match.id"
                class="bracket-match"
                :class="{ 'bracket-match-played': match.status === 'PLAYED' }"
              >
                <p class="match-time">
                  {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
                </p>
                <div class="team-line" :class="{ winner: match.winnerTeamId === match.homeTeamId }">
                  <span>{{ slotLabel(match, 'home') }}</span>
                  <strong>{{ match.homeScore ?? '-' }}</strong>
                </div>
                <div class="team-line" :class="{ winner: match.winnerTeamId === match.awayTeamId }">
                  <span>{{ slotLabel(match, 'away') }}</span>
                  <strong>{{ match.awayScore ?? '-' }}</strong>
                </div>
                <p class="mt-2 text-[11px] font-semibold text-oscuro-400">
                  {{ matchStatusLabel(match.status) }}
                  <span v-if="match.winnerTeamName" class="text-green-300">
                    · Ganador: {{ match.winnerTeamName }}
                  </span>
                </p>
              </article>
            </div>
          </section>
        </div>
      </div>
    </section>

    <section v-if="data?.matches.length" class="mt-8">
      <h2 class="text-lg font-bold text-white">Partidos</h2>
      <div class="mt-3 grid gap-3 md:grid-cols-2">
        <article
          v-for="match in data.matches"
          :key="match.id"
          class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="font-semibold text-white">
                {{ slotLabel(match, 'home') }}
                <span class="text-oscuro-500">vs</span>
                {{ slotLabel(match, 'away') }}
              </p>
              <p class="mt-1 text-xs text-oscuro-400">
                {{ data.format === 'POINTS' ? 'Fecha' : 'Ronda' }} {{ match.round }} ·
                {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
              </p>
            </div>
            <span class="rounded-lg bg-oscuro-900/80 px-2 py-1 text-xs font-semibold text-oscuro-200">
              {{ matchStatusLabel(match.status) }}
            </span>
          </div>
          <p class="mt-3 text-2xl font-bold text-white">{{ scoreLabel(match) }}</p>
        </article>
      </div>
    </section>

    <div
      v-if="!data?.matches.length && !data?.standings.length"
      class="mt-6 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
    >
      Aún no hay resultados publicados.
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { MatchStatus, MatchSummary, ResultsResponse } from '~/types/domain'
import { formatDateTime } from '~/utils/format'

const route = useRoute()
const api = useApi()
const disciplineId = Number(route.params.id)
const data = ref<ResultsResponse | null>(null)
const fixtureView = ref<'bracket' | 'rounds'>('bracket')

onMounted(() => {
  if (import.meta.client) {
    const saved = localStorage.getItem('fixtureView')
    if (saved === 'bracket' || saved === 'rounds') fixtureView.value = saved
  }
})

watch(fixtureView, (value) => {
  if (import.meta.client) localStorage.setItem('fixtureView', value)
})

const rounds = computed(() => {
  const groups = new Map<number, MatchSummary[]>()
  for (const match of data.value?.matches ?? []) {
    groups.set(match.round, [...(groups.get(match.round) ?? []), match])
  }
  return [...groups.entries()].map(([round, matches]) => ({ round, matches }))
})

onMounted(async () => {
  try {
    data.value = await api.get<ResultsResponse>(`/standings/${disciplineId}`)
  } catch {
    data.value = null
  }
})

function slotLabel(match: MatchSummary, side: 'home' | 'away') {
  const name = side === 'home' ? match.homeTeamName : match.awayTeamName
  if (name) return name
  if (match.status === 'PLAYED' && match.winnerTeamId != null) return 'Libre (bye)'
  return 'Por definir'
}

function scoreLabel(match: MatchSummary) {
  if (match.homeScore === null || match.homeScore === undefined) return '-'
  if (match.awayScore === null || match.awayScore === undefined) return '-'
  return `${match.homeScore} - ${match.awayScore}`
}

function eliminationRoundLabel(round: number, totalRounds: number) {
  const remaining = totalRounds - round
  if (remaining === 0) return 'Final'
  if (remaining === 1) return 'Semifinales'
  if (remaining === 2) return 'Cuartos'
  if (remaining === 3) return 'Octavos'
  return `Ronda ${round}`
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
</script>

<style scoped>
/* ---- Vista Llave (bracket) ---- */
.bracket-scroll {
  --gap: 3rem;
  --line: rgba(148, 163, 184, 0.45);
  --line-win: rgba(74, 222, 128, 0.85);
  overflow-x: auto;
  padding-bottom: 0.75rem;
  -webkit-overflow-scrolling: touch;
}
.bracket {
  display: flex;
  align-items: stretch;
  gap: var(--gap);
  min-width: max-content;
}
.bracket-round {
  display: flex;
  flex-direction: column;
  min-width: 240px;
}
.round-title {
  align-self: flex-start;
  display: inline-flex;
  border-radius: 0.35rem;
  background: rgba(34, 197, 94, 0.14);
  padding: 0.35rem 0.65rem;
  color: #bbf7d0;
  font-size: 0.9rem;
  font-weight: 800;
  text-transform: uppercase;
}
.round-body {
  margin-top: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.match-slot {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/* Conector de salida: codo (horizontal + vertical) hacia la ronda siguiente */
.bracket-round:not(:last-child) .match-slot::after {
  content: "";
  position: absolute;
  right: calc(var(--gap) / -2);
  width: calc(var(--gap) / 2);
  height: 50%;
  border-right: 2px solid var(--line);
  pointer-events: none;
}
.bracket-round:not(:last-child) .match-slot:nth-child(odd)::after {
  top: 50%;
  border-top: 2px solid var(--line);
}
.bracket-round:not(:last-child) .match-slot:nth-child(even)::after {
  bottom: 50%;
  border-bottom: 2px solid var(--line);
}
/* Conector de entrada: tramo horizontal desde la ronda anterior */
.bracket-round:not(:first-child) .match-slot::before {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--gap) / -2);
  width: calc(var(--gap) / 2);
  border-top: 2px solid var(--line);
  pointer-events: none;
}
/* Resalta el conector cuando el partido ya tiene ganador */
.bracket-round:not(:last-child) .match-slot.has-winner::after {
  border-color: var(--line-win);
}

/* ---- Tarjeta de partido (compartida por ambas vistas) ---- */
.bracket-match {
  position: relative;
  border-radius: 0.85rem;
  border: 1px solid rgba(55, 65, 81, 0.85);
  background: rgba(15, 23, 42, 0.72);
  padding: 0.85rem;
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.22);
}
.bracket-match-played {
  border-color: rgba(74, 222, 128, 0.45);
}
.match-time {
  margin-bottom: 0.55rem;
  display: inline-flex;
  border-radius: 0.45rem;
  background: rgba(0, 0, 0, 0.55);
  padding: 0.25rem 0.45rem;
  color: #facc15;
  font-size: 0.72rem;
  font-weight: 800;
}
.team-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.55rem;
  background: white;
  padding: 0.5rem 0.65rem;
  color: #111827;
}
.team-line + .team-line {
  margin-top: 0.45rem;
}
.team-line span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}
.team-line strong {
  min-width: 2rem;
  border-radius: 0.4rem;
  background: #e5e7eb;
  padding: 0.2rem 0.35rem;
  text-align: center;
}
.team-line.winner {
  background: #dcfce7;
  color: #14532d;
}
.team-line.winner strong {
  background: #86efac;
}

/* ---- Mobile: llave mas compacta ---- */
@media (max-width: 640px) {
  .bracket-scroll {
    --gap: 2rem;
  }
  .bracket-round {
    min-width: 200px;
  }
  .bracket-match {
    padding: 0.65rem;
  }
  .team-line {
    padding: 0.4rem 0.5rem;
    font-size: 0.85rem;
  }
}
</style>
