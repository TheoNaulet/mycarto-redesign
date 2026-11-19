<script setup lang="ts">
import { computed, useSlots } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

const props = withDefaults(
  defineProps<{
    /** Nom de l'objet parent : « Scolarité », « Paris », « Rack 1 ». Pour un `env` : « Production ». */
    name: string
    /** Type écrit dans l'onglet : « Domaine », « Site », « Rack ». Ignoré pour un `env` (ce n'est pas un objet). */
    type?: string
    /** Couche du type : couleur de l'onglet, du fond (55 %) et de la bordure (35 %). */
    layer: Layer
    /** Pictogramme de la tuile d'en-tête. */
    icon?: IconName
    /** Nombre d'enfants, affiché dans l'en-tête et conservé une fois replié. */
    count?: number
    /** Ce que compte le compteur, dit au survol : « 10 applications ». */
    countLabel?: string
    /** `default` objet parent, `zone` grande zone (POS, organigramme), `env` regroupement sans objet (PROD, DEV). */
    variant?: 'default' | 'zone' | 'env'
    /** Affiche le bouton de repli dans l'en-tête. */
    collapsible?: boolean
    /** Sélectionné : contour accent. */
    selected?: boolean
    /** Estompé : hors filtre ou hors chemin. */
    dimmed?: boolean
    /** Force l'état vide, même si des enfants sont passés. */
    empty?: boolean
    /** Texte de l'état vide. */
    emptyText?: string
  }>(),
  {
    type: undefined,
    icon: undefined,
    count: undefined,
    countLabel: undefined,
    variant: 'default',
    collapsible: true,
    selected: false,
    dimmed: false,
    empty: false,
    emptyText: 'Aucun objet dans ce domaine',
  },
)

/** Replié : ne garde que l'en-tête et le compteur. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const emit = defineEmits<{
  /** Clic sur l'en-tête : sélectionner le conteneur. */
  select: [event: MouseEvent]
  /** Double-clic sur l'en-tête : ouvrir la carte de l'objet parent. */
  open: [event: MouseEvent]
}>()

const slots = useSlots()
const isEmpty = computed(() => props.empty || props.count === 0 || !slots.default)
const showTab = computed(() => props.variant !== 'env' && !!props.type)
const classes = computed(() => [
  'mc-group',
  `l-${props.layer}`,
  props.variant !== 'default' && props.variant,
  collapsed.value && 'is-collapsed',
  props.selected && 'is-selected',
  props.dimmed && 'is-dim',
])
const toggleLabel = computed(() => `${collapsed.value ? 'Déplier' : 'Replier'} ${props.name}`)
</script>

<template>
  <section :class="classes" :aria-label="showTab ? `${type} ${name}` : name">
    <span v-if="showTab" class="mc-tab">{{ type }}</span>
    <div class="gh" @click="emit('select', $event)" @dblclick="emit('open', $event)">
      <span v-if="icon" class="tile"><McIcon :name="icon" /></span>
      <b>{{ name }}</b>
      <span class="grow" />
      <span v-if="count !== undefined" class="mc-count" :title="countLabel" :aria-label="countLabel ?? `${count} objets`">{{ count }}</span>
      <button
        v-if="collapsible"
        type="button"
        class="mc-ibtn sm mc-group-toggle"
        :aria-expanded="!collapsed"
        :aria-label="toggleLabel"
        :title="toggleLabel"
        @click.stop="collapsed = !collapsed"
      >
        <McIcon :name="collapsed ? 'chevron-right' : 'chevron-down'" size="sm" />
      </button>
    </div>
    <div v-if="!collapsed" class="gb">
      <p v-if="isEmpty" class="mc-group-empty">{{ emptyText }}</p>
      <slot v-else />
    </div>
  </section>
</template>

<style>
.mc-group > .gh { cursor: default; }
.mc-group-toggle { margin-right: -6px; }
.mc-group.is-selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.mc-group.is-selected > .mc-tab { box-shadow: 0 0 0 1px var(--accent); }
.mc-group.is-dim { opacity: .32; }
.mc-group { transition: opacity .2s, border-color var(--dur-fast, .12s); }
.mc-group-empty { flex: 1; margin: 0; padding: 14px 12px; border: 1px dashed color-mix(in srgb, var(--lc) 35%, transparent); border-radius: var(--radius-sm); font-size: 12px; line-height: 16px; color: var(--ink-subtle); text-align: center; }
</style>
