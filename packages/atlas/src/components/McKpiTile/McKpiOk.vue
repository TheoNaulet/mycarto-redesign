<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Ce qui est vérifié et va bien : « Tous les flux ont une source et une cible ». Ou le slot par défaut. */
    label?: string
    /** Nombre de contrôles sans anomalie regroupés sur cette ligne : affiche « 2 contrôles sans anomalie » à droite. */
    count?: number
    /** Texte à droite, à la place de celui calculé depuis `count`. */
    detail?: string
  }>(),
  { label: undefined, count: undefined, detail: undefined },
)

const right = computed(() => {
  if (props.detail) return props.detail
  if (props.count === undefined) return undefined
  return props.count > 1 ? `${props.count} contrôles sans anomalie` : `${props.count} contrôle sans anomalie`
})
</script>

<template>
  <div class="mc-kpi-ok" role="status">
    <McIcon name="check-circle" size="sm" />
    <slot>{{ label }}</slot>
    <span v-if="right">{{ right }}</span>
  </div>
</template>
