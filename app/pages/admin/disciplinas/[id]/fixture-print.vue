<template>
  <div class="print-page">
    <div class="no-print toolbar">
      <button type="button" class="toolbar-btn back" @click="goBack">
        <ChevronLeft class="h-4 w-4" /> Volver
      </button>
      <div v-if="data?.format === 'ELIMINATION'" class="toolbar-toggle">
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: fixtureView === 'bracket' }"
          @click="fixtureView = 'bracket'"
        >
          Llave
        </button>
        <button
          type="button"
          class="toggle-btn"
          :class="{ active: fixtureView === 'rounds' }"
          @click="fixtureView = 'rounds'"
        >
          Rondas
        </button>
      </div>
      <button type="button" class="toolbar-btn print" @click="printNow">
        <Printer class="h-4 w-4" /> Imprimir / Guardar PDF
      </button>
    </div>

    <div class="sheet">
      <div ref="printClip" class="print-clip">
        <div ref="printArea" class="print-area">
      <header class="sheet-header">
        <div>
          <h1 class="sheet-title">Fixture</h1>
          <p class="sheet-subtitle">{{ data?.disciplineName || 'Disciplina' }}</p>
        </div>
        <div class="sheet-meta">
          <p>{{ formatLabel }}</p>
          <p>Generado: {{ generatedAt }}</p>
        </div>
      </header>

      <p v-if="loading" class="sheet-empty">Cargando fixture…</p>

      <p
        v-else-if="!data || (!data.matches.length && !data.standings.length)"
        class="sheet-empty"
      >
        Aún no hay resultados publicados.
      </p>

      <template v-else>
        <!-- Tabla de posiciones (POINTS) -->
        <section v-if="data.format === 'POINTS' && data.standings.length" class="standings">
          <table class="standings-table">
            <thead>
              <tr>
                <th>#</th>
                <th class="left">Equipo</th>
                <th>PJ</th>
                <th>G</th>
                <th>E</th>
                <th>P</th>
                <th>GF</th>
                <th>GC</th>
                <th>Pts</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.standings" :key="row.teamId">
                <td>{{ row.position }}</td>
                <td class="left strong">{{ row.teamName }}</td>
                <td>{{ row.played }}</td>
                <td>{{ row.won }}</td>
                <td>{{ row.drawn }}</td>
                <td>{{ row.lost }}</td>
                <td>{{ row.goalsFor ?? 0 }}</td>
                <td>{{ row.goalsAgainst ?? 0 }}</td>
                <td class="strong">{{ row.points }}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Llave (bracket) -->
        <section
          v-if="data.format === 'ELIMINATION' && fixtureView === 'bracket' && rounds.length"
          class="bracket-scroll"
        >
          <div class="bracket">
            <section v-for="round in rounds" :key="round.round" class="bracket-round">
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
                  <article class="bracket-match" :class="{ played: match.status === 'PLAYED' }">
                    <p class="match-time">
                      {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
                    </p>
                    <div class="team-line" :class="{ winner: match.winnerTeamId === match.homeTeamId }">
                      <span>{{ slotLabel(match, 'home') }}</span>
                      <strong>{{ match.homeScore ?? '' }}</strong>
                    </div>
                    <div class="team-line" :class="{ winner: match.winnerTeamId === match.awayTeamId }">
                      <span>{{ slotLabel(match, 'away') }}</span>
                      <strong>{{ match.awayScore ?? '' }}</strong>
                    </div>
                    <p class="match-status">
                      {{ matchStatusLabel(match.status) }}
                      <span v-if="match.winnerTeamName" class="winner-name">
                        · Ganador: {{ match.winnerTeamName }}
                      </span>
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </div>
        </section>

        <!-- Rondas (lista) / fechas para POINTS -->
        <section
          v-if="(data.format === 'ELIMINATION' && fixtureView === 'rounds' && rounds.length) || (data.format === 'POINTS' && rounds.length)"
          class="rounds"
        >
          <section v-for="round in rounds" :key="round.round" class="rounds-group">
            <h3 class="round-title">
              {{
                data.format === 'POINTS'
                  ? `Fecha ${round.round}`
                  : eliminationRoundLabel(round.round, rounds.length)
              }}
            </h3>
            <div class="rounds-grid">
              <article
                v-for="match in round.matches"
                :key="match.id"
                class="bracket-match"
                :class="{ played: match.status === 'PLAYED' }"
              >
                <p class="match-time">
                  {{ match.scheduledAt ? formatDateTime(match.scheduledAt) : 'Sin horario' }}
                </p>
                <div class="team-line" :class="{ winner: match.winnerTeamId === match.homeTeamId }">
                  <span>{{ slotLabel(match, 'home') }}</span>
                  <strong>{{ match.homeScore ?? '' }}</strong>
                </div>
                <div class="team-line" :class="{ winner: match.winnerTeamId === match.awayTeamId }">
                  <span>{{ slotLabel(match, 'away') }}</span>
                  <strong>{{ match.awayScore ?? '' }}</strong>
                </div>
                <p class="match-status">
                  {{ matchStatusLabel(match.status) }}
                  <span v-if="match.winnerTeamName" class="winner-name">
                    · Ganador: {{ match.winnerTeamName }}
                  </span>
                </p>
              </article>
            </div>
          </section>
        </section>
      </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft, Printer } from 'lucide-vue-next'
import type { MatchStatus, MatchSummary, ResultsResponse } from '~/types/domain'
import { formatDateTime } from '~/utils/format'

definePageMeta({ layout: false, middleware: 'admin' })

const route = useRoute()
const router = useRouter()
const api = useApi()
const disciplineId = Number(route.params.id)
const data = ref<ResultsResponse | null>(null)
const loading = ref(true)
const printClip = ref<HTMLElement | null>(null)
const printArea = ref<HTMLElement | null>(null)

const fixtureView = ref<'bracket' | 'rounds'>(
  route.query.view === 'rounds' ? 'rounds' : 'bracket',
)

const generatedAt = formatDateTime(new Date().toISOString())

const formatLabel = computed(() =>
  data.value?.format === 'POINTS' ? 'Tabla de posiciones' : 'Llave de eliminación',
)

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
  } finally {
    loading.value = false
  }

  window.addEventListener('beforeprint', applyPrintScale)
  window.addEventListener('afterprint', clearPrintScale)

  if (route.query.auto === '1') {
    await nextTick()
    setTimeout(() => window.print(), 300)
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeprint', applyPrintScale)
  window.removeEventListener('afterprint', clearPrintScale)
})

// A4 apaisado menos margenes de 10mm, en px a 96dpi
const PRINT_MM_TO_PX = 96 / 25.4
const PRINT_AVAIL_W = (297 - 20) * PRINT_MM_TO_PX
const PRINT_AVAIL_H = (210 - 20) * PRINT_MM_TO_PX

function applyPrintScale() {
  clearPrintScale()
  const area = printArea.value
  const clip = printClip.value
  if (!area || !clip) return
  // Solo escalamos la vista de llave; rondas/tabla fluyen en varias paginas.
  if (!(data.value?.format === 'ELIMINATION' && fixtureView.value === 'bracket')) return

  // El ancho real de la llave vive en .bracket (min-width: max-content),
  // aunque su contenedor tenga scroll horizontal.
  const bracketEl = area.querySelector('.bracket') as HTMLElement | null
  const contentW = Math.max(area.scrollWidth, bracketEl?.scrollWidth ?? 0)
  const contentH = area.scrollHeight
  if (!contentW || !contentH) return

  const scale = Math.min(PRINT_AVAIL_W / contentW, PRINT_AVAIL_H / contentH, 1)
  if (scale >= 1) return

  area.style.transform = `scale(${scale})`
  area.style.transformOrigin = 'top left'
  clip.style.width = `${contentW * scale}px`
  clip.style.height = `${contentH * scale}px`
  clip.style.overflow = 'hidden'
}

function clearPrintScale() {
  const area = printArea.value
  const clip = printClip.value
  if (area) {
    area.style.removeProperty('transform')
    area.style.removeProperty('transform-origin')
  }
  if (clip) {
    clip.style.removeProperty('width')
    clip.style.removeProperty('height')
    clip.style.removeProperty('overflow')
  }
}

function printNow() {
  window.print()
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/admin/disciplinas')
}

function slotLabel(match: MatchSummary, side: 'home' | 'away') {
  const name = side === 'home' ? match.homeTeamName : match.awayTeamName
  if (name) return name
  if (match.status === 'PLAYED' && match.winnerTeamId != null) return 'Libre (bye)'
  return ''
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
.print-page {
  min-height: 100vh;
  background: #f1f5f9;
  color: #111827;
  padding: 1.5rem 1rem 3rem;
}

/* ---- Barra de acciones (no se imprime) ---- */
.toolbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  max-width: 1100px;
  margin: 0 auto 1.25rem;
  border-radius: 0.75rem;
  background: #ffffff;
  padding: 0.65rem 0.85rem;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.12);
}
.toolbar-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border-radius: 0.55rem;
  padding: 0.5rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  border: 1px solid transparent;
}
.toolbar-btn.back {
  background: #f1f5f9;
  color: #334155;
}
.toolbar-btn.back:hover {
  background: #e2e8f0;
}
.toolbar-btn.print {
  background: #16a34a;
  color: #ffffff;
}
.toolbar-btn.print:hover {
  background: #15803d;
}
.toolbar-toggle {
  display: inline-flex;
  border-radius: 9999px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 0.2rem;
}
.toggle-btn {
  border-radius: 9999px;
  padding: 0.35rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #64748b;
  cursor: pointer;
}
.toggle-btn.active {
  background: #16a34a;
  color: #ffffff;
}

/* ---- Hoja imprimible ---- */
.sheet {
  max-width: 1100px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 0.85rem;
  padding: 1.5rem;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.1);
}
.sheet-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.85rem;
  margin-bottom: 1.25rem;
}
.sheet-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #0f172a;
}
.sheet-subtitle {
  margin-top: 0.15rem;
  font-size: 1rem;
  color: #475569;
}
.sheet-meta {
  text-align: right;
  font-size: 0.78rem;
  color: #64748b;
}
.sheet-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: #64748b;
}

/* ---- Tabla de posiciones ---- */
.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}
.standings-table th,
.standings-table td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem 0.6rem;
  text-align: center;
}
.standings-table th {
  background: #f1f5f9;
  color: #334155;
  font-weight: 700;
}
.standings-table .left {
  text-align: left;
}
.standings-table .strong {
  font-weight: 800;
  color: #0f172a;
}

/* ---- Llave (bracket) ---- */
.bracket-scroll {
  --gap: 3rem;
  --line: #94a3b8;
  --line-win: #16a34a;
  overflow-x: auto;
  padding-bottom: 0.5rem;
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
  min-width: 220px;
}
.round-title {
  align-self: flex-start;
  display: inline-flex;
  border-radius: 0.35rem;
  background: #dcfce7;
  padding: 0.3rem 0.6rem;
  color: #166534;
  font-size: 0.85rem;
  font-weight: 800;
  text-transform: uppercase;
}
.round-body {
  margin-top: 0.85rem;
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
.bracket-round:not(:first-child) .match-slot::before {
  content: "";
  position: absolute;
  top: 50%;
  left: calc(var(--gap) / -2);
  width: calc(var(--gap) / 2);
  border-top: 2px solid var(--line);
  pointer-events: none;
}
.bracket-round:not(:last-child) .match-slot.has-winner::after {
  border-color: var(--line-win);
}

/* ---- Tarjeta de partido ---- */
.bracket-match {
  position: relative;
  border-radius: 0.7rem;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  padding: 0.7rem;
  break-inside: avoid;
}
.bracket-match.played {
  border-color: #16a34a;
}
.match-time {
  margin-bottom: 0.5rem;
  display: inline-flex;
  border-radius: 0.4rem;
  background: #1e293b;
  padding: 0.2rem 0.4rem;
  color: #fde047;
  font-size: 0.68rem;
  font-weight: 800;
}
.team-line {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
  min-height: 1.9rem;
  border-radius: 0.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  padding: 0.4rem 0.6rem;
  color: #111827;
}
.team-line + .team-line {
  margin-top: 0.4rem;
}
.team-line span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
}
.team-line strong {
  min-width: 2rem;
  min-height: 1.1rem;
  border-radius: 0.35rem;
  background: #e5e7eb;
  padding: 0.15rem 0.35rem;
  text-align: center;
}
.team-line.winner {
  background: #dcfce7;
  color: #14532d;
  border-color: #86efac;
}
.team-line.winner strong {
  background: #86efac;
}
.match-status {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
}
.winner-name {
  color: #16a34a;
}

/* ---- Rondas (lista) ---- */
.rounds {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.rounds-group {
  break-inside: avoid;
}
.rounds-grid {
  margin-top: 0.75rem;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

/* ---- Impresión A4 ---- */
@media print {
  @page {
    size: A4 landscape;
    margin: 10mm;
  }
  .print-page {
    background: #ffffff;
    padding: 0;
  }
  .no-print {
    display: none !important;
  }
  .sheet {
    max-width: none;
    margin: 0;
    padding: 0;
    box-shadow: none;
    border-radius: 0;
  }
  .bracket-scroll {
    overflow: visible;
  }
  .print-area {
    width: max-content;
  }
  .match-time {
    color: #111827;
    background: #e5e7eb;
  }
}
</style>
