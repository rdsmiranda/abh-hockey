<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStandingsStore } from '@/stores/standings.store'
import AppSelect     from '@/components/ui/AppSelect.vue'
import StateBanner   from '@/components/ui/StateBanner.vue'
import CategoryTabs  from '@/components/standings/CategoryTabs.vue'
import StandingsTable from '@/components/standings/StandingsTable.vue'
import PlayoffBracket from '@/components/playoffs/PlayoffBracket.vue'
import type { SelectOption } from '@/components/ui/AppSelect.vue'
import type { TabItem } from '@/components/standings/CategoryTabs.vue'

const store = useStandingsStore()

onMounted(() => store.loadIndex())

// Opciones para el select de campeonato
const championshipSelectOptions = computed<SelectOption[]>(() =>
  store.championshipOptions.map((o) => ({ value: o.file, label: o.label })),
)

// Opciones para el select de zona
const zoneSelectOptions = computed<SelectOption[]>(() =>
  (store.activeChampionship?.zones ?? []).map((z) => ({
    value: String(z.id),
    label: z.name,
  })),
)

// Tabs de categoría para la zona activa
const categoryTabs = computed<TabItem[]>(() =>
  (store.activeZone?.categories ?? []).map((c) => ({
    id: String(c.id),
    name: c.name,
  })),
)

// Sub-tabs Posiciones / Playoffs (solo cuando hay playoffs)
const subTabs = computed<TabItem<'standings' | 'playoffs'>[]>(() => [
  { id: 'standings', name: 'Posiciones' },
  { id: 'playoffs',  name: 'Playoffs'  },
])
</script>

<template>
  <div>
    <!-- ── Filtros ─────────────────────────────────────────── -->
    <div class="filters">
      <div class="filter-group">
        <label class="filter-label" for="sel-championship">Campeonato</label>
        <AppSelect
          id="sel-championship"
          :options="championshipSelectOptions"
          :model-value="store.selectedFile"
          :disabled="store.status === 'loading'"
          @update:model-value="store.loadChampionship"
        />
      </div>

      <div v-if="store.activeChampionship" class="filter-group">
        <label class="filter-label" for="sel-zone">Zona</label>
        <AppSelect
          id="sel-zone"
          :options="zoneSelectOptions"
          :model-value="store.selectedZoneId"
          @update:model-value="store.setZone"
        />
      </div>
    </div>

    <!-- ── Estado carga / error / idle ─────────────────────── -->
    <StateBanner
      v-if="store.status !== 'success'"
      :state="store.status"
      :message="store.errorMessage ?? undefined"
    />

    <!-- ── Contenido principal ─────────────────────────────── -->
    <template v-else-if="store.activeZone">
      <!-- Meta bar -->
      <div class="meta-bar">
        <span class="meta-title">
          {{ store.activeChampionship?.championship.name }}
          {{ store.activeChampionship?.championship.year }}
        </span>
        <span v-if="store.generatedAt" class="meta-updated">
          Actualizado: {{ store.generatedAt }}
        </span>
      </div>

      <!-- Tabs de categoría -->
      <CategoryTabs
        :tabs="categoryTabs"
        :model-value="store.activeCategoryId"
        @update:model-value="store.setCategory"
      />

      <!-- Contenido de la categoría activa -->
      <template v-if="store.activeCategory">
        <!-- Sub-tabs Posiciones / Playoffs -->
        <CategoryTabs
          v-if="store.hasPlayoffs"
          :tabs="subTabs"
          :model-value="store.activeSubTab"
          style="margin-bottom: 0.75rem"
          @update:model-value="store.setSubTab"
        />

        <!-- Tabla de posiciones -->
        <StandingsTable
          v-show="store.activeSubTab === 'standings'"
          :standings="store.activeCategory.standings"
        />

        <!-- Playoffs -->
        <PlayoffBracket
          v-if="store.hasPlayoffs && store.activeSubTab === 'playoffs' && store.activePlayoff && store.activeZone"
          :playoff="store.activePlayoff"
          :zone="store.activeZone"
        />
      </template>
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
