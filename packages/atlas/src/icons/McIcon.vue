<script setup lang="ts">
import { computed } from 'vue'
import { icons, type IconName } from './icons'

const props = withDefaults(
  defineProps<{
    /** Nom du pictogramme (voir la page Fondations / Pictogrammes). */
    name: IconName
    /** Taille : sm 14px, md 16px, lg 20px, xl 28px. */
    size?: 'sm' | 'md' | 'lg' | 'xl'
    /** Texte lu par les lecteurs d'écran. Sans lui, l'icône est décorative. */
    label?: string
  }>(),
  { size: 'md', label: undefined },
)

const body = computed(() => icons[props.name] ?? icons['help-circle'])
</script>

<template>
  <span
    class="mc-ico"
    :class="size !== 'md' && size"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      v-html="body"
    />
  </span>
</template>
