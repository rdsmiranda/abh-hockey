<script setup lang="ts">
import { computed } from 'vue'
import type { PlayoffBracket, MatchCardData } from '@/types'
import MatchCard from '@/components/ui/MatchCard.vue'

const props = defineProps<{ bracket: PlayoffBracket }>()

const matchCardData = computed<MatchCardData | null>(() => {
  const matches = props.bracket.matches
  if (!matches.length) return null
  const m = matches.find((m) => !m.played) ?? matches[matches.length - 1]!
  return {
    home_team_id:   Number(m.home_team_id),
    away_team_id:   Number(m.away_team_id),
    date:           m.date,
    time:           m.time,
    pitch:          m.pitch,
    played:         m.played,
    goals_home:     m.goals_home,
    goals_away:     m.goals_away,
    has_shootouts:  m.has_shootouts,
    shootouts_home: m.shootouts_home,
    shootouts_away: m.shootouts_away,
  }
})

const winnerId = computed(() =>
  props.bracket.is_completed && props.bracket.winner_id
    ? Number(props.bracket.winner_id)
    : null,
)
</script>

<template>
  <MatchCard
    v-if="matchCardData"
    :match="matchCardData"
    :winner-id="winnerId"
  />
</template>