// ─────────────────────────────────────────────────────────────────────────────
// HTTP layer
//
// Única responsabilidad: convertir fetch() en promesas tipadas.
// No conoce Vue, no muta estado, no importa nada de @/stores.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Carpeta base donde viven los JSON estáticos.
 * En desarrollo Vite sirve /public/ en la raíz.
 * En producción (GitHub Pages) Vite aplica BASE_URL automáticamente.
 */
const DATA_BASE = `${import.meta.env.BASE_URL}data`

/**
 * Error tipado que incluye el status HTTP.
 * Permite que los stores diferencien 404 (archivo no existe)
 * de 500 (servidor caído) si fuera necesario.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly path: string,
  ) {
    super(`HTTP ${status} al cargar "${path}"`)
    this.name = 'HttpError'
  }
}

/**
 * Descarga y parsea un JSON desde la carpeta data/.
 *
 * @param path - Ruta relativa dentro de data/, ej: "index.json"
 * @returns El JSON parseado y tipado como T
 * @throws HttpError si el servidor responde con status >= 400
 * @throws Error si el body no es JSON válido
 *
 * @example
 * const index = await fetchJson<ChampionshipOption[]>('index.json')
 */
export async function fetchJson<T>(path: string): Promise<T> {
  const url = `${DATA_BASE}/${path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new HttpError(response.status, path)
  }

  return response.json() as Promise<T>
}
