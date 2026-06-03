<template>
  <div ref="buttonRef" class="flex justify-center"></div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const emit = defineEmits<{ success: []; error: [string] }>()

const config = useRuntimeConfig()
const auth = useAuthStore()
const buttonRef = ref<HTMLElement | null>(null)

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve()
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar Google Sign-In'))
    document.head.appendChild(script)
  })
}

async function handleCredential(response: GoogleCredentialResponse) {
  const ok = await auth.loginWithGoogle(response.credential)
  if (ok) emit('success')
  else emit('error', auth.error ?? 'Error al iniciar sesión')
}

onMounted(async () => {
  if (!config.public.googleClientId) {
    emit('error', 'Falta configurar NUXT_PUBLIC_GOOGLE_CLIENT_ID')
    return
  }
  try {
    await loadGoogleScript()
    window.google!.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleCredential,
    })
    if (buttonRef.value) {
      window.google!.accounts.id.renderButton(buttonRef.value, {
        theme: 'filled_black',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 280,
      })
    }
  } catch (err) {
    emit('error', (err as Error).message)
  }
})
</script>
