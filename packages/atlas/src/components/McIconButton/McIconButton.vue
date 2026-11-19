<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

const props = withDefaults(
  defineProps<{
    /** Pictogramme affiché. */
    icon: IconName
    /** Nom de l'action, lu par les lecteurs d'écran et affiché en infobulle : « Modifier la carte ». Obligatoire. */
    label: string
    /** Raccourci clavier ajouté à l'infobulle : « E ». */
    shortcut?: string
    /** default (transparent), on (outil actif, jaune), pressed (bascule ouverte, accent), danger (suppression). */
    variant?: 'default' | 'on' | 'pressed' | 'danger'
    /** sm 28px, md 32px, lg 40px (barre d'outils flottante). */
    size?: 'sm' | 'md' | 'lg'
    /** Pastille rouge en haut à droite : notification, filtre appliqué. */
    badge?: boolean
    /** Bouton inactif. */
    disabled?: boolean
    /** Type HTML du bouton. */
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'default', size: 'md', shortcut: undefined, badge: false, disabled: false, type: 'button' },
)

defineEmits<{ click: [event: MouseEvent] }>()

const classes = computed(() => [
  'mc-ibtn',
  props.size !== 'md' && props.size,
  props.variant === 'on' && 'is-on',
  props.variant === 'pressed' && 'is-pressed',
  props.variant === 'danger' && 'danger',
])
const iconSize = computed(() => (props.size === 'sm' ? 'sm' : props.size === 'lg' ? 'lg' : 'md'))
const tooltip = computed(() => (props.shortcut ? `${props.label} (${props.shortcut})` : props.label))
/** Les variantes on et pressed sont des bascules : on l'annonce. */
const pressed = computed(() => (props.variant === 'on' || props.variant === 'pressed' ? 'true' : undefined))
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled"
    :aria-label="label"
    :aria-pressed="pressed"
    :aria-keyshortcuts="shortcut"
    :title="tooltip"
    @click="$emit('click', $event)"
  >
    <McIcon :name="icon" :size="iconSize" />
    <span v-if="badge" class="mc-dot-badge" aria-hidden="true" />
  </button>
</template>
