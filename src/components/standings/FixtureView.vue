<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import StateBanner from '@/components/ui/StateBanner.vue'

const props = defineProps<{
  zoneId: number
  categoryId: number
}>()

const store = useChampionshipStore()

// Carga lazy: solo cuando esta vista se monta
onMounted(() => store.loadFixture())

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

// Filtra los partidos de esta zona+categoría.
// Usa Number() en ambos lados para ser robusto a IDs serializados como string por Laravel.
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

function teamName(id: number | string) {
  return store.team(Number(id))?.name ?? '?'
}
function teamShort(id: number | string) {
  const t = store.team(Number(id))
  return t?.short_name ?? t?.name ?? '?'
}
function teamLogo(id: number | string) {
  return store.team(Number(id))?.logo ?? null
}

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return dt.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}
</script>

<template>
  <!-- Cargando fixture -->
  <StateBanner
    v-if="store.fixtureStatus === 'loading' || store.fixtureStatus === 'idle'"
    state="loading"
    message="Cargando fixture…"
  />

  <!-- Error al cargar -->
  <StateBanner
    v-else-if="store.fixtureStatus === 'error'"
    state="error"
    message="No se pudo cargar el fixture."
  />

  <!-- Sin partidos para esta combinación -->
  <div v-else-if="filteredRounds.length === 0" class="state-placeholder">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
    <p>No hay partidos en el fixture para esta categoría.</p>
  </div>

  <!-- Fixture por fecha -->
  <template v-else>
    <div v-for="round in filteredRounds" :key="round.id" class="round-block">
      <!-- Encabezado de fecha -->
      <div class="round-header">
        <h3 class="round-label">{{ round.label }}</h3>
        <!-- <span class="round-dates">
          {{ formatDate(round.date_from) }}
          <template v-if="round.date_from !== round.date_to">
            — {{ formatDate(round.date_to) }}
          </template>
        </span> -->
      </div>

      <!-- Partidos -->
      <div class="matches-list">
        <div
          v-for="match in round.matches"
          :key="match.id"
          class="fixture-card"
        >
          <!-- Equipo local -->
          <div class="fc-team fc-team--home">
            <img v-if="teamLogo(match.home_team_id)"
                 :src="teamLogo(match.home_team_id)!"
                 :alt="teamName(match.home_team_id)"
                 class="fc-logo"
                 @error="hideOnError" />
            <div v-else class="fc-logo-ph">
              {{ teamShort(match.home_team_id).slice(0, 2).toUpperCase() }}
            </div>
            <span class="fc-name">{{ teamName(match.home_team_id) }}</span>
            <span class="fc-short">{{ teamShort(match.home_team_id) }}</span>
          </div>

          <!-- Resultado o horario -->
          <div class="fc-center">
            <template v-if="match.played">
              <div class="fc-score">
                {{ match.goals_home }} – {{ match.goals_away }}
              </div>
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
            <span class="fc-name">{{ teamName(match.away_team_id) }}</span>
            <span class="fc-short">{{ teamShort(match.away_team_id) }}</span>
            <img v-if="teamLogo(match.away_team_id)"
                 :src="teamLogo(match.away_team_id)!"
                 :alt="teamName(match.away_team_id)"
                 class="fc-logo"
                 @error="hideOnError" />
            <div v-else class="fc-logo-ph">
              {{ teamShort(match.away_team_id).slice(0, 2).toUpperCase() }}
            </div>
          </div>

          <!-- Fecha y hora del partido -->
          <div v-if="match.date || match.time" class="fc-meta">
            <span v-if="match.date" class="fc-meta-date">{{ formatDate(match.date) }}</span>
            <span v-if="match.time" class="fc-meta-time">{{ match.time }}</span>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<style scoped>
/* Round header */
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
.round-dates { font-size: .72rem; color: #94a3b8; white-space: nowrap; }

/* Fixture card */
.matches-list { display: flex; flex-direction: column; gap: .4rem; }

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

/* Fecha/hora por partido */
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

/* Centro */
.fc-center { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; min-width: 64px; }
.fc-score  {
  font-family: var(--font-barlow-condensed); font-size: 1.3rem; font-weight: 800;
  color: var(--abh-dark); line-height: 1;
}
.fc-pen    { font-size: .65rem; color: #94a3b8; }
.fc-time   { font-family: var(--font-barlow-condensed); font-size: 1rem; font-weight: 700; color: var(--abh-dark); }
.fc-pitch  { font-size: .65rem; color: #94a3b8; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }

/* Placeholder */
.state-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: .75rem; padding: 3rem 1rem; color: #94a3b8; text-align: center;
}
.state-placeholder svg { width: 36px; height: 36px; opacity: .4; }
.state-placeholder p { font-size: .875rem; margin: 0; }

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