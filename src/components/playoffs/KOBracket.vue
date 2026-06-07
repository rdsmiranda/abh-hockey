<script setup lang="ts">
import { computed } from 'vue'
import type { PlayoffBracket } from '@/types'
import { useTeamResolver } from '@/composables/useTeam'

const props = defineProps<{ bracket: PlayoffBracket }>()

const { resolve, initials } = useTeamResolver()

// Coerce a number para evitar fallos si Laravel serializa IDs como strings
const t1 = computed(() => Number(props.bracket.team_1_id))
const t2 = computed(() => Number(props.bracket.team_2_id))

// Determina quién jugó de local en el primer partido
const homeId = computed<number>(() => {
  const first = props.bracket.matches[0]
  if (!first) return t1.value
  return Number(first.home_team_id) === t2.value ? t2.value : t1.value
})
const awayId = computed<number>(() =>
  homeId.value === t1.value ? t2.value : t1.value,
)

const isWinnerHome = computed(() =>
  props.bracket.is_completed && Number(props.bracket.winner_id) === homeId.value,
)
const isWinnerAway = computed(() =>
  props.bracket.is_completed && Number(props.bracket.winner_id) === awayId.value,
)

const scoreDisplay = computed<{ home: number; away: number; pen?: string } | null>(() => {
  const played = props.bracket.matches.filter((m) => m.played)
  const m = played.at(-1)
  if (!m) return null
  const isLastHome = Number(m.home_team_id) === homeId.value
  const gh = isLastHome ? m.goals_home! : m.goals_away!
  const ga = isLastHome ? m.goals_away! : m.goals_home!
  const pen = m.has_shootouts
    ? `Shootouts ${isLastHome ? m.shootouts_home : m.shootouts_away} – ${isLastHome ? m.shootouts_away : m.shootouts_home}`
    : undefined
  return { home: gh, away: ga, pen }
})

const label = computed(() =>
  props.bracket.matchup_number ? `Llave ${props.bracket.matchup_number}` : 'Enfrentamiento',
)

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
        <img v-if="resolve(homeId)?.logo"
             :src="resolve(homeId)!.logo!"
             :alt="resolve(homeId)!.name"
             class="mu-logo" @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ initials(homeId) }}</div>
        <div class="mu-info">
          <span class="mu-name">{{ resolve(homeId)?.name ?? 'Por definir' }}</span>
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
          <span class="mu-name">{{ resolve(awayId)?.name ?? 'Por definir' }}</span>
        </div>
        <img v-if="resolve(awayId)?.logo"
             :src="resolve(awayId)!.logo!"
             :alt="resolve(awayId)!.name"
             class="mu-logo" @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ initials(awayId) }}</div>
      </div>
    </div>

    <!-- Detalle de partidos -->
    <div v-if="bracket.matches.length" class="bc-matches">
      <div v-for="(m, i) in bracket.matches" :key="i" class="bc-match-row">
        <span class="bm-date">{{ m.date ?? '—' }}</span>
        <span class="bm-teams">
          {{ resolve(Number(m.home_team_id))?.short_name ?? '?' }}
          vs
          {{ resolve(Number(m.away_team_id))?.short_name ?? '?' }}
        </span>
        <template v-if="m.played">
          <span class="bm-result">{{ m.goals_home }} – {{ m.goals_away }}</span>
          <span v-if="m.has_shootouts" class="bm-pen">
            ({{ m.shootouts_home }}–{{ m.shootouts_away }} shootouts)
          </span>
        </template>
        <span v-else class="bm-pending">A jugarse</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import './bracket-shared.css';
</style>
