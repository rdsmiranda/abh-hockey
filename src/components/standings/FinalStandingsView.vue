<script setup lang="ts">
import type { FinalStandingRow } from '@/types'
import TeamCell from './TeamCell.vue'

defineProps<{ rows: FinalStandingRow[] }>()

// Colores de badge por contenido de la nota
const NOTE_STYLE: Record<string, string> = {
  'campeón':   'badge--gold',
  'campeon':   'badge--gold',
  'asciende':  'badge--green',
  'desciende': 'badge--red',
}

function noteStyle(note: string): string {
  const key = note.toLowerCase()
  for (const [k, cls] of Object.entries(NOTE_STYLE)) {
    if (key.includes(k)) return cls
  }
  return 'badge--gray'
}
</script>

<template>
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th class="th-team">Equipo</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.team_id">
          <td class="td-pos">{{ row.position }}</td>
          <td class="td-team">
            <TeamCell :team-id="row.team_id" />
          </td>
          <td class="td-note">
            <span v-if="row.note" :class="['note-badge', noteStyle(row.note)]">
              {{ row.note }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrapper { background: #fff; border: 1.5px solid var(--abh-border); border-radius: 8px; overflow: hidden; }
table { width: 100%; border-collapse: collapse; font-size: .845rem; }

thead tr { background: var(--abh-dark); color: #fff; }
thead th {
  font-family: var(--font-barlow-condensed); font-weight: 700; font-size: .72rem;
  letter-spacing: .1em; text-transform: uppercase;
  padding: .65rem .6rem; text-align: center; white-space: nowrap;
}
thead th.th-team { text-align: left; padding-left: .75rem; }

tbody tr { border-bottom: 1px solid var(--abh-border); transition: background .1s; }
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: #f8fafc; }
tbody td { padding: .6rem; text-align: center; color: var(--abh-dark); }

.td-pos  { font-family: var(--font-barlow-condensed); font-size: .9rem; font-weight: 700; color: #94a3b8; width: 36px; }
.td-team { text-align: left; padding-left: .75rem; }
.td-note { text-align: right; padding-right: .75rem; }

.note-badge {
  display: inline-flex; align-items: center;
  font-size: .7rem; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
  padding: 2px 8px; border-radius: 10px;
}
.badge--gold  { background: #fef9c3; color: #713f12; border: 1px solid #fde047; }
.badge--green { background: #dcfce7; color: #166534; }
.badge--red   { background: #fee2e2; color: #991b1b; }
.badge--gray  { background: #f1f5f9; color: #475569; }
</style>
