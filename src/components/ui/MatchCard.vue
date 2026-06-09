<script setup lang="ts">
import { computed } from 'vue'
import { useTeamResolver } from '@/composables/useTeam'
import type { MatchCardData } from '@/types'

const props = defineProps<{
  match: MatchCardData
  winnerId?: number | null
}>()

const { resolve, initials } = useTeamResolver()

const homeId = computed(() => Number(props.match.home_team_id))
const awayId = computed(() => Number(props.match.away_team_id))

const isWinnerHome = computed(() =>
  props.winnerId != null && props.winnerId === homeId.value,
)
const isWinnerAway = computed(() =>
  props.winnerId != null && props.winnerId === awayId.value,
)

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return dt.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <div class="fixture-card">

    <!-- Equipo local -->
    <div class="fc-team fc-team--home">
      <img
        v-if="resolve(homeId)?.logo"
        :src="resolve(homeId)!.logo!"
        :alt="resolve(homeId)!.name"
        class="fc-logo"
        @error="hideOnError"
      />
      <div v-else class="fc-logo-ph">{{ initials(homeId) }}</div>
      <span :class="['fc-name', isWinnerHome && 'fc-name--winner']">
        {{ resolve(homeId)?.name ?? 'Por definir' }}
      </span>
      <span :class="['fc-short', isWinnerHome && 'fc-name--winner']">
        {{ resolve(homeId)?.short_name ?? initials(homeId) }}
      </span>
    </div>

    <!-- Centro: resultado o horario/cancha -->
    <div class="fc-center">
      <template v-if="match.played">
        <div class="fc-score">{{ match.goals_home }} – {{ match.goals_away }}</div>
        <div v-if="match.has_shootouts" class="fc-pen">
          ({{ match.shootouts_home }}–{{ match.shootouts_away }} shootouts)
        </div>
      </template>
      <template v-else>
        <div class="fc-time">{{ match.time ?? '—' }}</div>
        <div v-if="match.pitch" class="fc-pitch">{{ match.pitch }}</div>
      </template>
    </div>

    <!-- Equipo visitante -->
    <div class="fc-team fc-team--away">
      <span :class="['fc-name', isWinnerAway && 'fc-name--winner']">
        {{ resolve(awayId)?.name ?? 'Por definir' }}
      </span>
      <span :class="['fc-short', isWinnerAway && 'fc-name--winner']">
        {{ resolve(awayId)?.short_name ?? initials(awayId) }}
      </span>
      <img
        v-if="resolve(awayId)?.logo"
        :src="resolve(awayId)!.logo!"
        :alt="resolve(awayId)!.name"
        class="fc-logo"
        @error="hideOnError"
      />
      <div v-else class="fc-logo-ph">{{ initials(awayId) }}</div>
    </div>

    <!-- Fecha y hora -->
    <div v-if="match.date || match.time" class="fc-meta">
      <span v-if="match.date" class="fc-meta-date">{{ formatDate(match.date) }}</span>
      <span v-if="match.time" class="fc-meta-time">{{ match.time }}</span>
    </div>

  </div>
</template>

<style scoped>
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

.fc-team { display: flex; align-items: center; gap: .45rem; min-width: 0; }
.fc-team--away { justify-content: flex-end; }

.fc-logo { width: 28px; height: 28px; object-fit: contain; flex-shrink: 0; }
.fc-logo-ph {
  width: 28px; height: 28px; background: var(--abh-border); border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-barlow-condensed); font-size: .6rem; font-weight: 800; color: #94a3b8;
}
.fc-name       { font-size: .85rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.fc-short      { font-size: .75rem; font-weight: 600; display: none; }
.fc-name--winner { color: var(--abh-blue); }

.fc-center { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 64px; }
.fc-score {
  font-family: var(--font-barlow-condensed); font-size: 1.3rem; font-weight: 800;
  color: var(--abh-dark); line-height: 1;
}
.fc-pen   { font-size: .65rem; color: #94a3b8; }
.fc-time  { font-family: var(--font-barlow-condensed); font-size: 1rem; font-weight: 700; color: var(--abh-dark); }
.fc-pitch { font-size: .65rem; color: #94a3b8; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }

.fc-meta {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 1px; padding-left: .5rem;
  border-left: 1px solid var(--abh-border);
  min-width: 64px;
}
.fc-meta-date { font-size: .72rem; color: #94a3b8; white-space: nowrap; }
.fc-meta-time {
  font-family: var(--font-barlow-condensed); font-size: .8rem;
  font-weight: 700; color: #64748b; white-space: nowrap;
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
    flex-direction: row; justify-content: center; align-items: center;
    gap: .4rem; padding-left: 0;
    border-left: none; border-top: 1px solid var(--abh-border);
    padding-top: .35rem; margin-top: .1rem; min-width: unset;
  }
}
</style>