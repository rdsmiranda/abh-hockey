<script setup lang="ts">
import type { PlayoffBracket } from '@/types'
import { useTeamResolver } from '@/composables/useTeam'
import MatchCard from '@/components/ui/MatchCard.vue'

const props = defineProps<{ bracket: PlayoffBracket }>()

const { resolve, initials } = useTeamResolver()

const formatLabel = props.bracket.format === 'triangular' ? 'Triangular' : 'Round Robin'
const POS_CLASS   = ['pos-1', 'pos-2', 'pos-3', 'pos-4']

function matchWinnerId(m: PlayoffBracket['matches'][number]): number | null {
  if (!m.played) return null

  if (m.has_shootouts) {
    const sh = m.shootouts_home ?? 0
    const sa = m.shootouts_away ?? 0
    if (sh > sa) return Number(m.home_team_id)
    if (sa > sh) return Number(m.away_team_id)
    return null
  }

  const gh = m.goals_home ?? 0
  const ga = m.goals_away ?? 0
  if (gh > ga) return Number(m.home_team_id)
  if (ga > gh) return Number(m.away_team_id)
  return null
}

function hideOnError(e: Event) { (e.target as HTMLImageElement).style.display = 'none' }
</script>

<template>
  <div>
    <!-- Tabla del grupo dentro del bracket-card -->
    <div class="bracket-card">
      <div class="bc-header">
        <span class="bc-label">{{ formatLabel }}</span>
      </div>

      <div v-if="bracket.group_standings?.length">
        <table class="group-table">
          <thead>
            <tr>
              <th style="width:28px">#</th>
              <th class="th-left">Equipo</th>
              <th title="Partidos jugados">PJ</th>
              <th title="Ganados"         class="col-hide-sm">G</th>
              <th title="Empatados"       class="col-hide-sm">E</th>
              <th title="Perdidos"        class="col-hide-sm">P</th>
              <th title="Goles a favor"   class="col-hide-sm">GF</th>
              <th title="Goles en contra" class="col-hide-sm">GC</th>
              <th title="Diferencia"      class="col-hide-sm">DG</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(s, i) in bracket.group_standings" :key="s.team_id">
              <td><span :class="['pos-badge', POS_CLASS[i]]">{{ i + 1 }}</span></td>
              <td class="td-left">
                <div class="group-team-cell">
                  <img v-if="resolve(s.team_id)?.logo" :src="resolve(s.team_id)!.logo!"
                       :alt="resolve(s.team_id)!.name" class="group-logo" @error="hideOnError" />
                  <span v-else class="group-logo-ph">{{ initials(s.team_id) }}</span>
                  {{ resolve(s.team_id)?.name ?? '?' }}
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
    </div>

    <!-- Partidos del grupo fuera del bracket-card -->
    <div v-if="bracket.matches.length" class="group-matches">
      <MatchCard
        v-for="(m, i) in bracket.matches"
        :key="i"
        :match="m"
        :winner-id="matchWinnerId(m)"
      />
    </div>
  </div>
</template>

<style scoped>
@import './bracket-shared.css';

.group-matches {
  display: flex;
  flex-direction: column;
  gap: .4rem;
  margin-top: .4rem;
}

@media (max-width: 640px) { .col-hide-sm { display: none; } }
</style>