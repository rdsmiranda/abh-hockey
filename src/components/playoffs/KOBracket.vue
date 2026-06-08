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


const firstMatch = computed(() => props.bracket.matches[0] ?? null)

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return dt.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}
</script>

<template>
  <div :class="['fixture-card', isWinnerHome && 'fc--winner-home', isWinnerAway && 'fc--winner-away']">

    <!-- Equipo local -->
    <div class="fc-team fc-team--home">
      <img v-if="resolve(homeId)?.logo"
           :src="resolve(homeId)!.logo!"
           :alt="resolve(homeId)!.name"
           class="fc-logo" @error="hideOnError" />
      <div v-else class="fc-logo-ph">{{ initials(homeId) }}</div>
      <span :class="['fc-name', isWinnerHome && 'fc-name--winner']">
        {{ resolve(homeId)?.name ?? 'Por definir' }}
      </span>
      <span :class="['fc-short', isWinnerHome && 'fc-name--winner']">
        {{ resolve(homeId)?.short_name ?? initials(homeId) }}
      </span>
    </div>

    <!-- Centro: resultado o vs -->
    <div class="fc-center">
      <template v-if="scoreDisplay">
        <div class="fc-score">{{ scoreDisplay.home }} – {{ scoreDisplay.away }}</div>
        <div v-if="scoreDisplay.pen" class="fc-pen">{{ scoreDisplay.pen }}</div>
      </template>
      <div v-else class="fc-time">vs</div>
    </div>

    <!-- Equipo visitante -->
    <div class="fc-team fc-team--away">
      <span :class="['fc-name', isWinnerAway && 'fc-name--winner']">
        {{ resolve(awayId)?.name ?? 'Por definir' }}
      </span>
      <span :class="['fc-short', isWinnerAway && 'fc-name--winner']">
        {{ resolve(awayId)?.short_name ?? initials(awayId) }}
      </span>
      <img v-if="resolve(awayId)?.logo"
           :src="resolve(awayId)!.logo!"
           :alt="resolve(awayId)!.name"
           class="fc-logo" @error="hideOnError" />
      <div v-else class="fc-logo-ph">{{ initials(awayId) }}</div>
    </div>

    <!-- Fecha y hora -->
    <div v-if="firstMatch?.date || firstMatch?.time" class="fc-meta">
      <span v-if="firstMatch.date" class="fc-meta-date">{{ formatDate(firstMatch.date) }}</span>
      <span v-if="firstMatch.time" class="fc-meta-time">{{ firstMatch.time }}</span>
    </div>

  </div>
</template>

<style scoped>
/* Reutiliza el mismo diseño que FixtureView */
.fixture-card {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto;
  align-items: center;
  gap: .5rem;
  background: #fff;
  border: 1.5px solid var(--abh-border);
  border-radius: 8px;
  padding: .6rem .85rem;
  transition: border-color .15s;
}
.fixture-card:hover { border-color: #c1cfe4; }

/* Equipos */
.fc-team { display: flex; align-items: center; gap: .45rem; min-width: 0; }
.fc-team--away { justify-content: flex-end; }

.fc-logo    { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
.fc-logo-ph {
  width: 28px; height: 28px; background: var(--abh-border); border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-barlow-condensed); font-size: .6rem; font-weight: 800; color: #94a3b8;
}
.fc-name  { font-size: .85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fc-short { font-size: .75rem; font-weight: 600; display: none; }
.fc-name--winner { color: var(--abh-blue); }

/* Centro */
.fc-center { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 64px; }
.fc-score  {
  font-family: var(--font-barlow-condensed); font-size: 1.3rem; font-weight: 800;
  color: var(--abh-dark); line-height: 1;
}
.fc-pen  { font-size: .65rem; color: #94a3b8; }
.fc-time { font-family: var(--font-barlow-condensed); font-size: 1rem; font-weight: 700; color: #94a3b8; }

/* Fecha/hora */
.fc-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
  padding-left: .5rem;
  border-left: 1px solid var(--abh-border);
  min-width: 64px;
}
.fc-meta-date {
  font-size: .72rem;
  color: #94a3b8;
  white-space: nowrap;
}
.fc-meta-time {
  font-family: var(--font-barlow-condensed);
  font-size: .8rem;
  font-weight: 700;
  color: #64748b;
  white-space: nowrap;
}

@media (max-width: 500px) {
  .fc-name  { display: none; }
  .fc-short { display: block; }
  .fixture-card {
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: auto auto;
    padding: .5rem .6rem;
  }
  .fc-meta {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: .4rem;
    padding-left: 0;
    border-left: none;
    border-top: 1px solid var(--abh-border);
    padding-top: .35rem;
    margin-top: .1rem;
    min-width: unset;
  }
}
</style>