<script setup lang="ts">
import { computed } from 'vue'
import { useChampionshipStore } from '@/stores/championship.store'
import type { RecentForm } from '@/types'

const props = defineProps<{
  match: RecentForm | null
  anchorRect: DOMRect | null
}>()

const store = useChampionshipStore()

const CARD_WIDTH  = 230
const CARD_HEIGHT = 160
const MARGIN      = 8

const RESULT_TEXT: Record<string, string> = { W: 'Victoria', D: 'Empate', L: 'Derrota' }

// Resuelve rival desde el diccionario de equipos
const opponent = computed(() =>
  props.match ? store.team(props.match.opponent_id) : undefined,
)

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

const style = computed<Record<string, string>>(() => {
  if (!props.anchorRect) return { display: 'none' }
  const rect = props.anchorRect
  let left = rect.left + rect.width / 2 - CARD_WIDTH / 2
  let top  = rect.top  - CARD_HEIGHT - MARGIN
  left = Math.max(MARGIN, Math.min(left, window.innerWidth - CARD_WIDTH - MARGIN))
  if (top < MARGIN) top = rect.bottom + MARGIN
  return { left: `${left}px`, top: `${top}px`, width: `${CARD_WIDTH}px` }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="hc">
      <div v-if="match" class="hc" :style="style" role="tooltip" aria-live="polite">
        <div :class="['hc-header', match.result]">
          <div class="hc-opponent">
            <img
              v-if="opponent?.logo"
              :src="opponent.logo"
              :alt="opponent.name"
              class="hc-opp-logo"
              @error="hideOnError"
            />
            <div>
              <div class="hc-opp-name">
                {{ opponent?.short_name ?? opponent?.name ?? '?' }}
              </div>
              <div class="hc-opp-venue">{{ match.was_home ? 'Local' : 'Visitante' }}</div>
            </div>
          </div>
          <div class="hc-score">
            <div class="hc-score-main">{{ match.score }}</div>
            <div v-if="match.shootouts" class="hc-score-pen">
              Pen: {{ match.shootouts.score }}
            </div>
          </div>
        </div>

        <div class="hc-body">
          <div class="hc-row">
            <span class="hc-label">Fecha</span>
            <span class="hc-value">{{ match.date }}</span>
          </div>
          <div class="hc-row">
            <span class="hc-label">Resultado</span>
            <span :class="['hc-result-badge', match.result]">
              {{ RESULT_TEXT[match.result] ?? match.result }}
            </span>
          </div>
          <div v-if="match.bonus_point" class="hc-row">
            <span />
            <span class="hc-bonus">★ Punto bonus</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.hc {
  position: fixed;
  background: #fff;
  border: 1.5px solid var(--abh-border);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(0,0,0,.16);
  z-index: 9999;
  pointer-events: none;
}
.hc-enter-active, .hc-leave-active { transition: opacity .1s; }
.hc-enter-from,  .hc-leave-to      { opacity: 0; }

.hc-header { padding: .75rem; color: #fff; display: flex; align-items: center; justify-content: space-between; gap: .5rem; }
.hc-header.W { background: linear-gradient(135deg,#16a34a,#22c55e); }
.hc-header.D { background: linear-gradient(135deg,#d97706,#f59e0b); }
.hc-header.L { background: linear-gradient(135deg,#b91c1c,#ef4444); }

.hc-opponent  { display: flex; align-items: center; gap: .45rem; }
.hc-opp-logo  { width: 28px; height: 28px; object-fit: contain; background: rgba(255,255,255,.2); border-radius: 4px; padding: 2px; }
.hc-opp-name  { font-weight: 600; font-size: .85rem; line-height: 1.2; }
.hc-opp-venue { font-size: .7rem; opacity: .8; }

.hc-score      { text-align: right; }
.hc-score-main { font-family: var(--font-barlow-condensed); font-size: 1.5rem; font-weight: 800; line-height: 1; }
.hc-score-pen  { font-size: .7rem; opacity: .85; }

.hc-body  { padding: .65rem .75rem; display: flex; flex-direction: column; gap: .45rem; }
.hc-row   { display: flex; justify-content: space-between; align-items: center; font-size: .78rem; }
.hc-label { color: #94a3b8; }
.hc-value { font-weight: 600; }

.hc-result-badge { display: inline-flex; align-items: center; border-radius: 4px; padding: 1px 7px; font-size: .72rem; font-weight: 700; color: #fff; }
.hc-result-badge.W { background: #22c55e; }
.hc-result-badge.D { background: #f59e0b; }
.hc-result-badge.L { background: #ef4444; }

.hc-bonus { display: inline-flex; align-items: center; gap: .25rem; background: #fef9c3; border: 1px solid #fde047; color: #713f12; border-radius: 4px; padding: 2px 7px; font-size: .72rem; font-weight: 600; }
</style>
