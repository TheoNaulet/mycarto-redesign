<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { Layer } from '../../utils/types'

/** Une donnée échangée par le flux, listée dans la variante `card`. */
export interface McFlowData {
  /** Nom de la donnée : « Données de santé ». */
  label: string
  /** Couche de l'objet donnée, pour la couleur de son pictogramme. */
  layer?: Layer
}

const props = withDefaults(
  defineProps<{
    /** Libellé du flux, formulé comme une action : « Maj des données étudiantes ». */
    label: string
    /** Métadonnée facultative après le libellé (fréquence) : « quotidien ». */
    meta?: string
    /** Sens : `one` unidirectionnel (→), `both` bidirectionnel (⇄). */
    direction?: 'one' | 'both'
    /** `pill` pilule de 26px posée sur le lien, `card` carte qui liste les données échangées. */
    variant?: 'pill' | 'card'
    /** Largeur en pixels : 210 pour une pilule, 220 pour une carte. */
    width?: number
    /** Données échangées, affichées par la variante `card`. */
    data?: McFlowData[]
    /** Sélectionné : contour accent. */
    selected?: boolean
    /** Survolé (forcé) : contour accent, comme son lien. */
    hover?: boolean
    /** Estompé : hors filtre ou hors chemin. */
    dimmed?: boolean
  }>(),
  { meta: undefined, direction: 'one', variant: 'pill', width: undefined, data: () => [], selected: false, hover: false, dimmed: false },
)

defineEmits<{
  /** Clic ou Entrée sur le flux. */
  select: [event: MouseEvent | KeyboardEvent]
}>()

const icon = computed(() => (props.direction === 'both' ? 'flow' : 'arrow-right'))
const w = computed(() => props.width ?? (props.variant === 'card' ? 220 : 210))
const classes = computed(() => [
  props.variant === 'card' ? 'mc-flow-card' : 'mc-flow',
  props.selected && 'is-selected',
  props.hover && 'is-hover',
  props.dimmed && 'is-dim',
])
const aria = computed(
  () => `Flux ${props.direction === 'both' ? 'bidirectionnel' : 'unidirectionnel'} : ${props.label}${props.meta ? ', ' + props.meta : ''}`,
)
</script>

<template>
  <div
    :class="classes"
    :style="{ width: w + 'px' }"
    role="button"
    tabindex="0"
    :aria-pressed="selected"
    :aria-label="aria"
    @click="$emit('select', $event)"
    @keydown.enter.prevent="$emit('select', $event)"
    @keydown.space.prevent="$emit('select', $event)"
  >
    <template v-if="variant === 'card'">
      <div class="top">
        <span class="dir"><McIcon :name="icon" /></span>
        <span class="grow">{{ label }}</span>
      </div>
      <span v-if="meta" class="mc-flow-meta">{{ meta }}</span>
      <span v-for="item in data" :key="item.label" class="mc-data" :class="item.layer && `l-${item.layer}`">
        <McIcon name="database" size="sm" />{{ item.label }}
      </span>
      <span v-if="!data.length" class="mc-flow-empty">Aucune donnée renseignée</span>
    </template>
    <template v-else>
      <span class="dir"><McIcon :name="icon" /></span>
      <span class="mc-flow-label">{{ label }}</span>
      <span v-if="meta" class="meta">· {{ meta }}</span>
    </template>
  </div>
</template>

<style>
.mc-flow, .mc-flow-card { cursor: pointer; transition: border-color var(--dur-fast, .12s), box-shadow var(--dur-fast, .12s), opacity .2s; }
.mc-flow-label { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
.mc-flow .meta { flex: none; }
.mc-flow:hover, .mc-flow.is-hover, .mc-flow-card:hover, .mc-flow-card.is-hover { border-color: var(--accent); }
.mc-flow-card.is-selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.mc-flow.is-dim, .mc-flow-card.is-dim { opacity: .32; }
.mc-flow-card .mc-data .mc-ico { color: var(--lc, var(--ink-subtle)); }
.mc-flow-meta { font-size: 11px; line-height: 14px; color: var(--ink-subtle); padding-left: 24px; }
.mc-flow-empty { font-size: 12px; line-height: 16px; color: var(--ink-subtle); padding: 2px 8px; }
</style>
