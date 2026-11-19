<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { Status } from '../../utils/types'

const props = withDefaults(
  defineProps<{
    /** Date de fin de support ou d'échéance (Date ou chaîne ISO « 2029-06-10 »). Vide = non renseignée. */
    date?: Date | string | null
    /** Seuil d'alerte en mois : en dessous, la date passe en orange. Réglage du back-office, 12 par défaut. */
    warnMonths?: number
    /** Date de référence pour le calcul (aujourd'hui par défaut). Utile pour les tests et les captures. */
    today?: Date | string
    /** Début de phrase avant la date à venir. */
    label?: string
    /** Début de phrase avant une date dépassée. */
    pastLabel?: string
    /** Texte quand la date est inconnue. */
    unknownLabel?: string
  }>(),
  {
    date: null,
    warnMonths: 12,
    today: undefined,
    label: 'Fin de support le',
    pastLabel: 'Plus supporté depuis le',
    unknownLabel: 'Fin de support non renseignée',
  },
)

/** Une date ISO courte est lue comme une date locale (pas de décalage de fuseau). */
function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v)
  const d = m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : new Date(v)
  return Number.isNaN(d.getTime()) ? null : d
}

const day = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

const parsed = computed(() => toDate(props.date))

const level = computed<Status>(() => {
  const d = parsed.value
  if (!d) return 'unknown'
  const now = day(toDate(props.today) ?? new Date())
  const end = day(d)
  if (end < now) return 'critical'
  const limit = new Date(now.getFullYear(), now.getMonth() + props.warnMonths, now.getDate())
  return end < limit ? 'warn' : 'ok'
})

const icon = computed(() => ({ ok: 'calendar', warn: 'alert-triangle', critical: 'alert-octagon', unknown: 'dashed-circle' } as const)[level.value])

const formatted = computed(() => (parsed.value ? parsed.value.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''))
const iso = computed(() => {
  const d = parsed.value
  if (!d) return undefined
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
</script>

<template>
  <span class="mc-life" :class="level !== 'ok' && level">
    <McIcon :name="icon" size="sm" />
    <template v-if="level === 'unknown'">{{ unknownLabel }}</template>
    <template v-else>{{ level === 'critical' ? pastLabel : label }} <time :datetime="iso">{{ formatted }}</time></template>
  </span>
</template>

<style>
.mc-life.unknown { color: var(--ink-subtle); }
</style>
