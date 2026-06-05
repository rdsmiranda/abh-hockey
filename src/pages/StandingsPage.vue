<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStandingsStore } from '@/stores/standings.store'
import AppSelect      from '@/components/ui/AppSelect.vue'
import StateBanner    from '@/components/ui/StateBanner.vue'
import CategoryTabs   from '@/components/standings/CategoryTabs.vue'
import StandingsTable from '@/components/standings/StandingsTable.vue'
import PlayoffBracket from '@/components/playoffs/PlayoffBracket.vue'
import type { SelectOption } from '@/components/ui/AppSelect.vue'
import type { TabItem } from '@/components/standings/CategoryTabs.vue'
import type { CategoryView } from '@/types'

const store = useStandingsStore()

onMounted(() => store.loadIndex())

// ── Campeonato ────────────────────────────────────────────────────────────
const championshipOptions = computed<SelectOption[]>(() =>
  store.championshipOptions.map((o) => ({ value: o.file, label: o.label })),
)

// ── Zona — dropdown ───────────────────────────────────────────────────────
const zoneOptions = computed<SelectOption[]>(() =>
  (store.activeChampionship?.zones ?? []).map((z) => ({
    value: String(z.id),
    label: z.name,
  })),
)

// ── Categoría — segmented control ─────────────────────────────────────────
const categoryTabs = computed<TabItem[]>(() =>
  (store.activeZone?.categories ?? []).map((c) => ({
    id: String(c.id),
    name: c.name,
  })),
)

// ── Vista — solo las tabs disponibles para la categoría activa ────────────
const ALL_VIEWS: { id: CategoryView; name: string }[] = [
  { id: 'standings', name: 'Tabla'    },
  { id: 'fixture',   name: 'Fixture'  },
  { id: 'playoffs',  name: 'Playoffs' },
  { id: 'final',     name: 'Final'    },
]

const viewTabs = computed<TabItem<CategoryView>[]>(() =>
  ALL_VIEWS.filter((v) => store.availableViews.includes(v.id)),
)

// ── Meta subtitle ─────────────────────────────────────────────────────────
const metaSubtitle = computed(() => {
  const parts: string[] = []
  if (store.activeZone)     parts.push(store.activeZone.name)
  if (store.activeCategory) parts.push(store.activeCategory.name)
  return parts.join(' · ')
})
</script>

<template>
  <div>
    <!-- ── Fila 1: Campeonato + Zona ──────────────────────────── -->
    <div class="top-filters">
      <div class="filter-group">
        <label class="filter-label" for="sel-championship">Campeonato</label>
        <AppSelect
          id="sel-championship"
          :options="championshipOptions"
          :model-value="store.selectedFile"
          :disabled="store.status === 'loading'"
          @update:model-value="store.loadChampionship"
        />
      </div>

      <div v-if="zoneOptions.length > 1" class="filter-group">
        <label class="filter-label" for="sel-zone">Zona</label>
        <AppSelect
          id="sel-zone"
          :options="zoneOptions"
          :model-value="store.selectedZoneId"
          @update:model-value="store.setZone"
        />
      </div>
    </div>

    <!-- ── Estado carga / error ────────────────────────────────── -->
    <StateBanner
      v-if="store.status !== 'success'"
      :state="store.status"
      :message="store.errorMessage ?? undefined"
    />

    <template v-else-if="store.activeChampionship">

      <!-- ── Categoría — segmented (solo si hay más de una) ────── -->
      <div v-if="categoryTabs.length > 1" class="filter-group" style="margin-bottom: 1rem">
        <label class="filter-label">Categoría</label>
        <CategoryTabs
          :tabs="categoryTabs"
          :model-value="store.activeCategoryId"
          @update:model-value="store.setCategory"
        />
      </div>

      <!-- ── Meta bar ───────────────────────────────────────────── -->
      <div class="meta-bar">
        <div>
          <div class="meta-title">
            {{ store.activeChampionship.championship.name }}
            {{ store.activeChampionship.championship.year }}
          </div>
          <div v-if="metaSubtitle" class="meta-subtitle">{{ metaSubtitle }}</div>
        </div>
        <span v-if="store.generatedAt" class="meta-updated">
          Actualizado: {{ store.generatedAt }}
        </span>
      </div>

      <!-- ── Vista — segmented con solo las tabs disponibles ─────── -->
      <div v-if="viewTabs.length > 1" class="filter-group" style="margin-bottom: 1.25rem">
        <label class="filter-label">Vista</label>
        <CategoryTabs
          :tabs="viewTabs"
          :model-value="store.activeSubTab"
          @update:model-value="store.setSubTab"
        />
      </div>

      <!-- ── Contenido ──────────────────────────────────────────── -->
      <template v-if="store.activeCategory">

        <!-- TABLA -->
        <StandingsTable
          v-if="store.activeSubTab === 'standings'"
          :standings="store.activeCategory.standings"
        />

        <!-- FIXTURE — placeholder -->
        <div v-else-if="store.activeSubTab === 'fixture'" class="state-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
          <p>El fixture estará disponible próximamente.</p>
        </div>

        <!-- PLAYOFFS -->
        <template v-else-if="store.activeSubTab === 'playoffs'">
          <PlayoffBracket
            v-if="store.activePlayoff && store.activeZone"
            :playoff="store.activePlayoff"
            :zone="store.activeZone"
          />
          <div v-else class="state-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M8 21h8M12 17v4M5 3h14l-4 7 4 7H5l4-7-4-7z"/>
            </svg>
            <p>No hay playoffs cargados para esta categoría.</p>
          </div>
        </template>

        <!-- FINAL — placeholder -->
        <div v-else-if="store.activeSubTab === 'final'" class="state-placeholder">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <circle cx="12" cy="8" r="5"/><path d="M7 21l5-8 5 8"/>
          </svg>
          <p>Las posiciones finales se publicarán al término del torneo.</p>
        </div>

      </template>
    </template>
  </div>
</template>

<style scoped>
/* Fila de Campeonato + Zona: en desktop lado a lado, en mobile apilados */
.top-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
@media (max-width: 600px) {
  .top-filters {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

/* En mobile los selects ocupan todo el ancho */
.top-filters .filter-group :deep(.app-select),
.top-filters .filter-group select {
  min-width: 0;
  width: 100%;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #64748b;
}

.meta-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}
.meta-title {
  font-family: var(--font-barlow-condensed);
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--abh-dark);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  line-height: 1.1;
}
.meta-subtitle {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--abh-gold);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}
.meta-updated {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
  align-self: flex-end;
}

.state-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #94a3b8;
  text-align: center;
}
.state-placeholder svg {
  width: 36px;
  height: 36px;
  opacity: 0.4;
}
.state-placeholder p {
  font-size: 0.875rem;
  margin: 0;
}
</style>
