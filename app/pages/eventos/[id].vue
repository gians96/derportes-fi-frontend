<template>
  <div>
    <NuxtLink
      to="/eventos"
      class="inline-flex items-center gap-1 text-sm text-oscuro-300 hover:text-white"
    >
      <ChevronLeft class="h-4 w-4" /> Eventos
    </NuxtLink>

    <div v-if="event" class="mt-4">
      <div class="rounded-2xl border border-oscuro-700 bg-oscuro-850 p-6">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 class="text-2xl font-bold text-white">{{ event.name }}</h1>
            <p class="mt-1 text-oscuro-300">{{ event.description }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="
              event.isOpen
                ? 'bg-green-500/10 text-green-300'
                : 'bg-oscuro-700 text-oscuro-300'
            "
          >
            {{ event.isOpen ? 'Inscripciones abiertas' : 'Cerrado' }}
          </span>
        </div>
        <p class="mt-3 text-sm text-oscuro-400">
          {{ formatDateUtc(event.startDate) }} — {{ formatDateUtc(event.endDate) }}
        </p>
      </div>

      <h2 class="mt-8 text-xl font-bold text-white">Disciplinas</h2>
      <div
        v-if="store.disciplines.length"
        class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <DisciplineCard
          v-for="d in store.disciplines"
          :key="d.id"
          :discipline="d"
        />
      </div>
      <div
        v-else
        class="mt-4 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
      >
        Aún no hay disciplinas configuradas para este evento.
      </div>
    </div>

    <div v-else class="mt-6 text-oscuro-400">Cargando evento…</div>
  </div>
</template>

<script setup lang="ts">
import { ChevronLeft } from 'lucide-vue-next'
import type { SportEvent } from '~/types/domain'
import { useEventsStore } from '~/stores/events'
import { formatDateUtc } from '~/utils/format'

const route = useRoute()
const store = useEventsStore()
const eventId = Number(route.params.id)
const event = ref<SportEvent | null>(null)

onMounted(async () => {
  const api = useApi()
  try {
    event.value = await api.get<SportEvent>(`/events/${eventId}`)
  } catch {
    event.value = null
  }
  await store.fetchDisciplines(eventId)
})
</script>
