import { fetchJson, HttpError } from './http'
import type { ChampionshipOption, ChampionshipPayload, FixturePayload } from '@/types'

export async function fetchChampionshipIndex(): Promise<ChampionshipOption[]> {
  const data = await fetchJson<unknown>('index.json')
  if (!Array.isArray(data)) {
    throw new Error('index.json no tiene el formato esperado (se esperaba un array)')
  }
  // Normalizar: Laravel puede exportar "filename" en lugar de "file"
  return (data as Record<string, string>[]).map((entry) => ({
    file:  entry['file'] ?? entry['filename'] ?? '',
    label: entry['label'] ?? '',
  }))
}

export async function fetchChampionship(file: string): Promise<ChampionshipPayload> {
  // Sanitizar: solo nombre de archivo, sin path traversal
  const clean = file.replace(/^.*[\\/]/, '') // quitar cualquier path prefix
  if (!clean.endsWith('.json') || clean.includes('..')) {
    throw new Error(`Nombre de archivo inválido: "${file}"`)
  }
  return fetchJson<ChampionshipPayload>(clean)
}

export async function fetchFixture(file: string): Promise<FixturePayload> {
  const clean = file.replace(/^.*[\\/]/, '')
  if (!clean.endsWith('.json') || clean.includes('..')) {
    throw new Error(`Nombre de archivo de fixture inválido: "${file}"`)
  }
  return fetchJson<FixturePayload>(clean)
}

export { HttpError }
