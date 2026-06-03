<template>
  <div>
    <h1 class="text-2xl font-bold text-white">Eventos deportivos</h1>
    <p class="mt-1 text-oscuro-300">
      Eventos organizados por la Facultad de Ingeniería y sus escuelas
      profesionales.
    </p>

    <div v-if="store.loading" class="mt-6 grid gap-4 sm:grid-cols-2">
      <div
        v-for="n in 4"
        :key="n"
        class="h-36 animate-pulse rounded-xl border border-oscuro-700 bg-oscuro-850"
      ></div>
    </div>

    <div v-else-if="store.events.length" class="mt-6 grid gap-4 sm:grid-cols-2">
      <NuxtLink
        v-for="event in store.events"
        :key="event.id"
        :to="`/eventos/${event.id}`"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-5 transition hover:border-green-500/40"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-white">{{ event.name }}</h3>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-semibold"
            :class="
              event.isOpen
                ? 'bg-green-500/10 text-green-300'
                : 'bg-oscuro-700 text-oscuro-300'
            "
          >
            {{ event.isOpen ? 'Abierto' : 'Cerrado' }}
          </span>
        </div>
        <p class="mt-1 line-clamp-2 text-sm text-oscuro-300">
          {{ event.description }}
        </p>
        <p class="mt-3 text-xs text-oscuro-400">
          {{ formatDate(event.startDate) }} — {{ formatDate(event.endDate) }}
        </p>
      </NuxtLink>
    </div>

    <div
      v-else
      class="mt-6 rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
    >
      No hay eventos registrados.
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEventsStore } from '~/stores/events'
import { formatDate } from '~/utils/format'

const store = useEventsStore()

onMounted(() => {
  store.fetchEvents()
})
</script>
