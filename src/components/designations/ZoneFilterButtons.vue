<script setup lang="ts">
defineProps<{
  zones: string[]
  modelValue: string | null   // null = "Todas"
}>()

defineEmits<{
  'update:modelValue': [zone: string | null]
}>()
</script>

<template>
  <div class="zone-btns" role="group" aria-label="Filtrar por zona">
    <button
      type="button"
      :class="['zone-btn', modelValue === null && 'zone-btn--active']"
      @click="$emit('update:modelValue', null)"
    >
      Todas
    </button>
    <button
      v-for="zone in zones"
      :key="zone"
      type="button"
      :class="['zone-btn', modelValue === zone && 'zone-btn--active']"
      @click="$emit('update:modelValue', zone)"
    >
      {{ zone }}
    </button>
  </div>
</template>

<style scoped>
.zone-btns { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.zone-btn {
  font-family: var(--font-barlow-condensed);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.4rem 0.9rem;
  border-radius: 6px;
  border: 1.5px solid var(--abh-border);
  background: #fff;
  color: #64748b;
  cursor: pointer;
  height: 38px;
  transition: color .15s, border-color .15s, background .15s;
}
.zone-btn:hover      { border-color: #c1cfe4; color: var(--abh-blue); }
.zone-btn--active    { background: var(--abh-blue); border-color: var(--abh-blue); color: #fff; }
</style>
