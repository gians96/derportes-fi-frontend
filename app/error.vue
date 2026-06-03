<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center bg-oscuro-900 px-4 text-center"
  >
    <p class="text-6xl font-bold text-green-400 glow-text">
      {{ error.statusCode }}
    </p>
    <h1 class="mt-4 text-2xl font-bold text-white">
      {{ error.statusCode === 404 ? 'Página no encontrada' : 'Algo salió mal' }}
    </h1>
    <p class="mt-2 max-w-md text-oscuro-300">
      {{ error.message || 'Ocurrió un error inesperado.' }}
    </p>
    <button
      class="mt-6 rounded-lg bg-green-500 px-5 py-2.5 font-semibold text-oscuro-900 transition hover:bg-green-400"
      @click="handleError"
    >
      Volver al inicio
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
