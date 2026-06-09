<template>
  <div class="flex min-h-[70vh] items-center justify-center">
    <div
      class="w-full max-w-md rounded-2xl border border-oscuro-700 bg-oscuro-850 p-8 text-center"
    >
      <div
        class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-green-500/20 bg-green-500/10"
      >
        <Trophy class="h-7 w-7 text-green-400" />
      </div>
      <h1 class="text-2xl font-bold text-white">Deportes FI</h1>
      <p class="mt-2 text-sm text-oscuro-300">
        Ingresa con tu cuenta de Google
      </p>

      <div class="mt-8 flex justify-center">
        <GoogleSignInButton @success="onSuccess" @error="onError" />
      </div>

      <p v-if="error" class="mt-4 text-sm text-red-400">{{ error }}</p>
      <p v-if="auth.loading" class="mt-4 text-sm text-oscuro-300">
        Verificando…
      </p>

      <p class="mt-8 text-xs text-oscuro-500">
        Los participantes externos deben validar su DNI para continuar.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: 'guest' })

const auth = useAuthStore()
const route = useRoute()
const error = ref('')

async function onSuccess() {
  const redirect = (route.query.redirect as string) || '/'
  if (auth.needsProfile) {
    await navigateTo('/completar-perfil')
    return
  }
  if (auth.isAdmin) {
    await navigateTo('/admin/dashboard')
    return
  }
  if (auth.isReferee) {
    await navigateTo('/admin/disciplinas')
    return
  }
  await navigateTo(redirect)
}

function onError(message: string) {
  error.value = message
}
</script>
