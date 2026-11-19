<script setup lang="ts">
import { computed, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import { uniquePrefix } from '../McEdge/edge'

/** Auteur d'un post-it : mêmes initiales et même couleur que son avatar. */
export interface McStickyAuthor {
  /** Initiales affichées dans l'avatar : « WV ». */
  initials: string
  /** Prénom affiché en pied : « William ». */
  name: string
  /** Couleur de la personne, 1 à 6 (`data-1…6`). */
  color?: 1 | 2 | 3 | 4 | 5 | 6
}

const props = withDefaults(
  defineProps<{
    /** Couleur du papier. Les mêmes dans les deux thèmes : c'est un objet posé sur la carte. */
    color?: 'yellow' | 'blue' | 'green' | 'pink'
    /** Le texte devient modifiable sur place. */
    editable?: boolean
    /** Auteur du post-it. */
    author?: McStickyAuthor
    /** Date courte en pied : « 07/07 ». */
    date?: string
    /** Inclinaison en degrés (−3 à 3 conseillé). */
    rotation?: number
    /** Nom du nœud auquel le post-it est épinglé (il le suit). Absent : post-it libre. */
    pinnedTo?: string
    /** Longueur conseillée ; au-delà, le compteur passe en alerte et invite au commentaire. */
    maxLength?: number
    /** Texte d'invite quand le post-it est vide et modifiable. */
    placeholder?: string
  }>(),
  {
    color: 'yellow',
    editable: false,
    author: undefined,
    date: undefined,
    rotation: 0,
    pinnedTo: undefined,
    maxLength: 140,
    placeholder: 'Écrire une remarque, une question, une décision…',
  },
)

/** Texte du post-it. */
const text = defineModel<string>('text', { default: '' })

const uid = uniquePrefix('mc-sticky', useId())
const over = computed(() => text.value.length > props.maxLength)
const classes = computed(() => ['mc-sticky', props.color !== 'yellow' && props.color, props.pinnedTo && 'is-pinned'])
const style = computed(() => (props.rotation ? { transform: `rotate(${props.rotation}deg)` } : undefined))
</script>

<template>
  <figure :class="classes" :style="style" :aria-label="`Post-it${author ? ' de ' + author.name : ''}${pinnedTo ? ', épinglé à ' + pinnedTo : ''}`">
    <span v-if="pinnedTo" class="mc-sticky-pin" :title="`Épinglé à ${pinnedTo}`"><McIcon name="pin" size="sm" /></span>
    <template v-if="editable">
      <label :for="`${uid}-t`" class="mc-sr">Texte du post-it</label>
      <textarea
        :id="`${uid}-t`"
        v-model="text"
        class="mc-sticky-input"
        rows="4"
        :placeholder="placeholder"
        :aria-describedby="`${uid}-n`"
      />
      <span :id="`${uid}-n`" class="mc-sticky-count" :class="{ 'is-over': over }" aria-live="polite">
        {{ text.length }} / {{ maxLength }}<template v-if="over"> · trop long, préférer un commentaire</template>
      </span>
    </template>
    <p v-else>{{ text }}</p>
    <figcaption v-if="author || date || pinnedTo" class="by">
      <span v-if="author" class="mc-avatar" :style="{ background: `var(--data-${author.color ?? 1})` }" aria-hidden="true">{{ author.initials }}</span>
      <span class="mc-sticky-meta">{{ [author?.name, date].filter(Boolean).join(' · ') }}</span>
      <span v-if="pinnedTo" class="mc-sticky-on"><McIcon name="link" size="sm" />{{ pinnedTo }}</span>
    </figcaption>
  </figure>
</template>

<style>
.mc-sticky { position: relative; margin: 0; }
.mc-sticky .by { flex-wrap: wrap; }
.mc-sticky-pin { position: absolute; top: -9px; left: 50%; margin-left: -11px; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: var(--on-navy); display: inline-flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(20, 24, 60, .3); }
.mc-sticky-pin .mc-ico { width: 12px; height: 12px; }
.mc-sticky-input { flex: 1; min-height: 80px; margin: -2px -4px; padding: 2px 4px; border: 0; border-radius: 4px; background: transparent; color: var(--navy); font: 600 15px/20px var(--font-display); resize: none; outline: none; }
.mc-sticky-input::placeholder { color: var(--navy); opacity: .45; }
.mc-sticky-input:focus-visible { box-shadow: 0 0 0 2px color-mix(in srgb, var(--navy) 35%, transparent); }
.mc-sticky-count { font-size: 11px; line-height: 14px; color: var(--navy); opacity: .7; font-variant-numeric: tabular-nums; }
.mc-sticky-count.is-over { opacity: 1; font-weight: 700; }
.mc-sticky-on { display: inline-flex; align-items: center; gap: 3px; margin-left: auto; font-weight: 600; }
.mc-sticky-on .mc-ico { width: 11px; height: 11px; }
</style>
