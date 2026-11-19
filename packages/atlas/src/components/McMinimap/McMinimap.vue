<script setup lang="ts">
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { Layer } from '../../utils/types'

/** Un bloc de la vue d'ensemble, en pourcentage de la carte (0 à 100). */
export interface McMinimapBlock {
  /** Couche de l'objet ou du conteneur : donne la couleur du bloc. */
  layer: Layer
  x: number
  y: number
  w: number
  h: number
}

/** Le cadre de ce qu'on voit, en pourcentage de la carte (0 à 100). */
export interface McMinimapRect {
  x: number
  y: number
  w: number
  h: number
}

const props = withDefaults(
  defineProps<{
    /** Blocs aux couleurs de couche, positionnés en % de la carte. */
    blocks?: McMinimapBlock[]
    /** Nombre d'objets de la carte, affiché en pied. */
    count?: number
    /** Zoom courant en facteur (1 = 100 %), affiché en pied. */
    zoom?: number
    /** Largeur du panneau en pixels. */
    width?: number
    /** Hauteur de la vue en pixels. */
    height?: number
  }>(),
  { blocks: () => [], count: 0, zoom: 1, width: 200, height: 112 },
)

/** Cadre de vue, en % de la carte. Glisser le cadre ou cliquer ailleurs le déplace. */
const viewport = defineModel<McMinimapRect>('viewport', { default: () => ({ x: 20, y: 20, w: 50, h: 50 }) })
/** Replié en un bouton. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const map = ref<HTMLElement>()
const dragging = ref(false)
let start: { px: number; py: number; x: number; y: number } | null = null

const pct = computed(() => `${Math.round(props.zoom * 100)} %`)
const objets = computed(() => `${props.count.toLocaleString('fr-FR')} objet${props.count > 1 ? 's' : ''}`)

function clampRect(x: number, y: number): McMinimapRect {
  const { w, h } = viewport.value
  return {
    x: Math.round(Math.min(100 - w, Math.max(0, x)) * 10) / 10,
    y: Math.round(Math.min(100 - h, Math.max(0, y)) * 10) / 10,
    w,
    h,
  }
}

function toPct(e: PointerEvent) {
  const r = map.value!.getBoundingClientRect()
  return { x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }
}

function onVpDown(e: PointerEvent) {
  e.stopPropagation()
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  const p = toPct(e)
  start = { px: p.x, py: p.y, x: viewport.value.x, y: viewport.value.y }
  dragging.value = true
}
function onVpMove(e: PointerEvent) {
  if (!start) return
  const p = toPct(e)
  viewport.value = clampRect(start.x + p.x - start.px, start.y + p.y - start.py)
}
function onVpUp() {
  start = null
  dragging.value = false
}

// Clic ailleurs sur la vue : recentrer le cadre là.
function onMapDown(e: PointerEvent) {
  const p = toPct(e)
  viewport.value = clampRect(p.x - viewport.value.w / 2, p.y - viewport.value.h / 2)
}

function onVpKey(e: KeyboardEvent) {
  const step = e.shiftKey ? 10 : 2
  const { x, y } = viewport.value
  const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  const m = moves[e.key]
  if (!m) return
  e.preventDefault()
  viewport.value = clampRect(x + m[0], y + m[1])
}
</script>

<template>
  <button
    v-if="collapsed"
    type="button"
    class="mc-float mc-ibtn lg mc-minimap-open"
    aria-label="Afficher la vue d'ensemble"
    title="Vue d'ensemble"
    @click="collapsed = false"
  >
    <McIcon name="map" size="lg" />
  </button>
  <section v-else class="mc-float mc-minimap" :style="{ width: width + 'px' }" aria-label="Vue d'ensemble de la carte">
    <div ref="map" class="map" :style="{ height: height + 'px' }" @pointerdown="onMapDown">
      <span
        v-for="(b, i) in blocks"
        :key="i"
        class="blk"
        :class="`l-${b.layer}`"
        :style="{ left: b.x + '%', top: b.y + '%', width: b.w + '%', height: b.h + '%' }"
      />
      <span
        class="vp mc-minimap-vp"
        :class="{ 'is-dragging': dragging }"
        role="slider"
        tabindex="0"
        aria-label="Cadre de vue (flèches pour déplacer, Maj pour aller plus vite)"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="Math.round(viewport.x)"
        :aria-valuetext="`${Math.round(viewport.x)} % depuis la gauche, ${Math.round(viewport.y)} % depuis le haut`"
        :style="{ left: viewport.x + '%', top: viewport.y + '%', width: viewport.w + '%', height: viewport.h + '%' }"
        @pointerdown="onVpDown"
        @pointermove="onVpMove"
        @pointerup="onVpUp"
        @pointercancel="onVpUp"
        @keydown="onVpKey"
      />
    </div>
    <div class="ft">
      <span>{{ objets }} · {{ pct }}</span>
      <button type="button" class="mc-ibtn sm mc-minimap-close" aria-label="Replier la vue d'ensemble" title="Replier" @click="collapsed = true">
        <McIcon name="chevron-down" size="sm" />
      </button>
    </div>
  </section>
</template>

<style>
.mc-minimap .map { cursor: pointer; touch-action: none; }
.mc-minimap-vp { cursor: grab; touch-action: none; }
.mc-minimap-vp.is-dragging { cursor: grabbing; }
.mc-minimap-vp:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-minimap .ft { font-variant-numeric: tabular-nums; }
.mc-minimap-close { width: 22px; height: 22px; margin: -3px -2px -3px 0; }
.mc-minimap-open { border: 1px solid var(--line); }
</style>
