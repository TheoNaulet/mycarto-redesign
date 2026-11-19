<script setup lang="ts">
import { computed, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Nombre total d'éléments. */
    total: number
    /** Nom des éléments, au singulier et au pluriel : « 65 applications », jamais « 65 occurrences ». */
    noun?: { one: string; many: string }
    /** Tailles de page proposées. */
    pageSizes?: number[]
    /** Pages visibles autour de la page courante avant les « … » (au-delà de 7 pages). */
    siblings?: number
    /** Masque le choix du nombre par page. */
    hidePageSize?: boolean
  }>(),
  { noun: () => ({ one: 'élément', many: 'éléments' }), pageSizes: () => [25, 50, 100], siblings: 1, hidePageSize: false },
)

/** Page courante, à partir de 1. */
const page = defineModel<number>('page', { default: 1 })
/** Nombre d'éléments par page. */
const pageSize = defineModel<number>('pageSize', { default: 25 })

const id = useId()
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / pageSize.value)))
const fmt = (n: number) => n.toLocaleString('fr-FR')
const totalLabel = computed(() => `${fmt(props.total)} ${props.total > 1 ? props.noun.many : props.noun.one}`)

type Cell = number | 'gap-l' | 'gap-r'
const cells = computed<Cell[]>(() => {
  const n = pageCount.value
  const p = Math.min(page.value, n)
  const s = props.siblings
  const slots = 5 + 2 * s
  if (n <= slots) return Array.from({ length: n }, (_, i) => i + 1)
  const edge = 3 + 2 * s
  if (p <= 2 + s + 1) return [...Array.from({ length: edge }, (_, i) => i + 1), 'gap-r', n]
  if (p >= n - (2 + s)) return [1, 'gap-l', ...Array.from({ length: edge }, (_, i) => n - edge + 1 + i)]
  return [1, 'gap-l', ...Array.from({ length: 2 * s + 1 }, (_, i) => p - s + i), 'gap-r', n]
})

function go(p: number) {
  page.value = Math.min(Math.max(1, p), pageCount.value)
}
watch(pageCount, (n) => {
  if (page.value > n) page.value = n
})
function onSize(e: Event) {
  const first = (page.value - 1) * pageSize.value
  pageSize.value = Number((e.target as HTMLSelectElement).value)
  page.value = Math.floor(first / pageSize.value) + 1
}
</script>

<template>
  <nav class="mc-pager" aria-label="Pagination">
    <span :id="`${id}-total`" aria-live="polite">{{ totalLabel }}</span>
    <span class="grow" />
    <template v-if="pageCount > 1">
      <button type="button" class="mc-ibtn sm" aria-label="Page précédente" :disabled="page <= 1" @click="go(page - 1)">
        <McIcon name="chevron-left" size="sm" />
      </button>
      <span class="pages">
        <template v-for="c in cells" :key="c">
          <span v-if="typeof c !== 'number'" class="mc-pager-gap" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            :class="{ 'is-on': c === page }"
            :aria-current="c === page ? 'page' : undefined"
            :aria-label="`Page ${c}`"
            @click="go(c)"
          >{{ c }}</button>
        </template>
      </span>
      <button type="button" class="mc-ibtn sm" aria-label="Page suivante" :disabled="page >= pageCount" @click="go(page + 1)">
        <McIcon name="chevron-right" size="sm" />
      </button>
    </template>
    <span class="grow" />
    <span v-if="!hidePageSize" class="mc-pager-size">
      <select class="mc-input select sm" :value="pageSize" aria-label="Nombre de lignes par page" @change="onSize">
        <option v-for="s in pageSizes" :key="s" :value="s">{{ s }} par page</option>
      </select>
      <McIcon name="chevron-down" size="sm" />
    </span>
  </nav>
</template>

<style>
.mc-pager .pages button:hover:not(.is-on) { background: var(--surface-sunken); color: var(--ink); }
.mc-pager-gap { display: inline-flex; align-items: center; justify-content: center; min-width: 20px; height: 28px; color: var(--ink-subtle); }
.mc-pager-size { position: relative; display: inline-flex; align-items: center; }
.mc-pager-size select.mc-input { appearance: none; -webkit-appearance: none; width: 130px; padding-right: 30px; font-family: var(--font-sans); }
.mc-pager-size select.mc-input:focus-visible { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); outline: none; }
.mc-pager-size .mc-ico { position: absolute; right: 10px; pointer-events: none; color: var(--ink-subtle); }
</style>
