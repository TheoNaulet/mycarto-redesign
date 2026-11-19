<script setup lang="ts">
import { useId } from 'vue'

withDefaults(
  defineProps<{
    /** Réglage, à gauche de l'interrupteur : « Afficher les flux ». Sinon, slot par défaut ou `ariaLabel`. */
    label?: string
    /** Texte d'aide sous le libellé. */
    help?: string
    /** Interrupteur inactif. */
    disabled?: boolean
    /** Étire la ligne pour aligner l'interrupteur à droite (panneaux, inspecteur). */
    block?: boolean
    /** Nom accessible quand il n'y a pas de libellé visible. */
    ariaLabel?: string
  }>(),
  { label: undefined, help: undefined, disabled: false, block: false, ariaLabel: undefined },
)

/** Allumé ou éteint. L'effet est immédiat : pas de bouton « Appliquer ». */
const on = defineModel<boolean>({ default: false })
const emit = defineEmits<{ change: [value: boolean] }>()
const id = useId()

function toggle() {
  on.value = !on.value
  emit('change', on.value)
}
</script>

<template>
  <div class="mc-switch-row" :class="{ 'is-block': block, 'is-disabled': disabled }">
    <span v-if="label || $slots.default || help" class="mc-switch-text">
      <label :id="`${id}-label`" :for="id"><slot>{{ label }}</slot></label>
      <span v-if="help" :id="`${id}-help`" class="mc-field-help">{{ help }}</span>
    </span>
    <button
      :id="id"
      type="button"
      role="switch"
      class="mc-switch"
      :class="{ 'is-on': on }"
      :aria-checked="on"
      :disabled="disabled"
      :aria-label="label || $slots.default ? undefined : ariaLabel"
      :aria-describedby="help ? `${id}-help` : undefined"
      @click="toggle"
    />
  </div>
</template>

<style>
.mc-switch-row { display: inline-flex; align-items: center; gap: var(--space-3); font-size: 14px; color: var(--ink); }
.mc-switch-row.is-block { display: flex; justify-content: space-between; }
.mc-switch-row label { cursor: pointer; }
.mc-switch-text { display: grid; gap: 2px; min-width: 0; }
button.mc-switch { border: 0; padding: 0; cursor: pointer; }
button.mc-switch:hover:not([disabled]):not(.is-on) { background: var(--ink-subtle); }
.mc-switch-row.is-disabled { color: var(--ink-subtle); }
.mc-switch-row.is-disabled label, button.mc-switch[disabled] { cursor: not-allowed; }
button.mc-switch[disabled] { opacity: .45; }
</style>
