<script setup lang="ts">
import { useChampionshipStore } from '@/stores/championship.store'
import type { RecentForm } from '@/types'

const props = defineProps<{
  result: 'W' | 'D' | 'L'
  match: RecentForm
}>()

const emit = defineEmits<{
  show: [match: RecentForm, rect: DOMRect]
  hide: []
}>()

const store = useChampionshipStore()
const LABEL: Record<string, string> = { W: 'G', D: 'E', L: 'P' }

const opponentName = () =>
  store.team(props.match.opponent_id)?.short_name ??
  store.team(props.match.opponent_id)?.name ??
  '?'

function handleShow(event: MouseEvent | FocusEvent) {
  const el = event.currentTarget as HTMLElement
  emit('show', props.match, el.getBoundingClientRect())
}
</script>

<template>
  <span class="hc-anchor">
    <button
      :class="['form-badge', result]"
      type="button"
      :aria-label="`${result === 'W' ? 'Victoria' : result === 'D' ? 'Empate' : 'Derrota'} vs ${opponentName()}, ${match.score}`"
      @mouseenter="handleShow"
      @mouseleave="$emit('hide')"
      @focus="handleShow"
      @blur="$emit('hide')"
    >
      {{ LABEL[result] ?? result }}
      <span v-if="match.bonus_point" class="bonus-dot" aria-hidden="true">+</span>
    </button>
  </span>
</template>

<style scoped>
.hc-anchor { position: relative; display: inline-block; }
.form-badge {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 22px; height: 22px;
  border-radius: 4px;
  font-family: var(--font-barlow-condensed);
  font-size: 11px; font-weight: 700; color: #fff;
  cursor: pointer; border: none; background: none;
  transition: transform 0.12s;
  user-select: none;
}
.form-badge:hover { transform: scale(1.18); }
.form-badge.W { background: #22c55e; }
.form-badge.D { background: #f59e0b; }
.form-badge.L { background: #ef4444; }

.bonus-dot {
  position: absolute; top: -3px; right: -3px;
  width: 9px; height: 9px;
  background: #fde047; border-radius: 50%; border: 1px solid #fff;
  font-size: 6px; display: flex; align-items: center; justify-content: center;
  color: #713f12; font-weight: 800;
}
</style>
