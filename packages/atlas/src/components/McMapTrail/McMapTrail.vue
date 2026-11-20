<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import type { IconName } from '../../icons/icons'
import McIcon from '../../icons/McIcon.vue'
import type { Layer } from '../../utils/types'

/** Une étape du fil : une carte d'où l'on vient. */
export interface TrailStep {
  /** Nom de la carte : « Scolarité », « APOGEE »… */
  label: string
  /** Couche de l'objet de la carte : donne la couleur du point. */
  layer?: Layer
  /** Adresse de la carte. Sans elle, le clic émet seulement `navigate`. */
  href?: string
  /** Pictogramme de la première étape, quand ce n'est pas l'accueil (« Diagrammes BPMN », liste d'où l'on vient). */
  icon?: IconName
}

const props = withDefaults(
  defineProps<{
    /** Étapes dans l'ordre parcouru. La première est l'accueil (pictogramme maison), la dernière la carte courante. */
    steps: TrailStep[]
    /** Nombre d'étapes visibles au plus. Au-delà, celles du milieu se replient dans « … ». */
    max?: number
    /** Accueil réduit à la maison, sans libellé (barre étroite). */
    compactHome?: boolean
    /** Nom du fil pour les lecteurs d'écran. */
    ariaLabel?: string
  }>(),
  { max: 4, compactHome: false, ariaLabel: 'Fil des cartes' },
)

const emit = defineEmits<{
  /** Clic sur une étape (hors carte courante) : retour à cette carte. */
  navigate: [step: TrailStep, index: number]
}>()

const id = useId()
const menuOpen = ref(false)
const active = ref(0)
const moreBtn = ref<HTMLButtonElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const host = ref<HTMLElement | null>(null)
const menuLeft = ref(0)
function setMoreBtn(el: unknown) {
  moreBtn.value = (el as HTMLButtonElement | null) ?? null
}

type Shown = { kind: 'step'; step: TrailStep; index: number } | { kind: 'more' }

const collapsed = computed(() => props.steps.length > Math.max(2, props.max))
const hidden = computed(() => {
  if (!collapsed.value) return [] as { step: TrailStep; index: number }[]
  const keep = Math.max(1, props.max - 1)
  return props.steps.slice(1, props.steps.length - keep).map((step, i) => ({ step, index: i + 1 }))
})
const shown = computed<Shown[]>(() => {
  const all = props.steps.map((step, index) => ({ kind: 'step' as const, step, index }))
  if (!collapsed.value) return all
  const keep = Math.max(1, props.max - 1)
  return [all[0], { kind: 'more' as const }, ...all.slice(all.length - keep)]
})
const last = computed(() => props.steps.length - 1)

function go(e: MouseEvent, step: TrailStep, index: number) {
  if (!step.href) e.preventDefault()
  emit('navigate', step, index)
}

function items(): HTMLElement[] {
  return Array.from(menuEl.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}
async function openMenu(focusIndex = 0) {
  menuLeft.value = moreBtn.value?.offsetLeft ?? 0
  menuOpen.value = true
  active.value = focusIndex
  await nextTick()
  items()[focusIndex]?.focus()
}
function closeMenu(returnFocus = true) {
  menuOpen.value = false
  if (returnFocus) moreBtn.value?.focus()
}
function onMoreKey(e: KeyboardEvent) {
  if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    openMenu(0)
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    openMenu(hidden.value.length - 1)
  }
}
function onMenuKey(e: KeyboardEvent) {
  const list = items()
  if (e.key === 'Escape') {
    e.preventDefault()
    closeMenu()
  } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault()
    const n = list.length
    active.value = (active.value + (e.key === 'ArrowDown' ? 1 : -1) + n) % n
    list[active.value]?.focus()
  } else if (e.key === 'Home' || e.key === 'End') {
    e.preventDefault()
    active.value = e.key === 'Home' ? 0 : list.length - 1
    list[active.value]?.focus()
  } else if (e.key === 'Tab') {
    closeMenu(false)
  }
}
function pick(e: MouseEvent, step: TrailStep, index: number) {
  go(e, step, index)
  closeMenu()
}

function onDocDown(e: PointerEvent) {
  if (host.value && !host.value.contains(e.target as Node)) closeMenu(false)
}
watch(menuOpen, (open) => {
  if (open) document.addEventListener('pointerdown', onDocDown)
  else document.removeEventListener('pointerdown', onDocDown)
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocDown))
</script>

<template>
  <nav ref="host" class="mc-trail-host" :aria-label="ariaLabel">
    <div class="mc-trail">
      <template v-for="(s, i) in shown" :key="s.kind === 'more' ? 'more' : s.index">
        <span v-if="i > 0" class="chev" aria-hidden="true"><McIcon name="chevron-right" size="sm" /></span>
        <button
          v-if="s.kind === 'more'"
          :ref="setMoreBtn"
          type="button"
          class="more"
          aria-haspopup="menu"
          :aria-expanded="menuOpen"
          :aria-controls="`${id}-menu`"
          :aria-label="`${hidden.length} cartes masquées`"
          @click="menuOpen ? closeMenu() : openMenu()"
          @keydown="onMoreKey"
        >…</button>
        <a v-else-if="s.index === last" aria-current="page" :class="s.index > 0 && s.step.layer && `l-${s.step.layer}`">{{ s.step.label }}</a>
        <a
          v-else
          :href="s.step.href ?? '#'"
          :class="s.index > 0 && s.step.layer && `l-${s.step.layer}`"
          :aria-label="s.index === 0 && compactHome ? s.step.label : undefined"
          :title="s.index === 0 && compactHome ? s.step.label : undefined"
          @click="go($event, s.step, s.index)"
        >
          <McIcon v-if="s.index === 0" :name="s.step.icon ?? 'home'" size="sm" />
          <span v-else-if="s.step.layer" class="ld" aria-hidden="true" />
          <template v-if="!(s.index === 0 && compactHome)">{{ s.step.label }}</template>
        </a>
      </template>
    </div>
    <div
      v-if="menuOpen"
      :id="`${id}-menu`"
      ref="menuEl"
      class="mc-menu mc-trail-menu"
      role="menu"
      aria-label="Cartes masquées"
      :style="{ left: `${menuLeft}px` }"
      @keydown="onMenuKey"
    >
      <a
        v-for="(h, i) in hidden"
        :key="h.index"
        role="menuitem"
        tabindex="-1"
        class="it"
        :class="[{ 'is-on': i === active }, h.step.layer && `l-${h.step.layer}`]"
        :href="h.step.href ?? '#'"
        @mouseenter="active = i"
        @click="pick($event, h.step, h.index)"
      >
        <span v-if="h.step.layer" class="ld" aria-hidden="true" />
        <span class="grow">{{ h.step.label }}</span>
      </a>
    </div>
  </nav>
</template>

<style>
.mc-trail-host { position: relative; display: flex; min-width: 0; }
.mc-trail button.more { display: inline-flex; align-items: center; height: 28px; padding: 0 8px; border: 0; border-radius: var(--radius-pill); background: transparent; color: var(--ink-muted); font: 600 13px/16px var(--font-sans); cursor: pointer; }
.mc-trail button.more:hover, .mc-trail button.more[aria-expanded="true"] { background: var(--surface-sunken); color: var(--ink); }
.mc-trail-menu { position: absolute; top: calc(100% + 6px); z-index: 30; min-width: 200px; }
.mc-trail-menu .it { color: inherit; text-decoration: none; outline: none; }
.mc-trail-menu .ld { width: 8px; height: 8px; border-radius: 50%; background: var(--lc); flex: none; }
</style>
