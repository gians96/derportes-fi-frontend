<template>
  <div class="text-sm text-oscuro-400">Redirigiendo a equipos de pago...</div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

await navigateTo({
  path: '/admin/inscripciones',
  query: { payment: 'PAID' },
}, { replace: true })
</script>
