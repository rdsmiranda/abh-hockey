import { computed, isRef, type ComputedRef, type Ref } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import type { Team } from '@/types'

// Acepta number, string, o cualquier Ref/ComputedRef de ambos
type MaybeRef<T> = T | Ref<T> | ComputedRef<T>

function unwrap(id: MaybeRef<number | string>): number {
  const raw = isRef(id) ? id.value : id
  return Number(raw)
}

/**
 * Resuelve un equipo reactivo por ID fijo.
 */
export function useTeam(teamId: number): ComputedRef<Team | undefined> {
  const store = useChampionshipStore()
  return computed(() => store.team(teamId))
}

/**
 * Resolver de equipos para componentes que necesitan lookups ad-hoc
 * (ej: brackets donde los IDs vienen de props o computed).
 *
 * Acepta tanto number como ComputedRef<number> para evitar el problema
 * de que Vue no hace auto-unwrap cuando el ref se pasa como argumento JS.
 */
export function useTeamResolver() {
  const store = useChampionshipStore()
  return {
    resolve: (id: MaybeRef<number | string>): Team | undefined =>
      store.team(unwrap(id)),

    initials: (id: MaybeRef<number | string>, fallback = '?'): string => {
      const t = store.team(unwrap(id))
      return (t?.short_name ?? t?.name ?? fallback).slice(0, 2).toUpperCase()
    },
  }
}
