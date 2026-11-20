<script setup lang="ts" generic="T extends object">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McLogo from '../../logos/McLogo.vue'
import type { LogoName } from '../../logos/logos'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import McSkeleton from '../McSkeleton/McSkeleton.vue'
import McEmptyState from '../McEmptyState/McEmptyState.vue'
import McErrorState from '../McEmptyState/McErrorState.vue'
import type { DataTableColumn, DataTableSort, RowKey } from './types'

const props = withDefaults(
  defineProps<{
    /** Colonnes, dans l'ordre. La première porte la tuile d'icône et le nom. */
    columns: DataTableColumn<T>[]
    /** Lignes à afficher (la page courante). */
    rows?: T[]
    /** Clé unique d'une ligne : nom du champ, ou fonction. */
    rowKey?: string | ((row: T) => RowKey)
    /** Ajoute la colonne de cases à cocher (`v-model:selected`). */
    selectable?: boolean
    /** Pictogramme de la tuile en première colonne : un nom, ou une fonction par ligne. Absent : pas de tuile (sauf slot `tile`). */
    icon?: IconName | ((row: T) => IconName)
    /** Logo de marque par ligne, à la place du pictogramme (Apache, Debian…). Sans logo : le pictogramme, ou les initiales avec `monogram`. */
    logo?: (row: T) => LogoName | undefined
    /** Sans logo : initiales de `monogram(row)` à la place du pictogramme. */
    monogram?: (row: T) => string
    /** Couche du type affiché : couleur de la tuile en première colonne. */
    layer?: Layer
    /** Titre du tableau, lu par les lecteurs d'écran : « Applications ». */
    caption?: string
    /** Hauteur maximale : au-delà, le tableau défile et l'en-tête reste collé en haut. */
    maxHeight?: string
    /** Trie les lignes dans le navigateur. À désactiver quand le serveur trie (écouter `update:sort`). */
    localSort?: boolean
    /** Données en cours de chargement : lignes squelettes, `aria-busy`. */
    loading?: boolean
    /** Nombre de lignes squelettes pendant le chargement. */
    loadingRows?: number
    /** Message d'erreur de chargement : remplace les lignes par un bloc d'erreur avec « Réessayer ». */
    error?: string
    /** Titre du bloc d'erreur. */
    errorTitle?: string
    /** Nouvel essai en cours : roue dans « Réessayer ». */
    retrying?: boolean
    /** Titre quand il n'y a aucune ligne : « Aucune application ne correspond à ces filtres ». */
    emptyTitle?: string
    /** Phrase qui dit quoi faire quand il n'y a aucune ligne. */
    emptyText?: string
    /** Pictogramme de l'état vide. */
    emptyIcon?: IconName
    /** Libellé lu de la case d'une ligne. Par défaut : « Sélectionner » + la valeur de la première colonne. */
    rowLabel?: (row: T) => string
  }>(),
  {
    rows: () => [],
    rowKey: 'id',
    selectable: false,
    icon: undefined,
    logo: undefined,
    monogram: undefined,
    layer: 'applicatif',
    caption: undefined,
    maxHeight: undefined,
    localSort: true,
    loading: false,
    loadingRows: 8,
    error: undefined,
    errorTitle: 'Impossible de charger les données',
    retrying: false,
    emptyTitle: 'Aucun résultat',
    emptyText: undefined,
    emptyIcon: 'search',
    rowLabel: undefined,
  },
)

/** Clés des lignes cochées. */
const selected = defineModel<RowKey[]>('selected', { default: () => [] })
/** Tri courant ; `null` : ordre d'origine. */
const sort = defineModel<DataTableSort | null>('sort', { default: null })

const emit = defineEmits<{
  /** Clic ou Entrée sur une ligne : ouvrir l'inspecteur. */
  open: [row: T]
  /** « Réessayer » dans le bloc d'erreur. */
  retry: []
}>()

const slots = defineSlots<{
  /** Contenu d'une cellule : `cell-<key>`, avec la ligne et la valeur brute. */
  [name: `cell-${string}`]: ((p: { row: T; value: unknown }) => unknown) | undefined
  /** Contenu de la tuile en première colonne. */
  tile?: (p: { row: T }) => unknown
  /** Actions de ligne, visibles au survol et au focus : `.mc-ibtn sm`. */
  actions?: (p: { row: T }) => unknown
  /** Action de l'état vide : « Effacer les filtres ». */
  'empty-action'?: () => unknown
}>()

const get = (row: T, key: string): unknown => (row as Record<string, unknown>)[key]
const keyOf = (row: T): RowKey => (typeof props.rowKey === 'function' ? props.rowKey(row) : (get(row, props.rowKey) as RowKey))
const iconOf = (row: T): IconName | undefined => (typeof props.icon === 'function' ? props.icon(row) : props.icon)
const isNil = (v: unknown) => v === undefined || v === null || v === ''
const display = (col: DataTableColumn<T>, row: T) => {
  const v = get(row, col.key)
  if (col.format) return col.format(v, row)
  if (typeof v === 'number') return v.toLocaleString('fr-FR')
  return isNil(v) ? '' : String(v)
}

const hasActions = computed(() => !!slots.actions)
const span = computed(() => props.columns.length + (props.selectable ? 1 : 0) + (hasActions.value ? 1 : 0))

const viewRows = computed(() => {
  const s = sort.value
  if (!s || !props.localSort) return props.rows
  const col = props.columns.find((c) => c.key === s.key)
  const val = (r: T) => (col?.sortValue ? col.sortValue(r) : get(r, s.key))
  return [...props.rows].sort((a, b) => {
    const va = val(a)
    const vb = val(b)
    // Les valeurs vides restent toujours en bas.
    if (isNil(va) && isNil(vb)) return 0
    if (isNil(va)) return 1
    if (isNil(vb)) return -1
    const c =
      typeof va === 'number' && typeof vb === 'number'
        ? va - vb
        : String(va).localeCompare(String(vb), 'fr', { numeric: true, sensitivity: 'base' })
    return s.dir === 'asc' ? c : -c
  })
})

const state = computed(() => (props.loading ? 'loading' : props.error ? 'error' : props.rows.length ? 'rows' : 'empty'))

const ariaSort = (col: DataTableColumn<T>) => {
  if (!col.sortable) return undefined
  if (sort.value?.key !== col.key) return 'none'
  return sort.value.dir === 'asc' ? 'ascending' : 'descending'
}
const cycleSort = (key: string) => {
  const s = sort.value
  if (!s || s.key !== key) sort.value = { key, dir: 'asc' }
  else if (s.dir === 'asc') sort.value = { key, dir: 'desc' }
  else sort.value = null
}

const selectedSet = computed(() => new Set(selected.value))
const isOn = (row: T) => selectedSet.value.has(keyOf(row))
const visibleKeys = computed(() => props.rows.map(keyOf))
const allOn = computed(() => visibleKeys.value.length > 0 && visibleKeys.value.every((k) => selectedSet.value.has(k)))
const someOn = computed(() => visibleKeys.value.some((k) => selectedSet.value.has(k)))

const toggleRow = (row: T) => {
  const k = keyOf(row)
  selected.value = isOn(row) ? selected.value.filter((x) => x !== k) : [...selected.value, k]
}
const toggleAll = () => {
  const keys = new Set(visibleKeys.value)
  selected.value = allOn.value
    ? selected.value.filter((k) => !keys.has(k))
    : [...selected.value, ...visibleKeys.value.filter((k) => !selectedSet.value.has(k))]
}

const labelOf = (row: T) => {
  if (props.rowLabel) return props.rowLabel(row)
  const first = props.columns[0]
  return `Sélectionner ${first ? display(first, row) : keyOf(row)}`
}

const onRowKey = (e: KeyboardEvent, row: T) => {
  if (e.target !== e.currentTarget) return
  if (e.key === 'Enter') emit('open', row)
  else if (e.key === ' ' && props.selectable) {
    e.preventDefault()
    toggleRow(row)
  }
}

const skelWidths = ['62%', '48%', '75%', '40%', '55%', '68%']
</script>

<template>
  <div
    class="mc-table-wrap mc-dt"
    :style="maxHeight ? { maxHeight, overflowY: 'auto' } : undefined"
    :aria-busy="loading || undefined"
  >
    <table class="mc-table">
      <caption v-if="caption" class="mc-sr">{{ caption }}</caption>
      <thead>
        <tr>
          <th v-if="selectable" scope="col" class="mc-dt-chk">
            <label class="mc-dt-check">
              <input
                type="checkbox"
                class="mc-sr"
                :checked="allOn"
                :indeterminate="someOn && !allOn"
                :disabled="state !== 'rows'"
                aria-label="Tout sélectionner"
                @change="toggleAll"
              />
              <span class="mc-box" :class="{ 'is-on': allOn, 'is-mixed': someOn && !allOn, 'is-disabled': state !== 'rows' }" aria-hidden="true">
                <McIcon v-if="allOn" name="check" size="sm" />
                <McIcon v-else-if="someOn" name="minus" size="sm" />
              </span>
            </label>
          </th>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            :aria-sort="ariaSort(col)"
            :style="{ width: col.width, textAlign: col.align }"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="mc-dt-sort"
              :class="{ 'is-sorted': sort?.key === col.key, 'is-asc': sort?.key === col.key && sort.dir === 'asc' }"
              :disabled="state !== 'rows'"
              @click="cycleSort(col.key)"
            >
              {{ col.label }}<span class="sort"><McIcon name="chevron-down" size="sm" /></span>
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
          <th v-if="hasActions" scope="col" class="mc-dt-act"><span class="mc-sr">Actions</span></th>
        </tr>
      </thead>

      <tbody v-if="state === 'loading'">
        <tr v-for="i in loadingRows" :key="i" class="mc-dt-skel">
          <td v-if="selectable"><McSkeleton label="" shape="block" :height="16" :width="16" /></td>
          <td v-for="(col, c) in columns" :key="col.key">
            <span v-if="c === 0" class="mc-dt-skname">
              <McSkeleton v-if="icon || $slots.tile" label="" shape="block" :height="22" :width="22" />
              <McSkeleton :label="i === 1 && c === 0 ? 'Chargement des lignes' : ''" :width="skelWidths[(i + c) % skelWidths.length]" />
            </span>
            <McSkeleton v-else label="" :width="skelWidths[(i + c) % skelWidths.length]" />
          </td>
          <td v-if="hasActions" />
        </tr>
      </tbody>

      <tbody v-else-if="state === 'error'">
        <tr class="mc-dt-state">
          <td :colspan="span">
            <McErrorState size="compact" :title="errorTitle" :text="error" :retrying="retrying" @retry="emit('retry')" />
          </td>
        </tr>
      </tbody>

      <tbody v-else-if="state === 'empty'">
        <tr class="mc-dt-state">
          <td :colspan="span">
            <McEmptyState size="compact" :icon="emptyIcon" :layer="layer" :title="emptyTitle" :text="emptyText">
              <template v-if="$slots['empty-action']" #action><slot name="empty-action" /></template>
            </McEmptyState>
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr
          v-for="row in viewRows"
          :key="keyOf(row)"
          :class="{ 'is-on': selectable && isOn(row) }"
          tabindex="0"
          @click="emit('open', row)"
          @keydown="onRowKey($event, row)"
        >
          <td v-if="selectable" class="mc-dt-chk" @click.stop>
            <label class="mc-dt-check">
              <input type="checkbox" class="mc-sr" :checked="isOn(row)" :aria-label="labelOf(row)" @change="toggleRow(row)" />
              <span class="mc-box" :class="{ 'is-on': isOn(row) }" aria-hidden="true"><McIcon v-if="isOn(row)" name="check" size="sm" /></span>
            </label>
          </td>
          <template v-for="(col, c) in columns" :key="col.key">
            <th
              v-if="c === 0"
              scope="row"
              class="mc-dt-rowh"
              :style="{ textAlign: col.align }"
            >
              <span class="name" :class="`l-${layer}`">
                <span v-if="logo?.(row)" class="tile has-logo"><McLogo :logo="logo(row)" :size="14" /></span>
                <span v-else-if="monogram" class="tile"><McLogo :label="monogram(row)" :size="14" /></span>
                <span v-else-if="iconOf(row) || $slots.tile" class="tile">
                  <slot name="tile" :row="row"><McIcon :name="iconOf(row)!" /></slot>
                </span>
                <slot :name="`cell-${col.key}`" :row="row" :value="get(row, col.key)">{{ display(col, row) }}</slot>
              </span>
            </th>
            <td
              v-else
              :class="{ muted: col.muted }"
              :style="{ textAlign: col.align }"
              :title="col.muted ? display(col, row) : undefined"
            >
              <slot :name="`cell-${col.key}`" :row="row" :value="get(row, col.key)">
                <span v-if="isNil(get(row, col.key)) && !col.format" class="mc-dt-nil">—</span>
                <template v-else>{{ display(col, row) }}</template>
              </slot>
            </td>
          </template>
          <td v-if="hasActions" class="mc-dt-act" @click.stop>
            <span class="rowact"><slot name="actions" :row="row" /></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style>
.mc-dt .mc-table thead th { z-index: 1; }
.mc-dt .mc-table th[aria-sort] { padding: 0 6px; }
.mc-dt-sort { display: inline-flex; align-items: center; height: 28px; padding: 0 6px; border: 0; border-radius: var(--radius-sm); background: transparent; font: inherit; color: inherit; cursor: pointer; }
.mc-dt-sort:hover:not([disabled]) { background: var(--line); color: var(--ink); }
.mc-dt-sort[disabled] { cursor: default; }
.mc-dt-sort .sort { opacity: 0; transition: opacity .12s, transform .12s; }
.mc-dt-sort:hover:not([disabled]) .sort { opacity: .6; }
.mc-dt-sort.is-sorted { color: var(--ink); }
.mc-dt-sort.is-sorted .sort { opacity: 1; color: var(--accent); }
.mc-dt-sort.is-asc .sort { transform: rotate(180deg); }
.mc-dt .mc-table th.mc-dt-chk, .mc-dt .mc-table td.mc-dt-chk { width: 28px; padding: 0 0 0 12px; }
.mc-dt-check { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; margin-left: -6px; cursor: pointer; vertical-align: middle; }
.mc-dt-check input:focus-visible + .mc-box { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-dt-check:hover .mc-box:not(.is-on):not(.is-mixed):not(.is-disabled) { border-color: var(--accent); }
.mc-dt-check input[disabled] ~ .mc-box { cursor: not-allowed; }
.mc-dt .mc-table tbody th.mc-dt-rowh { position: static; height: 40px; padding: 0 12px; background: transparent; border-bottom: 1px solid var(--line); font: 600 13px/18px var(--font-sans); color: var(--ink); text-align: left; white-space: nowrap; }
.mc-dt .mc-table tbody tr:last-child th.mc-dt-rowh { border-bottom: 0; }
.mc-dt .mc-table tbody tr:hover th.mc-dt-rowh { background: var(--surface-sunken); }
.mc-dt .mc-table tbody tr.is-on th.mc-dt-rowh { background: var(--accent-soft); }
.mc-dt .mc-table tbody tr[tabindex] { cursor: pointer; }
.mc-dt .mc-table tbody tr:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.mc-dt .mc-table tr:focus-within .rowact { visibility: visible; }
.mc-dt .mc-table td.mc-dt-act, .mc-dt .mc-table th.mc-dt-act { width: 1%; padding: 0 8px; text-align: right; }
.mc-dt-nil { color: var(--ink-subtle); }
.mc-dt-skname { display: flex; align-items: center; gap: 8px; }
.mc-dt-skname .mc-skeleton:first-child { width: auto; }
.mc-dt .mc-table tbody tr.mc-dt-skel:hover td { background: transparent; }
.mc-dt .mc-table tbody tr.mc-dt-state td { height: auto; white-space: normal; }
.mc-dt .mc-table tbody tr.mc-dt-state:hover td { background: transparent; }
</style>
