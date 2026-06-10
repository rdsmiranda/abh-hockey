// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Designaciones de árbitros
// Fuente: data/designaciones.json  (generado por arbix:export:designations-v2)
// ─────────────────────────────────────────────────────────────────────────────

/** Raíz del JSON de designaciones */
export interface DesignationData {
  /** ISO 8601 */
  generated_at: string
  /** Formato "YYYY-MM-DD" — inicio del período */
  from: string
  /** Formato "YYYY-MM-DD" — fin del período */
  to: string
  /**
   * Catálogo de árbitros activos, indexado por ID (string).
   * Permite lookup O(1): data.umpires[id]
   */
  umpires: Record<string, Umpire>
  /**
   * Catálogo de equipos presentes en el período, indexado por ID (string).
   * Permite lookup O(1): data.teams[id]
   */
  teams: Record<string, DesignationTeam>
  /** Zonas únicas en orden de exportación — alimenta el filtro de zona. */
  zones: string[]
  days: DesignationDay[]
}

/** Árbitro registrado en el sistema */
export interface Umpire {
  id: number
  name: string
}

/**
 * Equipo dentro del contexto de designaciones.
 * Definido localmente para no acoplar al tipo Team de championship,
 * que puede evolucionar de forma independiente.
 */
export interface DesignationTeam {
  id: number
  name: string
  short_name: string
  logo: string
}

/** Todos los partidos de una fecha específica */
export interface DesignationDay {
  /** Formato "YYYY-MM-DD" */
  date: string
  matches: DesignationMatch[]
}

/** Partido individual con designación de árbitros */
export interface DesignationMatch {
  id: number
  /** Hora del partido, ej: "10:00" */
  time?: string
  date: string
  /** Nombre de la categoría, ej: "Primera", "Sub16" */
  category?: string
  /** Nombre de la jornada/ronda, ej: "Final", "Triangular" */
  round?: string
  /** Nombre de la zona, ej: "Oro", "Plata" */
  zone?: string
  /** Cancha donde se juega */
  pitch?: string
  /** Importe total de la designación (suma de ambos árbitros). null = sin importe */
  fee?: number | null
  /** ID del equipo local — resolver con data.teams[home_team_id] */
  home_team_id?: number | null
  /** ID del equipo visitante — resolver con data.teams[away_team_id] */
  away_team_id?: number | null
  /** ID del primer árbitro — null si no hay designación */
  umpire_1_id?: number | null
  /** ID del segundo árbitro — null si no hay designación */
  umpire_2_id?: number | null
  supervisor?: null
}