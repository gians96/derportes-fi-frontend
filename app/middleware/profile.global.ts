import { useAuthStore } from '~/stores/auth'

// Fuerza a los estudiantes sin facultad/escuela a completar su perfil.
export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  const allowed = ['/completar-perfil', '/login', '/403']
  if (allowed.includes(to.path)) return

  if (auth.isLoggedIn && auth.needsProfile) {
    return navigateTo('/completar-perfil')
  }
})
