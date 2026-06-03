<template>
  <div>
    <h1 class="text-2xl font-bold text-white">Resultados y tabla</h1>
    <p class="mt-1 text-oscuro-300">{{ disciplineName }}</p>

    <div
      v-if="standings.length"
      class="mt-6 overflow-hidden rounded-xl border border-oscuro-700"
    >
      <table class="w-full text-left text-sm">
        <thead class="bg-oscuro-800 text-oscuro-300">
          <tr>
            <th class="px-4 py-3">#</th>
            <th class="px-4 py-3">Equipo</th>
            <th class="px-4 py-3 text-center">PJ</th>
            <th class="px-4 py-3 text-center">G</th>
            <th class="px-4 py-3 text-center">E</th>
            <th class="px-4 py-3 text-center">P</th>
            <th class="px-4 py-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-oscuro-700 bg-oscuro-850">
          <tr v-for="(row, i) in standings" :key="row.teamId">
            <td class="px-4 py-3 text-oscuro-400">{{ i + 1 }}</td>
            <td class="px-4 py-3 font-semibold text-white">{{ row.teamName }}</td>
            <td class="px-4 py-3 text-center text-oscuro-200">{{ row.played }}</td>
            <td class="px-4 py-3 text-center text-green-400">{{ row.won }}</td>
            <td class="px-4 py-3 text-center text-yellow-300">{{ row.drawn }}</td>
            <td class="px-4 py-3 text-center text-red-400">{{ row.lost }}</td>
            <td class="px-4 py-3 text-center font-bold text-white">
              {{ row.points }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-else
      class="mt-6 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
    >
      Aún no hay resultados publicados.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { StandingRow } from '~/types/domain'

const route = useRoute()
const api = useApi()
const disciplineId = Number(route.params.id)
const disciplineName = ref('')
const standings = ref<StandingRow[]>([])

onMounted(async () => {
  try {
    const data = await api.get<{ disciplineName: string; standings: StandingRow[] }>(
      `/standings/${disciplineId}`,
    )
    disciplineName.value = data.disciplineName
    standings.value = data.standings
  } catch {
    standings.value = []
  }
})
</script>
