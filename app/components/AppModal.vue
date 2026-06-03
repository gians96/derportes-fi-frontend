<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @keydown.esc="close"
      >
        <div
          class="absolute inset-0 bg-black/60 backdrop-blur-sm"
          @click="close"
        />
        <div
          class="relative z-10 w-full max-w-lg rounded-2xl border border-oscuro-700 bg-oscuro-850 shadow-2xl"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="flex items-center justify-between border-b border-oscuro-700 px-5 py-4"
          >
            <h2 class="text-base font-bold text-white">{{ title }}</h2>
            <button
              class="rounded-lg p-1 text-oscuro-400 hover:bg-oscuro-700 hover:text-white"
              @click="close"
            >
              <X class="h-5 w-5" />
            </button>
          </div>
          <div class="max-h-[70vh] overflow-y-auto px-5 py-4">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  modelValue: boolean
  title: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.15s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
