<script setup lang="ts">
import AppHeader from '@/components/layout/AppHeader.vue'
import AppNav    from '@/components/layout/AppNav.vue'
</script>

<template>
  <div class="min-h-svh flex flex-col">
    <AppHeader />
    <AppNav />
    <main class="flex-1 max-w-[1100px] w-full mx-auto px-4 py-6 pb-12">
      <RouterView />
    </main>
  </div>
</template>
