<template>
  <AppModal :model-value="modelValue" :title="title" @update:model-value="onCancel">
    <p class="text-sm text-oscuro-200">{{ message }}</p>
    <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>
    <div class="mt-6 flex justify-end gap-3">
      <button
        type="button"
        class="rounded-lg px-4 py-2 text-sm font-semibold text-oscuro-200 hover:bg-oscuro-700"
        :disabled="loading"
        @click="onCancel"
      >
        {{ cancelText }}
      </button>
      <button
        type="button"
        class="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-60"
        :disabled="loading"
        @click="emit('confirm')"
      >
        {{ loading ? 'Procesando…' : confirmText }}
      </button>
    </div>
  </AppModal>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message?: string
    confirmText?: string
    cancelText?: string
    loading?: boolean
    error?: string
  }>(),
  {
    title: 'Confirmar acción',
    message: '¿Estás seguro? Esta acción no se puede deshacer.',
    confirmText: 'Eliminar',
    cancelText: 'Cancelar',
    loading: false,
    error: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

function onCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>
