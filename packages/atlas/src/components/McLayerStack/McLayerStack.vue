<script setup lang="ts">
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import McSkeleton from '../McSkeleton/McSkeleton.vue'
import type { LayerStackCell, LayerStackLayer } from './types'

const props = withDefaults(
  defineProps<{
    /** Les 4 couches, de haut (métier) en bas (technique). */
    layers?: LayerStackLayer[]
    /** Nombre de colonnes de cases par strate (2 sous 720px de large). */
    columns?: number
    /** Décalage vers la droite de chaque strate par rapport à la précédente, en px : l'effet de feuilles empilées. */
    offset?: number
    /** Niveau de titre des onglets, pour le plan de la page. */
    headingLevel?: 2 | 3 | 4
    /** Chiffres en cours de chargement : cases squelettes. Sans `layers`, affiche les 4 couches par défaut. */
    loading?: boolean
    /** Nombre de cases squelettes par strate pendant le chargement. */
    loadingCells?: number
  }>(),
  { layers: () => [], columns: 5, offset: 20, headingLevel: 2, loading: false, loadingCells: 4 },
)

const emit = defineEmits<{ /** Ouverture d'une case (liste ou carte du type). */ open: [cell: LayerStackCell, layer: LayerStackLayer] }>()

const fallback: LayerStackLayer[] = [
  { n: 1, layer: 'metier', name: 'Couche métier', cells: [] },
  { n: 2, layer: 'fonctionnel', name: 'Couche fonctionnelle', cells: [] },
  { n: 3, layer: 'applicatif', name: 'Couche applicative', cells: [] },
  { n: 4, layer: 'technique', name: 'Couche technique', cells: [] },
]
const shown = computed(() => (props.loading && !props.layers.length ? fallback : props.layers))

const fmt = (n: number) => n.toLocaleString('fr-FR')
const mapsText = (n: number) => `${fmt(n)} ${n > 1 ? 'cartes' : 'carte'}`
const ariaOf = (c: LayerStackCell) =>
  [
    c.count !== undefined ? `${fmt(c.count)} ${c.label}` : `${c.label}, ${c.description ?? ''}`,
    c.alert?.label,
    c.maps ? mapsText(c.maps) : undefined,
  ]
    .filter(Boolean)
    .join(', ')
</script>

<template>
  <div class="mc-lstack" :style="{ '--mc-cols': columns }" :aria-busy="loading || undefined">
    <section
      v-for="(l, i) in shown"
      :key="l.layer + l.n"
      class="mc-strate"
      :class="`l-${l.layer}`"
      :style="{ '--mc-indent': `${i * offset}px` }"
    >
      <span class="mc-stab" role="heading" :aria-level="headingLevel"><b aria-hidden="true">{{ l.n }}</b>{{ l.name }}</span>
      <ul class="mc-cells">
        <template v-if="loading">
          <li v-for="k in loadingCells" :key="k" class="mc-cell is-skel">
            <McSkeleton shape="block" :height="40" :width="40" label="" class="cic-sk" />
            <span class="ctx">
              <McSkeleton :label="i === 0 && k === 1 ? 'Chargement des couches' : ''" :height="20" :width="40" />
              <McSkeleton label="" :height="10" :width="`${50 + ((k * 17) % 40)}%`" />
            </span>
          </li>
        </template>
        <template v-else>
          <li v-for="c in l.cells" :key="c.label">
            <component
              :is="c.href ? 'a' : 'button'"
              :href="c.href"
              :type="c.href ? undefined : 'button'"
              class="mc-cell"
              :class="{ 'is-empty': c.empty }"
              :aria-label="ariaOf(c)"
              :title="c.empty ? (c.description ?? `Aucun objet saisi`) : undefined"
              @click="emit('open', c, l)"
            >
              <span class="cic"><McIcon :name="c.icon" size="lg" /></span>
              <span class="ctx">
                <span v-if="c.count !== undefined" class="cnum">{{ fmt(c.count) }}</span>
                <span v-else class="cdesc">{{ c.description }}</span>
                <span class="clab">{{ c.label }}</span>
              </span>
              <span class="cmeta">
                <McStatusChip v-if="c.alert" :status="c.alert.status" size="sm">{{ c.alert.label }}</McStatusChip>
                <span v-if="c.maps" class="cmaps"><McIcon name="map" size="sm" />{{ mapsText(c.maps) }}</span>
              </span>
            </component>
          </li>
        </template>
      </ul>
    </section>
  </div>
</template>

<style>
.mc-lstack { position: relative; box-sizing: border-box; border-radius: var(--radius-xl); padding: 30px 28px 24px 24px; background-color: var(--surface); background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 24px 24px; border: 1px solid var(--line); display: grid; gap: 26px; align-content: start; }
.mc-strate { position: relative; margin-left: var(--mc-indent, 0); border-radius: var(--radius-md); border-top-left-radius: 0; background: var(--surface); border: 1px solid color-mix(in srgb, var(--lc) 40%, var(--line)); box-shadow: var(--shadow-node); }
.mc-stab { position: absolute; left: -1px; bottom: 100%; height: 22px; display: inline-flex; align-items: center; gap: 8px; padding: 0 12px 0 4px; border-radius: 8px 8px 0 0; background: var(--lc); color: var(--surface); font: 700 11px/22px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
.mc-stab b { width: 16px; height: 16px; border-radius: 50%; background: var(--surface); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; font: 700 10px/1 var(--font-display); }
.mc-cells { display: grid; grid-template-columns: repeat(var(--mc-cols, 5), minmax(0, 1fr)); margin: 0; padding: 0; list-style: none; overflow: hidden; border-radius: inherit; }
.mc-cells > li { display: flex; min-width: 0; box-shadow: -1px 0 0 var(--line), 0 -1px 0 var(--line); }
.mc-cell { position: relative; flex: 1; box-sizing: border-box; display: grid; grid-template-columns: auto 1fr; grid-template-rows: auto auto; column-gap: 12px; row-gap: 6px; padding: 14px 16px; min-width: 0; border: 0; background: transparent; font: inherit; color: inherit; text-align: left; text-decoration: none; cursor: pointer; transition: background-color .12s; }
.mc-cell:hover { background: color-mix(in srgb, var(--ls) 45%, var(--surface)); }
.mc-cell:focus-visible { outline-offset: -2px; }
.mc-cell .cic { width: 40px; height: 40px; border-radius: 10px; background: var(--ls); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; grid-row: 1 / span 2; }
.mc-cell .ctx { display: grid; min-width: 0; }
.mc-cell .cnum { font: 700 24px/26px var(--font-display); color: var(--ink); font-variant-numeric: tabular-nums; }
.mc-cell .cdesc { font: 600 13px/26px var(--font-display); color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-cell .clab { font-size: 12px; line-height: 16px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-cell .cmeta { grid-column: 2; display: flex; gap: 6px; flex-wrap: wrap; align-items: center; min-height: 18px; }
.mc-cell .cmaps { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; line-height: 14px; color: var(--ink-subtle); }
.mc-cell.is-empty { opacity: .5; }
.mc-cell.is-empty .cic { background: var(--surface-sunken); color: var(--ink-subtle); }
.mc-cell.is-skel { cursor: default; }
.mc-cell.is-skel:hover { background: transparent; }
.mc-cell.is-skel .cic-sk { width: auto; grid-row: 1 / span 2; }
.mc-cell.is-skel .ctx { gap: 6px; padding-top: 3px; }
@media (max-width: 720px) {
  .mc-lstack { padding: 30px 14px 16px; }
  .mc-strate { margin-left: 0; }
  .mc-cells { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
