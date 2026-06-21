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

  /** Resolver un equipo por ID numérico o string — robusto a ambos. */
  function team(id: number | string): Team | undefined {
    return data.value?.teams[String(Number(id))]
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

    // Si el JSON declara explícitamente las vistas, usarlas directamente
    if (cat.views && cat.views.length > 0) return cat.views

    // Inferencia desde los datos presentes
    const views: CategoryView[] = []
    if (cat.standings.length > 0) views.push('standings')
    // Fixture disponible si el championship tiene fixture_file declarado
    if (data.value?.fixture_file)  views.push('fixture')
    if (hasPlayoffs.value)          views.push('playoffs')
    if (hasFinalStandings.value)    views.push('final')
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

  /**
     * Título del campeonato para mostrar en UI.
     * Si `label` viene null/vacío, muestra solo "Nombre Año".
     * Si tiene contenido, agrega `"Label"` entre comillas.
     */
  const championshipTitle = computed<string>(() => {
    const champ = data.value?.championship
    if (!champ) return ''
    const base = `${champ.name} ${champ.year}`
    const label = champ.label?.trim()
    return label ? `${base} "${label}"` : base
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
    } catch (err) {
      console.error('[championship.store] loadIndex:', err)
      status.value = 'error'
      errorMessage.value = 'No se pudo cargar el listado de campeonatos.'
    }
  }

  async function loadChampionship(file: string): Promise<void> {
    if (file === selectedFile.value && data.value !== null) return
    status.value = 'loading'
    errorMessage.value = null
    fixture.value = null
    fixtureStatus.value = 'idle'
    try {
      const payload = await fetchChampionship(file)
      // Normalizar claves del diccionario teams a string para lookup consistente
      // y asegurar que todos los IDs sean numbers (Laravel puede serializar como string)
      const normalizedTeams: Record<string, Team> = {}
      for (const [k, v] of Object.entries(payload.teams)) {
        normalizedTeams[String(Number(k))] = { ...v, id: Number(v.id) }
      }
      data.value = { ...payload, teams: normalizedTeams }
      selectedFile.value = file
      _resetZoneSelection(data.value)
      status.value = 'success'
    } catch (err) {
      console.error('[championship.store] loadChampionship:', err)
      status.value = 'error'
      errorMessage.value = err instanceof Error
        ? `Error al cargar el campeonato: ${err.message}`
        : 'No se pudo cargar el campeonato seleccionado.'
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
    championshipTitle,
    // Actions
    loadIndex,
    loadChampionship,
    loadFixture,
    setZone,
    setCategory,
    setSubTab,
  }
})
