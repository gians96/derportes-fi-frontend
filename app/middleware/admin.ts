import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  if (!auth.token) {
    auth.loadFromStorage()
  }

  if (auth.token && !auth.user) {
    await auth.fetchProfile()
  }

  if (!auth.isLoggedIn) {
    return navigateTo('/login')
  }

  const refereeAllowed = auth.isReferee && to.path.startsWith('/admin/disciplinas')

  if (!auth.isAdmin && !refereeAllowed) {
    return navigateTo('/403')
  }
})
