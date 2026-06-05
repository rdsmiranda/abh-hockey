<script setup lang="ts">
import type { Bracket, Team } from '@/types'

const props = defineProps<{
  bracket: Bracket
  teamLookup: Map<number, Team>
}>()

const formatLabel = props.bracket.format === 'triangular' ? 'Triangular' : 'Round Robin'
const POS_CLASS = ['pos-1', 'pos-2', 'pos-3', 'pos-4']

function resolve(id: number) { return props.teamLookup.get(id) }
function initials(t: Team | undefined) {
  return (t?.short_name ?? t?.name ?? '?').slice(0, 2).toUpperCase()
}
function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <div class="bracket-card">
    <div class="bc-header">
      <span class="bc-label">{{ formatLabel }}</span>
    </div>

    <!-- Tabla de posiciones del grupo -->
    <div v-if="bracket.group_standings?.length">
      <table class="group-table">
        <thead>
          <tr>
            <th style="width:28px">#</th>
            <th class="th-left">Equipo</th>
            <th title="Partidos jugados">PJ</th>
            <th title="Ganados"       class="col-hide-sm">G</th>
            <th title="Empatados"     class="col-hide-sm">E</th>
            <th title="Perdidos"      class="col-hide-sm">P</th>
            <th title="Goles a favor" class="col-hide-sm">GF</th>
            <th title="Goles en contra" class="col-hide-sm">GC</th>
            <th title="Diferencia"    class="col-hide-sm">DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, i) in bracket.group_standings" :key="s.team.id">
            <td><span :class="['pos-badge', POS_CLASS[i]]">{{ i + 1 }}</span></td>
            <td class="td-left">
              <div class="group-team-cell">
                <img v-if="s.team.logo" :src="s.team.logo" :alt="s.team.name" class="group-logo"
                     @error="hideOnError" />
                <span v-else class="group-logo-ph">{{ initials(s.team) }}</span>
                {{ s.team.name }}
              </div>
            </td>
            <td>{{ s.played }}</td>
            <td class="col-hide-sm">{{ s.won }}</td>
            <td class="col-hide-sm">{{ s.drawn }}</td>
            <td class="col-hide-sm">{{ s.lost }}</td>
            <td class="col-hide-sm">{{ s.goals_for }}</td>
            <td class="col-hide-sm">{{ s.goals_against }}</td>
            <td class="col-hide-sm">{{ s.goal_difference > 0 ? '+' : '' }}{{ s.goal_difference }}</td>
            <td class="group-pts">{{ s.points }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Partidos del grupo -->
    <div v-if="bracket.matches.length" class="bc-matches">
      <div v-for="(m, i) in bracket.matches" :key="i" class="bc-match-row">
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

@media (max-width: 640px) {
  .col-hide-sm { display: none; }
}
</style>
