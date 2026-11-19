<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import { statusIcon, type Status } from '../../utils/types'

withDefaults(
  defineProps<{
    /** ok, warn, critical, unknown ; neutral pour une valeur sans état (« Prévue »). */
    status?: Status | 'neutral'
    size?: 'sm' | 'md'
  }>(),
  { status: 'neutral', size: 'md' },
)
</script>

<template>
  <span class="mc-chip" :class="[status, size === 'sm' && 'sm']">
    <McIcon v-if="status !== 'neutral'" :name="statusIcon[status]" />
    <slot />
  </span>
</template>
