import { fetchJson } from './http'
import type { DesignationIndex, DesignationData } from '@/types'

/**
 * Descarga las designaciones del período activo.
 *
 * Hace dos requests en secuencia:
 * 1. data/designations-index.json → obtiene el nombre del archivo activo
 * 2. data/<file> → descarga los datos reales
 *
 * Esta indirección permite que el sistema externo publique nuevas
 * designaciones cambiando solo el puntero, sin modificar la app.
 */
export async function fetchDesignations(): Promise<DesignationData> {
  const index = await fetchJson<DesignationIndex>('designations-index.json')

  if (!index.file || !index.file.endsWith('.json')) {
    throw new Error('designations-index.json contiene una referencia inválida')
  }

  return fetchJson<DesignationData>(index.file)
}
