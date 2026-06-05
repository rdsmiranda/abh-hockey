<script setup lang="ts">
import { computed } from 'vue'
import type { CategoryPlayoff, Zone } from '@/types'
import type { Bracket } from '@/types'
import { useTeamLookup } from '@/composables/useTeamLookup'
import KOBracket           from './KOBracket.vue'
import HomeAndAwayBracket  from './HomeAndAwayBracket.vue'
import GroupBracket        from './GroupBracket.vue'

const props = defineProps<{
  playoff: CategoryPlayoff
  zone: Zone
}>()

// Construimos el lookup UNA vez para toda la vista de playoffs
const zoneRef   = computed(() => props.zone)
const teamLookup = useTeamLookup(zoneRef)
</script>

<template>
  <div class="playoff-wrap">
    <template v-for="stage in playoff.stages" :key="stage.label">
      <!-- Encabezado de fase -->
      <div class="stage-header">
        <h3 class="stage-title">{{ stage.label }}</h3>
      </div>

      <!-- Cada bracket delega al componente correcto según su formato -->
      <template v-for="(bracket, i) in stage.brackets" :key="i">
        <GroupBracket
          v-if="bracket.format === 'triangular' || bracket.format === 'round_robin_4'"
          :bracket="bracket"
          :team-lookup="teamLookup"
        />
        <HomeAndAwayBracket
          v-else-if="bracket.format === 'home_and_away'"
          :bracket="bracket"
          :team-lookup="teamLookup"
        />
        <KOBracket
          v-else
          :bracket="bracket"
          :team-lookup="teamLookup"
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
