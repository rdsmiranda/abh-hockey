import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchChampionshipIndex,
  fetchChampionship,
} from '@/services/standings.service'
import type {
  ChampionshipOption,
  ChampionshipData,
  Zone,
  Category,
  CategoryView,
} from '@/types'
import type { CategoryPlayoff } from '@/types'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

export const useStandingsStore = defineStore('standings', () => {
  // ── Estado primitivo ──────────────────────────────────────────────────────
  const championshipOptions = ref<ChampionshipOption[]>([])
  const activeChampionship  = ref<ChampionshipData | null>(null)
  const selectedFile        = ref<string>('')
  const selectedZoneId      = ref<string>('')
  const activeCategoryId    = ref<string>('')
  const activeSubTab        = ref<'standings' | 'fixture' | 'playoffs' | 'final'>('standings')
  const status              = ref<LoadStatus>('idle')
  const errorMessage        = ref<string | null>(null)

  // ── Getters (computed) ────────────────────────────────────────────────────

  const activeZone = computed<Zone | null>(() =>
    activeChampionship.value?.zones.find(
      (z) => String(z.id) === selectedZoneId.value,
    ) ?? null,
  )

  const activeCategory = computed<Category | null>(() =>
    activeZone.value?.categories.find(
      (c) => String(c.id) === activeCategoryId.value,
    ) ?? null,
  )

  const activePlayoff = computed<CategoryPlayoff | null>(() => {
    if (!activeZone.value || !activeCategory.value) return null
    return (
      activeZone.value.playoffs?.find(
        (p) => p.category === activeCategory.value!.name,
      ) ?? null
    )
  })

  const hasPlayoffs = computed<boolean>(
    () => (activePlayoff.value?.stages?.length ?? 0) > 0,
  )

  /**
   * Vistas disponibles para la categoría activa.
   * Prioridad: campo `views` del JSON → inferencia desde los datos.
   * La página usa esto para mostrar/ocultar tabs del segmented control de Vista.
   */
  const availableViews = computed<CategoryView[]>(() => {
    const cat = activeCategory.value
    if (!cat) return ['standings']

    // Si el JSON declara explícitamente las vistas, usarlas directamente
    if (cat.views && cat.views.length > 0) return cat.views

    // Inferencia: standings siempre disponible si hay filas
    const views: CategoryView[] = []
    if (cat.standings.length > 0) views.push('standings')
    // playoffs si existe la sección con al menos un stage
    if (hasPlayoffs.value) views.push('playoffs')
    // fixture y final se agregarán cuando los JSON los incluyan
    return views.length > 0 ? views : ['standings']
  })

  /** Timestamp legible en es-AR para mostrar en el meta-bar */
  const generatedAt = computed<string | null>(() => {
    const raw = activeChampionship.value?.generated_at
    if (!raw) return null
    const dt = new Date(raw)
    return (
      dt.toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }) +
      ' ' +
      dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    )
  })

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Carga el listado de campeonatos y luego el primero automáticamente.
   * Guard: no hace nada si ya hay opciones cargadas.
   */
  async function loadIndex(): Promise<void> {
    if (championshipOptions.value.length > 0) return
    status.value = 'loading'
    errorMessage.value = null
    try {
      const options = await fetchChampionshipIndex()
      championshipOptions.value = options
      if (options.length > 0 && options[0]) {
        await loadChampionship(options[0].file)
      } else {
        status.value = 'success'
      }
    } catch {
      status.value = 'error'
      errorMessage.value = 'No se pudo cargar el listado de campeonatos.'
    }
  }

  /**
   * Descarga y activa un campeonato por nombre de archivo.
   * Guard: si el archivo ya está activo no hace un segundo fetch.
   */
  async function loadChampionship(file: string): Promise<void> {
    if (file === selectedFile.value && activeChampionship.value !== null) return
    status.value = 'loading'
    errorMessage.value = null
    try {
      const data = await fetchChampionship(file)
      activeChampionship.value = data
      selectedFile.value = file
      _resetZoneSelection(data)
      status.value = 'success'
    } catch {
      status.value = 'error'
      errorMessage.value = 'No se pudo cargar el campeonato seleccionado.'
    }
  }

  function setZone(zoneId: string): void {
    selectedZoneId.value = zoneId
    activeSubTab.value = 'standings'
    const zone = activeChampionship.value?.zones.find(
      (z) => String(z.id) === zoneId,
    )
    activeCategoryId.value =
      zone?.categories[0] ? String(zone.categories[0].id) : ''
  }

  function setCategory(catId: string): void {
    activeCategoryId.value = catId
    // Resetear a la primera vista disponible para esta categoría
    activeSubTab.value = 'standings'
  }

  function setSubTab(tab: CategoryView): void {
    // Solo cambiar si la vista está disponible para la categoría activa
    if (availableViews.value.includes(tab)) {
      activeSubTab.value = tab
    }
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  function _resetZoneSelection(data: ChampionshipData): void {
    const firstZone = data.zones[0]
    if (firstZone) {
      selectedZoneId.value = String(firstZone.id)
      activeCategoryId.value = firstZone.categories[0]
        ? String(firstZone.categories[0].id)
        : ''
    } else {
      selectedZoneId.value = ''
      activeCategoryId.value = ''
    }
    activeSubTab.value = 'standings'
  }

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    // State
    championshipOptions,
    activeChampionship,
    selectedFile,
    selectedZoneId,
    activeCategoryId,
    activeSubTab,
    status,
    errorMessage,
    // Getters
    activeZone,
    activeCategory,
    activePlayoff,
    hasPlayoffs,
    availableViews,
    generatedAt,
    // Actions
    loadIndex,
    loadChampionship,
    setZone,
    setCategory,
    setSubTab,
  }
})
