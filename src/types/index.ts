// Re-export centralizado: los componentes importan desde '@/types', no desde
// '@/types/championship' directamente. Si se reorganizan los archivos de tipos,
// solo cambia este index, no todos los componentes.

export type {
  ChampionshipOption,
  ChampionshipMeta,
  ChampionshipData,
  Zone,
  Category,
  Team,
  StandingRow,
  RecentFormEntry,
  MatchResult,
} from './championship'

export type {
  CategoryPlayoff,
  PlayoffStage,
  BracketFormat,
  Bracket,
  BracketMatch,
  GroupStandingRow,
} from './playoff'

export type {
  DesignationIndex,
  DesignationData,
  Umpire,
  DesignationDay,
  DesignationMatch,
} from './designation'
