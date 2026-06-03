<template>
  <div>
    <section
      class="relative overflow-hidden rounded-2xl border border-oscuro-700 bg-gradient-to-br from-oscuro-850 to-oscuro-900 p-8 sm:p-12"
    >
      <div class="relative z-10 max-w-2xl">
        <span
          class="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-300"
        >
          <Sparkles class="h-3.5 w-3.5" /> Facultad de Ingeniería
        </span>
        <h1 class="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl">
          Vive el deporte
          <span class="text-green-400 glow-text">universitario</span>
        </h1>
        <p class="mt-4 text-lg text-oscuro-200">
          Inscríbete a las disciplinas de tu escuela profesional, gestiona tu
          equipo y sigue tus resultados en tiempo real.
        </p>
        <div class="mt-6 flex flex-wrap gap-3">
          <NuxtLink
            to="/eventos"
            class="rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 transition hover:bg-green-400"
          >
            Ver eventos
          </NuxtLink>
          <NuxtLink
            v-if="!auth.isLoggedIn"
            to="/login"
            class="rounded-lg border border-oscuro-600 px-5 py-2.5 font-semibold text-oscuro-100 transition hover:bg-oscuro-800"
          >
            Iniciar sesión
          </NuxtLink>
        </div>
      </div>
    </section>

    <section class="mt-8">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Eventos abiertos</h2>
        <NuxtLink
          to="/eventos"
          class="text-sm font-semibold text-green-400 hover:text-green-300"
        >
          Ver todos →
        </NuxtLink>
      </div>

      <div v-if="store.loading" class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="n in 3"
          :key="n"
          class="h-40 animate-pulse rounded-xl border border-oscuro-700 bg-oscuro-850"
        ></div>
      </div>

      <div
        v-else-if="store.openEvents.length"
        class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <NuxtLink
          v-for="event in store.openEvents"
          :key="event.id"
          :to="`/eventos/${event.id}`"
          class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-5 transition hover:border-green-500/40"
        >
          <h3 class="text-lg font-bold text-white">{{ event.name }}</h3>
          <p class="mt-1 line-clamp-2 text-sm text-oscuro-300">
            {{ event.description }}
          </p>
          <p class="mt-3 text-xs text-oscuro-400">
            {{ formatDate(event.startDate) }} —
            {{ formatDate(event.endDate) }}
          </p>
        </NuxtLink>
      </div>

      <div
        v-else
        class="rounded-xl border border-dashed border-oscuro-700 bg-oscuro-850 p-10 text-center text-oscuro-400"
      >
        No hay eventos abiertos por el momento.
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useEventsStore } from '~/stores/events'
import { formatDate } from '~/utils/format'

const auth = useAuthStore()
const store = useEventsStore()

onMounted(() => {
  store.fetchEvents()
})
</script>
