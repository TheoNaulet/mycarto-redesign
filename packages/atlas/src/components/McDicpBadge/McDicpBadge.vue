<script lang="ts">
import type { Criticity } from '../../utils/types'

export type DicpLetter = 'D' | 'I' | 'C' | 'P'

/** Nom complet de chaque critère DICP. */
export const dicpCriteria: Record<DicpLetter, string> = {
  D: 'Disponibilité',
  I: 'Intégrité',
  C: 'Confidentialité',
  P: 'Preuve',
}

/** Libellé de chaque niveau de criticité. */
export const criticityLabel: Record<Criticity, string> = {
  0: 'Non renseignée',
  1: 'Faible',
  2: 'Modérée',
  3: 'Forte',
  4: 'Très forte',
}
</script>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Disponibilité : 1 faible à 4 très forte, 0 non renseignée (carré pointillé). */
    d?: Criticity
    /** Intégrité : 1 faible à 4 très forte, 0 non renseignée. */
    i?: Criticity
    /** Confidentialité : 1 faible à 4 très forte, 0 non renseignée. */
    c?: Criticity
    /** Preuve : 1 faible à 4 très forte, 0 non renseignée. */
    p?: Criticity
    /** N'affiche qu'un critère (un seul carré), par exemple dans un Select de Disponibilité. */
    only?: DicpLetter
    /** Écrit le niveau (1 à 4, « – » si non renseigné) au lieu de la lettre : pour une légende. */
    numeric?: boolean
  }>(),
  { d: 0, i: 0, c: 0, p: 0, only: undefined, numeric: false },
)

const squares = computed(() => {
  const all = [
    { letter: 'D' as const, level: props.d },
    { letter: 'I' as const, level: props.i },
    { letter: 'C' as const, level: props.c },
    { letter: 'P' as const, level: props.p },
  ]
  return (props.only ? all.filter((s) => s.letter === props.only) : all).map((s) => ({
    ...s,
    text: props.numeric ? (s.level ? String(s.level) : '–') : s.letter,
    title: props.numeric && props.only === undefined ? criticityLabel[s.level] : `${dicpCriteria[s.letter]} : ${criticityLabel[s.level]}`,
  }))
})

const ariaLabel = computed(() => squares.value.map((s) => s.title).join(', '))
</script>

<template>
  <span class="mc-dicp" role="img" :aria-label="ariaLabel">
    <span v-for="s in squares" :key="s.letter" :class="`c${s.level}`" :title="s.title" aria-hidden="true">{{ s.text }}</span>
  </span>
</template>
