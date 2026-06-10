<script setup lang="ts">
import type { PlayoffBracket } from '@/types'
import StandingsTable from '@/components/standings/StandingsTable.vue'
import MatchCard from '@/components/ui/MatchCard.vue'

defineProps<{ bracket: PlayoffBracket }>()

function matchWinnerId(m: PlayoffBracket['matches'][number]): number | null {
  if (!m.played) return null

  if (m.has_shootouts) {
    const sh = m.shootouts_home ?? 0
    const sa = m.shootouts_away ?? 0
    if (sh > sa) return Number(m.home_team_id)
    if (sa > sh) return Number(m.away_team_id)
    return null
  }

  const gh = m.goals_home ?? 0
  const ga = m.goals_away ?? 0
  if (gh > ga) return Number(m.home_team_id)
  if (ga > gh) return Number(m.away_team_id)
  return null
}
</script>

<template>
  <div>
    
    <StandingsTable
    v-if="bracket.group_standings?.length"
    :standings="bracket.group_standings"
    :show-recent-form="false"
    />

    <div v-if="bracket.matches.length" class="group-matches">
      <MatchCard
        v-for="(m, i) in bracket.matches"
        :key="i"
        :match="m"
        :winner-id="matchWinnerId(m)"
      />
    </div>
  </div>
</template>

<style scoped>
@import './bracket-shared.css';

.group-matches {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  margin-top: .4rem;
}
</style>