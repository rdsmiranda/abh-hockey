<script setup lang="ts">
function onLogoError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <header class="bg-gradient-to-br from-[--abh-dark] to-[#243352] border-b-[3px] border-[--abh-gold] px-6">
    <div class="max-w-[1100px] mx-auto flex items-center gap-4 py-3">
      <img
        src="/assets/logo-abh.png"
        alt="Logo ABH"
        class="w-[52px] h-auto shrink-0"
        @error="onLogoError"
      />
      <div>
        <h1 class="font-[--font-barlow-condensed] text-[1.4rem] font-black text-white tracking-[0.03em] uppercase leading-tight">
          Asociación Bahiense de Hockey
        </h1>
        <p class="text-[0.72rem] text-[--abh-gold] font-semibold tracking-[0.12em] uppercase mt-px">
          Comisión de Árbitros
        </p>
      </div>
    </div>
  </header>
</template>
