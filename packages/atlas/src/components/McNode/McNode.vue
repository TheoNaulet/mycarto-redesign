<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import { statusIcon, type Layer, type Status } from '../../utils/types'

const props = withDefaults(
  defineProps<{
    /** Nom de l'objet, casse saisie (jamais forcée en capitales). */
    name: string
    /** Type écrit dans l'onglet : « Application », « VM », « Contrat »… */
    type: string
    /** Couche du type : donne la couleur de l'onglet et de la tuile. Jamais un état. */
    layer: Layer
    /** Pictogramme du type. */
    icon: IconName
    /** Un fait, pas le type (déjà dans l'onglet) : « 32 utilisateurs ». */
    subtitle?: string
    /** État affiché à droite (icône), quand une lentille ou une règle s'applique. */
    status?: Status
    /** Colore le nœud selon l'état (lentille active). */
    lens?: boolean
    /** default 48px sur 2 lignes, compact 36px sur 1 ligne (sous 40 % de zoom). */
    density?: 'default' | 'compact'
    selected?: boolean
    /** Halo jaune : trouvé par la recherche. */
    match?: boolean
    /** Estompé : hors filtre ou hors chemin. */
    dimmed?: boolean
    /** Objet principal de la carte (étoile devant le nom). */
    main?: boolean
    /** Données en cours de chargement : squelette. */
    loading?: boolean
    /** Objet introuvable ou en erreur : contour pointillé rouge. */
    error?: boolean
    /** Étiquette d'appartenance en pointillé sous le nœud : « Cluster philosophe ». */
    member?: string
  }>(),
  { density: 'default', subtitle: undefined, status: undefined, member: undefined },
)

defineEmits<{ select: [event: MouseEvent]; open: [event: MouseEvent] }>()

const classes = computed(() => [
  'mc-node',
  `l-${props.layer}`,
  props.density === 'compact' && 'compact',
  props.selected && 'is-selected',
  props.match && 'is-match',
  props.dimmed && 'is-dim',
  props.loading && 'is-loading',
  props.error && 'is-error',
  props.lens && props.status && `lens-${props.status}`,
])
</script>

<template>
  <div
    :class="classes"
    role="button"
    tabindex="0"
    :aria-pressed="selected"
    :aria-busy="loading || undefined"
    :aria-label="`${type} ${name}${status ? ', état ' + status : ''}`"
    @click="$emit('select', $event)"
    @dblclick="$emit('open', $event)"
    @keydown.enter="$emit('open', $event as unknown as MouseEvent)"
  >
    <span class="mc-tab">{{ type }}</span>
    <span class="tile"><McIcon :name="error ? 'alert-octagon' : icon" /></span>
    <span class="tx">
      <b><span v-if="main" style="color: var(--data-2)" aria-label="Objet principal">★ </span>{{ loading ? 'Chargement' : name }}</b>
      <span v-if="error">Introuvable : supprimé ou sans droits</span>
      <span v-else-if="subtitle || loading">{{ loading ? 'Chargement' : subtitle }}</span>
    </span>
    <span v-if="status && !loading" class="st" :class="status"><McIcon :name="statusIcon[status]" /></span>
    <template v-if="selected">
      <span class="hdl" style="left: -4px; top: -4px" /><span class="hdl" style="right: -4px; top: -4px" />
      <span class="hdl" style="left: -4px; bottom: -4px" /><span class="hdl" style="right: -4px; bottom: -4px" />
    </template>
    <span v-if="member" class="member mc-chip member sm" style="background: var(--surface)">{{ member }}</span>
  </div>
</template>
