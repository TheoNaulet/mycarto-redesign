<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import McButton from '../McButton/McButton.vue'

withDefaults(
  defineProps<{
    /** Ce qui n'a pas marché, sans jargon : « Impossible de charger les applications ». */
    title?: string
    /** Ce que la personne peut faire, et ce qui est préservé : « Vos données ne sont pas perdues. » */
    text?: string
    /** Détail technique facultatif (code, message du serveur), replié sous « Détails techniques ». */
    details?: string
    /** Libellé du bouton de nouvel essai. Vide pour ne pas l'afficher. */
    retryLabel?: string
    /** Nouvel essai en cours : roue dans le bouton. */
    retrying?: boolean
    /** compact : pour un tableau, un panneau ou une liste. */
    size?: 'md' | 'compact'
  }>(),
  {
    title: 'Impossible de charger les données',
    text: 'La connexion au serveur a échoué. Vos données ne sont pas perdues : réessayez dans un instant.',
    details: undefined,
    retryLabel: 'Réessayer',
    retrying: false,
    size: 'md',
  },
)

defineEmits<{ /** Nouvel essai demandé. */ retry: [] }>()
defineSlots<{
  /** Remplace le texte. */
  default?: () => unknown
  /** Actions supplémentaires, à droite de « Réessayer ». */
  action?: () => unknown
}>()
</script>

<template>
  <div class="mc-error mc-error-state" :class="size === 'compact' && 'compact'" role="alert">
    <span class="art"><McIcon name="alert-octagon" :size="size === 'compact' ? 'lg' : 'xl'" /></span>
    <b>{{ title }}</b>
    <p v-if="text || $slots.default"><slot>{{ text }}</slot></p>
    <div v-if="retryLabel || $slots.action" class="act mc-row">
      <McButton v-if="retryLabel" variant="outline" size="sm" icon="undo" :loading="retrying" @click="$emit('retry')">{{ retryLabel }}</McButton>
      <slot name="action" />
    </div>
    <details v-if="details" class="dt">
      <summary>Détails techniques</summary>
      <code class="mc-code">{{ details }}</code>
    </details>
  </div>
</template>

<style>
.mc-error-state .act { justify-content: center; margin-top: 4px; }
.mc-error-state .dt { max-width: 360px; font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
.mc-error-state .dt summary { cursor: pointer; }
.mc-error-state .dt code { display: block; margin-top: 6px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--surface-sunken); color: var(--ink-muted); text-align: left; overflow-wrap: anywhere; }
.mc-error-state.compact { padding: var(--space-5) var(--space-4); }
.mc-error-state.compact .art { width: 48px; height: 48px; border-radius: 14px; }
</style>
