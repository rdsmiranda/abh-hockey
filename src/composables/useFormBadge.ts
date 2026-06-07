import { ref, onUnmounted } from 'vue'
import type { RecentForm } from '@/types'

export function useFormBadge() {
  const activeMatch = ref<RecentForm | null>(null)
  const anchorRect  = ref<DOMRect | null>(null)
  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function show(match: RecentForm, rect: DOMRect): void {
    if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null }
    activeMatch.value = match
    anchorRect.value  = rect
  }

  function hide(): void {
    hideTimer = setTimeout(() => {
      activeMatch.value = null
      anchorRect.value  = null
      hideTimer = null
    }, 80)
  }

  function cancelHide(): void {
    if (hideTimer !== null) { clearTimeout(hideTimer); hideTimer = null }
  }

  onUnmounted(() => { if (hideTimer !== null) clearTimeout(hideTimer) })

  return { activeMatch, anchorRect, show, hide, cancelHide }
}
