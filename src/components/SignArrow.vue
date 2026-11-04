<script setup lang="ts">
// Directional arrow pictogram, drawn like wayfinding signage.
const props = withDefaults(defineProps<{ dir?: 'up' | 'down' | 'left' | 'right' }>(), { dir: 'right' })
const rotation = { right: 0, down: 90, left: 180, up: 270 }[props.dir]
</script>

<template>
  <svg class="sign-arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <g :transform="`rotate(${rotation} 12 12)`">
      <path d="M4 12h14M12.5 5.5 19 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>
</template>

<style scoped>
.sign-arrow {
  width: 1em;
  height: 1em;
  flex: none;
}
</style>
