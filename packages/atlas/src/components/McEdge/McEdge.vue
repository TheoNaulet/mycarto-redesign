<script setup lang="ts">
import { computed, inject, ref, useId } from 'vue'
import { routeEdge } from '../../utils/geo'
import McEdgeMarkers from './McEdgeMarkers.vue'
import { edgeMarkersKey, markerIds, uniquePrefix, type McEdgeKind, type McPoint } from './edge'

const props = withDefaults(
  defineProps<{
    /** Départ du lien, au bord droit de la source (le rond creux s'y pose). */
    from: McPoint
    /** Arrivée : bord gauche de la cible moins EDGE_GAP (8px), au centre vertical de la cible. */
    to: McPoint
    /** Abscisse du coude vertical. Par défaut, à mi-chemin entre départ et arrivée. */
    midX?: number
    /** flow (repos), hover (survol ou sélection), impact (chemin d'impact), host (hébergement, pointillé sans flèche), dim (estompé). */
    kind?: McEdgeKind
    /** Libellé en pilule au milieu du lien : « Synchrone · semestrielle ». Visible au survol, à la sélection ou avec `showLabel`. */
    label?: string
    /** Lien sélectionné : passe en accent et montre son libellé. */
    selected?: boolean
    /** Montre le libellé en permanence. */
    showLabel?: boolean
    /** Pointe triangulaire à l'arrivée. Toujours absente sur un lien d'hébergement. */
    arrow?: boolean
    /** Rond creux au départ. Toujours absent sur un lien d'hébergement. */
    port?: boolean
    /** Réagit au survol et au clic (zone de saisie élargie à 12px). */
    interactive?: boolean
  }>(),
  { midX: undefined, kind: 'flow', label: undefined, selected: false, showLabel: false, arrow: true, port: true, interactive: true },
)

const emit = defineEmits<{
  /** Clic ou Entrée sur le lien. */
  select: [event: MouseEvent | KeyboardEvent]
  /** Entrée et sortie du survol. */
  hover: [hovered: boolean]
}>()

// Hors d'une McEdgeLayer, le lien déclare ses propres marqueurs.
const shared = inject(edgeMarkersKey, null)
const ownIds = shared ? null : markerIds(uniquePrefix('mc-edge', useId()))
const ids = shared ?? ownIds!

const hovered = ref(false)

const tone = computed<'base' | 'hover' | 'impact'>(() => {
  if (props.kind === 'impact') return 'impact'
  if (props.kind === 'hover' || ((hovered.value || props.selected) && props.kind !== 'host')) return 'hover'
  return 'base'
})

const pathClass = computed(() => {
  if (props.kind === 'host') return ['mc-edge', 'host', (hovered.value || props.selected) && 'is-hover']
  if (tone.value === 'hover') return ['mc-edge', 'hover']
  return ['mc-edge', props.kind !== 'flow' && props.kind]
})

const d = computed(() => routeEdge(props.from.x, props.from.y, props.to.x, props.to.y, props.midX))

const markerStart = computed(() => (props.port && props.kind !== 'host' ? `url(#${ids.port[tone.value]})` : undefined))
const markerEnd = computed(() => (props.arrow && props.kind !== 'host' ? `url(#${ids.arrow[tone.value]})` : undefined))

const labelVisible = computed(() => !!props.label && (props.showLabel || props.selected || hovered.value))
const labelPos = computed(() => {
  const straight = Math.abs(props.to.y - props.from.y) < 0.5
  const x = straight ? (props.from.x + props.to.x) / 2 : (props.midX ?? Math.round((props.from.x + props.to.x) / 2))
  // Sur un lien droit, la pilule se pose au-dessus du trait ; sur un lien coudé, au milieu du segment vertical.
  return { x, y: straight ? props.from.y - 18 : (props.from.y + props.to.y) / 2 }
})

function setHover(v: boolean) {
  if (!props.interactive) return
  hovered.value = v
  emit('hover', v)
}
</script>

<template>
  <g class="mc-edge-g" :class="{ 'is-interactive': interactive }">
    <McEdgeMarkers v-if="ownIds" :ids="ownIds" />
    <path :class="pathClass" :d="d" :marker-start="markerStart" :marker-end="markerEnd" />
    <path
      v-if="interactive"
      class="mc-edge-hit"
      :d="d"
      role="button"
      tabindex="0"
      :aria-label="label ? `Lien : ${label}` : 'Lien'"
      :aria-pressed="selected"
      @pointerenter="setHover(true)"
      @pointerleave="setHover(false)"
      @focus="setHover(true)"
      @blur="setHover(false)"
      @click="emit('select', $event)"
      @keydown.enter.prevent="emit('select', $event)"
      @keydown.space.prevent="emit('select', $event)"
    />
    <foreignObject
      v-if="labelVisible"
      :x="labelPos.x - 150"
      :y="labelPos.y - 10"
      width="300"
      height="20"
      class="mc-edge-fo"
    >
      <div class="mc-edge-label-wrap"><span class="mc-edge-label">{{ label }}</span></div>
    </foreignObject>
  </g>
</template>

<style>
.mc-edge-hit { fill: none; stroke: transparent; stroke-width: 12; pointer-events: stroke; cursor: pointer; outline: none; }
.mc-edge-g .mc-edge { transition: stroke var(--dur-fast, .12s), opacity .2s; }
.mc-edge.host.is-hover { stroke: var(--accent); }
.mc-edge-fo { overflow: visible; pointer-events: none; }
.mc-edge-label-wrap { display: flex; justify-content: center; align-items: center; height: 20px; }
</style>
