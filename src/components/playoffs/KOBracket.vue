<script setup lang="ts">
import { computed } from 'vue'
import type { Bracket, Team } from '@/types'

const props = defineProps<{
  bracket: Bracket
  teamLookup: Map<number, Team>
}>()

// Determinar quién juega de local en el primer partido
// para mostrar equipos en orden canónico (local izq / visitante der)
const teamHome = computed<Team | undefined>(() => {
  const ref = props.bracket.matches[0]
  if (!ref) return props.bracket.team_1
  if (props.bracket.team_2 && ref.home_team_id === props.bracket.team_2.id)
    return props.bracket.team_2
  return props.bracket.team_1
})

const teamAway = computed<Team | undefined>(() =>
  teamHome.value?.id === props.bracket.team_1?.id
    ? props.bracket.team_2
    : props.bracket.team_1,
)

const isWinnerHome = computed(() =>
  props.bracket.is_completed &&
  !!props.bracket.winner_id &&
  props.bracket.winner_id === teamHome.value?.id,
)
const isWinnerAway = computed(() =>
  props.bracket.is_completed &&
  !!props.bracket.winner_id &&
  props.bracket.winner_id === teamAway.value?.id,
)

// Último partido jugado para el marcador principal
const lastPlayed = computed(() => {
  const played = props.bracket.matches.filter((m) => m.played)
  return played.at(-1) ?? null
})

const scoreDisplay = computed<{ home: number; away: number; pen?: string } | null>(() => {
  const m = lastPlayed.value
  if (!m) return null
  const isLastHome = m.home_team_id === teamHome.value?.id
  const gh = isLastHome ? m.goals_home! : m.goals_away!
  const ga = isLastHome ? m.goals_away! : m.goals_home!
  const pen =
    m.has_shootouts
      ? `Pen ${isLastHome ? m.shootouts_home : m.shootouts_away} – ${isLastHome ? m.shootouts_away : m.shootouts_home}`
      : undefined
  return { home: gh, away: ga, pen }
})

const label = computed(() =>
  props.bracket.matchup_number ? `Llave ${props.bracket.matchup_number}` : 'Enfrentamiento',
)

function teamName(t: Team | undefined) { return t?.name ?? 'Por definir' }
function teamInitials(t: Team | undefined) {
  return (t?.short_name ?? t?.name ?? '?').slice(0, 2).toUpperCase()
}
function resolve(id: number) { return props.teamLookup.get(id) }
function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <div class="bracket-card">
    <div class="bc-header">
      <span class="bc-label">{{ label }}</span>
      <span :class="['bc-badge', bracket.is_completed ? 'bc-badge--done' : 'bc-badge--pending']">
        {{ bracket.is_completed ? 'Finalizado' : 'Pendiente' }}
      </span>
    </div>

    <div class="matchup">
      <!-- Local -->
      <div :class="['mu-team', isWinnerHome && 'mu-team--winner']">
        <img v-if="teamHome?.logo" :src="teamHome.logo" :alt="teamHome.name" class="mu-logo"
             @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ teamInitials(teamHome) }}</div>
        <div class="mu-info">
          <span class="mu-name">{{ teamName(teamHome) }}</span>
        </div>
      </div>

      <!-- Marcador -->
      <div class="mu-score">
        <template v-if="scoreDisplay">
          <div class="mu-score-main">{{ scoreDisplay.home }} – {{ scoreDisplay.away }}</div>
          <div v-if="scoreDisplay.pen" class="mu-score-pen">{{ scoreDisplay.pen }}</div>
        </template>
        <div v-else class="mu-score-vs">vs</div>
      </div>

      <!-- Visitante -->
      <div :class="['mu-team mu-team--right', isWinnerAway && 'mu-team--winner']">
        <div class="mu-info mu-info--right">
          <span class="mu-name">{{ teamName(teamAway) }}</span>
        </div>
        <img v-if="teamAway?.logo" :src="teamAway.logo" :alt="teamAway.name" class="mu-logo"
             @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ teamInitials(teamAway) }}</div>
      </div>
    </div>

    <!-- Detalle de partidos -->
    <div v-if="bracket.matches.length" class="bc-matches">
      <div
        v-for="(m, i) in bracket.matches"
        :key="i"
        class="bc-match-row"
      >
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
