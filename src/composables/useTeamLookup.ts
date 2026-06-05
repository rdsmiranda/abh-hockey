import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { Zone, Team } from '@/types'

/**
 * Construye un mapa de equipos indexado por ID a partir de una zona,
 * buscando tanto en standings como en brackets de playoffs.
 *
 * El resultado es un computed: se recalcula automáticamente si la zona cambia.
 * Complejidad: O(n) una sola vez por zona, luego O(1) por lookup.
 *
 * @example
 * const lookup = useTeamLookup(computed(() => store.activeZone))
 * const team = lookup.value.get(42)  // Team | undefined
 */
export function useTeamLookup(
  zone: ComputedRef<Zone | null>,
): ComputedRef<Map<number, Team>> {
  return computed(() => {
    const map = new Map<number, Team>()
    const z = zone.value
    if (!z) return map

    // Desde standings
    for (const cat of z.categories) {
      for (const row of cat.standings) {
        map.set(row.team.id, row.team)
      }
    }

    // Desde brackets de playoffs (equipos que pueden no estar en standings)
    for (const playoff of z.playoffs ?? []) {
      for (const stage of playoff.stages) {
        for (const bracket of stage.brackets) {
          for (const key of ['team_1', 'team_2', 'team_3', 'team_4'] as const) {
            const team = bracket[key]
            if (team) map.set(team.id, team)
          }
        }
      }
    }

    return map
  })
}
