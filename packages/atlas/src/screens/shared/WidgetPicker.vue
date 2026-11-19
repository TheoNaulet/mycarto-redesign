<script setup lang="ts">
// Modale d'ajout d'un widget au tableau de bord : les types de widgets avec un aperçu, une recherche
// et un filtre par famille. « Ajouter » (ou double-clic, ou Entrée sur une carte) émet `add` avec le type choisi.
import { computed, nextTick, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McModal from '../../components/McModal/McModal.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McButton from '../../components/McButton/McButton.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import { widgetCategories, widgetKinds, type WidgetCategory, type WidgetKind, type WidgetType } from './widgets'

export type { WidgetKind, WidgetType } from './widgets'

const props = withDefaults(
  defineProps<{
    /** Types déjà présents sur le tableau de bord : signalés, mais toujours ajoutables. */
    added?: WidgetType[]
    /** Nom du tableau de bord, dans le sous-titre. */
    dashboard?: string
  }>(),
  { added: () => [], dashboard: 'Tableau de bord' },
)

/** Modale ouverte. */
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  /** Le widget choisi ; la modale se ferme ensuite. */
  add: [type: WidgetType]
}>()

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const query = ref('')
const category = ref<WidgetCategory | 'Tous'>('Tous')
const chosen = ref<WidgetType | null>(null)

const shown = computed(() => {
  const q = norm(query.value)
  return widgetKinds.filter(
    (w) => (category.value === 'Tous' || w.category === category.value) && (!q || norm(`${w.label} ${w.description} ${w.example} ${w.category}`).includes(q)),
  )
})
const countOf = (c: WidgetCategory | 'Tous') => (c === 'Tous' ? widgetKinds.length : widgetKinds.filter((w) => w.category === c).length)
const chosenKind = computed(() => widgetKinds.find((w) => w.type === chosen.value) ?? null)
const searchCount = computed(() => {
  const n = shown.value.length
  return n ? `${n} widget${n > 1 ? 's' : ''}` : 'Aucun widget'
})

watch(open, (o) => {
  if (o) {
    query.value = ''
    category.value = 'Tous'
    chosen.value = null
  }
})
// Le choix disparaît s'il sort du filtre.
watch(shown, (list) => {
  if (chosen.value && !list.some((w) => w.type === chosen.value)) chosen.value = null
})

function add(w: WidgetKind | null = chosenKind.value) {
  if (!w) return
  emit('add', w.type)
  open.value = false
}

/* ---------- Clavier : flèches entre les cartes, Entrée pour ajouter ---------- */
const grid = ref<HTMLElement | null>(null)
async function onKey(e: KeyboardEvent, i: number) {
  const cols = grid.value ? getComputedStyle(grid.value).gridTemplateColumns.split(' ').length : 1
  const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols }
  if (e.key === 'Enter') {
    e.preventDefault()
    add(shown.value[i])
    return
  }
  if (e.key === ' ') {
    e.preventDefault()
    chosen.value = shown.value[i].type
    return
  }
  const d = moves[e.key]
  if (d === undefined) return
  e.preventDefault()
  const j = Math.min(shown.value.length - 1, Math.max(0, i + d))
  chosen.value = shown.value[j].type
  await nextTick()
  grid.value?.querySelectorAll<HTMLElement>('[role="radio"]')[j]?.focus()
}
const tabIndex = (w: WidgetKind, i: number) => (chosen.value ? (w.type === chosen.value ? 0 : -1) : i === 0 ? 0 : -1)
</script>

<template>
  <McModal
    v-model:open="open"
    title="Ajouter un widget"
    :subtitle="`Au tableau de bord « ${dashboard} »`"
    size="lg"
    :confirm-label="chosenKind ? `Ajouter « ${chosenKind.label} »` : 'Ajouter le widget'"
    confirm-icon="plus"
    :confirm-disabled="!chosenKind"
    :footer-note="chosenKind ? `${chosenKind.span === 2 ? 'Occupe deux colonnes' : 'Occupe une colonne'} · se règle après l’ajout` : 'Choisissez un widget, ou double-cliquez pour l’ajouter'"
    @confirm="add()"
  >
    <div class="mc-scr-wp">
      <div class="mc-scr-wp-tools">
        <McSearchField v-model="query" size="sm" class="mc-scr-wp-search" placeholder="Rechercher un widget" :count="query ? searchCount : undefined" />
        <div class="mc-seg" role="group" aria-label="Famille de widgets">
          <button
            v-for="c in ['Tous', ...widgetCategories] as const"
            :key="c"
            type="button"
            :class="{ 'is-on': category === c }"
            :aria-pressed="category === c"
            @click="category = c"
          >
            {{ c }}<span class="mc-scr-wp-n">{{ countOf(c) }}</span>
          </button>
        </div>
      </div>

      <div v-if="shown.length" ref="grid" class="mc-scr-wp-grid" role="radiogroup" aria-label="Types de widgets">
        <div
          v-for="(w, i) in shown"
          :key="w.type"
          role="radio"
          class="mc-scr-wp-card"
          :class="{ 'is-on': w.type === chosen }"
          :aria-checked="w.type === chosen"
          :tabindex="tabIndex(w, i)"
          @click="chosen = w.type"
          @dblclick="add(w)"
          @keydown="onKey($event, i)"
        >
          <div class="mc-scr-wp-prev" aria-hidden="true">
            <!-- Chiffre clé -->
            <template v-if="w.type === 'kpi'">
              <span class="mc-scr-wp-big">65</span>
              <svg viewBox="0 0 80 24" class="mc-scr-wp-spark"><polyline points="0,20 14,17 28,18 42,11 56,12 70,5 80,6" /></svg>
            </template>
            <!-- Jauge -->
            <svg v-else-if="w.type === 'jauge'" viewBox="0 0 100 60" class="mc-scr-wp-svg">
              <path d="M10 52a40 40 0 0 1 80 0" class="mc-scr-wp-track" />
              <path d="M10 52a40 40 0 0 1 72.4-23.5" class="mc-scr-wp-arc" />
              <text x="50" y="50" text-anchor="middle" class="mc-scr-wp-num">82 %</text>
            </svg>
            <!-- Barres -->
            <div v-else-if="w.type === 'barres'" class="mc-scr-wp-bars">
              <i v-for="(b, k) in [92, 70, 52, 34, 18]" :key="k" :style="{ width: `${b}%` }" />
            </div>
            <!-- Anneau -->
            <svg v-else-if="w.type === 'anneau'" viewBox="0 0 60 60" class="mc-scr-wp-svg mc-scr-wp-donut">
              <circle cx="30" cy="30" r="20" class="mc-scr-wp-track" />
              <circle cx="30" cy="30" r="20" class="mc-scr-wp-seg1" pathLength="100" stroke-dasharray="72 28" />
              <circle cx="30" cy="30" r="20" class="mc-scr-wp-seg2" pathLength="100" stroke-dasharray="20 80" stroke-dashoffset="-72" />
            </svg>
            <!-- Évolution -->
            <svg v-else-if="w.type === 'courbe'" viewBox="0 0 120 60" class="mc-scr-wp-svg">
              <path d="M0 50H120M0 30H120M0 10H120" class="mc-scr-wp-grid-l" />
              <polyline points="0,44 20,40 40,42 60,28 80,30 100,16 120,12" class="mc-scr-wp-line" />
            </svg>
            <!-- Points d'attention -->
            <ul v-else-if="w.type === 'liste'" class="mc-scr-wp-list">
              <li><b class="is-crit" />Tomcat 5</li>
              <li><b class="is-crit" />Oracle 10g</li>
              <li><b class="is-warn" />PHP 7.2</li>
            </ul>
            <!-- Échéances -->
            <div v-else-if="w.type === 'echeances'" class="mc-scr-wp-time">
              <span class="mc-scr-wp-axis" />
              <b v-for="(x, k) in [12, 30, 46, 70, 88]" :key="k" :class="k < 1 ? 'is-crit' : k < 3 ? 'is-warn' : 'is-ok'" :style="{ left: `${x}%` }" />
            </div>
            <!-- Résultat de requête -->
            <div v-else-if="w.type === 'tableau'" class="mc-scr-wp-table">
              <i v-for="k in 4" :key="k"><span /><span /></i>
            </div>
            <!-- Aperçu de carte -->
            <svg v-else viewBox="0 0 120 60" class="mc-scr-wp-svg mc-scr-wp-map">
              <path d="M30 18L60 30M60 30L92 16M60 30L90 46" class="mc-scr-wp-edge" />
              <rect x="10" y="12" width="28" height="12" rx="3" />
              <rect x="46" y="24" width="28" height="12" rx="3" class="is-main" />
              <rect x="82" y="10" width="28" height="12" rx="3" />
              <rect x="80" y="40" width="28" height="12" rx="3" />
            </svg>
          </div>
          <div class="mc-scr-wp-txt">
            <span class="mc-scr-wp-name"><McIcon :name="w.icon" size="sm" />{{ w.label }}</span>
            <span class="mc-scr-wp-desc">{{ w.description }}</span>
            <span class="mc-cap">ex. {{ w.example }}</span>
            <span v-if="added.includes(w.type)" class="mc-scr-wp-on"><McIcon name="check" size="sm" />Déjà sur ce tableau de bord</span>
          </div>
        </div>
      </div>
      <McEmptyState v-else size="compact" title="Aucun widget ne correspond" :text="`Rien ne contient « ${query} »${category !== 'Tous' ? ` dans la famille ${category}` : ''}.`">
        <template #action>
          <McButton variant="outline" size="sm" icon="x" @click="(query = ''), (category = 'Tous')">Effacer la recherche</McButton>
        </template>
      </McEmptyState>
    </div>
  </McModal>
</template>

<style>
.mc-scr-wp { display: grid; gap: 14px; }
.mc-scr-wp-tools { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-wp-search { width: 240px; }
.mc-scr-wp-n { margin-left: 4px; color: var(--ink-subtle); font-weight: 500; font-variant-numeric: tabular-nums; }
.mc-scr-wp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.mc-scr-wp-card { display: grid; grid-template-rows: auto 1fr; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface); cursor: pointer; overflow: hidden; transition: border-color .12s ease-out, box-shadow .12s ease-out; }
.mc-scr-wp-card:hover { border-color: var(--line-strong); box-shadow: var(--shadow-hover); }
.mc-scr-wp-card.is-on { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.mc-scr-wp-card:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-wp-prev { height: 96px; display: flex; align-items: center; justify-content: center; gap: 12px; padding: 12px 16px; box-sizing: border-box; background: var(--surface-sunken); border-bottom: 1px solid var(--line); color: var(--ink); }
.mc-scr-wp-txt { display: grid; gap: 4px; padding: 10px 12px 12px; align-content: start; }
.mc-scr-wp-name { display: flex; align-items: center; gap: 6px; font: 600 14px/18px var(--font-display); }
.mc-scr-wp-name .mc-ico { color: var(--ink-muted); }
.mc-scr-wp-desc { font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-wp-on { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; line-height: 16px; color: var(--status-ok); }

/* Aperçus */
.mc-scr-wp-big { font: 700 34px/1 var(--font-display); color: var(--ink); font-variant-numeric: tabular-nums; }
.mc-scr-wp-spark { width: 80px; height: 24px; }
.mc-scr-wp-spark polyline, .mc-scr-wp-line { fill: none; stroke: var(--data-1); stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.mc-scr-wp-svg { height: 100%; max-width: 100%; overflow: visible; }
.mc-scr-wp-track { fill: none; stroke: var(--line); stroke-width: 8; stroke-linecap: round; }
.mc-scr-wp-arc { fill: none; stroke: var(--status-ok); stroke-width: 8; stroke-linecap: round; }
.mc-scr-wp-num { font: 700 15px/1 var(--font-display); fill: var(--ink); }
.mc-scr-wp-donut circle { fill: none; stroke-width: 9; transform: rotate(-90deg); transform-origin: 30px 30px; }
.mc-scr-wp-donut .mc-scr-wp-track { stroke-linecap: butt; }
.mc-scr-wp-seg1 { stroke: var(--data-1); }
.mc-scr-wp-seg2 { stroke: var(--data-3); }
.mc-scr-wp-grid-l { stroke: var(--line); stroke-width: 1; }
.mc-scr-wp-bars { width: 100%; display: grid; gap: 6px; }
.mc-scr-wp-bars i { height: 8px; border-radius: 2px; background: var(--data-1); }
.mc-scr-wp-bars i:nth-child(n + 3) { opacity: .7; }
.mc-scr-wp-list { list-style: none; margin: 0; padding: 0; width: 100%; display: grid; gap: 6px; font-size: 12px; line-height: 16px; }
.mc-scr-wp-list li { display: flex; align-items: center; gap: 8px; padding: 2px 8px; border-radius: var(--radius-xs); background: var(--surface); }
.mc-scr-wp-list b, .mc-scr-wp-time b { width: 8px; height: 8px; border-radius: 50%; flex: none; }
.mc-scr-wp-prev .is-crit { background: var(--status-critical); }
.mc-scr-wp-prev .is-warn { background: var(--status-warn); }
.mc-scr-wp-prev .is-ok { background: var(--status-ok); }
.mc-scr-wp-time { position: relative; width: 100%; height: 40px; }
.mc-scr-wp-axis { position: absolute; left: 0; right: 0; top: 50%; height: 2px; background: var(--line-strong); }
.mc-scr-wp-time b { position: absolute; top: calc(50% - 5px); width: 10px; height: 10px; margin-left: -5px; box-shadow: 0 0 0 2px var(--surface-sunken); }
.mc-scr-wp-table { width: 100%; display: grid; gap: 5px; }
.mc-scr-wp-table i { display: grid; grid-template-columns: 1fr 2fr; gap: 8px; padding: 3px 6px; border-radius: 3px; background: var(--surface); }
.mc-scr-wp-table span { height: 6px; border-radius: 2px; background: var(--line-strong); }
.mc-scr-wp-table span:first-child { background: var(--layer-applicatif); opacity: .6; }
.mc-scr-wp-map rect { fill: var(--layer-applicatif-soft); stroke: var(--layer-applicatif); stroke-width: 1; }
.mc-scr-wp-map rect.is-main { fill: var(--yellow-soft); stroke: var(--ink); }
.mc-scr-wp-edge { fill: none; stroke: var(--edge); stroke-width: 1.2; }
@media (prefers-reduced-motion: reduce) {
  .mc-scr-wp-card { transition: none; }
}
</style>
