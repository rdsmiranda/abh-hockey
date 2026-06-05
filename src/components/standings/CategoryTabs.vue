<script setup lang="ts" generic="TId extends string | number">
/**
 * Tabs horizontales genéricas.
 * Se usa en dos contextos diferentes sin cambios:
 *   1. Tabs de categoría (Primera, Reserva, Sub-16…)
 *   2. Sub-tabs de sección (Posiciones / Playoffs)
 *
 * El tipo genérico TId permite que el ID sea string o number.
 */
export interface TabItem<T extends string | number = string> {
  id: T
  name: string
}

const props = defineProps<{
  tabs: TabItem<TId>[]
  modelValue: TId
}>()

defineEmits<{
  'update:modelValue': [id: TId]
}>()
</script>

<template>
  <div class="tabs" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="String(tab.id) === String(modelValue)"
      :class="['tab-btn', String(tab.id) === String(modelValue) && 'tab-btn--active']"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.name }}
    </button>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid var(--abh-border);
  margin-bottom: 1rem;
}
.tab-btn {
  font-family: var(--font-barlow-condensed);
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  padding: 0.55rem 1.1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: #64748b;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
}
.tab-btn:hover     { color: var(--abh-blue); }
.tab-btn--active   { color: var(--abh-blue); border-bottom-color: var(--abh-gold); }
</style>
