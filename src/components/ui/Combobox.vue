<script setup lang="ts">
import { ref, computed, watch } from 'vue'

export interface ComboboxOption {
  id: number | string
  label: string
}

const props = defineProps<{
  options: ComboboxOption[]
  modelValue: ComboboxOption | null
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ComboboxOption | null]
}>()

const inputText  = ref(props.modelValue?.label ?? '')
const isOpen     = ref(false)
const inputRef   = ref<HTMLInputElement | null>(null)

// Sincronizar texto cuando el valor externo cambia
watch(() => props.modelValue, (val) => {
  inputText.value = val?.label ?? ''
})

const filtered = computed<ComboboxOption[]>(() => {
  const q = inputText.value.toLowerCase().trim()
  if (!q) return props.options
  return props.options.filter((o) => o.label.toLowerCase().includes(q))
})

function onInput() {
  // Al escribir, limpiamos la selección confirmada
  emit('update:modelValue', null)
  isOpen.value = true
}

function select(option: ComboboxOption) {
  emit('update:modelValue', option)
  inputText.value = option.label
  isOpen.value    = false
}

function clear() {
  emit('update:modelValue', null)
  inputText.value = ''
  isOpen.value    = false
  inputRef.value?.focus()
}

function onFocus() {
  isOpen.value = true
}

function onBlur() {
  // Delay para que el click en una opción se procese antes de cerrar
  setTimeout(() => {
    isOpen.value = false
    // Si el usuario escribió texto pero no seleccionó → limpiar
    if (!props.modelValue && inputText.value) {
      inputText.value = ''
    }
  }, 150)
}
</script>

<template>
  <div class="combobox-wrap" role="combobox" :aria-expanded="isOpen">
    <input
      ref="inputRef"
      v-model="inputText"
      type="search"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      :placeholder="placeholder ?? 'Buscar…'"
      class="combobox-input"
      aria-autocomplete="list"
      @input="onInput"
      @focus="onFocus"
      @blur="onBlur"
    />

    <!-- Botón limpiar -->
    <button
      v-if="modelValue || inputText"
      type="button"
      class="combobox-clear"
      aria-label="Limpiar búsqueda"
      @mousedown.prevent="clear"
    >
      ×
    </button>

    <!-- Dropdown -->
    <div
      v-if="isOpen"
      class="combobox-dropdown"
      role="listbox"
    >
      <div
        v-if="filtered.length === 0"
        class="combobox-empty"
      >
        Sin resultados
      </div>
      <div
        v-for="option in filtered"
        :key="option.id"
        role="option"
        :aria-selected="modelValue?.id === option.id"
        :class="['combobox-option', modelValue?.id === option.id && 'combobox-option--active']"
        @mousedown.prevent="select(option)"
      >
        {{ option.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.combobox-wrap {
  position: relative;
}
.combobox-input {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 0 2.2rem 0 1rem;
  height: 38px;
  font-family: var(--font-barlow);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--abh-dark);
  min-width: 240px;
  width: 100%;
  box-shadow: 0 1px 2px rgba(0,0,0,.05);
  transition: border-color .15s, box-shadow .15s;
}
.combobox-input:focus {
  outline: none;
  border-color: var(--abh-blue);
  box-shadow: 0 0 0 3px rgba(78,109,158,.12);
}
/* Ocultar el botón nativo "×" de type=search en webkit */
.combobox-input::-webkit-search-cancel-button { display: none; }

.combobox-clear {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 1.2rem;
  line-height: 1;
  padding: 2px 4px;
  transition: color .15s;
}
.combobox-clear:hover { color: var(--abh-dark); }

.combobox-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  min-width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0,0,0,.1);
  z-index: 100;
  max-height: 220px;
  overflow-y: auto;
}
.combobox-option {
  padding: .5rem 1rem;
  font-size: .875rem;
  cursor: pointer;
  color: var(--abh-dark);
  transition: background .1s;
  white-space: nowrap;
}
.combobox-option:hover        { background: var(--abh-light); }
.combobox-option--active      { background: #eef2f8; color: var(--abh-blue); font-weight: 600; }
.combobox-empty {
  padding: .5rem 1rem;
  font-size: .875rem;
  color: #94a3b8;
  font-style: italic;
}
</style>
