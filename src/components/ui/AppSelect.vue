<script setup lang="ts" generic="TValue extends string | number">
export interface SelectOption<T extends string | number = string> {
  value: T
  label: string
}

defineProps<{
  options: SelectOption<TValue>[]
  modelValue: TValue
  placeholder?: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: TValue]
}>()
</script>

<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    class="app-select"
    @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value as TValue)"
  >
    <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.app-select {
  appearance: none;
  background: #fff
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2364748b' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")
    no-repeat right 0.75rem center;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0.55rem 2.5rem 0.55rem 1rem;
  height: 38px;
  font-family: var(--font-barlow);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--abh-dark);
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: border-color 0.15s, box-shadow 0.15s;
  width: 100%;
  min-width: 160px;
}
.app-select:hover {
  border-color: #cbd5e1;
}
.app-select:focus {
  outline: none;
  border-color: var(--abh-blue);
  box-shadow: 0 0 0 3px rgba(78, 109, 158, 0.12);
}
.app-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
