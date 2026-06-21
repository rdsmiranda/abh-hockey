// ─────────────────────────────────────────────────────────────────────────────
// Dominio: Campeonatos, Posiciones, Playoffs, Fixture
// Fuente: data/<championship-file>.json  +  data/<fixture-file>.json
// ─────────────────────────────────────────────────────────────────────────────

// ── Equipo ────────────────────────────────────────────────────────────────────
// Vive UNA SOLA VEZ en ChampionshipPayload.teams (Record<string, Team>).
// En todos los demás objetos se usa solo el ID numérico.
export interface Team {
  id: number
  name: string
  short_name: string
  logo: string | null
}

// ── Resultados de penales ─────────────────────────────────────────────────────
export interface Shootouts {
  for: number
  against: number
  won: boolean
  score: string
}

// ── Forma reciente ────────────────────────────────────────────────────────────
export type MatchResult = 'W' | 'D' | 'L'

export interface RecentForm {
  result: MatchResult
  score: string
  opponent_id: number
  was_home: boolean
  date: string
  bonus_point: boolean
  shootouts: Shootouts | null
}

// ── Posiciones (fase regular) ─────────────────────────────────────────────────
export interface StandingRow {
  position: number
  team_id: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  recent_form: RecentForm[]
}


// ── Playoffs ──────────────────────────────────────────────────────────────────
export type BracketFormat =
  | 'single_elimination'
  | 'home_and_away'
  | 'triangular'
  | 'round_robin_4'

export interface PlayoffMatch {
  game: number | null
  date: string | null
  time: string | null
  home_team_id: number
  away_team_id: number
  pitch: string | null
  played: boolean
  goals_home: number | null
  goals_away: number | null
  has_shootouts: boolean
  shootouts_home: number | null
  shootouts_away: number | null
}

export interface GroupStandingRow {
  position: number
  team_id: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
}

export interface PlayoffBracket {
  id: number
  format: BracketFormat
  matchup_number: number
  series_wins_required: number | null
  team_1_id: number
  team_2_id: number
  team_1_seed: number | null
  team_2_seed: number | null
  // Formatos de grupo agregan team_3 y team_4
  team_3_id?: number
  team_4_id?: number
  is_completed: boolean
  winner_id: number | null
  team_1_wins: number | null
  team_2_wins: number | null
  matches: PlayoffMatch[]
  group_standings?: StandingRow[]
}

export interface PlayoffStage {
  id: string
  label: string
  order: number
  brackets: PlayoffBracket[]
}

export interface Playoffs {
  stages: PlayoffStage[]
}

// ── Posiciones finales (post-playoffs) ────────────────────────────────────────
export interface FinalStandingRow {
  position: number
  team_id: number
  note: string | null
}

// ── Vistas disponibles por categoría ─────────────────────────────────────────
// El campo `views` en Category es opcional: si no viene en el JSON,
// el store infiere las vistas desde los datos presentes.
export type CategoryView = 'standings' | 'fixture' | 'playoffs' | 'final'

// ── Categoría ─────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  standings: StandingRow[]
  playoffs: Playoffs | null
  final_standings: FinalStandingRow[] | null
  views?: CategoryView[]
}

// ── Zona ──────────────────────────────────────────────────────────────────────
export interface Zone {
  id: number
  name: string
  categories: Category[]
}

// ── Metadatos del campeonato ──────────────────────────────────────────────────
export interface Championship {
  id: number
  name: string
  year: number
  label: string
  start_date: string
  end_date: string
}

// ── Payload raíz del JSON principal ──────────────────────────────────────────
export interface ChampionshipPayload {
  championship: Championship
  generated_at: string
  /** Nombre del archivo de fixture, sin path. Ej: "torneo-apertura-2025-fixture.json" */
  fixture_file: string
  /** Diccionario de equipos. Clave: string del ID numérico ("1", "2", ...) */
  teams: Record<string, Team>
  zones: Zone[]
}

// ── Index de campeonatos (data/index.json) ────────────────────────────────────
export interface ChampionshipOption {
  file: string
  label: string
}

// ── Fixture (archivo separado, carga lazy) ────────────────────────────────────
export interface FixtureMatch {
  id: number
  zone_id: number
  category_id: number
  date: string
  time: string | null
  home_team_id: number
  away_team_id: number
  pitch: string | null
  played: boolean
  goals_home: number | null
  goals_away: number | null
  has_shootouts: boolean
  shootouts_home: number | null
  shootouts_away: number | null
}

export interface FixtureRound {
  id: number
  label: string
  date_from: string
  date_to: string
  matches: FixtureMatch[]
}

// ── MatchCard (componente compartido) ────────────────────────────────────────
// Subconjunto mínimo que necesita el componente visual.
// Tanto FixtureMatch como PlayoffMatch se mapean a este tipo antes de renderizar.
export interface MatchCardData {
  home_team_id: number
  away_team_id: number
  date: string | null
  time: string | null
  pitch: string | null       // No viene en playoffs → null
  played: boolean
  goals_home: number | null
  goals_away: number | null
  has_shootouts: boolean
  shootouts_home: number | null
  shootouts_away: number | null
}

export interface FixturePayload {
  championship_id: number
  generated_at: string
  rounds: FixtureRound[]
}
