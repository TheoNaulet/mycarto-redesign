<script setup lang="ts">
import { computed } from 'vue'
import { logos, type LogoName } from './logos'

const props = withDefaults(
  defineProps<{
    /** Logo de marque. Sans logo : initiales de `label`. */
    logo?: LogoName
    /** Nom de l'objet, pour les initiales de repli. */
    label?: string
    /** Côté du logo en pixels. */
    size?: number
  }>(),
  { logo: undefined, label: '', size: 18 },
)

const def = computed(() => (props.logo ? logos[props.logo] : undefined))
/** « Net HASP » → NH, « Celcat » → CE, « Six » → SI. */
const initials = computed(() => {
  const words = props.label.replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).filter(Boolean)
  const s = words.length > 1 && !/^\d/.test(words[1]) ? words[0][0] + words[1][0] : (words[0] ?? '?').slice(0, 2)
  return s.toUpperCase()
})
</script>

<template>
  <svg v-if="def" class="mc-logo" :width="size" :height="size" viewBox="0 0 24 24" role="img" :aria-label="def.title">
    <path v-for="(p, i) in def.paths" :key="i" :d="p.d" :fill="p.fill" />
  </svg>
  <span v-else class="mc-logo mc-logo-mono" :style="{ fontSize: `${Math.round(size * 0.62)}px` }" aria-hidden="true">{{ initials }}</span>
</template>

<style>
.mc-logo { display: block; flex: none; }
.mc-logo-mono { font-family: var(--font-display); font-weight: 700; letter-spacing: -.02em; line-height: 1; }
</style>
