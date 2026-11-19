<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Une ligne, 60 caractères au plus. Pas de lien ni de bouton dedans (sinon c'est un popover). */
    text: string
    /** Raccourci clavier affiché après le texte, plus pâle : « L », « ⌘K ». */
    shortcut?: string
    /** Au-dessus ou en dessous du déclencheur. */
    placement?: 'top' | 'bottom'
    /** Délai d'apparition au survol, en ms. Au focus clavier, l'infobulle apparaît aussi après ce délai. */
    delay?: number
    /** Désactive l'infobulle. */
    disabled?: boolean
  }>(),
  { shortcut: undefined, placement: 'top', delay: 400, disabled: false },
)

/** Infobulle visible (pilotable pour la documentation). */
const open = defineModel<boolean>('open', { default: false })

const id = useId()
const host = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setTimeout> | undefined

function show() {
  if (props.disabled) return
  clearTimeout(timer)
  timer = setTimeout(() => (open.value = true), props.delay)
}
function hide() {
  clearTimeout(timer)
  open.value = false
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) hide()
}

/** Relie le déclencheur (premier élément du slot) à l'infobulle. */
function link() {
  const trigger = host.value?.firstElementChild
  if (!trigger || trigger.getAttribute('role') === 'tooltip') return
  const ids = (trigger.getAttribute('aria-describedby') ?? '').split(' ').filter(Boolean)
  if (!ids.includes(`${id}-tip`)) trigger.setAttribute('aria-describedby', [...ids, `${id}-tip`].join(' '))
}
onMounted(link)
watch(() => props.disabled, (d) => d && hide())
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <span
    ref="host"
    class="mc-tip-host"
    @mouseenter="show"
    @mouseleave="hide"
    @focusin="show"
    @focusout="hide"
    @keydown="onKey"
    @pointerdown="hide"
  >
    <slot />
    <span
      v-show="open && !disabled"
      :id="`${id}-tip`"
      role="tooltip"
      class="mc-tip arrow mc-tip-pop"
      :class="placement === 'bottom' ? 'below' : 'above'"
    >{{ text }}<span v-if="shortcut" class="k">{{ shortcut }}</span></span>
  </span>
</template>

<style>
.mc-tip-host { position: relative; display: inline-flex; }
.mc-tip-pop { position: absolute; left: 50%; z-index: 50; white-space: nowrap; pointer-events: none; transform: translateX(-50%); }
.mc-tip-pop.above { bottom: calc(100% + 8px); }
.mc-tip-pop.below { top: calc(100% + 8px); }
.mc-tip.arrow.below::after { bottom: auto; top: -4px; }
</style>
