<script setup lang="ts">
import McSkeleton from '../McSkeleton/McSkeleton.vue'
import type { KeyValueItem } from './types'

withDefaults(
  defineProps<{
    /** Les attributs, dans l'ordre d'affichage. */
    items?: KeyValueItem[]
    /** Dates système regroupées en bas, en petit : « Créé le 12/03/2021 par T. Naulet ». Une ligne par entrée. */
    meta?: string[]
    /** Texte affiché pour une valeur vide. */
    emptyLabel?: string
    /** Données en cours de chargement : paires squelettes. */
    loading?: boolean
    /** Nombre de paires squelettes pendant le chargement. */
    loadingRows?: number
  }>(),
  { items: () => [], meta: () => [], emptyLabel: 'Non renseigné', loading: false, loadingRows: 6 },
)

const emit = defineEmits<{ /** Clic sur une valeur-lien (objet lié). */ open: [item: KeyValueItem, event: MouseEvent] }>()

defineSlots<{
  /** Remplace l'affichage d'une valeur (puce d'état, liste de liens…). */
  value?: (p: { item: KeyValueItem }) => unknown
}>()

const isEmpty = (i: KeyValueItem) => i.empty || i.value === undefined || i.value === null || i.value === ''
const fmt = (v: KeyValueItem['value']) => (typeof v === 'number' ? v.toLocaleString('fr-FR') : v)
const widths = ['55%', '80%', '40%', '70%', '62%', '48%']
</script>

<template>
  <div class="mc-kvlist" :aria-busy="loading || undefined">
    <dl v-if="loading" class="mc-kv">
      <template v-for="i in loadingRows" :key="i">
        <dt><McSkeleton :label="i === 1 ? 'Chargement des attributs' : ''" :width="widths[(i + 2) % widths.length]" /></dt>
        <dd><McSkeleton label="" :width="widths[i % widths.length]" /></dd>
      </template>
    </dl>
    <dl v-else class="mc-kv">
      <template v-for="(item, i) in items" :key="`${item.key}-${i}`">
        <dt>{{ item.key }}</dt>
        <dd :class="{ empty: isEmpty(item) && !$slots.value }">
          <slot name="value" :item="item">
            <template v-if="isEmpty(item)">{{ emptyLabel }}</template>
            <a v-else-if="item.href" :href="item.href" class="mc-kv-link" :class="{ 'mc-code': item.code }" @click="emit('open', item, $event)">{{ fmt(item.value) }}</a>
            <span v-else-if="item.code" class="mc-code">{{ item.value }}</span>
            <template v-else>{{ fmt(item.value) }}</template>
          </slot>
        </dd>
      </template>
    </dl>
    <footer v-if="meta.length && !loading" class="mc-kv-meta mc-cap">
      <span v-for="m in meta" :key="m">{{ m }}</span>
    </footer>
  </div>
</template>

<style>
.mc-kvlist { display: grid; gap: 14px; }
.mc-kvlist .mc-kv dt { overflow-wrap: break-word; hyphens: auto; }
.mc-kvlist .mc-kv dd { white-space: pre-line; }
.mc-kv-link { color: var(--accent); text-decoration: none; }
.mc-kv-link:hover { text-decoration: underline; }
.mc-kv-meta { display: grid; gap: 2px; padding-top: 10px; border-top: 1px solid var(--line); }
</style>
