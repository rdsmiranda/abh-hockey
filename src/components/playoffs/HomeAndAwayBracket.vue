<script setup lang="ts">
import { computed } from 'vue'
import type { PlayoffBracket } from '@/types'
import { useTeamResolver } from '@/composables/useTeam'

const props = defineProps<{ bracket: PlayoffBracket }>()

const { resolve, initials } = useTeamResolver()

const t1 = computed(() => Number(props.bracket.team_1_id))
const t2 = computed(() => Number(props.bracket.team_2_id))

const isWinner1 = computed(() =>
  props.bracket.is_completed && Number(props.bracket.winner_id) === t1.value,
)
const isWinner2 = computed(() =>
  props.bracket.is_completed && Number(props.bracket.winner_id) === t2.value,
)

const playedMatches = computed(() => props.bracket.matches.filter((m) => m.played))

const aggregateGoals = computed(() => {
  let g1 = 0, g2 = 0
  for (const m of playedMatches.value) {
    if (Number(m.home_team_id) === t1.value) {
      g1 += m.goals_home ?? 0; g2 += m.goals_away ?? 0
    } else {
      g1 += m.goals_away ?? 0; g2 += m.goals_home ?? 0
    }
  }
  return { g1, g2 }
})

const hasStarted  = computed(() => playedMatches.value.length > 0)
const label       = computed(() =>
  props.bracket.matchup_number ? `Serie ${props.bracket.matchup_number}` : 'Ida y vuelta',
)
const seriesLabel = computed(() =>
  props.bracket.series_wins_required
    ? `Ida y vuelta · Al mejor de ${props.bracket.series_wins_required}`
    : 'Ida y vuelta',
)

function t1IsHome(homeId: number | string) { return Number(homeId) === t1.value }
function hideOnError(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }
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
      <div :class="['mu-team', isWinner1 && 'mu-team--winner']">
        <img v-if="resolve(t1)?.logo" :src="resolve(t1)!.logo!" :alt="resolve(t1)!.name"
             class="mu-logo" @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ initials(t1) }}</div>
        <div class="mu-info">
          <span class="mu-name">{{ resolve(t1)?.name ?? 'Por definir' }}</span>
        </div>
      </div>

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

      <div :class="['mu-team mu-team--right', isWinner2 && 'mu-team--winner']">
        <div class="mu-info mu-info--right">
          <span class="mu-name">{{ resolve(t2)?.name ?? 'Por definir' }}</span>
        </div>
        <img v-if="resolve(t2)?.logo" :src="resolve(t2)!.logo!" :alt="resolve(t2)!.name"
             class="mu-logo" @error="hideOnError" />
        <div v-else class="mu-logo-ph">{{ initials(t2) }}</div>
      </div>
    </div>

    <div v-if="bracket.matches.length" class="bc-matches">
      <div v-for="(m, i) in bracket.matches" :key="i" class="bc-match-row">
        <span v-if="m.game" class="bm-game">G{{ m.game }}</span>
        <span :class="['bm-venue', t1IsHome(m.home_team_id) ? 'bm-venue--local' : 'bm-venue--visitor']">
          {{ t1IsHome(m.home_team_id) ? 'Local' : 'Visita' }}
        </span>
        <span class="bm-date">{{ m.date ?? '—' }}</span>
        <span class="bm-teams">
          {{ resolve(Number(m.home_team_id))?.short_name ?? '?' }}
          vs
          {{ resolve(Number(m.away_team_id))?.short_name ?? '?' }}
        </span>
        <template v-if="m.played">
          <span class="bm-result">{{ m.goals_home }} – {{ m.goals_away }}</span>
          <span v-if="m.has_shootouts" class="bm-pen">
            ({{ m.shootouts_home }}–{{ m.shootouts_away }} pen)
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
