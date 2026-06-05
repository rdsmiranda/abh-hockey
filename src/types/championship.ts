// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Campeonatos y Posiciones
// Fuente: data/index.json  +  data/<championship-file>.json
// ─────────────────────────────────────────────────────────────────────────────

/** Entrada del listado de campeonatos disponibles (data/index.json) */
export interface ChampionshipOption {
  /** Nombre del archivo JSON dentro de data/, ej: "torneo-apertura-2025.json" */
  file: string
  /** Etiqueta legible para el selector, ej: "Torneo Apertura 2025" */
  label: string
}

/** Metadatos del campeonato */
export interface ChampionshipMeta {
  name: string
  year: number | string
}

/** Raíz del JSON de un campeonato completo */
export interface ChampionshipData {
  championship: ChampionshipMeta
  /** ISO 8601, ej: "2025-06-01T18:30:00-03:00" */
  generated_at: string
  zones: Zone[]
}

/** Zona dentro de un campeonato (ej: "Zona Norte", "Primera División") */
export interface Zone {
  id: number | string
  name: string
  categories: Category[]
  /** Puede no existir si la zona no tiene fase de playoffs */
  playoffs?: CategoryPlayoff[]
}

/** Categoría dentro de una zona (ej: "Primera", "Reserva", "Sub-16") */
export interface Category {
  id: number | string
  name: string
  standings: StandingRow[]
}

/** Equipo — se reutiliza en posiciones, playoffs y designaciones */
export interface Team {
  id: number
  name: string
  short_name?: string
  /** URL relativa o absoluta del logo, ej: "assets/logos/villa-mitre.png" */
  logo?: string
}

/** Fila de la tabla de posiciones */
export interface StandingRow {
  position: number
  team: Team
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  /** Últimos N partidos jugados, orden cronológico (primero el más antiguo) */
  recent_form: RecentFormEntry[]
}

/** Un partido individual en la racha de forma reciente */
export interface RecentFormEntry {
  result: MatchResult
  /** Marcador del partido, ej: "3-1" */
  score: string
  /** Nombre del rival */
  opponent: string
  opponent_logo?: string
  was_home: boolean
  /** Formato "YYYY-MM-DD" */
  date: string
  bonus_point?: boolean
  /** Solo presente si el partido se definió por penales */
  shootouts?: { score: string }
}

export type MatchResult = 'W' | 'D' | 'L'
