<script setup lang="ts">
import { reactive } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import McSkeleton from '../McSkeleton/McSkeleton.vue'
import type { RelationGroup, RelationItem } from './types'

const props = withDefaults(
  defineProps<{
    /** Les relations de l'objet, groupées par verbe. */
    groups?: RelationGroup[]
    /** Nombre d'objets montrés par groupe avant « Voir les N ». */
    visible?: number
    /** Relations en cours de chargement : lignes squelettes. */
    loading?: boolean
    /** Nombre de groupes squelettes pendant le chargement. */
    loadingGroups?: number
  }>(),
  { groups: () => [], visible: 5, loading: false, loadingGroups: 2 },
)

const emit = defineEmits<{
  /** Ajout d'un objet dans le groupe de ce verbe. */
  add: [verb: string]
  /** Ouverture d'un objet lié (son inspecteur). */
  open: [item: RelationItem, verb: string]
  /** « Voir les N » : le groupe se déplie ; écouter pour ouvrir plutôt la liste complète ailleurs. */
  more: [verb: string]
}>()

const expanded = reactive<Record<string, boolean>>({})

const shownItems = (g: RelationGroup) => (expanded[g.verb] ? g.items : g.items.slice(0, props.visible))
const canAdd = (g: RelationGroup) => !!g.addLabel && (g.max === undefined || g.items.length < g.max)
const toggle = (g: RelationGroup) => {
  expanded[g.verb] = !expanded[g.verb]
  if (expanded[g.verb]) emit('more', g.verb)
}
</script>

<template>
  <div class="mc-rels" :aria-busy="loading || undefined">
    <template v-if="loading">
      <div v-for="i in loadingGroups" :key="i" class="mc-rel">
        <McSkeleton :label="i === 1 ? 'Chargement des relations' : ''" :width="90" :height="10" />
        <McSkeleton label="" shape="block" :height="36" />
        <McSkeleton label="" shape="block" :height="36" />
      </div>
    </template>
    <template v-else>
    <section v-for="g in groups" :key="g.verb" class="mc-rel" :aria-label="g.verb">
      <div class="verb">
        <span class="mc-over grow">{{ g.verb }}</span>
        <span class="mc-count" :aria-label="`${g.items.length} ${g.items.length > 1 ? 'objets' : 'objet'}`">{{ g.items.length }}</span>
      </div>
      <p v-if="!g.items.length" class="mc-rel-empty">{{ g.emptyLabel ?? 'Aucun objet lié' }}</p>
      <ul v-else class="mc-rel-items">
        <li v-for="item in shownItems(g)" :key="item.id ?? item.name">
          <button type="button" class="row" :class="`l-${item.layer}`" @click="emit('open', item, g.verb)">
            <span class="tile"><McIcon :name="item.icon" /></span>
            <span class="grow">{{ item.name }}<span v-if="item.meta" class="mc-cap"> · {{ item.meta }}</span></span>
            <McStatusChip v-if="item.status && item.statusLabel" :status="item.status" size="sm">{{ item.statusLabel }}</McStatusChip>
            <McIcon name="chevron-right" size="sm" class="go" />
          </button>
        </li>
      </ul>
      <button
        v-if="g.items.length > visible"
        type="button"
        class="mc-rel-more"
        :aria-expanded="!!expanded[g.verb]"
        @click="toggle(g)"
      >
        {{ expanded[g.verb] ? 'Réduire' : `Voir les ${g.items.length}` }}
        <McIcon name="chevron-down" size="sm" :class="{ up: expanded[g.verb] }" />
      </button>
      <button v-if="canAdd(g)" type="button" class="add" @click="emit('add', g.verb)">
        <McIcon name="plus" size="sm" />{{ g.addLabel }}
      </button>
    </section>
    </template>
  </div>
</template>

<style>
.mc-rels { display: grid; gap: 16px; }
.mc-rel-items { display: grid; gap: 6px; margin: 0; padding: 0; list-style: none; }
.mc-rel button.row { width: 100%; box-sizing: border-box; border: 0; font: inherit; font-size: 13px; color: var(--ink); text-align: left; cursor: pointer; transition: background-color .12s; }
.mc-rel button.row:hover { background: color-mix(in srgb, var(--ls) 55%, var(--surface-sunken)); }
.mc-rel .row .go { color: var(--ink-subtle); visibility: hidden; }
.mc-rel .row:hover .go, .mc-rel .row:focus-visible .go { visibility: visible; }
.mc-rel .add { font-family: var(--font-sans); }
.mc-rel .add:hover { border-color: var(--accent); color: var(--accent); }
.mc-rel-empty { margin: 0; padding: 8px; font-size: 13px; line-height: 18px; color: var(--ink-subtle); }
.mc-rel-more { justify-self: start; display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 8px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--accent); font: 600 12px/16px var(--font-sans); cursor: pointer; }
.mc-rel-more:hover { background: var(--accent-soft); }
.mc-rel-more .up { transform: rotate(180deg); }
</style>
