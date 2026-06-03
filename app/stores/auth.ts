import { defineStore } from 'pinia'
import type { AuthUser } from '~/types/domain'

interface AuthState {
  user: AuthUser | null
  token: string | null
  loading: boolean
  error: string | null
}

const TOKEN_KEY = 'deportes_fi_token'
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

function tokenCookie() {
  return useCookie<string | null>(TOKEN_KEY, {
    maxAge: TOKEN_MAX_AGE,
    sameSite: 'lax',
    path: '/',
  })
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null,
    loading: false,
    error: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.user && !!state.token,
    isAdmin: (state) =>
      state.user?.role === 'ADMIN_SYSTEM' ||
      state.user?.role === 'OWNER_SYSTEM',
    isOwner: (state) => state.user?.role === 'OWNER_SYSTEM',
    needsProfile: (state) =>
      state.user?.role === 'STUDENT' &&
      (!state.user?.facultyId || !state.user?.schoolId),
  },

  actions: {
    loadFromStorage() {
      const token = tokenCookie().value
      if (token) this.token = token
    },

    async loginWithGoogle(idToken: string) {
      this.loading = true
      this.error = null
      try {
        const api = useApi()
        const data = await api.post<{ token: string; user: AuthUser }>(
          '/auth/google',
          { idToken },
        )
        this.token = data.token
        this.user = data.user
        tokenCookie().value = data.token
        return true
      } catch (err: unknown) {
        this.error =
          (err as { data?: { message?: string } })?.data?.message ??
          'No se pudo iniciar sesión'
        this.clearSession()
        return false
      } finally {
        this.loading = false
      }
    },

    async fetchProfile() {
      if (!this.token) return false
      try {
        const api = useApi()
        const user = await api.get<AuthUser>('/auth/me')
        this.user = user
        return true
      } catch {
        this.clearSession()
        return false
      }
    },

    async updateProfile(payload: {
      facultyId: number
      schoolId: number
      dni?: string
    }) {
      const api = useApi()
      const user = await api.patch<AuthUser>('/auth/me/profile', payload)
      this.user = user
      return user
    },

    clearSession() {
      this.user = null
      this.token = null
      tokenCookie().value = null
    },

    async logout() {
      this.clearSession()
      await navigateTo('/login')
    },
  },
})
