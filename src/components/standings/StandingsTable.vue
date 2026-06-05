<script setup lang="ts">
import type { StandingRow, RecentFormEntry } from '@/types'
import TeamCell   from './TeamCell.vue'
import FormBadge  from './FormBadge.vue'
import HoverCard  from '@/components/ui/HoverCard.vue'
import { useFormBadge } from '@/composables/useFormBadge'

defineProps<{
  standings: StandingRow[]
}>()

const { activeMatch, anchorRect, show, hide } = useFormBadge()

function onBadgeShow(match: RecentFormEntry, rect: DOMRect) {
  show(match, rect)
}
</script>

<template>
  <div
    v-if="standings.length === 0"
    class="text-center py-10 text-slate-400 text-sm"
  >
    Sin datos de posiciones.
  </div>

  <template v-else>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th class="th-team">Equipo</th>
            <th title="Partidos jugados">PJ</th>
            <th title="Ganados"          class="col-hide-sm">G</th>
            <th title="Empatados"        class="col-hide-sm">E</th>
            <th title="Perdidos"         class="col-hide-sm">P</th>
            <th title="Goles a favor"    class="col-hide-sm">GF</th>
            <th title="Goles en contra"  class="col-hide-sm">GC</th>
            <th title="Diferencia de goles">DG</th>
            <th>Pts</th>
            <th>Últimos 5</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in standings" :key="row.team.id">
            <td class="td-pos">{{ row.position }}</td>
            <td class="td-team">
              <TeamCell :team="row.team" />
            </td>
            <td>{{ row.played }}</td>
            <td class="col-hide-sm">{{ row.won }}</td>
            <td class="col-hide-sm">{{ row.drawn }}</td>
            <td class="col-hide-sm">{{ row.lost }}</td>
            <td class="col-hide-sm">{{ row.goals_for }}</td>
            <td class="col-hide-sm">{{ row.goals_against }}</td>
            <td class="td-gd">
              {{ row.goal_difference > 0 ? '+' : '' }}{{ row.goal_difference }}
            </td>
            <td class="td-pts">{{ row.points }}</td>
            <td>
              <div class="form-badges">
                <FormBadge
                  v-for="(entry, i) in row.recent_form"
                  :key="i"
                  :result="entry.result"
                  :match="entry"
                  @show="onBadgeShow"
                  @hide="hide"
                />
                <span
                  v-if="!row.recent_form?.length"
                  class="text-slate-300 text-xs"
                >
                  —
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- HoverCard usa Teleport internamente, no afecta el layout -->
    <HoverCard :match="activeMatch" :anchor-rect="anchorRect" />
  </template>
</template>

<style scoped>
.table-wrapper {
  background: #fff;
  border: 1.5px solid var(--abh-border);
  border-radius: 8px;
  overflow: hidden;
}
table { width: 100%; border-collapse: collapse; font-size: 0.845rem; }

thead tr   { background: var(--abh-dark); color: #fff; }
thead th   {
  font-family: var(--font-barlow-condensed);
  font-weight: 700; font-size: 0.72rem;
  letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.65rem 0.6rem; text-align: center; white-space: nowrap;
}
thead th.th-team { text-align: left; padding-left: 0.75rem; }

tbody tr          { border-bottom: 1px solid var(--abh-border); transition: background 0.1s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover    { background: #f8fafc; }
tbody td          { padding: 0.6rem; text-align: center; color: var(--abh-dark); }

.td-pos  { font-family: var(--font-barlow-condensed); font-size: 0.9rem; font-weight: 700; color: #94a3b8; width: 36px; }
.td-team { text-align: left; padding-left: 0.75rem; }
.td-pts  { font-family: var(--font-barlow-condensed); font-weight: 800; font-size: 1rem; }
.td-gd   { color: #64748b; font-size: 0.8rem; }

.form-badges { display: flex; align-items: center; gap: 3px; justify-content: center; }

@media (max-width: 640px) {
  .col-hide-sm { display: none; }
}
</style>
