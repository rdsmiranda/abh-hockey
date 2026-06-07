import { computed, type ComputedRef } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import type { Team } from '@/types'

/**
 * Resuelve un equipo por ID desde el diccionario del store.
 * O(1) — el store indexa equipos en Record<string, Team>.
 *
 * @example
 * const team = useTeam(row.team_id)
 * // En template: team.value?.name, team.value?.logo
 */
export function useTeam(teamId: number): ComputedRef<Team | undefined> {
  const store = useChampionshipStore()
  return computed(() => store.team(teamId))
}

/**
 * Resuelve múltiples equipos de una vez.
 * Útil para componentes que necesitan varios equipos fijos (ej: brackets).
 *
 * @example
 * const { resolve } = useTeamResolver()
 * resolve(bracket.team_1_id)?.name
 */
export function useTeamResolver() {
  const store = useChampionshipStore()
  return {
    resolve: (id: number): Team | undefined => store.team(id),
    initials: (id: number, fallback = '?'): string => {
      const t = store.team(id)
      return (t?.short_name ?? t?.name ?? fallback).slice(0, 2).toUpperCase()
    },
  }
}
