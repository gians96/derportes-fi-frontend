import type { Faculty } from '~/types/domain'

export function useFaculties() {
  const api = useApi()
  const faculties = useState<Faculty[]>('faculties', () => [])
  const loading = useState<boolean>('faculties_loading', () => false)

  async function load(force = false) {
    if (faculties.value.length && !force) return faculties.value
    loading.value = true
    try {
      faculties.value = await api.get<Faculty[]>('/faculties')
    } finally {
      loading.value = false
    }
    return faculties.value
  }

  return { faculties, loading, load }
}
