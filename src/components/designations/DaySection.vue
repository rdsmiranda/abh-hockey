<script setup lang="ts">
import { computed } from 'vue'
import type { DesignationDay } from '@/types'
import MatchCard from './MatchCard.vue'

const props = defineProps<{
  day: DesignationDay
  highlightName: string | null
}>()

// Días y meses en español para formatear la fecha
const DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
                   'septiembre','octubre','noviembre','diciembre']

const dateLabel = computed<string>(() => {
  const [y, mo, d] = props.day.date.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return `${DAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[mo! - 1]}`
})

/**
 * Agrupa los partidos por zona manteniendo el orden de primera aparición.
 * Resultado: Map<zoneName, DesignationMatch[]>
 */
const byZone = computed(() => {
  const map = new Map<string, typeof props.day.matches>()
  for (const m of props.day.matches) {
    const z = m.zone ?? '—'
    if (!map.has(z)) map.set(z, [])
    map.get(z)!.push(m)
  }
  return map
})
</script>

<template>
  <section>
    <!-- Encabezado del día -->
    <div class="day-header">
      <h2 class="day-title">{{ dateLabel }}</h2>
      <span class="day-count">
        {{ day.matches.length }} {{ day.matches.length === 1 ? 'partido' : 'partidos' }}
      </span>
    </div>

    <!-- Por cada zona dentro del día -->
    <template v-for="[zone, matches] in byZone" :key="zone">
      <div class="zone-subheader">
        <h3 class="zone-title">{{ zone }}</h3>
      </div>
      <div class="matches-list">
        <MatchCard
          v-for="(match, i) in matches"
          :key="i"
          :match="match"
          :highlight-name="highlightName"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
/* Day header */
.day-header {
  display: flex; align-items: center; gap: .75rem;
  margin: 1.75rem 0 .85rem;
}
.day-header::after { content: ''; flex: 1; height: 1.5px; background: var(--abh-border); }
.day-title  { font-family: var(--font-barlow-condensed); font-size: 1.05rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--abh-dark); white-space: nowrap; }
.day-count  { font-size: .72rem; font-weight: 600; color: #94a3b8; white-space: nowrap; }

/* Zone subheader */
.zone-subheader {
  display: flex; align-items: center; gap: .6rem;
  margin: 1rem 0 .5rem;
}
.zone-subheader::after { content: ''; flex: 1; height: 1px; background: var(--abh-border); }
.zone-title { font-family: var(--font-barlow-condensed); font-size: .85rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: var(--abh-blue); white-space: nowrap; }

.matches-list { display: flex; flex-direction: column; }
</style>
