<script setup lang="ts">
withDefaults(
  defineProps<{
    /** sm 14px (dans un bouton, une ligne), md 20px (une zone, un panneau). */
    size?: 'sm' | 'md'
    /** Ce qui se passe, lu par les lecteurs d'écran : « Export en cours ». Au-delà de 10 s, l'afficher aussi à l'écran. */
    label?: string
  }>(),
  { size: 'md', label: 'Chargement' },
)
</script>

<template>
  <span class="mc-spin mc-spinner" :class="size === 'sm' && 'sm'" role="status">
    <span class="mc-sr">{{ label }}</span>
  </span>
</template>

<style>
.mc-spinner { display: inline-block; flex: none; box-sizing: border-box; vertical-align: middle; }
.mc-spinner.sm { width: 14px; height: 14px; }
</style>
