<script setup lang="ts">
import { provide, useId } from 'vue'
import McEdge from './McEdge.vue'
import McEdgeMarkers from './McEdgeMarkers.vue'
import { edgeMarkersKey, markerIds, uniquePrefix, type McEdgeSpec } from './edge'

withDefaults(
  defineProps<{
    /** Les liens à tracer, en coordonnées du canevas (pixels). */
    edges?: McEdgeSpec[]
    /** Rend les liens survolables et cliquables. */
    interactive?: boolean
  }>(),
  { edges: () => [], interactive: true },
)

const emit = defineEmits<{
  /** Clic sur un lien : son identifiant. */
  select: [id: string]
  /** Survol d'un lien : son identifiant, ou null à la sortie. */
  hover: [id: string | null]
}>()

// Une seule série de marqueurs par couche, aux identifiants uniques dans la page.
const ids = markerIds(uniquePrefix('mc-edges', useId()))
provide(edgeMarkersKey, ids)
</script>

<template>
  <svg class="mc-edge-layer" role="group" aria-label="Liens de la carte">
    <McEdgeMarkers :ids="ids" />
    <McEdge
      v-for="e in edges"
      :key="e.id"
      :from="e.from"
      :to="e.to"
      :mid-x="e.midX"
      :kind="e.kind ?? 'flow'"
      :label="e.label"
      :selected="e.selected ?? false"
      :show-label="e.showLabel ?? false"
      :arrow="e.arrow ?? true"
      :port="e.port ?? true"
      :interactive="interactive"
      @select="emit('select', e.id)"
      @hover="(h) => emit('hover', h ? e.id : null)"
    />
    <slot />
  </svg>
</template>

<style>
.mc-edge-layer { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
</style>
