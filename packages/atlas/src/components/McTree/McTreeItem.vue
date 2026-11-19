<script setup lang="ts">
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

withDefaults(
  defineProps<{
    /** Libellé de l'élément. */
    label: string
    /** Niveau d'indentation (0 = racine), 16px par niveau. */
    level?: number
    /** Couche : point de couleur devant le libellé. */
    layer?: Layer
    /** Pictogramme à la place du point de couche. */
    icon?: IconName
    /** Compteur d'occurrences à droite. */
    count?: number
    /** A des enfants : affiche le chevron de dépliage. */
    expandable?: boolean
    /** Enfants visibles. */
    expanded?: boolean
    /** Élément sélectionné (`accent-soft`, gras). */
    selected?: boolean
    /** Racine regroupante : libellé atténué en gras (les 4 couches de l'explorateur). */
    group?: boolean
    /** Reçoit le focus clavier (une seule à 0 dans l'arbre). */
    focusable?: boolean
    /** Survol forcé, pour la documentation. */
    hover?: boolean
    /** Position dans la fratrie, pour les lecteurs d'écran. */
    posinset?: number
    /** Taille de la fratrie, pour les lecteurs d'écran. */
    setsize?: number
  }>(),
  { level: 0, layer: undefined, icon: undefined, count: undefined, posinset: undefined, setsize: undefined },
)

defineEmits<{
  /** Clic sur le libellé. */
  select: [event: MouseEvent]
  /** Clic sur le chevron. */
  toggle: [event: MouseEvent]
}>()
</script>

<template>
  <div
    class="it"
    :class="[layer && `l-${layer}`, { 'is-on': selected, grp: group, 'is-hover': hover }]"
    role="treeitem"
    :aria-level="level + 1"
    :aria-selected="selected"
    :aria-expanded="expandable ? expanded : undefined"
    :aria-posinset="posinset"
    :aria-setsize="setsize"
    :tabindex="focusable ? 0 : -1"
    :style="{ paddingLeft: `${8 + level * 16}px` }"
    @click="$emit('select', $event)"
  >
    <span class="tw" @click.stop="expandable && $emit('toggle', $event)">
      <McIcon v-if="expandable" :name="expanded ? 'chevron-down' : 'chevron-right'" size="sm" />
    </span>
    <McIcon v-if="icon" :name="icon" size="sm" class="mc-tree-ic" />
    <span v-else-if="layer" class="ld" aria-hidden="true" />
    <span class="grow">{{ label }}</span>
    <span v-if="$slots.action" class="act" @click.stop @keydown.stop><slot name="action" /></span>
    <span v-if="count !== undefined" class="mc-count">{{ count }}</span>
  </div>
</template>
