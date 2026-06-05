<script setup lang="ts">
export type BannerState = 'idle' | 'loading' | 'error' | 'empty'

const props = withDefaults(
  defineProps<{
    state: BannerState
    message?: string
  }>(),
  { message: undefined },
)

const defaults: Record<BannerState, string> = {
  idle:    'Seleccioná un campeonato para ver las posiciones.',
  loading: 'Cargando…',
  error:   'No se pudo cargar la información. Intentá de nuevo.',
  empty:   'No hay datos para mostrar.',
}

const text = () => props.message ?? defaults[props.state]
</script>

<template>
  <div
    role="status"
    :aria-live="state === 'loading' ? 'polite' : 'off'"
    class="text-center py-10 text-sm text-slate-400"
  >
    <!-- Spinner para loading -->
    <svg
      v-if="state === 'loading'"
      class="inline-block w-5 h-5 mr-2 animate-spin text-[--abh-blue]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
    </svg>

    <!-- Ícono de error -->
    <svg
      v-else-if="state === 'error'"
      class="inline-block w-5 h-5 mr-2 text-red-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
    </svg>

    <span>{{ text() }}</span>
  </div>
</template>
