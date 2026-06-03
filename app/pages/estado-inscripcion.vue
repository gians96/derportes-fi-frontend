<template>
  <div>
    <h1 class="text-2xl font-bold text-white">Estado de mis inscripciones</h1>
    <p class="mt-1 text-oscuro-300">
      Revisa el estado de los equipos que has inscrito.
    </p>

    <div v-if="teams.length" class="mt-6 space-y-4">
      <div
        v-for="team in teams"
        :key="team.id"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-5"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">{{ team.name }}</h3>
          <StatusBadge :status="team.status" />
        </div>
        <p class="mt-1 text-sm text-oscuro-400">
          {{ team.participants.length }} integrantes ·
          {{ formatDate(team.createdAt) }}
        </p>
        <p
          v-if="team.status === 'REJECTED' && team.rejectionReason"
          class="mt-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          Motivo de rechazo: {{ team.rejectionReason }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="mt-6 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
    >
      Aún no has inscrito ningún equipo.
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Team } from '~/types/domain'
import { formatDate } from '~/utils/format'

definePageMeta({ middleware: 'auth' })

const api = useApi()
const teams = ref<Team[]>([])

onMounted(async () => {
  try {
    teams.value = await api.get<Team[]>('/registrations/mine')
  } catch {
    teams.value = []
  }
})
</script>
