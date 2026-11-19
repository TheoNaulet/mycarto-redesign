<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

withDefaults(
  defineProps<{
    /** tag (contour plein) : rôle dans la carte. member (pointillé) : appartenance à un regroupement non dessiné. */
    variant?: 'tag' | 'member'
    /** Pictogramme facultatif devant le libellé (le type du regroupement, par exemple). */
    icon?: IconName
    /** sm 18px (sous un nœud), md 22px. */
    size?: 'sm' | 'md'
  }>(),
  { variant: 'tag', icon: undefined, size: 'md' },
)
</script>

<template>
  <span class="mc-chip" :class="[variant, size === 'sm' && 'sm']">
    <McIcon v-if="icon" :name="icon" size="sm" />
    <slot />
  </span>
</template>
