<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Nom du filtre et sa valeur : « Couche : Applicative ». Ignoré en mode débordement (`overflow`). */
    label?: string
    /** Mode débordement : affiche « +N filtres » au lieu d'un filtre (au-delà de 3 puces). */
    overflow?: number
    /** Cache la croix : filtre imposé, qu'on ne peut pas retirer ici. */
    removable?: boolean
    /** Puce inactive. */
    disabled?: boolean
  }>(),
  { label: '', overflow: undefined, removable: true, disabled: false },
)

const emit = defineEmits<{
  /** Clic sur la croix (ou Retour arrière / Suppr sur la croix). */
  remove: []
  /** Clic sur la puce « +N filtres » : afficher tous les filtres. */
  expand: []
}>()

const overflowText = computed(() => (props.overflow === 1 ? '+1 filtre' : `+${props.overflow} filtres`))
</script>

<template>
  <button
    v-if="overflow !== undefined"
    type="button"
    class="mc-chip filter mc-filter-more"
    :disabled="disabled"
    :aria-label="`Afficher ${overflow === 1 ? 'le filtre masqué' : `les ${overflow} filtres masqués`}`"
    @click="emit('expand')"
  >
    {{ overflowText }}
  </button>
  <span v-else class="mc-chip filter" :class="{ 'is-disabled': disabled }">
    {{ label }}
    <button
      v-if="removable"
      type="button"
      :aria-label="`Retirer le filtre ${label}`"
      :title="`Retirer le filtre`"
      :disabled="disabled"
      @click="emit('remove')"
      @keydown.delete.prevent="emit('remove')"
    >
      <McIcon name="x" size="sm" />
    </button>
  </span>
</template>

<style>
.mc-chip.filter button { border-radius: 50%; }
.mc-chip.filter button:hover:not([disabled]) { background: var(--accent); color: var(--on-accent); }
.mc-chip.filter.is-disabled, .mc-filter-more[disabled] { opacity: .45; }
.mc-chip.filter button[disabled] { cursor: not-allowed; }
button.mc-filter-more { border: 0; font-family: var(--font-sans); cursor: pointer; }
button.mc-filter-more:hover:not([disabled]) { box-shadow: inset 0 0 0 1px var(--accent); }
</style>
