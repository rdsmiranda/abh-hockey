<script setup lang="ts">
import { computed } from 'vue'
import type { DesignationDay } from '@/types'
import DesignationCard from './DesignationCard.vue'

const props = defineProps<{
  day: DesignationDay
  /** ID del árbitro a resaltar, o null */
  highlightId: number | null
}>()

const DAYS_ES   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

const dateLabel = computed<string>(() => {
  const [y, mo, d] = props.day.date.split('-').map(Number)
  const dt = new Date(y!, mo! - 1, d)
  return `${DAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[mo! - 1]}`
})
</script>

<template>
  <section>
    <div class="day-header">
      <h2 class="day-title">{{ dateLabel }}</h2>
      <span class="day-count">
        {{ day.matches.length }} {{ day.matches.length === 1 ? 'partido' : 'partidos' }}
      </span>
    </div>

    <div class="matches-list">
      <DesignationCard
        v-for="match in day.matches"
        :key="match.id"
        :match="match"
        :highlight-id="highlightId"
      />
    </div>
  </section>
</template>

<style scoped>
.day-header {
  display: flex;
  align-items: center;
  gap: .75rem;
  margin: 1.75rem 0 .85rem;
}
.day-header::after {
  content: '';
  flex: 1;
  height: 1.5px;
  background: var(--abh-border);
}
.day-title {
  font-family: var(--font-barlow-condensed);
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: var(--abh-dark);
  white-space: nowrap;
}
.day-count {
  font-size: .72rem;
  font-weight: 600;
  color: #94a3b8;
  white-space: nowrap;
}
.matches-list {
  display: flex;
  flex-direction: column;
}
</style>