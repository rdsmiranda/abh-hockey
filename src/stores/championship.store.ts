import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  fetchChampionshipIndex,
  fetchChampionship,
  fetchFixture,
} from '@/services/standings.service'
import type {
  ChampionshipOption,
  ChampionshipPayload,
  Team,
  Zone,
  Category,
  CategoryView,
  Playoffs,
  FinalStandingRow,
  FixturePayload,
} from '@/types'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

export const useChampionshipStore = defineStore('championship', () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  const championshipOptions = ref<ChampionshipOption[]>([])
  const data                = ref<ChampionshipPayload | null>(null)
  const fixture             = ref<FixturePayload | null>(null)
  const selectedFile        = ref<string>('')
  const selectedZoneId      = ref<string>('')
  const activeCategoryId    = ref<string>('')
  const activeSubTab        = ref<CategoryView>('standings')
  const status              = ref<LoadStatus>('idle')
  const fixtureStatus       = ref<LoadStatus>('idle')
  const errorMessage        = ref<string | null>(null)

  // ── Getters: equipos ──────────────────────────────────────────────────────

  /** Diccionario de equipos. O(1) por acceso. */
  const teams = computed<Record<string, Team>>(() => data.value?.teams ?? {})

  /** Resolver un equipo por ID numérico. */
  function team(id: number): Team | undefined {
    return data.value?.teams[String(id)]
  }

  // ── Getters: navegación ───────────────────────────────────────────────────

  const activeZone = computed<Zone | null>(() =>
    data.value?.zones.find((z) => String(z.id) === selectedZoneId.value) ?? null,
  )

  const activeCategory = computed<Category | null>(() =>
    activeZone.value?.categories.find(
      (c) => String(c.id) === activeCategoryId.value,
    ) ?? null,
  )

  const activePlayoffs = computed<Playoffs | null>(
    () => activeCategory.value?.playoffs ?? null,
  )

  const activeFinalStandings = computed<FinalStandingRow[] | null>(
    () => activeCategory.value?.final_standings ?? null,
  )

  const hasPlayoffs = computed<boolean>(
    () => (activePlayoffs.value?.stages?.length ?? 0) > 0,
  )

  const hasFinalStandings = computed<boolean>(
    () => (activeFinalStandings.value?.length ?? 0) > 0,
  )

  /**
   * Vistas disponibles para la categoría activa.
   * Prioridad: campo `views` del JSON → inferencia desde los datos.
   */
  const availableViews = computed<CategoryView[]>(() => {
    const cat = activeCategory.value
    if (!cat) return ['standings']

    if (cat.views && cat.views.length > 0) return cat.views

    const views: CategoryView[] = []
    if (cat.standings.length > 0)   views.push('standings')
    if (hasPlayoffs.value)           views.push('playoffs')
    if (hasFinalStandings.value)     views.push('final')
    // 'fixture' se agrega cuando el fixture_file esté presente y
    // haya partidos de esta zona+categoría — se delega al futuro
    return views.length > 0 ? views : ['standings']
  })

  /** Timestamp legible en es-AR. */
  const generatedAt = computed<string | null>(() => {
    const raw = data.value?.generated_at
    if (!raw) return null
    const dt = new Date(raw)
    return (
      dt.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
      ' ' +
      dt.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    )
  })

  // ── Actions ───────────────────────────────────────────────────────────────

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

  async function loadChampionship(file: string): Promise<void> {
    if (file === selectedFile.value && data.value !== null) return
    status.value = 'loading'
    errorMessage.value = null
    // Resetear fixture al cambiar campeonato
    fixture.value = null
    fixtureStatus.value = 'idle'
    try {
      const payload = await fetchChampionship(file)
      data.value = payload
      selectedFile.value = file
      _resetZoneSelection(payload)
      status.value = 'success'
    } catch {
      status.value = 'error'
      errorMessage.value = 'No se pudo cargar el campeonato seleccionado.'
    }
  }

  /**
   * Carga el fixture de forma lazy.
   * Solo se ejecuta cuando el usuario navega a la vista de fixture.
   * Guard: no recarga si ya está cargado o en progreso.
   */
  async function loadFixture(): Promise<void> {
    const fixtureFile = data.value?.fixture_file
    if (!fixtureFile || fixture.value || fixtureStatus.value === 'loading') return
    fixtureStatus.value = 'loading'
    try {
      fixture.value = await fetchFixture(fixtureFile)
      fixtureStatus.value = 'success'
    } catch {
      fixtureStatus.value = 'error'
    }
  }

  function setZone(zoneId: string): void {
    selectedZoneId.value = zoneId
    activeSubTab.value = 'standings'
    const zone = data.value?.zones.find((z) => String(z.id) === zoneId)
    activeCategoryId.value = zone?.categories[0] ? String(zone.categories[0].id) : ''
  }

  function setCategory(catId: string): void {
    activeCategoryId.value = catId
    activeSubTab.value = 'standings'
  }

  function setSubTab(tab: CategoryView): void {
    if (availableViews.value.includes(tab)) {
      activeSubTab.value = tab
    }
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  function _resetZoneSelection(payload: ChampionshipPayload): void {
    const firstZone = payload.zones[0]
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
    data,
    fixture,
    selectedFile,
    selectedZoneId,
    activeCategoryId,
    activeSubTab,
    status,
    fixtureStatus,
    errorMessage,
    // Getters: equipos
    teams,
    team,
    // Getters: navegación
    activeZone,
    activeCategory,
    activePlayoffs,
    activeFinalStandings,
    hasPlayoffs,
    hasFinalStandings,
    availableViews,
    generatedAt,
    // Actions
    loadIndex,
    loadChampionship,
    loadFixture,
    setZone,
    setCategory,
    setSubTab,
  }
})
