<script setup lang="ts">
import { computed } from 'vue'
import type { Bracket, Team } from '@/types'

const props = defineProps<{
  bracket: Bracket
  teamLookup: Map<number, Team>
}>()

const t1 = computed(() => props.bracket.team_1)
const t2 = computed(() => props.bracket.team_2)

const isWinner1 = computed(() => props.bracket.is_completed && props.bracket.winner_id === t1.value?.id)
const isWinner2 = computed(() => props.bracket.is_completed && props.bracket.winner_id === t2.value?.id)

const playedMatches = computed(() => props.bracket.matches.filter((m) => m.played))

const aggregateGoals = computed(() => {
  let g1 = 0, g2 = 0
  for (const m of playedMatches.value) {
    if (m.home_team_id === t1.value?.id) {
      g1 += m.goals_home ?? 0; g2 += m.goals_away ?? 0
    } else {
      g1 += m.goals_away ?? 0; g2 += m.goals_home ?? 0
    }
  }
  return { g1, g2 }
})

const hasStarted = computed(() => playedMatches.value.length > 0)
const label = computed(() => props.bracket.matchup_number ? `Serie ${props.bracket.matchup_number}` : 'Ida y vuelta')
const seriesLabel = computed(() =>
  props.bracket.series_wins_required
    ? `Ida y vuelta · Al mejor de ${props.bracket.series_wins_required}`
    : 'Ida y vuelta',
)

function teamInitials(t: Team | undefined) {
  return (t?.short_name ?? t?.name ?? '?').slice(0, 2).toUpperCase()
}
function resolve(id: number) { return props.teamLookup.get(id) }
function t1IsHome(homeId: number) { return homeId === t1.value?.id }
function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <div class="bracket-card">
    <div class="bc-header">
      <span class="bc-label">{{ label }}</span>
      <span class="bc-sublabel">{{ seriesLabel }}</span>
      <span :class="['bc-badge', bracket.is_completed ? 'bc-badge--done' : 'bc-badge--pending']">
        {{ bracket.is_completed ? 'Finalizado' : 'Pendiente' }}
      </span>
    </div>

    <div class="matchup">
      <!-- Equipo 1 -->
      <div :class="['mu-team', isWinner1 && 'mu-team--winner']">
        <img v-if="t1?.logo" :src="t1.logo" :alt="t1.name" class="mu-logo"
             @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ teamInitials(t1) }}</div>
        <div class="mu-info">
          <span class="mu-name">{{ t1?.name ?? 'Por definir' }}</span>
        </div>
      </div>

      <!-- Marcador agregado / vs -->
      <div class="mu-score">
        <template v-if="hasStarted || bracket.is_completed">
          <div class="mu-score-main">{{ aggregateGoals.g1 }} – {{ aggregateGoals.g2 }}</div>
          <div class="mu-score-subtitle">goles</div>
        </template>
        <template v-else>
          <div class="mu-score-vs">vs</div>
          <div v-if="bracket.series_wins_required" class="mu-score-subtitle">
            Al mejor de {{ bracket.series_wins_required }}
          </div>
        </template>
      </div>

      <!-- Equipo 2 -->
      <div :class="['mu-team mu-team--right', isWinner2 && 'mu-team--winner']">
        <div class="mu-info mu-info--right">
          <span class="mu-name">{{ t2?.name ?? 'Por definir' }}</span>
        </div>
        <img v-if="t2?.logo" :src="t2.logo" :alt="t2.name" class="mu-logo"
             @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ teamInitials(t2) }}</div>
      </div>
    </div>

    <!-- Detalle de partidos -->
    <div v-if="bracket.matches.length" class="bc-matches">
      <div v-for="(m, i) in bracket.matches" :key="i" class="bc-match-row">
        <span v-if="m.game" class="bm-game">G{{ m.game }}</span>
        <span :class="['bm-venue', t1IsHome(m.home_team_id) ? 'bm-venue--local' : 'bm-venue--visitor']">
          {{ t1IsHome(m.home_team_id) ? 'Local' : 'Visita' }}
        </span>
        <span class="bm-date">{{ m.date ?? '—' }}</span>
        <span class="bm-teams">
          {{ resolve(m.home_team_id)?.short_name ?? resolve(m.home_team_id)?.name ?? '?' }}
          vs
          {{ resolve(m.away_team_id)?.short_name ?? resolve(m.away_team_id)?.name ?? '?' }}
        </span>
        <template v-if="m.played">
          <span class="bm-result">{{ m.goals_home }} – {{ m.goals_away }}</span>
          <span v-if="m.has_shootouts" class="bm-pen">({{ m.shootouts_home }}–{{ m.shootouts_away }} pen)</span>
        </template>
        <span v-else class="bm-pending">A jugarse</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './bracket-shared.css';
</style>
