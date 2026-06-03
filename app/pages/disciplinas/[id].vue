<template>
  <div v-if="discipline">
    <NuxtLink
      :to="`/eventos/${discipline.eventId}`"
      class="inline-flex items-center gap-1 text-sm text-oscuro-300 hover:text-white"
    >
      <ChevronLeft class="h-4 w-4" /> Volver al evento
    </NuxtLink>

    <div class="mt-4 rounded-2xl border border-oscuro-700 bg-oscuro-850 p-6">
      <h1 class="text-2xl font-bold text-white">{{ discipline.name }}</h1>
      <div class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-lg bg-oscuro-900/60 p-3">
          <p class="text-xs text-oscuro-400">Modalidad</p>
          <p class="font-semibold text-white">
            {{ discipline.modality === 'TEAM' ? 'Por equipos' : 'Individual' }}
          </p>
        </div>
        <div class="rounded-lg bg-oscuro-900/60 p-3">
          <p class="text-xs text-oscuro-400">Jugadores</p>
          <p class="font-semibold text-white">
            {{ discipline.minPlayers }} - {{ discipline.maxPlayers }}
          </p>
        </div>
        <div class="rounded-lg bg-oscuro-900/60 p-3">
          <p class="text-xs text-oscuro-400">Costo</p>
          <p class="font-semibold text-white">
            {{ discipline.isPaid ? formatCurrency(discipline.cost) : 'Gratuito' }}
          </p>
        </div>
        <div class="rounded-lg bg-oscuro-900/60 p-3">
          <p class="text-xs text-oscuro-400">Cierre de inscripción</p>
          <p class="font-semibold text-white">
            {{ formatDateUtc(discipline.registrationDeadline) }}
          </p>
        </div>
      </div>

      <div v-if="discipline.rulesText" class="mt-6">
        <h3 class="text-sm font-semibold text-oscuro-200">Bases</h3>
        <p class="mt-1 whitespace-pre-line text-sm text-oscuro-300">
          {{ discipline.rulesText }}
        </p>
      </div>

      <div v-if="discipline.extraInfo" class="mt-4">
        <h3 class="text-sm font-semibold text-oscuro-200">
          Información adicional
        </h3>
        <p class="mt-1 whitespace-pre-line text-sm text-oscuro-300">
          {{ discipline.extraInfo }}
        </p>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <NuxtLink
          :to="`/inscripcion/${discipline.id}`"
          class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 transition hover:bg-green-400"
        >
          Inscribir equipo
        </NuxtLink>
        <NuxtLink
          :to="`/resultados/${discipline.id}`"
          class="rounded-lg border border-oscuro-600 px-5 py-2.5 font-semibold text-oscuro-100 transition hover:bg-oscuro-800"
        >
          Ver resultados
        </NuxtLink>
      </div>
    </div>
  </div>
  <div v-else class="text-oscuro-400">Cargando disciplina…</div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { Discipline } from '~/types/domain'
import { formatCurrency, formatDateUtc } from '~/utils/format'

const route = useRoute()
const discipline = ref<Discipline | null>(null)

onMounted(async () => {
  const api = useApi()
  try {
    discipline.value = await api.get<Discipline>(
      `/disciplines/${Number(route.params.id)}`,
    )
  } catch {
    discipline.value = null
  }
})
</script>
