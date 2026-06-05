import { ref, onUnmounted } from 'vue'
import type { RecentFormEntry } from '@/types'

/**
 * Maneja la visibilidad y posición del hover card de FormBadge.
 *
 * Diseñado para ser instanciado UNA VEZ en el componente que contiene
 * el HoverCard (StandingsTable o StandingsPage), no en cada FormBadge.
 * Los FormBadges emiten eventos que este composable procesa.
 */
export function useFormBadge() {
  const activeMatch  = ref<RecentFormEntry | null>(null)
  const anchorRect   = ref<DOMRect | null>(null)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function show(match: RecentFormEntry, rect: DOMRect): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    activeMatch.value  = match
    anchorRect.value   = rect
  }

  function hide(): void {
    // Pequeño delay para permitir que el cursor llegue al HoverCard
    // sin que desaparezca (útil si el card tiene contenido interactivo)
    hideTimer = setTimeout(() => {
      activeMatch.value = null
      anchorRect.value  = null
      hideTimer = null
    }, 80)
  }

  function cancelHide(): void {
    if (hideTimer !== null) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  onUnmounted(() => {
    if (hideTimer !== null) clearTimeout(hideTimer)
  })

  return { activeMatch, anchorRect, show, hide, cancelHide }
}
