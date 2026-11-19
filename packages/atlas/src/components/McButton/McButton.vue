<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

const props = withDefaults(
  defineProps<{
    /** primary (jaune, une seule par vue), secondary (navy), outline, ghost, danger. */
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    /** sm 28px, md 32px, lg 40px. */
    size?: 'sm' | 'md' | 'lg'
    /** Icône à gauche du libellé. */
    icon?: IconName
    /** Affiche une roue à la place de l'icône et bloque le clic. Le bouton garde sa largeur. */
    loading?: boolean
    disabled?: boolean
    /** Rend un lien <a> au lieu d'un <button>. */
    href?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'primary', size: 'md', icon: undefined, loading: false, disabled: false, href: undefined, type: 'button' },
)

defineEmits<{ click: [event: MouseEvent] }>()

const classes = computed(() => ['mc-btn', props.variant, props.size !== 'md' && props.size, props.loading && 'is-loading'])
const iconSize = computed(() => (props.size === 'sm' ? 'sm' : 'md'))
</script>

<template>
  <a v-if="href && !disabled" :href="href" :class="classes" @click="$emit('click', $event)">
    <McIcon v-if="icon" :name="icon" :size="iconSize" />
    <slot />
  </a>
  <button
    v-else
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
    :aria-busy="loading || undefined"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="mc-spin" aria-hidden="true" />
    <McIcon v-else-if="icon" :name="icon" :size="iconSize" />
    <slot />
  </button>
</template>
