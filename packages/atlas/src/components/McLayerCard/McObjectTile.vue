<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import type { Layer, Status } from '../../utils/types'

const props = withDefaults(
  defineProps<{
    /** Nom du type : « Applications », « Pays ». */
    label: string
    /** Pictogramme du type, 28px dans un carré à la couleur de la couche. */
    icon: IconName
    /** Couche du type. Inutile dans une `McLayerCard`, qui la transmet. */
    layer?: Layer
    /** Nombre de cartes de ce type : icône carte + nombre, en haut à gauche. */
    maps?: number
    /** Objets qui demandent une action : puce en haut à droite (« 25 »), `title` lu et en infobulle (« 25 applications non valides »). */
    alert?: { status: Status; label: string; title?: string }
    /** Aucun objet de ce type : tuile estompée et grise. */
    empty?: boolean
    /** Infobulle de la tuile vide. */
    emptyHint?: string
    /** Lien de la tuile. Sans lien, la tuile est un bouton. */
    href?: string
  }>(),
  { layer: undefined, maps: undefined, alert: undefined, empty: false, emptyHint: undefined, href: undefined },
)

defineEmits<{ /** Ouverture du type (liste, carte ou choix de carte s'il y en a plusieurs). */ open: [event: MouseEvent] }>()

const aria = computed(() =>
  [
    props.label,
    props.empty ? (props.emptyHint ?? 'aucun objet') : undefined,
    props.alert ? (props.alert.title ?? props.alert.label) : undefined,
    props.maps ? `${props.maps} ${props.maps > 1 ? 'cartes' : 'carte'}` : undefined,
  ]
    .filter(Boolean)
    .join(', '),
)
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : 'button'"
    class="mc-tile mc-otile"
    :class="[layer && `l-${layer}`, empty && 'is-empty']"
    :aria-label="aria"
    :title="empty ? (emptyHint ?? 'Aucun objet saisi') : alert?.title"
    @click="$emit('open', $event)"
  >
    <span v-if="maps" class="maps"><McIcon name="map" size="sm" />{{ maps }}</span>
    <span class="ic"><McIcon :name="icon" size="xl" /></span>
    <b>{{ label }}</b>
    <McStatusChip v-if="alert" class="n" :status="alert.status" size="sm">{{ alert.label }}</McStatusChip>
  </component>
</template>

<style>
.mc-otile { font: inherit; color: inherit; text-decoration: none; margin: 0; }
.mc-otile .maps .mc-ico { width: 12px; height: 12px; }
.mc-otile b { max-width: 100%; overflow-wrap: anywhere; }
.mc-otile.is-empty:hover { box-shadow: none; transform: none; }
.mc-otile:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
</style>
