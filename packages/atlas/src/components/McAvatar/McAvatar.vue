<script lang="ts">
/** Initiales d'un nom : « Anne Rivière » → « AR », « sophocle » → « SO ». */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/[\s\-_.]+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Couleur stable (1 à 6) déduite du nom, quand aucune n'est attribuée. */
export function colorOf(name: string): 1 | 2 | 3 | 4 | 5 | 6 {
  let h = 0
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0
  return ((h % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Nom complet de la personne : donne les initiales et le nom lu par les lecteurs d'écran. */
    name: string
    /** Rôle affiché dans l'infobulle après le nom : « Référent métier ». */
    role?: string
    /** Initiales imposées (sinon déduites du nom). */
    initials?: string
    /** Couleur attribuée à la personne (data-1 à data-6), la même pour son avatar, son curseur et ses post-its. Sinon déduite du nom. */
    color?: 1 | 2 | 3 | 4 | 5 | 6
    /** md 24px, lg 32px. */
    size?: 'md' | 'lg'
  }>(),
  { role: undefined, initials: undefined, color: undefined, size: 'md' },
)

const text = computed(() => props.initials ?? initialsOf(props.name))
const tone = computed(() => props.color ?? colorOf(props.name))
const tooltip = computed(() => (props.role ? `${props.name}, ${props.role}` : props.name))
</script>

<template>
  <span class="mc-avatar" :class="size === 'lg' && 'lg'" :data-color="tone" role="img" :aria-label="tooltip" :title="tooltip">
    <span aria-hidden="true">{{ text }}</span>
  </span>
</template>

<style>
.mc-avatar[data-color="1"] { background: var(--data-1); }
.mc-avatar[data-color="2"] { background: var(--data-2); }
.mc-avatar[data-color="3"] { background: var(--data-3); }
.mc-avatar[data-color="4"] { background: var(--data-4); }
.mc-avatar[data-color="5"] { background: var(--data-5); }
.mc-avatar[data-color="6"] { background: var(--data-6); }
</style>
