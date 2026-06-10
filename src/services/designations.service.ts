import { fetchJson } from './http'
import type { DesignationData } from '@/types'

/**
 * Descarga las designaciones del período activo.
 *
 * El comando arbix:export:designations-v2 siempre escribe en el mismo
 * archivo (designaciones.json), por lo que ya no hace falta el índice
 * intermediario que existía en la versión anterior.
 */
export async function fetchDesignations(): Promise<DesignationData> {
  return fetchJson<DesignationData>('designaciones.json')
}