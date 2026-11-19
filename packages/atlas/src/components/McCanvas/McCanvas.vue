<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Largeur fixe (nombre = pixels). Ignorée avec `fill`. */
    width?: number | string
    /** Hauteur fixe (nombre = pixels). Ignorée avec `fill`. */
    height?: number | string
    /** Remplit son parent (position absolue, inset 0) au lieu d'une taille fixe. */
    fill?: boolean
    /** Zoom du calque de contenu (1 = 100 %, 0,1 à 4). La trame de points suit. */
    zoom?: number
    /** Décalage du contenu en pixels écran (défilement, outil Main). */
    pan?: { x: number; y: number }
    /** Nom de la carte pour les lecteurs d'écran. */
    label?: string
  }>(),
  { width: '100%', height: 480, fill: false, zoom: 1, pan: () => ({ x: 0, y: 0 }), label: 'Carte' },
)

const emit = defineEmits<{
  /** Clic sur le vide ou Échap : tout désélectionner. */
  deselect: []
  /** Double-clic sur le vide : recadrer sur tout. */
  fit: []
}>()

const slots = useSlots()
const px = (v: number | string) => (typeof v === 'number' ? `${v}px` : v)

const rootStyle = computed(() => {
  const pitch = 24 * props.zoom
  return {
    ...(props.fill ? {} : { width: px(props.width), height: px(props.height) }),
    backgroundSize: `${pitch}px ${pitch}px`,
    backgroundPosition: `${props.pan.x}px ${props.pan.y}px`,
  }
})
const layerStyle = computed(() => ({
  transform: `translate(${props.pan.x}px, ${props.pan.y}px) scale(${props.zoom})`,
}))
// Le panneau de droite descend sous la barre du haut quand il y en a une.
const rightTop = computed(() => (slots.top ? '84px' : '16px'))
</script>

<template>
  <div
    class="mc-canvas mc-canvas-root"
    :class="{ 'is-fill': fill }"
    :style="rootStyle"
    role="region"
    :aria-label="label"
    tabindex="-1"
    @keydown.esc="emit('deselect')"
  >
    <div class="mc-canvas-layer" :style="layerStyle" @click.self="emit('deselect')" @dblclick.self="emit('fit')">
      <slot />
    </div>
    <div v-if="$slots.top" class="mc-canvas-top"><slot name="top" /></div>
    <div v-if="$slots.right" class="mc-canvas-right" :style="{ top: rightTop }"><slot name="right" /></div>
    <div v-if="$slots['bottom-left']" class="mc-canvas-bl"><slot name="bottom-left" /></div>
    <div v-if="$slots.bottom" class="mc-canvas-bottom"><slot name="bottom" /></div>
  </div>
</template>

<style>
.mc-canvas-root { outline: none; }
.mc-canvas-root.is-fill { position: absolute; inset: 0; }
.mc-canvas-layer { position: absolute; inset: 0; transform-origin: 0 0; }
.mc-canvas-layer > .mc-node, .mc-canvas-layer > .mc-group { position: absolute; margin: 0; }
.mc-canvas-top, .mc-canvas-right, .mc-canvas-bl, .mc-canvas-bottom { position: absolute; z-index: 5; pointer-events: none; }
.mc-canvas-top > *, .mc-canvas-right > *, .mc-canvas-bl > *, .mc-canvas-bottom > * { pointer-events: auto; }
.mc-canvas-top { left: 16px; right: 16px; top: 16px; display: flex; gap: var(--space-2); align-items: flex-start; }
.mc-canvas-top > * { flex: 1; min-width: 0; }
.mc-canvas-right { right: 16px; bottom: 16px; display: flex; flex-direction: column; align-items: flex-end; gap: var(--space-3); z-index: 6; }
.mc-canvas-right > * { max-height: 100%; overflow: auto; }
.mc-canvas-bl { left: 16px; bottom: 16px; }
.mc-canvas-bottom { left: 50%; bottom: 16px; transform: translateX(-50%); }
</style>
