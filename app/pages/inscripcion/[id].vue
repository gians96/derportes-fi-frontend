<template>
  <div class="mx-auto max-w-5xl">
    <h1 class="text-2xl font-bold text-white">Inscripción de equipo</h1>
    <p class="mt-1 text-oscuro-300">
      Completa los datos del equipo y registra a los jugadores.
    </p>

    <div
      v-if="discipline"
      class="mt-4 rounded-2xl border border-oscuro-700 bg-oscuro-850 p-4 text-sm text-oscuro-200"
    >
      <p>
        {{ participantTypeLabel(discipline.participantType) }} · jugadores para
        bases: {{ countedPlayers }} / {{ discipline.minPlayers }}-{{ discipline.maxPlayers }}
      </p>
      <p class="mt-1 text-xs text-oscuro-400">
        Tú serás el delegado responsable. La lista de integrantes cuenta solo a los jugadores del equipo.
      </p>
    </div>

    <p v-if="discipline && !canRegister" class="mt-3 text-sm text-amber-300">
      Esta disciplina no corresponde a tu tipo de participante.
    </p>

    <form class="mt-6 space-y-6" @submit.prevent="submit">
      <fieldset class="rounded-2xl border border-oscuro-700 bg-oscuro-850 p-5 shadow-xl shadow-black/10">
        <legend class="px-2 text-sm font-semibold text-green-300">
          Datos del equipo
        </legend>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm text-oscuro-200">Nombre del equipo</span>
            <input
              v-model="form.teamName"
              type="text"
              required
              class="input"
              placeholder="Ej. Los Ingenieros FC"
            />
          </label>
          <label class="block">
            <span class="text-sm text-oscuro-200">Celular de contacto</span>
            <input
              v-model="form.phone"
              type="tel"
              class="input"
              placeholder="999 999 999"
            />
          </label>
          <label v-if="participantMode === 'STUDENT'" class="block">
            <span class="text-sm text-oscuro-200">Ciclo</span>
            <input
              v-model="form.cycle"
              type="text"
              required
              class="input"
              placeholder="Ej. VIII"
            />
          </label>
          <label v-if="participantMode === 'STUDENT'" class="block">
            <span class="text-sm text-oscuro-200">Sección</span>
            <input
              v-model="form.section"
              type="text"
              required
              class="input"
              placeholder="Ej. A"
            />
          </label>
        </div>
      </fieldset>

      <fieldset class="rounded-2xl border border-oscuro-700 bg-oscuro-850 p-5 shadow-xl shadow-black/10">
        <legend class="px-2 text-sm font-semibold text-green-300">
          Delegado responsable
        </legend>
        <div class="rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
          <p class="font-semibold text-white">{{ auth.user?.fullName }}</p>
          <p class="mt-1 text-xs text-oscuro-400">
            {{ auth.user?.email }}<span v-if="auth.user?.studentCode"> · {{ auth.user.studentCode }}</span>
          </p>
        </div>
      </fieldset>

      <fieldset class="rounded-2xl border border-oscuro-700 bg-oscuro-850 p-5 shadow-xl shadow-black/10">
        <legend class="px-2 text-sm font-semibold text-green-300">
          Jugadores
        </legend>

        <div class="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <label>
            <span class="text-sm text-oscuro-200">
              {{ participantMode === 'OTHER' ? 'Buscar por DNI' : 'Buscar por código de estudiante' }}
            </span>
            <input
              v-model="search"
              type="text"
              :inputmode="participantMode === 'OTHER' ? 'numeric' : 'text'"
              class="input"
              :placeholder="participantMode === 'OTHER' ? 'Ej. 71234567' : 'Ej. 2301010149'"
            />
          </label>
          <button
            type="button"
            class="h-[46px] rounded-lg bg-green-500/15 px-5 font-semibold text-green-300 transition hover:bg-green-500/25 disabled:opacity-60"
            :disabled="searching"
            @click="searchStudent"
          >
            {{ searching ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
        <p v-if="searchError" class="mt-2 text-sm text-red-400">
          {{ searchError }}
        </p>

        <ul class="mt-5 space-y-3">
          <li
            v-for="(p, i) in form.participants"
            :key="p.studentCode || p.dni || p.fullName"
            class="grid gap-3 rounded-xl border border-oscuro-800 bg-oscuro-900/60 px-5 py-4 md:grid-cols-[1fr_auto] md:items-center"
          >
            <div>
              <p class="text-lg font-bold uppercase tracking-normal text-white">
                {{ p.fullName }}
              </p>
              <p class="mt-1 text-xs text-oscuro-400">
                {{ p.studentCode || p.dni }} · Jugador
              </p>
            </div>
            <button
              type="button"
              class="text-xs text-red-400 hover:text-red-300 md:justify-self-end"
              @click="removeParticipant(i)"
            >
              Quitar
            </button>
          </li>
        </ul>
        <p v-if="!form.participants.length" class="mt-3 text-sm text-oscuro-400">
          Agrega al menos un jugador.
        </p>
      </fieldset>

      <fieldset
        v-if="discipline?.isPaid"
        class="rounded-2xl border border-oscuro-700 bg-oscuro-850 p-5 shadow-xl shadow-black/10"
      >
        <legend class="px-2 text-sm font-semibold text-green-300">
          Comprobante de pago ({{ formatCurrency(discipline.cost) }})
        </legend>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="text-sm text-oscuro-200">N° de operación</span>
            <input v-model="form.operationNumber" type="text" class="input" />
          </label>
          <label class="block">
            <span class="text-sm text-oscuro-200">Imagen del voucher</span>
            <input
              type="file"
              accept="image/*"
              class="input"
              @change="onFile"
            />
          </label>
        </div>
      </fieldset>

      <p v-if="error" class="text-sm text-red-400">{{ error }}</p>
      <p v-if="success" class="text-sm text-green-400">{{ success }}</p>

      <button
        type="submit"
        class="w-full rounded-lg bg-green-500 px-5 py-3 font-semibold text-oscuro-900 transition hover:bg-green-400 disabled:opacity-50"
        :disabled="submitting || !canRegister"
      >
        {{ submitting ? 'Enviando...' : 'Enviar inscripción' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { AcademicStudent, Discipline, Participant } from '~/types/domain'
import { useAuthStore } from '~/stores/auth'
import { formatCurrency } from '~/utils/format'
import {
  canUseParticipantType,
  countedParticipants,
  participantTypeLabel,
} from '~/utils/participants'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const api = useApi()
const auth = useAuthStore()
const disciplineId = Number(route.params.id)

const discipline = ref<Discipline | null>(null)
const search = ref('')
const searching = ref(false)
const searchError = ref('')
const submitting = ref(false)
const error = ref('')
const success = ref('')

const participantMode = computed<'STUDENT' | 'OTHER'>(
  () => discipline.value?.participantType ?? 'STUDENT',
)

const countedPlayers = computed(() =>
  countedParticipants(participantMode.value, form.participants),
)

const canRegister = computed(() => {
  if (!discipline.value || !auth.user) return false
  return canUseParticipantType(auth.user, discipline.value.participantType)
})

const form = reactive({
  teamName: '',
  phone: '',
  cycle: '',
  section: '',
  operationNumber: '',
  participants: [] as Participant[],
  voucherFile: null as File | null,
})

onMounted(async () => {
  try {
    discipline.value = await api.get<Discipline>(`/disciplines/${disciplineId}`)
  } catch {
    discipline.value = null
  }
})

async function searchStudent() {
  if (!canRegister.value) {
    searchError.value = 'Esta disciplina no corresponde a tu tipo de participante.'
    return
  }
  const q = search.value.trim()
  if (!q) return
  searching.value = true
  searchError.value = ''
  try {
    let person: AcademicStudent
    if (participantMode.value === 'OTHER') {
      if (!/^\d{8}$/.test(q)) {
        searchError.value = 'Ingresa un DNI válido de 8 dígitos.'
        return
      }
      person = await api.get<AcademicStudent>('/academic/dni', { numero: q })
    } else {
      person = await api.get<AcademicStudent>('/academic/student', {
        buscador: q,
      })
    }
    const code = person.studentCode?.trim() || null
    const dni = person.dni?.trim() || (/^\d{8}$/.test(q) ? q : null)
    const already = form.participants.some(
      (p) =>
        (code && p.studentCode === code) ||
        (dni && p.dni === dni) ||
        (p.fullName.toLowerCase() === person.fullName.toLowerCase() &&
          (!code || !p.studentCode) &&
          (!dni || !p.dni)),
    )
    if (already) {
      searchError.value = 'Esa persona ya fue agregada.'
      return
    }
    form.participants.push({
      fullName: person.fullName.replace(/\s+/g, ' ').trim(),
      studentCode: code,
      dni,
      gender: 'O',
      isDelegate: false,
      countsAsPlayer: true,
    })
    search.value = ''
  } catch {
    searchError.value =
      participantMode.value === 'OTHER'
        ? 'No se encontró una persona con ese DNI.'
        : 'No se encontró un estudiante único con ese código.'
  } finally {
    searching.value = false
  }
}

function removeParticipant(index: number) {
  form.participants.splice(index, 1)
}

function onFile(e: Event) {
  const target = e.target as HTMLInputElement
  form.voucherFile = target.files?.[0] ?? null
}

async function submit() {
  error.value = ''
  success.value = ''
  if (!form.participants.length) {
    error.value = 'Agrega al menos un jugador.'
    return
  }
  if (!canRegister.value) {
    error.value = auth.user
      ? 'Esta disciplina no corresponde a tu tipo de participante.'
      : 'Inicia sesión para inscribirte.'
    return
  }
  if (
    participantMode.value === 'STUDENT' &&
    (!form.cycle.trim() || !form.section.trim())
  ) {
    error.value = 'Completa ciclo y sección del equipo.'
    return
  }
  if (
    discipline.value &&
    (countedPlayers.value < discipline.value.minPlayers ||
      countedPlayers.value > discipline.value.maxPlayers)
  ) {
    error.value = `El equipo debe tener entre ${discipline.value.minPlayers} y ${discipline.value.maxPlayers} jugadores. Tiene ${countedPlayers.value}.`
    return
  }
  if (discipline.value?.isPaid && !form.voucherFile) {
    error.value = 'Adjunta el comprobante de pago.'
    return
  }
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('disciplineId', String(disciplineId))
    fd.append('teamName', form.teamName)
    fd.append('phone', form.phone)
    fd.append('cycle', form.cycle)
    fd.append('section', form.section)
    fd.append('participants', JSON.stringify(form.participants))
    if (discipline.value?.isPaid) {
      fd.append('operationNumber', form.operationNumber)
      if (form.voucherFile) fd.append('voucher', form.voucherFile)
    }
    await api.upload('/registrations', fd)
    success.value = 'Inscripción enviada. Queda pendiente de validación.'
    setTimeout(() => navigateTo('/estado-inscripcion'), 1200)
  } catch (err: unknown) {
    error.value =
      (err as { data?: { message?: string } })?.data?.message ??
      'No se pudo enviar la inscripción.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input {
  margin-top: 0.25rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid rgba(55, 65, 81, 0.4);
  background-color: #182029;
  padding: 0.625rem 0.75rem;
  color: white;
  outline: none;
}
.input:focus {
  border-color: #4ade80;
  box-shadow: 0 0 0 1px rgba(74, 222, 128, 0.4);
}
</style>
