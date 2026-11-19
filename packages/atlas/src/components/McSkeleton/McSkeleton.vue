<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Nombre de lignes de texte simulées. La dernière est plus courte, comme un vrai paragraphe. */
    lines?: number
    /** Hauteur d'une ligne ou du bloc : nombre (px) ou longueur CSS. 12px par défaut pour une ligne, 40px pour un bloc. */
    height?: number | string
    /** Largeur : nombre (px), longueur CSS, ou une largeur par ligne. 100 % par défaut. */
    width?: number | string | Array<number | string>
    /** line : lignes de texte ; block : rectangle (tuile, carte) ; circle : avatar, pastille. */
    shape?: 'line' | 'block' | 'circle'
    /** Écart entre les lignes, en px. */
    gap?: number
    /** Texte lu par les lecteurs d'écran. Vide pour un squelette à l'intérieur d'une zone déjà annoncée (aria-busy). */
    label?: string
  }>(),
  { lines: 1, height: undefined, width: undefined, shape: 'line', gap: 8, label: 'Chargement' },
)

const len = (v: number | string | undefined) => (typeof v === 'number' ? `${v}px` : v)

const items = computed(() => {
  const count = props.shape === 'line' ? Math.max(1, props.lines) : 1
  const h = len(props.height) ?? (props.shape === 'line' ? '12px' : '40px')
  return Array.from({ length: count }, (_, i) => {
    let w: string | undefined
    if (Array.isArray(props.width)) w = len(props.width[i % props.width.length])
    else w = len(props.width)
    if (!w) w = props.shape === 'circle' ? h : count > 1 && i === count - 1 ? '60%' : '100%'
    return { width: w, height: h }
  })
})
</script>

<template>
  <span
    class="mc-skeleton"
    :style="{ gap: `${gap}px` }"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : 'true'"
  >
    <span v-for="(s, i) in items" :key="i" class="mc-skel" :class="shape !== 'line' && `is-${shape}`" :style="s" />
  </span>
</template>

<style>
.mc-skeleton { display: grid; width: 100%; }
.mc-skeleton .mc-skel { display: block; max-width: 100%; }
.mc-skeleton .mc-skel.is-block { border-radius: var(--radius-md); }
.mc-skeleton .mc-skel.is-circle { border-radius: 50%; }
</style>
