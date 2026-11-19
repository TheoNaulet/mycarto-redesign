<script setup lang="ts">
withDefaults(
  defineProps<{
    /** Prénom de la personne : « Samuel ». */
    name: string
    /** Couleur de la personne, 1 à 6 (`data-1…6`), la même que son avatar dans l'AppBar. */
    color?: 1 | 2 | 3 | 4 | 5 | 6
    /** Inactif : curseur estompé, avant de disparaître après 10 s. */
    idle?: boolean
  }>(),
  { color: 1, idle: false },
)
</script>

<template>
  <span class="mc-cursor" :class="{ 'is-idle': idle }" role="img" :aria-label="`${name}${idle ? ', inactif' : ''} est sur la carte`">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 2l16 8-7 2-3 7z" class="mc-cursor-arrow" :style="{ fill: `var(--data-${color})` }" />
    </svg>
    <span class="nm" :style="{ background: `var(--data-${color})` }">{{ name }}</span>
  </span>
</template>

<style>
.mc-cursor { pointer-events: none; transition: opacity .4s; }
.mc-cursor.is-idle { opacity: .4; }
.mc-cursor-arrow { stroke: var(--surface); stroke-width: 1.5; stroke-linejoin: round; }
[data-theme="dark"] .mc-cursor .nm { color: var(--navy-deep); }
</style>
