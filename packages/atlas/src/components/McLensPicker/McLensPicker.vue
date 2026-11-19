<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import { uniquePrefix } from '../McEdge/edge'
import { MC_LENSES, NO_LENS, type McLens } from './lenses'

const props = withDefaults(
  defineProps<{
    /** Lentilles proposées, « Aucune » comprise. Par défaut, celles de myCarto. */
    lenses?: McLens[]
    /** Identifiant de la lentille qui revient aux couleurs de couche. */
    noneId?: string
    /** Côté d'ouverture de la liste : `top` dans la barre d'outils du bas, `bottom` ailleurs. */
    placement?: 'top' | 'bottom'
    /** Titre de la liste. */
    heading?: string
  }>(),
  { lenses: () => MC_LENSES, noneId: NO_LENS, placement: 'top', heading: 'Lire la carte par' },
)

/** Identifiant de la lentille active. */
const lens = defineModel<string>('lens', { default: NO_LENS })
/** Liste ouverte. */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** La lentille a changé : la lentille choisie. */
  change: [lens: McLens]
}>()

const uid = uniquePrefix('mc-lens', useId())
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const list = ref<HTMLElement>()
const active = ref(0)

const current = computed(() => props.lenses.find((l) => l.id === lens.value) ?? props.lenses[0])
const isOn = computed(() => lens.value !== props.noneId)

function choose(l: McLens) {
  lens.value = l.id
  emit('change', l)
  close()
}

function close(focus = true) {
  open.value = false
  if (focus) nextTick(() => trigger.value?.focus())
}

function toggle() {
  open.value = !open.value
}

watch(open, async (v) => {
  if (!v) return
  active.value = Math.max(0, props.lenses.findIndex((l) => l.id === lens.value))
  await nextTick()
  list.value?.focus()
})

function onListKey(e: KeyboardEvent) {
  const n = props.lenses.length
  if (e.key === 'ArrowDown') active.value = (active.value + 1) % n
  else if (e.key === 'ArrowUp') active.value = (active.value - 1 + n) % n
  else if (e.key === 'Home') active.value = 0
  else if (e.key === 'End') active.value = n - 1
  else if (e.key === 'Enter' || e.key === ' ') {
    const l = props.lenses[active.value]
    if (l) choose(l)
  } else if (e.key === 'Tab') return close(false)
  else return
  e.preventDefault()
}

function onDocPointer(e: PointerEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close(false)
}
watch(open, (v) => {
  if (v) document.addEventListener('pointerdown', onDocPointer)
  else document.removeEventListener('pointerdown', onDocPointer)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocPointer))
</script>

<template>
  <div ref="root" class="mc-lens-picker" @keydown.esc.stop="open && close()">
    <button
      ref="trigger"
      type="button"
      class="mc-lens"
      :class="{ 'is-on': isOn }"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="`${uid}-list`"
      :aria-label="`Lentille : ${current?.label ?? ''}`"
      title="Lentille"
      @click="toggle"
    >
      <McIcon name="lens" size="lg" />
      <span class="lbl">Lentille<small>{{ current?.label }}</small></span>
      <McIcon name="chevron-down" size="sm" />
    </button>
    <div v-if="open" class="mc-pop mc-maps mc-lens-pop" :class="`is-${placement}`">
      <div :id="`${uid}-head`" class="head mc-over">{{ heading }}</div>
      <div
        :id="`${uid}-list`"
        ref="list"
        role="listbox"
        tabindex="-1"
        :aria-labelledby="`${uid}-head`"
        :aria-activedescendant="`${uid}-o${active}`"
        class="mc-lens-list"
        @keydown="onListKey"
      >
        <div
          v-for="(l, i) in lenses"
          :id="`${uid}-o${i}`"
          :key="l.id"
          role="option"
          class="it"
          :class="{ 'is-on': l.id === lens, 'is-active': i === active }"
          :aria-selected="l.id === lens"
          @click="choose(l)"
          @pointerenter="active = i"
        >
          <span class="th mc-lens-th" :class="`t-${l.tone}`"><McIcon :name="l.icon" /></span>
          <span class="tx"><b>{{ l.label }}</b><span>{{ l.description }}</span></span>
          <span v-if="l.id === lens" class="go mc-lens-check"><McIcon name="check" size="sm" /></span>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.mc-lens-picker { position: relative; display: inline-flex; }
.mc-lens-pop { position: absolute; left: 0; z-index: 20; }
.mc-lens-pop.is-top { bottom: calc(100% + 10px); }
.mc-lens-pop.is-bottom { top: calc(100% + 8px); }
.mc-lens-list { outline: none; }
.mc-lens-list:focus-visible .it.is-active { outline: 2px solid var(--focus); outline-offset: -2px; }
.mc-maps .it.is-active { background: var(--surface-sunken); }
.mc-lens-check { color: var(--accent); }
.mc-lens-th.t-neutral { background: var(--layer-applicatif-soft); color: var(--layer-applicatif); }
.mc-lens-th.t-ok { background: var(--status-ok-soft); color: var(--status-ok); }
.mc-lens-th.t-warn { background: var(--status-warn-soft); color: var(--status-warn); }
.mc-lens-th.t-critical { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-lens-th.t-unknown { background: var(--status-unknown-soft); color: var(--status-unknown); }
.mc-lens-th.t-dicp { background: var(--crit-1); color: var(--ink); }
</style>
