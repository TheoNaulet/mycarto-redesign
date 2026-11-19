<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import { statusIcon, type Layer, type Status } from '../../utils/types'

/** Une ligne de légende. Elle porte un niveau de lentille (`status`), une couche (`layer`) ou un échantillon libre (`swatch`). */
export interface McLegendItem {
  /** Identifiant stable ; par défaut le libellé. */
  id?: string
  /** Libellé : « Expire dans moins de 6 mois », « Application ». */
  label: string
  /** Nombre d'objets visibles concernés (suit les filtres). */
  count: number
  /** Niveau de lentille : échantillon de nœud (fond, bordure, icône). */
  status?: Status
  /** Couche du type : point de couleur. */
  layer?: Layer
  /** Échantillon libre : un niveau avec une autre icône (« calendar » pour 6 à 12 mois). */
  swatch?: { tone: Status; icon: IconName }
}

/** Une section de la légende : « Types », puis la lentille active. */
export interface McLegendSection {
  /** Titre de la section : « Types », « Échéance des contrats ». */
  title: string
  /** Lignes de la section. */
  items: McLegendItem[]
}

const props = withDefaults(
  defineProps<{
    /** Titre du panneau. */
    title?: string
    /** Sections générées à partir de ce qui est visible. */
    sections?: McLegendSection[]
    /** Affiche le bouton Fermer. */
    closable?: boolean
    /** Trie les niveaux du plus critique au plus sûr, « Non renseigné » en dernier. */
    sort?: boolean
  }>(),
  { title: 'Légende', sections: () => [], closable: true, sort: true },
)

/** Identifiant de la ligne isolée sur la carte, ou null. */
const isolated = defineModel<string | null>('isolated', { default: null })

const emit = defineEmits<{
  /** Une ligne est isolée (ou null quand on la relâche). */
  isolate: [item: McLegendItem | null]
  /** Fermer la légende. */
  close: []
}>()

const rank: Record<Status, number> = { critical: 0, warn: 1, ok: 2, unknown: 3 }
const toneOf = (i: McLegendItem) => i.status ?? i.swatch?.tone
const keyOf = (i: McLegendItem) => i.id ?? i.label

const view = computed(() =>
  props.sections.map((s) => ({
    ...s,
    items: props.sort
      ? s.items
          .map((item, idx) => ({ item, idx }))
          .sort((a, b) => {
            const ta = toneOf(a.item)
            const tb = toneOf(b.item)
            if (!ta || !tb) return a.idx - b.idx
            return rank[ta] - rank[tb] || a.idx - b.idx
          })
          .map((x) => x.item)
      : s.items,
  })),
)

function toggle(item: McLegendItem) {
  const k = keyOf(item)
  const on = isolated.value === k
  isolated.value = on ? null : k
  emit('isolate', on ? null : item)
}
</script>

<template>
  <aside class="mc-float mc-legend" :class="{ 'has-isolated': isolated !== null }" :aria-label="title">
    <div class="hd">
      <span class="grow">{{ title }}</span>
      <button v-if="closable" type="button" class="mc-ibtn sm" aria-label="Fermer la légende" title="Fermer (L)" @click="emit('close')">
        <McIcon name="x" size="sm" />
      </button>
    </div>
    <template v-for="(s, si) in view" :key="s.title">
      <hr v-if="si > 0" class="mc-hr" />
      <div class="mc-col mc-legend-sec" role="group" :aria-label="s.title">
        <span class="mc-over">{{ s.title }}</span>
        <button
          v-for="item in s.items"
          :key="keyOf(item)"
          type="button"
          class="li"
          :class="[item.layer && `l-${item.layer}`, { 'is-pressed': isolated === keyOf(item), 'is-zero': item.count === 0 }]"
          :aria-pressed="isolated === keyOf(item)"
          :title="isolated === keyOf(item) ? 'Tout réafficher' : 'Isoler ces objets sur la carte'"
          @click="toggle(item)"
        >
          <span v-if="toneOf(item)" class="sw" :class="toneOf(item)">
            <McIcon :name="item.swatch?.icon ?? statusIcon[toneOf(item)!]" />
          </span>
          <span v-else-if="item.layer" class="ld" />
          <span class="grow">{{ item.label }}</span>
          <span class="mc-count">{{ item.count }}</span>
        </button>
      </div>
    </template>
  </aside>
</template>

<style>
.mc-legend-sec { gap: 4px; }
.mc-legend-sec .mc-over { margin-bottom: 4px; }
.mc-legend button.li { width: calc(100% + 12px); margin: 0 -6px; padding: 3px 6px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font-family: var(--font-sans); text-align: left; cursor: pointer; transition: background-color var(--dur-fast, .12s), opacity .2s; }
.mc-legend button.li:hover { background: var(--surface-sunken); }
.mc-legend button.li.is-pressed { background: var(--accent-soft); }
.mc-legend button.li.is-pressed .mc-count { background: var(--accent); color: var(--on-accent); }
.mc-legend.has-isolated button.li:not(.is-pressed) { opacity: .55; }
.mc-legend button.li.is-zero .grow { color: var(--ink-subtle); }
</style>
