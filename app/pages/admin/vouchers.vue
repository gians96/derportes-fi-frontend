<template>
  <div>
    <h1 class="text-xl font-bold text-white">Validación de vouchers</h1>
    <p class="mt-1 text-sm text-oscuro-300">
      Revisa los comprobantes de pago de los equipos.
    </p>

    <div class="mt-4 flex gap-2">
      <button
        v-for="f in filters"
        :key="f.value"
        class="rounded-lg px-3 py-1.5 text-sm font-semibold transition"
        :class="
          filter === f.value
            ? 'bg-green-500/15 text-green-300'
            : 'bg-oscuro-850 text-oscuro-300 hover:bg-oscuro-800'
        "
        @click="filter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="mt-6 grid gap-4 sm:grid-cols-2">
      <div
        v-for="v in filtered"
        :key="v.id"
        class="rounded-xl border border-oscuro-700 bg-oscuro-850 p-4"
      >
        <div class="flex items-center justify-between">
          <p class="font-semibold text-white">{{ v.teamName }}</p>
          <StatusBadge :status="v.status" />
        </div>
        <p class="text-xs text-oscuro-400">
          Op. {{ v.operationNumber || '—' }} · {{ formatCurrency(v.amount) }}
        </p>
        <a
          v-if="v.imageUrl"
          :href="resolveUrl(v.imageUrl)"
          target="_blank"
          class="mt-3 block overflow-hidden rounded-lg border border-oscuro-700"
        >
          <img
            :src="resolveUrl(v.imageUrl)"
            alt="voucher"
            class="h-40 w-full object-cover"
          />
        </a>

        <div v-if="v.status === 'PENDING'" class="mt-3 space-y-2">
          <button
            class="w-full rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-oscuro-900 hover:bg-green-400"
            @click="validate(v)"
          >
            Validar
          </button>
          <div class="flex gap-2">
            <input
              v-model="reasons[v.id]"
              placeholder="Motivo"
              class="flex-1 rounded-lg border border-oscuro-700 bg-oscuro-900/60 px-3 py-2 text-sm text-white"
            />
            <button
              class="rounded-lg bg-red-500/15 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/25"
              @click="reject(v)"
            >
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Voucher, VoucherStatus } from '~/types/domain'
import { formatCurrency } from '~/utils/format'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const api = useApi()
const config = useRuntimeConfig()
const vouchers = ref<Voucher[]>([])
const reasons = reactive<Record<number, string>>({})
const filter = ref<VoucherStatus | 'ALL'>('PENDING')

const filters: { label: string; value: VoucherStatus | 'ALL' }[] = [
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Validados', value: 'VALIDATED' },
  { label: 'Rechazados', value: 'REJECTED' },
  { label: 'Todos', value: 'ALL' },
]

const filtered = computed(() =>
  filter.value === 'ALL'
    ? vouchers.value
    : vouchers.value.filter((v) => v.status === filter.value),
)

function resolveUrl(path: string) {
  if (path.startsWith('http')) return path
  return config.public.apiBase.replace(/\/api\/v1$/, '') + path
}

async function load() {
  try {
    vouchers.value = await api.get<Voucher[]>('/vouchers')
  } catch {
    vouchers.value = []
  }
}

async function validate(v: Voucher) {
  await api.patch(`/vouchers/${v.id}/validate`, {})
  await load()
}

async function reject(v: Voucher) {
  const reason = reasons[v.id]?.trim()
  if (!reason) return
  await api.patch(`/vouchers/${v.id}/reject`, { reason })
  await load()
}

onMounted(load)
</script>
