// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Designaciones de árbitros
// Fuente: data/designations-index.json  +  data/<designations-file>.json
// ─────────────────────────────────────────────────────────────────────────────

import type { Team } from './championship'

/** data/designations-index.json — puntero al archivo activo */
export interface DesignationIndex {
  /** Nombre del archivo de designaciones activo, ej: "designaciones-2025-06.json" */
  file: string
}

/** Raíz del JSON de designaciones */
export interface DesignationData {
  /** Formato "YYYY-MM-DD" — inicio del período */
  from: string
  /** Formato "YYYY-MM-DD" — fin del período */
  to: string
  /** ISO 8601 */
  generated_at: string
  /** Lista completa de árbitros para el combobox de búsqueda */
  umpires: Umpire[]
  days: DesignationDay[]
}

/** Árbitro registrado en el sistema */
export interface Umpire {
  id: number
  name: string
}

/** Todos los partidos de una fecha específica */
export interface DesignationDay {
  /** Formato "YYYY-MM-DD" */
  date: string
  matches: DesignationMatch[]
}

/** Partido individual con designación de árbitros */
export interface DesignationMatch {
  /** Hora del partido, ej: "10:00" */
  time?: string
  /** Nombre de la categoría, ej: "Primera", "Reserva" */
  category?: string
  /** Nombre de la jornada/fecha, ej: "Fecha 8" */
  round?: string
  /** Nombre de la zona, ej: "Zona Norte" */
  zone?: string
  /** Cancha donde se juega */
  pitch?: string
  /** Importe de la designación. null = sin importe asignado */
  fee?: number | null
  home_team?: Team
  away_team?: Team
  /** Nombre del primer árbitro. Ausente o vacío = a designar */
  umpire_1?: string
  /** Nombre del segundo árbitro. Ausente o vacío = a designar */
  umpire_2?: string
}
