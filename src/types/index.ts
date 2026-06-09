// Re-export centralizado.
// Los componentes importan desde '@/types', no desde '@/types/championship'.

export type {
  // Equipo
  Team,
  // Resultados
  MatchResult,
  Shootouts,
  // Forma reciente
  RecentForm,
  // Posiciones regulares
  StandingRow,
  // Playoffs
  BracketFormat,
  PlayoffMatch,
  GroupStandingRow,
  PlayoffBracket,
  PlayoffStage,
  Playoffs,
  // Posiciones finales
  FinalStandingRow,
  // Vistas y categoría
  CategoryView,
  Category,
  // Zona y campeonato
  Zone,
  Championship,
  ChampionshipPayload,
  ChampionshipOption,
  // Fixture
  FixtureMatch,
  FixtureRound,
  FixturePayload,
  // Matches
  MatchCardData
} from './championship'

export type {
  DesignationIndex,
  DesignationData,
  Umpire,
  DesignationDay,
  DesignationMatch,
} from './designation'
