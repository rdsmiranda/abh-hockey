// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Playoffs
// Anidado dentro de Zone.playoffs[] en el JSON del campeonato
// ─────────────────────────────────────────────────────────────────────────────

import type { Team } from './championship'

/**
 * Playoffs de una categoría específica dentro de una zona.
 * El campo `category` debe coincidir con Category.name para relacionarlos.
 */
export interface CategoryPlayoff {
  /** Debe coincidir con Category.name, ej: "Primera" */
  category: string
  stages: PlayoffStage[]
}

/** Fase de playoffs, ej: "Cuartos de final", "Semifinal", "Final" */
export interface PlayoffStage {
  label: string
  brackets: Bracket[]
}

/**
 * Formato del enfrentamiento. Determina qué componente Vue se usa:
 * - single_elimination → KOBracket.vue
 * - home_and_away      → HomeAndAwayBracket.vue
 * - triangular         → GroupBracket.vue
 * - round_robin_4      → GroupBracket.vue
 */
export type BracketFormat =
  | 'single_elimination'
  | 'home_and_away'
  | 'triangular'
  | 'round_robin_4'

/** Un enfrentamiento o grupo dentro de una fase */
export interface Bracket {
  format: BracketFormat
  /** Número de llave/serie para mostrar en el encabezado */
  matchup_number?: number
  /** Equipos participantes. Pueden ser null si "por definir" */
  team_1?: Team
  team_2?: Team
  /** Solo en formatos de grupo (triangular / round_robin_4) */
  team_3?: Team
  team_4?: Team
  is_completed: boolean
  /** ID del equipo ganador, presente cuando is_completed = true */
  winner_id?: number
  /** Para home_and_away: cantidad de victorias necesarias para ganar la serie */
  series_wins_required?: number
  matches: BracketMatch[]
  /** Solo en formatos de grupo */
  group_standings?: GroupStandingRow[]
}

/** Partido individual dentro de un bracket */
export interface BracketMatch {
  /** Número de partido dentro de la serie (para home_and_away) */
  game?: number
  /** Formato "YYYY-MM-DD" */
  date?: string
  home_team_id: number
  away_team_id: number
  played: boolean
  goals_home?: number
  goals_away?: number
  has_shootouts?: boolean
  shootouts_home?: number
  shootouts_away?: number
}

/** Fila en la tabla de posiciones de un grupo (triangular / round_robin_4) */
export interface GroupStandingRow {
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}
