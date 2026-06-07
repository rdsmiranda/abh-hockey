import { fetchJson, HttpError } from './http'
import type { ChampionshipOption, ChampionshipPayload, FixturePayload } from '@/types'

export async function fetchChampionshipIndex(): Promise<ChampionshipOption[]> {
  const data = await fetchJson<unknown>('index.json')
  if (!Array.isArray(data)) {
    throw new Error('index.json no tiene el formato esperado (se esperaba un array)')
  }
  return data as ChampionshipOption[]
}

export async function fetchChampionship(file: string): Promise<ChampionshipPayload> {
  if (!file.endsWith('.json') || file.includes('/') || file.includes('..')) {
    throw new Error(`Nombre de archivo inválido: "${file}"`)
  }
  return fetchJson<ChampionshipPayload>(file)
}

/**
 * Carga el archivo de fixture de forma lazy.
 * El nombre del archivo viene de ChampionshipPayload.fixture_file.
 */
export async function fetchFixture(file: string): Promise<FixturePayload> {
  if (!file.endsWith('.json') || file.includes('/') || file.includes('..')) {
    throw new Error(`Nombre de archivo de fixture inválido: "${file}"`)
  }
  return fetchJson<FixturePayload>(file)
}

export { HttpError }
