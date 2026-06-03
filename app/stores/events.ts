import { defineStore } from 'pinia'
import type { SportEvent, Discipline } from '~/types/domain'

interface EventsState {
  events: SportEvent[]
  disciplines: Discipline[]
  loading: boolean
}

export const useEventsStore = defineStore('events', {
  state: (): EventsState => ({
    events: [],
    disciplines: [],
    loading: false,
  }),

  getters: {
    openEvents: (state) => state.events.filter((e) => e.isOpen),
  },

  actions: {
    async fetchEvents() {
      this.loading = true
      try {
        const api = useApi()
        this.events = await api.get<SportEvent[]>('/events')
      } catch {
        this.events = []
      } finally {
        this.loading = false
      }
    },

    async fetchDisciplines(eventId: number) {
      try {
        const api = useApi()
        this.disciplines = await api.get<Discipline[]>(
          `/events/${eventId}/disciplines`,
        )
      } catch {
        this.disciplines = []
      }
    },
  },
})
