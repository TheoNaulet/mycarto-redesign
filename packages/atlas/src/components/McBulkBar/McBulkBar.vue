<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Nombre d'éléments sélectionnés. À 0, la barre disparaît. */
    count: number
    /** Formes accordées du nom et du participe, au singulier et au pluriel : { one: 'machine sélectionnée', other: 'machines sélectionnées' }. */
    forms?: { one: string; other: string }
    /** Libellé lu du bouton qui vide la sélection. */
    clearLabel?: string
    /** Flotte en bas au centre du parent (qui doit être en position relative), au-dessus du contenu. */
    floating?: boolean
  }>(),
  {
    forms: () => ({ one: 'application sélectionnée', other: 'applications sélectionnées' }),
    clearLabel: 'Tout désélectionner',
    floating: false,
  },
)

defineEmits<{ /** Vider la sélection. */ clear: [] }>()
defineSlots<{
  /** Actions groupées : `McButton variant="ghost" size="sm"`. L'action destructrice en dernier. */
  default?: () => unknown
}>()

const text = computed(() => (props.count > 1 ? props.forms.other : props.forms.one))
</script>

<template>
  <Transition name="mc-bulk">
    <div v-if="count > 0" class="mc-bulk mc-bulkbar" :class="floating && 'is-floating'" role="toolbar" aria-label="Actions sur la sélection">
      <span class="lbl" aria-live="polite"><b>{{ count.toLocaleString('fr-FR') }}</b> {{ text }}</span>
      <span class="grow" />
      <slot />
      <span class="sep" aria-hidden="true" />
      <button type="button" class="mc-ibtn sm" :aria-label="clearLabel" :title="clearLabel" @click="$emit('clear')">
        <McIcon name="x" size="sm" />
      </button>
    </div>
  </Transition>
</template>

<style>
.mc-bulkbar { box-sizing: border-box; min-width: 360px; max-width: calc(100% - 32px); }
.mc-bulkbar .lbl { white-space: nowrap; }
.mc-bulkbar .lbl b { font-variant-numeric: tabular-nums; }
.mc-bulkbar .sep { width: 1px; height: 20px; background: color-mix(in srgb, var(--on-navy) 20%, transparent); margin: 0 2px; }
.mc-bulkbar .mc-ibtn { color: var(--on-navy-muted); }
.mc-bulkbar .mc-ibtn:hover { background: color-mix(in srgb, var(--on-navy) 12%, transparent); color: var(--on-navy); }
.mc-bulkbar.is-floating { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 10; }
.mc-bulk-enter-active, .mc-bulk-leave-active { transition: opacity .16s ease-out, translate .16s ease-out; }
.mc-bulk-enter-from, .mc-bulk-leave-to { opacity: 0; translate: 0 8px; }
</style>
