<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Le nombre affiché. Ignoré en mode `dot`. */
    count?: number
    /** default (gris), strong (navy, onglet actif), alert (rouge, notifications non lues). */
    variant?: 'default' | 'strong' | 'alert'
    /** Au-delà, affiche « 99+ ». */
    max?: number
    /** Pastille sans chiffre : « il y a du nouveau ». */
    dot?: boolean
    /** Texte lu par les lecteurs d'écran, accordé : « 3 notifications non lues ». Sans lui, le nombre seul est lu. */
    label?: string
  }>(),
  { count: 0, variant: 'default', max: 99, dot: false, label: undefined },
)

const text = computed(() => (props.count > props.max ? `${props.max}+` : String(props.count)))
</script>

<template>
  <span v-if="dot" class="mc-dot-badge mc-dot-badge-inline" :role="label ? 'status' : undefined" :aria-label="label" :aria-hidden="label ? undefined : 'true'" />
  <span v-else class="mc-count" :class="variant !== 'default' && variant" :aria-label="label" :role="label ? 'status' : undefined">{{ text }}</span>
</template>

<style>
.mc-dot-badge-inline { display: inline-block; flex: none; }
</style>
