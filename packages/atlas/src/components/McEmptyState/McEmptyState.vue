<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

withDefaults(
  defineProps<{
    /** Pictogramme dans le carré : celui du type d'objet attendu, ou la loupe pour une recherche. */
    icon?: IconName
    /** Couche du type attendu : colore le carré. Applicative par défaut. */
    layer?: Layer
    /** Ce qui est vide, en une phrase courte : « Aucune application ne correspond à ces filtres ». */
    title: string
    /** Pourquoi c'est vide et quoi faire : « Effacez un filtre ou cherchez dans toutes les couches. » */
    text?: string
    /** compact : pour un tableau, un panneau ou une liste (carré 56px, moins de marges). */
    size?: 'md' | 'compact'
  }>(),
  { icon: 'search', layer: 'applicatif', text: undefined, size: 'md' },
)

defineSlots<{
  /** Remplace le texte (liens, mise en forme). */
  default?: () => unknown
  /** Une action, rarement deux : « Effacer les filtres », « Ajouter des objets ». */
  action?: () => unknown
}>()
</script>

<template>
  <div class="mc-empty mc-empty-state" :class="[`l-${layer}`, size === 'compact' && 'compact']">
    <span class="art"><McIcon :name="icon" :size="size === 'compact' ? 'lg' : 'xl'" /></span>
    <b>{{ title }}</b>
    <p v-if="text || $slots.default"><slot>{{ text }}</slot></p>
    <div v-if="$slots.action" class="act mc-row"><slot name="action" /></div>
  </div>
</template>

<style>
.mc-empty-state .art { background: var(--ls); color: var(--lc); }
.mc-empty-state .mc-ico.xl { width: 40px; height: 40px; }
.mc-empty-state .act { justify-content: center; margin-top: 4px; }
.mc-empty-state.compact { padding: var(--space-5) var(--space-4); gap: 8px; }
.mc-empty-state.compact .art { width: 56px; height: 56px; border-radius: 16px; }
.mc-empty-state.compact .mc-ico.lg { width: 28px; height: 28px; }
.mc-empty-state.compact b { font-size: 15px; line-height: 20px; }
</style>
