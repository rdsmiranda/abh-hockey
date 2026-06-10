import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDesignations } from '@/services/designations.service'
import type { DesignationData, DesignationDay, DesignationMatch, Umpire, Team } from '@/types'
import type { LoadStatus } from './championship.store'

export const useDesignationsStore = defineStore('designations', () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  const data           = ref<DesignationData | null>(null)
  const selectedUmpire = ref<Umpire | null>(null)
  const selectedZone   = ref<string | null>(null)   // null = "Todas"
  const status         = ref<LoadStatus>('idle')
  const errorMessage   = ref<string | null>(null)

  // ── Getters: catálogos ────────────────────────────────────────────────────

  /** Lista de árbitros para el combobox — vacía si no hay datos. */
  const umpires = computed<Umpire[]>(() => Object.values(data.value?.umpires ?? {}))

  /**
   * Resolver un árbitro por ID. Mismo patrón que team() en championship.store.
   * Robusto a IDs numéricos o string.
   */
  function umpire(id: number | string | null | undefined): Umpire | undefined {
    if (id == null) return undefined
    return data.value?.umpires[String(Number(id))]
  }

  /**
   * Resolver un equipo por ID.
   * Mismo patrón que team() en championship.store.
   */
  function team(id: number | string | null | undefined): Team | undefined {
    if (id == null) return undefined
    return data.value?.teams[String(Number(id))]
  }

  // ── Getters: filtros ──────────────────────────────────────────────────────

  /**
   * Zonas disponibles en orden de exportación.
   * El comando Laravel ya las incluye en el JSON, no hace falta recorrer partidos.
   */
  const availableZones = computed<string[]>(() => data.value?.zones ?? [])

  /** true si hay más de una zona — decide si se muestra el filtro. */
  const hasMultipleZones = computed(() => availableZones.value.length > 1)

  /**
   * Días filtrados por zona y árbitro seleccionados.
   * El filtro de árbitro ahora compara IDs (O(1)) en lugar de strings.
   * Los días vacíos tras filtrar se omiten.
   */
  const filteredDays = computed<DesignationDay[]>(() => {
    if (!data.value) return []

    const uid  = selectedUmpire.value?.id ?? null
    const zone = selectedZone.value

    return data.value.days
      .map((day) => {
        const matches = day.matches.filter((m: DesignationMatch) => {
          const zoneOk   = zone === null || (m.zone ?? '—') === zone
          const umpireOk = uid === null || m.umpire_1_id === uid || m.umpire_2_id === uid
          return zoneOk && umpireOk
        })
        return { ...day, matches }
      })
      .filter((day) => day.matches.length > 0)
  })

  // ── Getters: metadatos ────────────────────────────────────────────────────

  /** Período del encabezado en formato legible. */
  const periodLabel = computed<string>(() => {
    if (!data.value?.from) return ''
    const from = _formatDateLong(data.value.from)
    const to   = _formatDateLong(data.value.to)
    return from === to ? from : `${from} — ${to}`
  })

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

  async function load(): Promise<void> {
    if (data.value !== null) return
    status.value = 'loading'
    errorMessage.value = null
    try {
      const payload = await fetchDesignations()

      // Normalizar claves de los catálogos a string para lookup consistente.
      // Mismo patrón que championship.store normaliza `teams`.
      const normalizedUmpires: Record<string, Umpire> = {}
      for (const [k, v] of Object.entries(payload.umpires)) {
        normalizedUmpires[String(Number(k))] = { ...v, id: Number(v.id) }
      }

      const normalizedTeams: Record<string, Team> = {}
      for (const [k, v] of Object.entries(payload.teams)) {
        normalizedTeams[String(Number(k))] = { ...v, id: Number(v.id) }
      }

      data.value = { ...payload, umpires: normalizedUmpires, teams: normalizedTeams }
      status.value = 'success'
    } catch {
      status.value = 'error'
      errorMessage.value = 'No se encontraron designaciones publicadas.'
    }
  }

  function selectUmpire(u: Umpire | null): void {
    selectedUmpire.value = u
  }

  function selectZone(zone: string | null): void {
    selectedZone.value = zone
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  const DAYS_ES   = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const MONTHS_ES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                     'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

  function _formatDateLong(dateStr: string): string {
    const [y, mo, d] = dateStr.split('-').map(Number)
    const dt = new Date(y!, mo! - 1, d)
    return `${DAYS_ES[dt.getDay()]} ${d} de ${MONTHS_ES[mo! - 1]}`
  }

  // ── Expose ────────────────────────────────────────────────────────────────
  return {
    // State
    data,
    selectedUmpire,
    selectedZone,
    status,
    errorMessage,
    // Getters: catálogos
    umpires,
    umpire,
    team,
    // Getters: filtros
    availableZones,
    hasMultipleZones,
    filteredDays,
    // Getters: metadatos
    periodLabel,
    generatedAt,
    // Actions
    load,
    selectUmpire,
    selectZone,
  }
})