import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const auth = useAuthStore()
  auth.loadFromStorage()
  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }
})
