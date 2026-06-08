<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import AppSelect           from '@/components/ui/AppSelect.vue'
import StateBanner         from '@/components/ui/StateBanner.vue'
import CategoryTabs        from '@/components/standings/CategoryTabs.vue'
import StandingsTable      from '@/components/standings/StandingsTable.vue'
import FinalStandingsView  from '@/components/standings/FinalStandingsView.vue'
import FixtureView         from '@/components/standings/FixtureView.vue'
import PlayoffBracket      from '@/components/playoffs/PlayoffBracket.vue'
import type { SelectOption } from '@/components/ui/AppSelect.vue'
import type { TabItem } from '@/components/standings/CategoryTabs.vue'
import type { CategoryView } from '@/types'

const store = useChampionshipStore()

onMounted(() => store.loadIndex())

// ── Campeonato ────────────────────────────────────────────────────────────
const championshipOptions = computed<SelectOption[]>(() =>
  store.championshipOptions.map((o) => ({ value: o.file, label: o.label })),
)

// ── Zona — dropdown ───────────────────────────────────────────────────────
const zoneOptions = computed<SelectOption[]>(() =>
  (store.data?.zones ?? []).map((z) => ({
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

// ── Vista — solo tabs disponibles para la categoría activa ───────────────
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
    <!-- ── Campeonato + Zona ───────────────────────────────────── -->
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

    <!-- ── Estado ─────────────────────────────────────────────── -->
    <StateBanner
      v-if="store.status !== 'success'"
      :state="store.status"
      :message="store.errorMessage ?? undefined"
    />

    <template v-else-if="store.data">

      <!-- ── Categoría ──────────────────────────────────────── -->
      <div v-if="categoryTabs.length > 1" class="filter-group" style="margin-bottom:1rem">
        <label class="filter-label">Categoría</label>
        <CategoryTabs
          :tabs="categoryTabs"
          :model-value="store.activeCategoryId"
          @update:model-value="store.setCategory"
        />
      </div>

      <!-- ── Meta bar ───────────────────────────────────────── -->
      <div class="meta-bar">
        <div>
          <div class="meta-title">
            {{ store.data.championship.name }} {{ store.data.championship.year }}
          </div>
          <div v-if="metaSubtitle" class="meta-subtitle">{{ metaSubtitle }}</div>
        </div>
        <span v-if="store.generatedAt" class="meta-updated">
          Actualizado: {{ store.generatedAt }}
        </span>
      </div>

      <!-- ── Vista ─────────────────────────────────────────── -->
      <div v-if="viewTabs.length > 1" class="filter-group" style="margin-bottom:1.25rem">
        <!-- <label class="filter-label">Vista</label> -->
        <CategoryTabs
          :tabs="viewTabs"
          :model-value="store.activeSubTab"
          @update:model-value="store.setSubTab"
        />
      </div>

      <!-- ── Contenido ─────────────────────────────────────── -->
      <template v-if="store.activeCategory && store.activeZone">

        <!-- TABLA -->
        <StandingsTable
          v-if="store.activeSubTab === 'standings'"
          :standings="store.activeCategory.standings"
        />

        <!-- FIXTURE -->
        <FixtureView
          v-else-if="store.activeSubTab === 'fixture'"
          :zone-id="store.activeZone.id"
          :category-id="store.activeCategory.id"
        />

        <!-- PLAYOFFS -->
        <template v-else-if="store.activeSubTab === 'playoffs'">
          <PlayoffBracket
            v-if="store.activePlayoffs"
            :playoffs="store.activePlayoffs"
          />
          <div v-else class="state-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <path d="M8 21h8M12 17v4M5 3h14l-4 7 4 7H5l4-7-4-7z"/>
            </svg>
            <p>No hay playoffs para esta categoría.</p>
          </div>
        </template>

        <!-- FINAL -->
        <template v-else-if="store.activeSubTab === 'final'">
          <FinalStandingsView
            v-if="store.activeFinalStandings"
            :rows="store.activeFinalStandings"
          />
          <div v-else class="state-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
              <circle cx="12" cy="8" r="5"/><path d="M7 21l5-8 5 8"/>
            </svg>
            <p>Las posiciones finales se publicarán al término del torneo.</p>
          </div>
        </template>

      </template>
    </template>
  </div>
</template>

<style scoped>
.top-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: .75rem;
  margin-bottom: 1.25rem;
}
@media (max-width: 600px) {
  .top-filters { grid-template-columns: 1fr; }
}

.filter-group { display: flex; flex-direction: column; gap: .3rem; }
.top-filters .filter-group :deep(select) { min-width: 0; width: 100%; }

.filter-label {
  font-size: .7rem; font-weight: 600;
  letter-spacing: .1em; text-transform: uppercase; color: #64748b;
}

.meta-bar {
  display: flex; align-items: flex-start; justify-content: space-between;
  flex-wrap: wrap; gap: .5rem; margin-bottom: 1rem;
}
.meta-title {
  font-family: var(--font-barlow-condensed); font-size: 1.35rem; font-weight: 800;
  color: var(--abh-dark); text-transform: uppercase; letter-spacing: .04em; line-height: 1.1;
}
.meta-subtitle {
  font-size: .75rem; font-weight: 700; color: var(--abh-gold);
  text-transform: uppercase; letter-spacing: .06em; margin-top: 2px;
}
.meta-updated { font-size: .72rem; color: #94a3b8; white-space: nowrap; align-self: flex-end; }

.state-placeholder {
  display: flex; flex-direction: column; align-items: center;
  gap: .75rem; padding: 3rem 1rem; color: #94a3b8; text-align: center;
}
.state-placeholder svg { width: 36px; height: 36px; opacity: .4; }
.state-placeholder p { font-size: .875rem; margin: 0; }
</style>
