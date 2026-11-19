<script setup lang="ts">
import { computed } from 'vue'
import McSkeleton from '../McSkeleton/McSkeleton.vue'

const props = withDefaults(
  defineProps<{
    /** État du contrôle : critical (« À corriger »), warn (« À vérifier ») ou neutral (un chiffre sans alerte). */
    tone?: 'critical' | 'warn' | 'neutral'
    /** Mot d'action écrit dans l'onglet. Par défaut : « À corriger », « À vérifier » ou « Inventaire » selon `tone`. */
    tab?: string
    /** Le chiffre. Un nombre est formaté à la française (1 250). */
    value?: number | string
    /** Ce que compte le chiffre, en entier : « Applications non valides ». */
    label: string
    /** Pied : le dénominateur et le lien, « sur 65 · les compléter → ». */
    foot?: string
    /** Lien vers la liste filtrée dans l'explorateur. Toute la carte est cliquable. */
    href?: string
    /** Chiffre en cours de calcul : squelette à la place du nombre et du pied. */
    loading?: boolean
  }>(),
  { tone: 'neutral', tab: undefined, value: undefined, foot: undefined, href: undefined, loading: false },
)

defineEmits<{ /** Clic sur la carte (en plus de la navigation si `href`). */ click: [event: MouseEvent] }>()

const tabText = computed(
  () => props.tab ?? { critical: 'À corriger', warn: 'À vérifier', neutral: 'Inventaire' }[props.tone],
)
const shown = computed(() =>
  typeof props.value === 'number' ? props.value.toLocaleString('fr-FR') : (props.value ?? '—'),
)
</script>

<template>
  <component
    :is="href ? 'a' : 'div'"
    :href="href"
    class="mc-kpi mc-kpi-tile"
    :class="[tone, href && 'is-link']"
    :aria-busy="loading || undefined"
    @click="$emit('click', $event)"
  >
    <span class="tab">{{ tabText }}</span>
    <template v-if="loading">
      <McSkeleton label="Calcul en cours" :height="28" :width="56" class="num-sk" />
      <span class="lbl">{{ label }}</span>
      <McSkeleton label="" :height="10" width="60%" />
    </template>
    <template v-else>
      <span class="num">{{ shown }}</span>
      <span class="lbl">{{ label }}</span>
      <span v-if="foot || $slots.default" class="ft"><slot>{{ foot }}</slot></span>
    </template>
  </component>
</template>

<style>
.mc-kpi-tile { box-sizing: border-box; }
.mc-kpi-tile:not(.is-link):hover { border-color: var(--line); box-shadow: var(--shadow-node); }
.mc-kpi-tile .num-sk { margin: 2px 0; }
.mc-kpi-tile .num-sk .mc-skel { border-radius: var(--radius-xs); }
</style>
