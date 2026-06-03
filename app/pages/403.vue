<template>
  <div class="flex min-h-[70vh] flex-col items-center justify-center text-center">
    <p class="text-6xl font-bold text-green-400 glow-text">403</p>
    <h1 class="mt-4 text-2xl font-bold text-white">Acceso no autorizado</h1>
    <p class="mt-2 text-oscuro-300">
      No tienes permisos para acceder a esta sección.
    </p>
    <NuxtLink
      to="/"
      class="mt-6 rounded-lg bg-green-500/10 px-5 py-2.5 font-semibold text-green-300 transition hover:bg-green-500/20"
    >
      Volver al inicio
    </NuxtLink>
  </div>
</template>
