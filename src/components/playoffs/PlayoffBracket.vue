<script setup lang="ts">
import type { Playoffs } from '@/types'
import KOBracket          from './KOBracket.vue'
import HomeAndAwayBracket from './HomeAndAwayBracket.vue'
import GroupBracket       from './GroupBracket.vue'

defineProps<{
  playoffs: Playoffs
}>()
</script>

<template>
  <div>
    <template v-for="stage in playoffs.stages" :key="stage.id">
      <div class="stage-header">
        <h3 class="stage-title">{{ stage.label }}</h3>
      </div>

      <template v-for="bracket in stage.brackets" :key="bracket.id">
        <GroupBracket
          v-if="bracket.format === 'triangular' || bracket.format === 'round_robin_4'"
          :bracket="bracket"
        />
        <HomeAndAwayBracket
          v-else-if="bracket.format === 'home_and_away'"
          :bracket="bracket"
        />
        <KOBracket
          v-else
          :bracket="bracket"
        />
      </template>
    </template>
  </div>
</template>

<style scoped>
.stage-header {
  display: flex; align-items: center; gap: .75rem;
  margin: 1.5rem 0 .65rem;
}
.stage-header::after { content: ''; flex: 1; height: 1px; background: var(--abh-border); }
.stage-title {
  font-family: var(--font-barlow-condensed); font-size: .9rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--abh-blue); white-space: nowrap;
}
</style>
