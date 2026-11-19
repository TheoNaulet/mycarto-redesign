<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'

withDefaults(
  defineProps<{
    /** Libellé à droite de la case (sinon, slot par défaut). Toute la ligne est cliquable. */
    label?: string
    /** Case inactive. */
    disabled?: boolean
    /** Nom accessible quand il n'y a pas de libellé visible (case d'une ligne de tableau). */
    ariaLabel?: string
    /** Nom du champ dans un formulaire. */
    name?: string
    /** Valeur envoyée avec le formulaire quand la case est cochée. */
    value?: string
  }>(),
  { label: undefined, disabled: false, ariaLabel: undefined, name: undefined, value: undefined },
)

/** Cochée ou non. */
const checked = defineModel<boolean>({ default: false })
/** Partielle (tiret) : une partie des lignes est cochée. Un clic la coche entièrement. */
const indeterminate = defineModel<boolean>('indeterminate', { default: false })

const input = ref<HTMLInputElement>()
const sync = () => {
  if (input.value) input.value.indeterminate = indeterminate.value
}
onMounted(sync)
watch(indeterminate, sync)

function onChange(e: Event) {
  const el = e.target as HTMLInputElement
  if (indeterminate.value) {
    indeterminate.value = false
    el.checked = true
  }
  checked.value = el.checked
}
</script>

<template>
  <label class="mc-check" :class="{ 'is-disabled': disabled }">
    <input
      ref="input"
      type="checkbox"
      class="mc-sr"
      :checked="checked"
      :disabled="disabled"
      :name="name"
      :value="value"
      :aria-label="label || $slots.default ? undefined : ariaLabel"
      :aria-checked="indeterminate ? 'mixed' : undefined"
      @change="onChange"
    />
    <span class="mc-box" :class="{ 'is-on': checked && !indeterminate, 'is-mixed': indeterminate, 'is-disabled': disabled }" aria-hidden="true">
      <McIcon v-if="indeterminate" name="minus" size="sm" />
      <McIcon v-else-if="checked" name="check" size="sm" />
    </span>
    <span v-if="label || $slots.default" class="mc-check-label"><slot>{{ label }}</slot></span>
  </label>
</template>

<style>
.mc-check { position: relative; }
.mc-check input:focus-visible + .mc-box { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-check:hover:not(.is-disabled) .mc-box:not(.is-on):not(.is-mixed) { border-color: var(--accent); }
.mc-check.is-disabled { color: var(--ink-subtle); cursor: not-allowed; }
.mc-box .mc-ico { width: 12px; height: 12px; }
</style>
