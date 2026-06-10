<script setup lang="ts">
import { computed } from 'vue'
import type { DesignationMatch } from '@/types'
import { useDesignationsStore } from '@/stores/designations.store'

const props = defineProps<{
  match: DesignationMatch
  /** ID del árbitro a resaltar, o null */
  highlightId: number | null
}>()

const store = useDesignationsStore()

// ── Resolución por ID ─────────────────────────────────────────────────────

const homeTeam = computed(() => store.team(props.match.home_team_id))
const awayTeam = computed(() => store.team(props.match.away_team_id))
const umpire1  = computed(() => store.umpire(props.match.umpire_1_id))
const umpire2  = computed(() => store.umpire(props.match.umpire_2_id))

// ── Highlight ─────────────────────────────────────────────────────────────

const isU1Hi = computed(() =>
  props.highlightId !== null && props.match.umpire_1_id === props.highlightId,
)
const isU2Hi = computed(() =>
  props.highlightId !== null && props.match.umpire_2_id === props.highlightId,
)
const isHighlighted = computed(() => isU1Hi.value || isU2Hi.value)

// ── Helpers ───────────────────────────────────────────────────────────────

const feeFormatted = computed<string | null>(() => {
  if (props.match.fee == null) return null
  return '$ ' + Number(props.match.fee).toLocaleString('es-AR', { maximumFractionDigits: 0 })
})

function formatDate(dateStr: string): string {
  const [y, mo, d] = dateStr.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return dt.toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short' })
}

function initials(name?: string): string {
  return (name ?? '?').slice(0, 3).toUpperCase()
}

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

const ZONE_STYLES: Record<string, { bg: string; color: string }> = {
  'Oro':         { bg: '#fef3c7', color: '#b45309' },
  'Plata':       { bg: '#f1f5f9', color: '#475569' },
  'Bronce':      { bg: '#fde8d8', color: '#92400e' },
  'Intermedia':  { bg: '#ede9fe', color: '#5b21b6' },
  'Caballeros':  { bg: '#d1fae5', color: '#065f46' },
  'Promocional': { bg: '#fce7f3', color: '#9d174d' },
}
const DEFAULT_ZONE_STYLE = { bg: '#e9eef5', color: '#64748b' }

function zoneStyle(zone: string): { background: string; color: string } {
  const s = ZONE_STYLES[zone] ?? DEFAULT_ZONE_STYLE
  return { background: s.bg, color: s.color }
}
</script>

<template>
  <article
    :class="['match-card', isHighlighted && 'match-card--hi']"
    :aria-label="`${homeTeam?.name ?? '?'} vs ${awayTeam?.name ?? '?'}`"
  >
    <!-- ── Top bar ───────────────────────────────────────── -->
    <div class="card-top">
      <div class="card-top__meta">
        <span v-if="match.zone" class="badge-zone" :style="zoneStyle(match.zone)">{{ match.zone }}</span>
        <span class="badge-cat">{{ match.category ?? '—' }}</span>
        <span v-if="match.round" class="badge-round">{{ match.round }}</span>
      </div>
      <div class="card-top__right">
        <span v-if="feeFormatted" class="badge-fee">{{ feeFormatted }}</span>
        <span v-else class="badge-fee badge-fee--muted">Sin importe</span>
        <div v-if="match.date" class="card-date">
          <span class="card-date__label">{{ formatDate(match.date) }}</span>
        </div>
      </div>
    </div>

    <!-- ── Teams ─────────────────────────────────────────── -->
    <div class="teams-block">
      <!-- Local -->
      <div class="team-side">
        <img
          v-if="homeTeam?.logo"
          :src="homeTeam.logo"
          :alt="homeTeam.name"
          class="mc-logo"
          @error="hideOnError"
        />
        <div v-else class="mc-logo-ph">{{ initials(homeTeam?.short_name ?? homeTeam?.name) }}</div>
        <div class="mc-info">
          <div class="mc-name">{{ homeTeam?.name ?? 'A confirmar' }}</div>
          <div v-if="homeTeam?.short_name" class="mc-short">{{ homeTeam.short_name }}</div>
        </div>
      </div>

      <!-- Centro: horario + cancha -->
      <div class="match-center">
        <span class="mc-time">{{ match.time ?? '—' }}</span>
        <span class="mc-pitch">
          <svg class="mc-pitch-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M8 1.5C5.515 1.5 3.5 3.515 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.485-2.015-4.5-4.5-4.5z"/>
            <circle cx="8" cy="6" r="1.5"/>
          </svg>
          {{ match.pitch ?? '—' }}
        </span>
      </div>

      <!-- Visitante -->
      <div class="team-side team-side--away">
        <img
          v-if="awayTeam?.logo"
          :src="awayTeam.logo"
          :alt="awayTeam.name"
          class="mc-logo"
          @error="hideOnError"
        />
        <div v-else class="mc-logo-ph">{{ initials(awayTeam?.short_name ?? awayTeam?.name) }}</div>
        <div class="mc-info mc-info--right">
          <div class="mc-name">{{ awayTeam?.name ?? 'A confirmar' }}</div>
          <div v-if="awayTeam?.short_name" class="mc-short">{{ awayTeam.short_name }}</div>
        </div>
      </div>
    </div>

    <!-- ── Árbitros ──────────────────────────────────────── -->
    <div class="card-umpires">
      <div :class="['umpire-slot', isU1Hi && 'umpire-slot--hi']">
        <svg class="ump-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="8" cy="5" r="2.8"/>
          <path d="M2 14c0-2.8 2.5-4.5 6-4.5s6 1.7 6 4.5"/>
        </svg>
        <span :class="['ump-name', !umpire1 && 'ump-name--muted']">
          {{ umpire1?.name ?? 'A designar' }}
        </span>
      </div>

      <span class="umpires-sep" aria-hidden="true" />

      <div :class="['umpire-slot', isU2Hi && 'umpire-slot--hi']">
        <svg class="ump-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="8" cy="5" r="2.8"/>
          <path d="M2 14c0-2.8 2.5-4.5 6-4.5s6 1.7 6 4.5"/>
        </svg>
        <span :class="['ump-name', !umpire2 && 'ump-name--muted']">
          {{ umpire2?.name ?? 'A designar' }}
        </span>
      </div>
    </div>
  </article>
</template>

<style scoped>
/* ── Card shell ─────────────────────────────────────────── */
.match-card {
  border-radius: 10px;
  overflow: hidden;
  border: 1.5px solid var(--abh-border);
  background: #fff;
  transition: border-color .15s, box-shadow .15s;
  margin-bottom: .75rem;
}
.match-card:hover {
  border-color: #c1cfe4;
  box-shadow: 0 3px 8px rgba(26,35,51,.1);
}
.match-card--hi:hover {
  box-shadow: 0 3px 8px rgba(78,109,158,.18);
}

/* ── Top bar ────────────────────────────────────────────── */
.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .45rem .85rem;
  border-bottom: 1px solid var(--abh-border);
  background: var(--abh-light);
  flex-wrap: wrap;
}
.card-top__meta {
  display: flex;
  align-items: center;
  gap: .4rem;
  flex-wrap: wrap;
}
.card-top__right {
  display: flex;
  align-items: center;
  gap: .6rem;
}
.badge-cat {
  font-family: var(--font-barlow-condensed);
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  color: var(--abh-blue);
  background: #dde6f3;
  padding: 2px 8px;
  border-radius: 4px;
}
.badge-zone {
  font-family: var(--font-barlow-condensed);
  font-size: .75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .06em;
  padding: 2px 7px;
  border-radius: 4px;
}
.badge-round {
  font-size: .72rem;
  font-weight: 500;
  color: #94a3b8;
}
.badge-fee {
  font-family: var(--font-barlow-condensed);
  font-size: .88rem;
  font-weight: 800;
  color: var(--abh-dark);
  white-space: nowrap;
}
.badge-fee--muted {
  font-family: var(--font-barlow);
  font-size: .72rem;
  font-weight: 400;
  font-style: italic;
  color: #94a3b8;
}

/* Fecha */
.card-date {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding-left: .6rem;
  border-left: 1px solid var(--abh-border);
}
.card-date__label {
  font-size: .72rem;
  color: #64748b;
  white-space: nowrap;
  text-transform: capitalize;
}

/* ── Teams block ────────────────────────────────────────── */
.teams-block {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: .85rem;
}
.team-side {
  display: flex;
  align-items: center;
  gap: .5rem;
  flex: 1;
  min-width: 0;
}
.team-side--away {
  flex-direction: row-reverse;
  text-align: right;
}
.mc-logo {
  width: 36px;
  height: 36px;
  object-fit: contain;
  flex-shrink: 0;
}
.mc-logo-ph {
  width: 36px;
  height: 36px;
  background: var(--abh-border);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-barlow-condensed);
  font-size: .65rem;
  font-weight: 800;
  color: #94a3b8;
}
.mc-info { min-width: 0; }
.mc-info--right { text-align: right; }
.mc-name {
  font-size: .88rem;
  font-weight: 600;
  color: var(--abh-dark);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mc-short {
  font-size: .7rem;
  color: #94a3b8;
  margin-top: 1px;
}

/* Centro horario + cancha */
.match-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
  flex-shrink: 0;
  min-width: 64px;
}
.mc-time {
  font-family: var(--font-barlow-condensed);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--abh-dark);
  letter-spacing: .02em;
  line-height: 1;
}
.mc-pitch {
  display: flex;
  align-items: center;
  gap: .2rem;
  font-size: .68rem;
  color: #64748b;
  white-space: nowrap;
}
.mc-pitch-icon {
  width: 11px;
  height: 11px;
  flex-shrink: 0;
  color: #94a3b8;
}

/* ── Árbitros ───────────────────────────────────────────── */
.card-umpires {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: .45rem .85rem;
  border-top: 1px solid var(--abh-border);
  background: var(--abh-light);
  gap: .5rem;
}
.umpire-slot {
  display: flex;
  align-items: center;
  gap: .3rem;
}
.umpires-sep {
  width: 1px;
  height: 14px;
  background: var(--abh-border);
  flex-shrink: 0;
}
.ump-icon {
  width: 13px;
  height: 13px;
  color: #94a3b8;
  flex-shrink: 0;
}
.umpire-slot--hi .ump-icon { color: var(--abh-blue); }
.ump-name {
  font-size: .75rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ump-name--muted {
  color: #94a3b8;
  font-style: italic;
}
.umpire-slot--hi .ump-name {
  color: var(--abh-blue);
  font-weight: 700;
}
</style>