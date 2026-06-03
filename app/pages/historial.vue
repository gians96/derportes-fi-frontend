<template>
  <div>
    <h1 class="text-2xl font-bold text-white">Mi historial deportivo</h1>
    <p class="mt-1 text-oscuro-300">
      Competencias en las que has participado y sus resultados.
    </p>

    <div v-if="history.length" class="mt-6 overflow-hidden rounded-xl border border-oscuro-700">
      <table class="w-full text-left text-sm">
        <thead class="bg-oscuro-800 text-oscuro-300">
          <tr>
            <th class="px-4 py-3">Disciplina</th>
            <th class="px-4 py-3">Equipo</th>
            <th class="px-4 py-3">Resultado</th>
            <th class="px-4 py-3">Fecha</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-oscuro-700 bg-oscuro-850">
          <tr v-for="(row, i) in history" :key="i">
            <td class="px-4 py-3 font-semibold text-white">
              {{ row.discipline }}
            </td>
            <td class="px-4 py-3 text-oscuro-200">{{ row.team }}</td>
            <td class="px-4 py-3">
              <span
                class="font-semibold"
                :class="{
                  'text-green-400': row.result === 'ganado',
                  'text-red-400': row.result === 'perdido',
                  'text-yellow-300': row.result === 'empate',
                }"
              >
                {{ row.result }}
              </span>
            </td>
            <td class="px-4 py-3 text-oscuro-400">{{ formatDate(row.date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="mt-6 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
    >
      Todavía no tienes participaciones registradas.
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '~/utils/format'

definePageMeta({ middleware: 'auth' })

interface HistoryRow {
  discipline: string
  team: string
  result: string
  date: string
}

const api = useApi()
const history = ref<HistoryRow[]>([])

onMounted(async () => {
  try {
    history.value = await api.get<HistoryRow[]>('/results/mine')
  } catch {
    history.value = []
  }
})
</script>
