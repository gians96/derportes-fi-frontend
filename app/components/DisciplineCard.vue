<template>
  <div
    class="group rounded-xl border border-oscuro-700 bg-oscuro-850 p-5 transition-all hover:border-green-500/40 hover:shadow-lg hover:shadow-green-950/30"
  >
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-lg font-bold text-white">{{ discipline.name }}</h3>
        <p class="mt-0.5 text-sm text-oscuro-300">
          {{ modalityLabel }} · {{ genderLabel }}
        </p>
      </div>
      <span
        class="rounded-md border px-2 py-1 text-xs font-semibold"
        :class="
          discipline.isPaid
            ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300'
            : 'border-green-500/30 bg-green-500/10 text-green-300'
        "
      >
        {{ discipline.isPaid ? formatCurrency(discipline.cost) : 'Gratuito' }}
      </span>
    </div>

    <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
      <div class="rounded-lg bg-oscuro-900/60 p-3">
        <p class="text-oscuro-400">Jugadores</p>
        <p class="font-semibold text-white">
          {{ discipline.minPlayers }} - {{ discipline.maxPlayers }}
        </p>
      </div>
      <div class="rounded-lg bg-oscuro-900/60 p-3">
        <p class="text-oscuro-400">Equipos</p>
        <p class="font-semibold text-white">
          {{ discipline.teamsCount ?? 0 }} / {{ discipline.maxTeams }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex items-center justify-between">
      <span class="text-xs text-oscuro-400">
        Cierre: {{ formatDate(discipline.registrationDeadline) }}
      </span>
      <NuxtLink
        :to="`/disciplinas/${discipline.id}`"
        class="rounded-lg bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
      >
        Ver detalle
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Discipline } from '~/types/domain'
import { formatCurrency, formatDate } from '~/utils/format'

const props = defineProps<{ discipline: Discipline }>()

const modalityLabel = computed(() =>
  props.discipline.modality === 'TEAM' ? 'Por equipos' : 'Individual',
)

const genderLabel = computed(() => {
  const map: Record<string, string> = {
    MALE: 'Varones',
    FEMALE: 'Mujeres',
    MIXED: 'Mixto',
    FREE: 'Libre',
  }
  return map[props.discipline.genderPolicy] ?? 'Libre'
})
</script>
