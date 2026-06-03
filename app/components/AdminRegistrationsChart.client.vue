<template>
  <div class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-5">
    <h3 class="mb-4 text-sm font-semibold text-oscuro-200">
      Inscripciones por disciplina
    </h3>
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
)

const props = defineProps<{
  labels: string[]
  values: number[]
}>()

const chartData = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Equipos',
      data: props.values,
      backgroundColor: 'rgba(69, 248, 130, 0.5)',
      borderColor: '#45f882',
      borderWidth: 1,
      borderRadius: 6,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  plugins: { legend: { labels: { color: '#a3aab0' } } },
  scales: {
    x: { ticks: { color: '#77808a' }, grid: { color: '#151d24' } },
    y: { ticks: { color: '#77808a' }, grid: { color: '#151d24' } },
  },
}
</script>
