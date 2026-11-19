<script setup lang="ts">
import type { McEdgeMarkers } from './edge'

defineProps<{
  /** Identifiants des marqueurs à déclarer (voir `markerIds`). */
  ids: McEdgeMarkers
}>()

const tones = ['base', 'hover', 'impact'] as const
</script>

<template>
  <defs>
    <marker
      v-for="t in tones"
      :id="ids.port[t]"
      :key="'p' + t"
      viewBox="0 0 12 12"
      refX="6"
      refY="6"
      markerWidth="11"
      markerHeight="11"
      markerUnits="userSpaceOnUse"
    >
      <circle cx="6" cy="6" r="3.5" :class="['mc-port', t !== 'base' && t]" />
    </marker>
    <marker
      v-for="t in tones"
      :id="ids.arrow[t]"
      :key="'a' + t"
      viewBox="0 0 24 24"
      refX="7"
      refY="12"
      markerWidth="13"
      markerHeight="13"
      markerUnits="userSpaceOnUse"
      orient="auto"
    >
      <path d="M7 6.5 L18 12 L7 17.5 Z" :class="['mc-arrow', t !== 'base' && t]" />
    </marker>
  </defs>
</template>
