<script setup lang="ts">
import { computed } from 'vue'
import McAvatar from './McAvatar.vue'

export interface McAvatarPerson {
  name: string
  role?: string
  initials?: string
  color?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(
  defineProps<{
    /** Les personnes, dans l'ordre d'affichage. */
    people: McAvatarPerson[]
    /** Nombre d'avatars visibles avant « +N ». */
    max?: number
    /** md 24px, lg 32px. */
    size?: 'md' | 'lg'
    /** Nom du groupe pour les lecteurs d'écran : « Personnes sur la carte ». */
    label?: string
  }>(),
  { max: 3, size: 'md', label: 'Personnes' },
)

const visible = computed(() => (props.people.length > props.max ? props.people.slice(0, props.max) : props.people))
const hidden = computed(() => props.people.slice(visible.value.length))
const moreTitle = computed(() => hidden.value.map((p) => p.name).join(', '))
const moreLabel = computed(() => (hidden.value.length === 1 ? `et 1 autre personne : ${moreTitle.value}` : `et ${hidden.value.length} autres personnes : ${moreTitle.value}`))
</script>

<template>
  <span class="mc-avatars" role="group" :aria-label="label">
    <McAvatar v-for="p in visible" :key="p.name" v-bind="p" :size="size" />
    <span v-if="hidden.length" class="mc-avatar more" :class="size === 'lg' && 'lg'" role="img" :aria-label="moreLabel" :title="moreTitle">
      <span aria-hidden="true">+{{ hidden.length }}</span>
    </span>
  </span>
</template>
