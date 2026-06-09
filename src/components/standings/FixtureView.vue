<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import type { MatchCardData } from '@/types'
import StateBanner from '@/components/ui/StateBanner.vue'
import MatchCard from '@/components/ui/MatchCard.vue'

const props = defineProps<{
  zoneId: number
  categoryId: number
}>()

const store = useChampionshipStore()

onMounted(() => store.loadFixture())

const filteredRounds = computed(() => {
  if (!store.fixture) return []
  const zId = Number(props.zoneId)
  const cId = Number(props.categoryId)
  return store.fixture.rounds
    .map((round) => ({
      ...round,
      matches: round.matches.filter(
        (m) => Number(m.zone_id) === zId && Number(m.category_id) === cId,
      ),
    }))
    .filter((round) => round.matches.length > 0)
})

// Mapeo FixtureMatch → MatchCardData
function toMatchCardData(m: typeof filteredRounds.value[0]['matches'][0]): MatchCardData {
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
}
</script>

<template>
  <StateBanner
    v-if="store.fixtureStatus === 'loading' || store.fixtureStatus === 'idle'"
    state="loading"
    message="Cargando fixture…"
  />

  <StateBanner
    v-else-if="store.fixtureStatus === 'error'"
    state="error"
    message="No se pudo cargar el fixture."
  />

  <div v-else-if="filteredRounds.length === 0" class="state-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
    <p>No hay partidos en el fixture para esta categoría.</p>
  </div>

  <template v-else>
    <div v-for="round in filteredRounds" :key="round.id" class="round-block">
      <div class="round-header">
        <h3 class="round-label">{{ round.label }}</h3>
      </div>
      <div class="matches-list">
        <MatchCard
          v-for="match in round.matches"
          :key="match.id"
          :match="toMatchCardData(match)"
        />
      </div>
    </div>
  </template>
</template>

<style scoped>
.round-block { margin-bottom: 1.5rem; }
.round-header {
  display: flex; align-items: center; gap: .75rem;
  margin-bottom: .65rem;
}
.round-header::after { content: ''; flex: 1; height: 1px; background: var(--abh-border); }
.round-label {
  font-family: var(--font-barlow-condensed); font-size: .9rem; font-weight: 700;
  letter-spacing: .08em; text-transform: uppercase; color: var(--abh-blue); white-space: nowrap;
}

.matches-list { display: flex; flex-direction: column; gap: .4rem; }

.state-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: .75rem; padding: 3rem 1rem; color: #94a3b8; text-align: center;
}
.state-placeholder svg { width: 36px; height: 36px; opacity: .4; }
.state-placeholder p { font-size: .875rem; margin: 0; }
</style>