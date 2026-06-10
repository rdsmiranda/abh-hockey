<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDesignationsStore } from '@/stores/designations.store'
import Combobox          from '@/components/ui/Combobox.vue'
import StateBanner       from '@/components/ui/StateBanner.vue'
import ZoneFilterButtons from '@/components/designations/ZoneFilterButtons.vue'
import DaySection        from '@/components/designations/DaySection.vue'
import type { ComboboxOption } from '@/components/ui/Combobox.vue'

const store = useDesignationsStore()

onMounted(() => store.load())

// Adaptar Umpire[] al formato que espera Combobox
const umpireOptions = computed<ComboboxOption[]>(() =>
  store.umpires.map((u) => ({ id: u.id, label: u.name })),
)

// Adaptar ComboboxOption | null → Umpire | null para el store
function onUmpireChange(opt: ComboboxOption | null) {
  if (!opt) { store.selectUmpire(null); return }
  const found = store.umpires.find((u) => u.id === opt.id) ?? null
  store.selectUmpire(found)
}

// ID del árbitro seleccionado para pasar a DaySection → DesignationCard
const highlightId = computed<number | null>(() => store.selectedUmpire?.id ?? null)

// Mensaje cuando hay partidos pero los filtros no arrojan resultados
const emptyMessage = computed<string>(() => {
  const who   = store.selectedUmpire ? ` para ${store.selectedUmpire.name}` : ''
  const where = store.selectedZone   ? ` en ${store.selectedZone}`          : ''
  return `No hay partidos designados${who}${where} en este período.`
})

// ComboboxOption del árbitro actualmente seleccionado
const selectedUmpireOption = computed<ComboboxOption | null>(() =>
  store.selectedUmpire
    ? { id: store.selectedUmpire.id, label: store.selectedUmpire.name }
    : null,
)

// true solo si hay filtros activos (árbitro o zona)
const hasActiveFilters = computed(() =>
  store.selectedUmpire !== null || store.selectedZone !== null,
)
</script>

<template>
  <div>
    <!-- ── Estado: carga / error ──────────────────────────────── -->
    <StateBanner
      v-if="store.status !== 'success'"
      :state="store.status"
      :message="store.errorMessage ?? undefined"
    />

    <!-- ── Estado: sin partidos próximos (no hay nada para filtrar) ── -->
    <StateBanner
      v-else-if="store.isEmpty"
      state="empty"
      message="No se encontraron designaciones publicadas."
    />

    <!-- ── Estado: carga exitosa con partidos próximos ────────── -->
    <template v-else>
      <!-- Filtros — solo visibles cuando hay partidos próximos -->
      <div class="filters">
        <div class="filter-group">
          <label class="filter-label">Árbitro</label>
          <Combobox
            :options="umpireOptions"
            :model-value="selectedUmpireOption"
            placeholder="Buscar árbitro…"
            @update:model-value="onUmpireChange"
          />
        </div>

        <div v-if="store.hasMultipleZones" class="filter-group">
          <label class="filter-label">Zona</label>
          <ZoneFilterButtons
            :zones="store.availableZones"
            :model-value="store.selectedZone"
            @update:model-value="store.selectZone"
          />
        </div>
      </div>

      <!-- Meta bar -->
      <div class="meta-bar">
        <span class="meta-title">{{ store.periodLabel }}</span>
        <span v-if="store.generatedAt" class="meta-updated">
          Actualizado: {{ store.generatedAt }}
        </span>
      </div>

      <!-- Sin resultados por filtros activos -->
      <div
        v-if="store.filteredDays.length === 0 && hasActiveFilters"
        class="text-center py-10 text-sm text-slate-400"
        v-html="emptyMessage"
      />

      <!-- Días con partidos -->
      <DaySection
        v-for="day in store.filteredDays"
        :key="day.date"
        :day="day"
        :highlight-id="highlightId"
      />
    </template>
  </div>
</template>

<style scoped>
.filters {
  display: flex;
  gap: .75rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
  align-items: flex-end;
}
.filter-group {
  display: flex;
  flex-direction: column;
  gap: .25rem;
}
.filter-label {
  font-size: .7rem;
  font-weight: 600;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #64748b;
}
.meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: .5rem;
  margin-bottom: 1rem;
}
.meta-title {
  font-family: var(--font-barlow-condensed);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--abh-dark);
  text-transform: uppercase;
  letter-spacing: .04em;
}
.meta-updated {
  font-size: .72rem;
  color: #94a3b8;
}
</style>