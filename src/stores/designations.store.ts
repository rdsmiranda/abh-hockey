import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchDesignations } from '@/services/designations.service'
import type { DesignationData, DesignationDay, DesignationMatch, Umpire } from '@/types'
import type { LoadStatus } from './standings.store'

export const useDesignationsStore = defineStore('designations', () => {
  // ── Estado ────────────────────────────────────────────────────────────────
  const data            = ref<DesignationData | null>(null)
  const selectedUmpire  = ref<Umpire | null>(null)
  const selectedZone    = ref<string | null>(null)   // null = "Todas"
  const status          = ref<LoadStatus>('idle')
  const errorMessage    = ref<string | null>(null)

  // ── Getters ───────────────────────────────────────────────────────────────

  /** Lista de árbitros para el combobox — vacía si no hay datos */
  const umpires = computed<Umpire[]>(() => data.value?.umpires ?? [])

  /**
   * Zonas únicas en orden de primera aparición.
   * Se usa para construir los botones de filtro de zona.
   */
  const availableZones = computed<string[]>(() => {
    const seen = new Set<string>()
    const result: string[] = []
    for (const day of data.value?.days ?? []) {
      for (const match of day.matches) {
        const z = match.zone ?? '—'
        if (!seen.has(z)) {
          seen.add(z)
          result.push(z)
        }
      }
    }
    return result
  })

  /** true si hay más de una zona — decide si se muestra el filtro */
  const hasMultipleZones = computed(() => availableZones.value.length > 1)

  /**
   * Días filtrados por zona y árbitro seleccionados.
   * Cada día solo incluye los partidos que pasan ambos filtros.
   * Los días vacíos (sin partidos tras filtrar) se omiten.
   */
  const filteredDays = computed<DesignationDay[]>(() => {
    if (!data.value) return []

    const umpireName = selectedUmpire.value?.name.toLowerCase() ?? null
    const zone       = selectedZone.value

    return data.value.days
      .map((day) => {
        const matches = day.matches.filter((m) => {
          const zoneOk = zone === null || (m.zone ?? '—') === zone
          const umpireOk =
            umpireName === null ||
            m.umpire_1?.toLowerCase().includes(umpireName) ||
            m.umpire_2?.toLowerCase().includes(umpireName)
          return zoneOk && umpireOk
        })
        return { ...day, matches }
      })
      .filter((day) => day.matches.length > 0)
  })

  /** Período del encabezado en formato legible */
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

  /** Carga las designaciones. Guard: no recarga si ya hay datos. */
  async function load(): Promise<void> {
    if (data.value !== null) return
    status.value = 'loading'
    errorMessage.value = null
    try {
      data.value = await fetchDesignations()
      status.value = 'success'
    } catch {
      status.value = 'error'
      errorMessage.value = 'No se encontraron designaciones publicadas.'
    }
  }

  function selectUmpire(umpire: Umpire | null): void {
    selectedUmpire.value = umpire
  }

  function selectZone(zone: string | null): void {
    selectedZone.value = zone
  }

  // ── Helpers privados ──────────────────────────────────────────────────────

  const DAYS_ES   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']
  const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

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
    // Getters
    umpires,
    availableZones,
    hasMultipleZones,
    filteredDays,
    periodLabel,
    generatedAt,
    // Actions
    load,
    selectUmpire,
    selectZone,
  }
})
