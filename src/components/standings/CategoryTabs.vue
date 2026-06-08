<script setup lang="ts" generic="TId extends string | number">
/**
 * Segmented control genérico.
 * Reemplaza los tabs con borde inferior por el estilo pill/capsule
 * con fondo oscuro en el ítem activo, tal como muestra el diseño.
 */
export interface TabItem<T extends string | number = string> {
  id: T
  name: string
}

defineProps<{
  tabs: TabItem<TId>[]
  modelValue: TId
}>()

defineEmits<{
  'update:modelValue': [id: TId]
}>()
</script>

<template>
  <div class="seg" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      :aria-selected="String(tab.id) === String(modelValue)"
      :class="['seg-btn', String(tab.id) === String(modelValue) && 'seg-btn--active']"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ tab.name }}
    </button>
  </div>
</template>

<style scoped>
.seg {
  display: flex;
  background: #e8edf5;
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  margin-bottom: 1rem;
  width: 100%;
}

.seg-btn {
  flex: 1;
  font-family: var(--font-barlow-condensed);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.55rem 0.75rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, box-shadow 0.15s;
  white-space: nowrap;
}

.seg-btn:hover:not(.seg-btn--active) {
  background: rgba(255, 255, 255, 0.6);
  color: var(--abh-dark);
}

.seg-btn--active {
  background: var(--abh-dark);
  color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
}
</style>
