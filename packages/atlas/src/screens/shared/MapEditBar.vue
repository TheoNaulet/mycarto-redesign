<script setup lang="ts">
// Barre du bas en mode modification : remplace la barre d'outils de lecture.
// À gauche, les ajouts propres à la carte (slot) ; puis Annuler, le compte des modifications, Abandonner et Terminer.
import McIcon from '../../icons/McIcon.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'

defineProps<{
  count: number
  countLabel: string
  /** Ce qu'on peut faire sur cette carte, en une phrase. */
  hint?: string
}>()
defineEmits<{ undo: []; discard: []; finish: [] }>()
</script>

<template>
  <div class="mc-float mc-toolbar mc-mapedit" role="toolbar" aria-label="Modification de la carte">
    <span class="mc-mapedit-mode"><McIcon name="pencil" size="sm" />Modification</span>
    <span v-if="$slots.default" class="mc-sep" aria-hidden="true" />
    <slot />
    <span class="mc-sep" aria-hidden="true" />
    <McIconButton icon="undo" size="lg" label="Annuler" shortcut="⌘Z" :disabled="!count" @click="$emit('undo')" />
    <span class="mc-mapedit-count" :class="{ 'is-dirty': count }" aria-live="polite" :title="hint">{{ countLabel }}</span>
    <McButton variant="ghost" @click="$emit('discard')">Abandonner</McButton>
    <McButton variant="primary" icon="check" @click="$emit('finish')">Terminer</McButton>
  </div>
</template>

<style>
.mc-mapedit { gap: 6px; padding-inline: 10px 6px; }
.mc-mapedit-mode { display: inline-flex; align-items: center; gap: 6px; font: 600 13px/18px var(--font-sans); color: var(--accent); white-space: nowrap; }
.mc-mapedit-count { padding: 0 6px; font-size: 12px; line-height: 16px; color: var(--ink-subtle); white-space: nowrap; font-variant-numeric: tabular-nums; }
.mc-mapedit-count.is-dirty { color: var(--ink-muted); }
</style>
