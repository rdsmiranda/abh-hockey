import { fetchJson, HttpError } from './http'
import type { ChampionshipOption, ChampionshipData } from '@/types'

/**
 * Descarga el listado de campeonatos disponibles.
 * Fuente: data/index.json
 */
export async function fetchChampionshipIndex(): Promise<ChampionshipOption[]> {
  const data = await fetchJson<unknown>('index.json')

  // Validación de contrato mínima: detecta cambios en el JSON antes de que
  // lleguen a los componentes como datos incorrectos sin error claro.
  if (!Array.isArray(data)) {
    throw new Error(
      'index.json no tiene el formato esperado (se esperaba un array)',
    )
  }

  return data as ChampionshipOption[]
}

/**
 * Descarga los datos completos de un campeonato.
 *
 * @param file - Nombre del archivo, ej: "torneo-apertura-2025.json"
 *               Debe provenir del index, nunca de input del usuario.
 */
export async function fetchChampionship(
  file: string,
): Promise<ChampionshipData> {
  // Guard básico: evitar path traversal aunque los datos vengan del propio index
  if (!file.endsWith('.json') || file.includes('/') || file.includes('..')) {
    throw new Error(`Nombre de archivo inválido: "${file}"`)
  }

  return fetchJson<ChampionshipData>(file)
}

// Re-export para que los stores solo importen desde services/
export { HttpError }
