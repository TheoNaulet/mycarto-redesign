<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Lecture seule : masque Post-it et Commentaire. */
    readonly?: boolean
    /** Collaboration active : montre Post-it et Commentaire (hors lecture seule). */
    collaboration?: boolean
    /** Des filtres sont appliqués : bouton Filtrer enfoncé, avec une pastille. */
    filterActive?: boolean
    /** Zoom minimal (0,1 = 10 %). */
    minZoom?: number
    /** Zoom maximal (4 = 400 %). */
    maxZoom?: number
    /** Facteur appliqué par − et +. */
    zoomStep?: number
    /** Écoute les raccourcis clavier V, H, F, L, S, C, 0, − et + sur la page. */
    shortcuts?: boolean
    /** Nom de la barre pour les lecteurs d'écran. */
    label?: string
  }>(),
  {
    readonly: false,
    collaboration: true,
    filterActive: false,
    minZoom: 0.1,
    maxZoom: 4,
    zoomStep: 1.25,
    shortcuts: false,
    label: 'Outils de la carte',
  },
)

/** Outil actif : `select` (Sélection, V) ou `hand` (Main, H). */
const tool = defineModel<'select' | 'hand'>('tool', { default: 'select' })
/** Zoom courant, en facteur : 1 = 100 %. */
const zoom = defineModel<number>('zoom', { default: 1 })
/** Légende affichée : bouton enfoncé. */
const legend = defineModel<boolean>('legend', { default: false })

const emit = defineEmits<{
  /** Ouvrir le panneau de filtres. */
  filter: []
  /** Poser un post-it. */
  sticky: []
  /** Ajouter un commentaire. */
  comment: []
  /** Recadrer sur toute la carte. */
  fit: []
}>()

const root = ref<HTMLElement>()
const showCollab = computed(() => props.collaboration && !props.readonly)
const pct = computed(() => `${Math.round(zoom.value * 100)} %`)

function clamp(z: number) {
  return Math.round(Math.min(props.maxZoom, Math.max(props.minZoom, z)) * 100) / 100
}
function zoomOut() {
  zoom.value = clamp(zoom.value / props.zoomStep)
}
function zoomIn() {
  zoom.value = clamp(zoom.value * props.zoomStep)
}

// Flèches gauche/droite : passer d'un bouton à l'autre dans la barre.
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight' && e.key !== 'Home' && e.key !== 'End') return
  const items = Array.from(root.value?.querySelectorAll<HTMLElement>('button:not([disabled])') ?? [])
  const i = items.indexOf(document.activeElement as HTMLElement)
  if (i < 0) return
  e.preventDefault()
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (i + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length
  items[next]?.focus()
}

function onShortcut(e: KeyboardEvent) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const t = e.target as HTMLElement | null
  if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
  const k = e.key.toLowerCase()
  if (k === 'v') tool.value = 'select'
  else if (k === 'h') tool.value = 'hand'
  else if (k === 's' && showCollab.value) emit('sticky')
  else if (k === 'c' && showCollab.value) emit('comment')
  else if (k === 'f') emit('filter')
  else if (k === 'l') legend.value = !legend.value
  else if (k === '0') zoom.value = 1
  else if (k === '-') zoomOut()
  else if (k === '+' || k === '=') zoomIn()
  else return
  e.preventDefault()
}

onMounted(() => props.shortcuts && window.addEventListener('keydown', onShortcut))
onBeforeUnmount(() => window.removeEventListener('keydown', onShortcut))
</script>

<template>
  <div ref="root" class="mc-float mc-toolbar" role="toolbar" :aria-label="label" aria-orientation="horizontal" @keydown="onKeydown">
    <button
      type="button"
      class="mc-ibtn lg"
      :class="{ 'is-on': tool === 'select' }"
      :aria-pressed="tool === 'select'"
      aria-label="Sélection"
      title="Sélection (V)"
      @click="tool = 'select'"
    >
      <McIcon name="cursor" size="lg" />
    </button>
    <button
      type="button"
      class="mc-ibtn lg"
      :class="{ 'is-on': tool === 'hand' }"
      :aria-pressed="tool === 'hand'"
      aria-label="Main"
      title="Main (H)"
      @click="tool = 'hand'"
    >
      <McIcon name="hand" size="lg" />
    </button>
    <span class="mc-sep" aria-hidden="true" />
    <slot name="lens" />
    <button
      type="button"
      class="mc-ibtn lg"
      :class="{ 'is-pressed': filterActive }"
      :aria-pressed="filterActive"
      :aria-label="filterActive ? 'Filtrer, filtres appliqués' : 'Filtrer'"
      title="Filtrer (F)"
      @click="emit('filter')"
    >
      <McIcon name="filter" size="lg" />
      <span v-if="filterActive" class="mc-dot-badge" aria-hidden="true" />
    </button>
    <button
      type="button"
      class="mc-ibtn lg"
      :class="{ 'is-pressed': legend }"
      :aria-pressed="legend"
      aria-label="Légende"
      title="Légende (L)"
      @click="legend = !legend"
    >
      <McIcon name="info" size="lg" />
    </button>
    <template v-if="showCollab">
      <span class="mc-sep" aria-hidden="true" />
      <button type="button" class="mc-ibtn lg" aria-label="Post-it" title="Post-it (S)" @click="emit('sticky')">
        <McIcon name="sticky" size="lg" />
      </button>
      <button type="button" class="mc-ibtn lg" aria-label="Commentaire" title="Commentaire (C)" @click="emit('comment')">
        <McIcon name="comment" size="lg" />
      </button>
    </template>
    <slot />
    <span class="mc-sep" aria-hidden="true" />
    <span class="zoom" role="group" aria-label="Zoom">
      <button
        type="button"
        class="mc-ibtn sm"
        aria-label="Zoom arrière"
        title="Zoom arrière (−)"
        :disabled="zoom <= minZoom"
        @click="zoomOut"
      >
        <McIcon name="minus" size="sm" />
      </button>
      <button type="button" class="mc-toolbar-pct" :aria-label="`Zoom ${pct}, revenir à 100 %`" title="Revenir à 100 % (0)" @click="zoom = 1">
        {{ pct }}
      </button>
      <button
        type="button"
        class="mc-ibtn sm"
        aria-label="Zoom avant"
        title="Zoom avant (+)"
        :disabled="zoom >= maxZoom"
        @click="zoomIn"
      >
        <McIcon name="plus" size="sm" />
      </button>
      <button type="button" class="mc-ibtn sm" aria-label="Recadrer" title="Recadrer sur tout (double-clic sur le vide)" @click="emit('fit')">
        <McIcon name="fit" size="sm" />
      </button>
    </span>
  </div>
</template>

<style>
.mc-toolbar-pct { min-width: 44px; height: var(--control-sm); padding: 0 4px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink-muted); font: 600 12px/16px var(--font-sans); font-variant-numeric: tabular-nums; text-align: center; cursor: pointer; white-space: nowrap; }
.mc-toolbar-pct:hover { background: var(--surface-sunken); color: var(--ink); }
</style>
