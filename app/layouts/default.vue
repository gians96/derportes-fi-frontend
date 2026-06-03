<template>
  <div class="flex min-h-screen flex-col bg-oscuro-900">
    <header
      class="sticky top-0 z-40 border-b border-oscuro-700 bg-oscuro-800/80 backdrop-blur-sm"
    >
      <div
        class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6"
      >
        <NuxtLink to="/" class="flex items-center gap-3">
          <div
            class="rounded-lg border border-green-500/20 bg-green-500/10 px-2 py-2 shadow-lg shadow-green-950/40"
          >
            <Trophy class="h-5 w-5 text-green-400" />
          </div>
          <div class="leading-tight">
            <p class="text-base font-bold text-white">
              Deportes <span class="text-green-400 glow-text">FI</span>
            </p>
            <p class="text-[11px] text-oscuro-300">Facultad de Ingeniería · UNDC</p>
          </div>
        </NuxtLink>

        <nav class="hidden items-center gap-1 md:flex">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-lg px-3 py-2 text-sm font-semibold text-oscuro-200 transition hover:bg-oscuro-700 hover:text-white"
            active-class="text-green-400"
          >
            {{ link.label }}
          </NuxtLink>
        </nav>

        <div class="flex items-center gap-2">
          <template v-if="auth.isLoggedIn">
            <NuxtLink
              v-if="auth.isAdmin"
              to="/admin/dashboard"
              class="hidden rounded-lg bg-green-500/10 px-3 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-500/20 sm:block"
            >
              Panel admin
            </NuxtLink>
            <button
              class="rounded-lg border border-oscuro-700 px-3 py-2 text-sm font-semibold text-oscuro-200 transition hover:text-white"
              @click="auth.logout()"
            >
              Salir
            </button>
          </template>
          <NuxtLink
            v-else
            to="/login"
            class="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-semibold text-green-300 transition hover:bg-green-500/20"
          >
            Ingresar
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
      <slot />
    </main>

    <footer class="border-t border-oscuro-700 bg-oscuro-850">
      <div
        class="mx-auto max-w-6xl px-4 py-6 text-center text-sm text-oscuro-400 sm:px-6"
      >
        © {{ new Date().getFullYear() }} Facultad de Ingeniería · Universidad
        Nacional de Cañete
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/historial', label: 'Historial' },
]
</script>
