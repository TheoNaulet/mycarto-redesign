<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

withDefaults(
  defineProps<{
    /** Nom du type en toutes lettres : « Application », « Machine virtuelle ». */
    type: string
    /** Couche du type : donne la couleur de la pastille, jamais un état. */
    layer: Layer
    /** Pictogramme du type. */
    icon: IconName
    /** sm 18px (tableaux denses), md 22px. */
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)
</script>

<template>
  <span class="mc-chip type" :class="[`l-${layer}`, size === 'sm' && 'sm']">
    <span class="sw" aria-hidden="true"><McIcon :name="icon" /></span>
    {{ type }}
  </span>
</template>

<style>
.mc-chip.type.sm { padding-left: 2px; }
.mc-chip.type.sm .sw { width: 14px; height: 14px; }
.mc-chip.type.sm .sw .mc-ico { width: 9px; height: 9px; }
</style>
