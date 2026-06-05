<script setup lang="ts">
import { computed } from 'vue'
import type { DesignationMatch } from '@/types'

const props = defineProps<{
  match: DesignationMatch
  /** Nombre del árbitro a resaltar (en minúsculas) o null */
  highlightName: string | null
}>()

const isU1Hi = computed(() =>
  !!props.highlightName &&
  !!props.match.umpire_1?.toLowerCase().includes(props.highlightName),
)
const isU2Hi = computed(() =>
  !!props.highlightName &&
  !!props.match.umpire_2?.toLowerCase().includes(props.highlightName),
)
const isHighlighted = computed(() => isU1Hi.value || isU2Hi.value)

const feeFormatted = computed<string | null>(() => {
  if (props.match.fee == null) return null
  return '$ ' + Number(props.match.fee).toLocaleString('es-AR', { maximumFractionDigits: 0 })
})

function initials(team: DesignationMatch['home_team']): string {
  return (team?.short_name ?? team?.name ?? '?').slice(0, 3).toUpperCase()
}
function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <article
    :class="[
      'match-card',
      isHighlighted ? 'match-card--hi' : 'match-card--default',
    ]"
    :aria-label="`${match.home_team?.name ?? '?'} vs ${match.away_team?.name ?? '?'}`"
  >
    <!-- ── Top bar ───────────────────────────────────────── -->
    <div :class="['card-top', isHighlighted && 'card-top--hi']">
      <span class="badge-time">{{ match.time ?? '—' }}</span>
      <span class="badge-cat">{{ match.category ?? '—' }}</span>
      <span v-if="match.round" class="badge-round">{{ match.round }}</span>
      <span class="spacer" />
      <span v-if="feeFormatted" class="badge-fee">{{ feeFormatted }}</span>
      <span v-else class="badge-fee badge-fee--muted">Sin importe</span>
    </div>

    <!-- ── Teams ─────────────────────────────────────────── -->
    <div class="teams-block">
      <!-- Home -->
      <div class="team-side">
        <img
          v-if="match.home_team?.logo"
          :src="match.home_team.logo"
          :alt="match.home_team.name"
          class="mc-logo"
          @error="hideOnError"
        />
        <div v-else class="mc-logo-ph">{{ initials(match.home_team) }}</div>
        <div class="mc-info">
          <div class="mc-name">{{ match.home_team?.name ?? 'A confirmar' }}</div>
          <div v-if="match.home_team?.short_name" class="mc-short">{{ match.home_team.short_name }}</div>
        </div>
      </div>

      <span class="vs-sep" aria-label="versus">vs</span>

      <!-- Away -->
      <div class="team-side team-side--away">
        <img
          v-if="match.away_team?.logo"
          :src="match.away_team.logo"
          :alt="match.away_team.name"
          class="mc-logo"
          @error="hideOnError"
        />
        <div v-else class="mc-logo-ph">{{ initials(match.away_team) }}</div>
        <div class="mc-info mc-info--right">
          <div class="mc-name">{{ match.away_team?.name ?? 'A confirmar' }}</div>
          <div v-if="match.away_team?.short_name" class="mc-short">{{ match.away_team.short_name }}</div>
        </div>
      </div>
    </div>

    <!-- ── Bottom bar ────────────────────────────────────── -->
    <div :class="['card-bottom', isHighlighted && 'card-bottom--hi']">
      <!-- Cancha -->
      <div class="cb-item">
        <svg class="cb-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"/>
          <circle cx="8" cy="6" r="1.5"/>
        </svg>
        <span class="cb-text">{{ match.pitch ?? '—' }}</span>
      </div>

      <!-- Árbitros -->
      <div class="cb-umpires">
        <div class="cb-item">
          <svg class="cb-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="8" cy="5" r="2.8"/>
            <path d="M2 14c0-2.8 2.5-4.5 6-4.5s6 1.7 6 4.5"/>
          </svg>
          <span :class="['cb-text', !match.umpire_1 && 'cb-text--muted', isU1Hi && 'cb-text--hi']">
            {{ match.umpire_1 ?? 'A designar' }}
          </span>
        </div>
        <span class="cb-sep" aria-hidden="true" />
        <div class="cb-item">
          <svg class="cb-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="8" cy="5" r="2.8"/>
            <path d="M2 14c0-2.8 2.5-4.5 6-4.5s6 1.7 6 4.5"/>
          </svg>
          <span :class="['cb-text', !match.umpire_2 && 'cb-text--muted', isU2Hi && 'cb-text--hi']">
            {{ match.umpire_2 ?? 'A designar' }}
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* Card */
.match-card {
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid var(--abh-border);
  background: #fff;
  transition: border-color .15s, box-shadow .15s;
  margin-bottom: .75rem;
}
.match-card--default:hover { border-color: #c1cfe4; box-shadow: 0 3px 8px rgba(26,35,51,.1); }
.match-card--hi            { border-color: var(--abh-blue); background: #eef2f8; }
.match-card--hi:hover      { box-shadow: 0 3px 8px rgba(78,109,158,.18); }

/* Top */
.card-top {
  display: flex; align-items: center; gap: .5rem;
  padding: .5rem .85rem;
  border-bottom: 1px solid var(--abh-border);
  flex-wrap: wrap;
}
.card-top--hi { border-bottom-color: #c1cfe4; }
.badge-time  { font-family: var(--font-barlow-condensed); font-size: .82rem; font-weight: 800; background: var(--abh-dark); color: #fff; padding: 2px 8px; border-radius: 5px; }
.badge-cat   { font-family: var(--font-barlow-condensed); font-size: .75rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--abh-blue); background: #eef2f8; padding: 2px 8px; border-radius: 5px; }
.badge-round { font-size: .72rem; font-weight: 600; color: #94a3b8; }
.spacer      { flex: 1; }
.badge-fee        { font-family: var(--font-barlow-condensed); font-size: .88rem; font-weight: 800; color: var(--abh-dark); }
.badge-fee--muted { font-family: var(--font-barlow); font-size: .75rem; font-weight: 400; font-style: italic; color: #94a3b8; }

/* Teams */
.teams-block {
  display: flex; align-items: center; justify-content: space-between;
  gap: .75rem; padding: .75rem .85rem;
}
.team-side          { display: flex; align-items: center; gap: .55rem; flex: 1; min-width: 0; }
.team-side--away    { flex-direction: row-reverse; text-align: right; }
.mc-logo    { width: 36px; height: 36px; object-fit: contain; flex-shrink: 0; }
.mc-logo-ph {
  width: 36px; height: 36px;
  background: var(--abh-border); border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-barlow-condensed); font-size: .65rem; font-weight: 800; color: #94a3b8;
}
.mc-info        { min-width: 0; }
.mc-info--right { text-align: right; }
.mc-name  { font-size: .88rem; font-weight: 600; color: var(--abh-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-short { font-size: .72rem; color: #94a3b8; margin-top: 1px; }
.vs-sep   { font-family: var(--font-barlow-condensed); font-size: .78rem; font-weight: 700; color: #94a3b8; flex-shrink: 0; }

/* Bottom */
.card-bottom {
  display: flex; flex-direction: column; align-items: center; gap: .3rem;
  padding: .45rem .85rem;
  border-top: 1px solid var(--abh-border);
  background: var(--abh-light);
}
@media (min-width: 540px) {
  .card-bottom { flex-direction: row; justify-content: space-between; }
}
.card-bottom--hi { background: #e6edf6; border-top-color: #c1cfe4; }

.cb-item    { display: flex; align-items: center; gap: .32rem; }
.cb-umpires { display: flex; align-items: center; gap: .5rem; }
.cb-sep     { width: 1px; height: 12px; background: var(--abh-border); flex-shrink: 0; }
.cb-icon    { width: 13px; height: 13px; color: #94a3b8; flex-shrink: 0; }
.cb-text        { font-size: .75rem; color: #334155; white-space: nowrap; }
.cb-text--muted { color: #94a3b8; font-style: italic; }
.cb-text--hi    { color: var(--abh-blue); font-weight: 600; }
</style>
