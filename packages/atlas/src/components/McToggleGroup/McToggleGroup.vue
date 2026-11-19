<script setup lang="ts">
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

export interface McToggleOption {
  value: string
  label: string
  icon?: IconName
}

const props = withDefaults(
  defineProps<{
    /** Les 2 à 4 modes proposés. Au-delà de 4, utiliser un Select. */
    options: McToggleOption[]
    /** Nom du groupe, lu par les lecteurs d'écran : « Vue de la liste ». */
    label: string
    /** Masque les libellés (icône seule, libellé en infobulle). Chaque option doit alors avoir une icône. */
    iconOnly?: boolean
    /** Groupe inactif. */
    disabled?: boolean
  }>(),
  { iconOnly: false, disabled: false },
)

const model = defineModel<string>()
const emit = defineEmits<{ change: [value: string] }>()

const buttons = ref<HTMLButtonElement[]>([])
const activeIndex = computed(() => {
  const i = props.options.findIndex((o) => o.value === model.value)
  return i < 0 ? 0 : i
})

function select(i: number, focus = false) {
  const opt = props.options[i]
  if (!opt || props.disabled) return
  if (model.value !== opt.value) {
    model.value = opt.value
    emit('change', opt.value)
  }
  if (focus) buttons.value[i]?.focus()
}

function onKey(e: KeyboardEvent, i: number) {
  const n = props.options.length
  let next: number | null = null
  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % n
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + n) % n
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = n - 1
  if (next === null) return
  e.preventDefault()
  select(next, true)
}
</script>

<template>
  <div class="mc-seg" role="radiogroup" :aria-label="label" :aria-disabled="disabled || undefined" :class="{ 'is-disabled': disabled }">
    <button
      v-for="(opt, i) in options"
      :key="opt.value"
      ref="buttons"
      type="button"
      role="radio"
      :class="{ 'is-on': i === activeIndex && model !== undefined }"
      :aria-checked="opt.value === model"
      :tabindex="i === activeIndex ? 0 : -1"
      :disabled="disabled"
      :aria-label="iconOnly ? opt.label : undefined"
      :title="iconOnly ? opt.label : undefined"
      @click="select(i)"
      @keydown="onKey($event, i)"
    >
      <McIcon v-if="opt.icon" :name="opt.icon" size="sm" />
      <template v-if="!iconOnly">{{ opt.label }}</template>
    </button>
  </div>
</template>

<style>
.mc-seg button:hover:not(.is-on):not([disabled]), .mc-seg button.is-hover { color: var(--ink); }
.mc-seg.is-disabled { opacity: .45; }
.mc-seg.is-disabled button { cursor: not-allowed; }
</style>
