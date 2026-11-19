<script setup lang="ts">
// Écran « Criticité des applications » : les 65 applications de l'inventaire par niveau DICP.
// Le niveau d'une application est le plus fort des critères retenus (D, I, C, P). Matrice domaines × niveaux,
// puis les applications groupées du niveau très fort aux non évaluées ; une ligne ouvre la fiche.
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McDicpBadge, { criticityLabel, dicpCriteria, type DicpLetter } from '../../components/McDicpBadge/McDicpBadge.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import type { Criticity } from '../../utils/types'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { inventory, type Application } from '../../data/applications'
import { exportCsv } from '../../data/a-texte'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Critères et niveaux ---------- */
const LETTERS: DicpLetter[] = ['D', 'I', 'C', 'P']
// La disponibilité d'abord : le critère que l'on regarde pour un plan de continuité.
const criteria = ref<DicpLetter[]>(['D'])
function toggle(l: DicpLetter) {
  const has = criteria.value.includes(l)
  if (has && criteria.value.length === 1) return
  criteria.value = has ? criteria.value.filter((x) => x !== l) : LETTERS.filter((x) => x === l || criteria.value.includes(x))
}
const allCriteria = computed(() => criteria.value.length === LETTERS.length)
const levelOf = (a: Application): Criticity => Math.max(0, ...criteria.value.map((l) => a.dicp[l.toLowerCase() as 'd' | 'i' | 'c' | 'p'])) as Criticity
const LEVELS: Criticity[] = [4, 3, 2, 1, 0]
const levelName = (n: Criticity) => (n ? criticityLabel[n] : 'Non évaluées')

/* ---------- Recherche et case de la matrice ---------- */
const query = ref('')
const found = computed(() => {
  const q = norm(query.value.trim())
  return q ? inventory.filter((a) => norm(`${a.name} ${a.description ?? ''} ${a.domaines.join(' ')}`).includes(q)) : inventory
})
const domainOf = (a: Application) => a.domaines[0] ?? 'Sans domaine'
const DOMAINS = [...new Set(inventory.map(domainOf))].sort((a, b) => inventory.filter((x) => domainOf(x) === b).length - inventory.filter((x) => domainOf(x) === a).length)
const cell = ref<{ domain: string | null; level: Criticity | null } | null>(null)
function pickCell(domain: string | null, level: Criticity | null) {
  const same = cell.value && cell.value.domain === domain && cell.value.level === level
  cell.value = same ? null : { domain, level }
}
const count = (domain: string | null, level: Criticity | null) =>
  found.value.filter((a) => (domain === null || domainOf(a) === domain) && (level === null || levelOf(a) === level)).length
const shown = computed(() => (cell.value ? found.value.filter((a) => (cell.value!.domain === null || domainOf(a) === cell.value!.domain) && (cell.value!.level === null || levelOf(a) === cell.value!.level)) : found.value))
const groups = computed(() =>
  LEVELS.map((lv) => ({
    lv,
    apps: shown.value
      .filter((a) => levelOf(a) === lv)
      .sort((a, b) => {
        // Dans un niveau : le plus de critères à ce niveau d'abord, puis le nom.
        const n = (x: Application) => criteria.value.filter((l) => x.dicp[l.toLowerCase() as 'd'] === lv).length
        return n(b) - n(a) || a.name.localeCompare(b.name, 'fr')
      }),
  })).filter((g) => g.apps.length),
)
const max = computed(() => Math.max(1, ...DOMAINS.flatMap((d) => LEVELS.map((l) => count(d, l)))))
const tint = (n: number, lv: Criticity) => (n ? { '--k': `${Math.round(14 + (n / max.value) * 44)}%`, '--c': lv ? `var(--crit-${lv})` : 'var(--status-unknown)' } : {})
const cellLabel = computed(() => {
  const c = cell.value
  if (!c) return ''
  const parts = [c.domain, c.level !== null ? levelName(c.level) : null].filter(Boolean)
  return parts.join(' · ')
})
const bar = computed(() => LEVELS.map((lv) => ({ lv, n: count(null, lv) })).filter((x) => x.n))
const evaluated = computed(() => found.value.filter((a) => levelOf(a) > 0).length)
function clearAll() {
  query.value = ''
  cell.value = null
  criteria.value = ['D']
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche applicative', layer: 'applicatif' }, { label: 'Criticité' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0 || i === 1) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (found.value.length ? plural(found.value.length, 'application', 'applications') : 'Aucun résultat') : undefined))
/** Exporter : les applications affichées (recherche et case de la matrice), avec leur niveau et leurs 4 critères. */
function exportList() {
  const lv = (n: number) => (n ? criticityLabel[n as Criticity] : 'Non évalué')
  const rows = groups.value.flatMap((g) => g.apps.map((a) => [a.name, domainOf(a), levelName(g.lv), lv(a.dicp.d), lv(a.dicp.i), lv(a.dicp.c), lv(a.dicp.p)]))
  const file = exportCsv(cell.value ? `Criticité ${cellLabel.value}` : 'Criticité des applications', ['Application', 'Domaine', `Niveau (${criteria.value.join(', ')})`, 'Disponibilité', 'Intégrité', 'Confidentialité', 'Preuve'], rows)
  toast.success(`${file} téléchargé : ${plural(rows.length, 'application', 'applications')}`)
}
function open(a: Application, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey) return
  e.preventDefault()
  goFiche(a.slug)
}
</script>

<template>
  <div class="mc-scr-crit">
    <McAppBar class="mc-scr-crit-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <main class="mc-scr-crit-wrap">
      <header class="mc-scr-crit-head">
        <div class="mc-scr-crit-titles">
          <p class="mc-over">Couche applicative · Sécurité</p>
          <h1 class="title-lg">Criticité des applications <span class="mc-scr-crit-n">{{ shown.length }}</span></h1>
        </div>
        <McSearchField v-model="query" class="mc-scr-crit-search" placeholder="Rechercher une application" :count="searchCount" />
      </header>

      <div class="mc-scr-crit-filters">
        <span class="mc-scr-crit-k" id="mc-scr-crit-crit">Critères</span>
        <div class="mc-scr-crit-letters" role="group" aria-labelledby="mc-scr-crit-crit">
          <button
            v-for="l in LETTERS"
            :key="l"
            type="button"
            class="mc-scr-crit-letter"
            :class="{ 'is-on': criteria.includes(l) }"
            :aria-pressed="criteria.includes(l)"
            :title="criteria.includes(l) && criteria.length === 1 ? 'Au moins un critère reste coché' : undefined"
            @click="toggle(l)"
          >
            <McIcon :name="criteria.includes(l) ? 'check' : 'plus'" size="sm" />{{ dicpCriteria[l] }}
          </button>
        </div>
        <McFilterChip v-if="cell" :label="cellLabel" @remove="cell = null" />
        <span class="mc-scr-crit-grow" />
        <McButton v-if="cell || query || criteria.length !== 1 || criteria[0] !== 'D'" variant="ghost" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
      </div>

      <section class="mc-scr-crit-card" aria-label="Répartition par niveau">
        <div class="mc-scr-crit-sum">
          <p class="mc-scr-crit-sumtext">
            <b>{{ evaluated }}</b> {{ evaluated > 1 ? 'applications évaluées' : 'application évaluée' }} sur {{ found.length }}
            <span class="mc-scr-crit-sub">· niveau le plus fort de {{ allCriteria ? 'D, I, C et P' : criteria.join(', ').replace(/, ([^,]*)$/, ' et $1') }}</span>
          </p>
          <div class="mc-scr-crit-stack" role="img" :aria-label="bar.map((x) => `${levelName(x.lv)} : ${x.n}`).join(', ')">
            <button
              v-for="x in bar"
              :key="x.lv"
              type="button"
              class="mc-scr-crit-seg"
              :class="`mc-scr-crit-lv-${x.lv}`"
              :style="{ flexGrow: x.n }"
              :title="`${levelName(x.lv)} : ${plural(x.n, 'application', 'applications')}`"
              @click="pickCell(null, x.lv)"
            >{{ x.n }}</button>
          </div>
          <ul class="mc-scr-crit-legend">
            <li v-for="lv in LEVELS" :key="lv"><span class="mc-scr-crit-sw" :class="`mc-scr-crit-lv-${lv}`" />{{ levelName(lv) }}</li>
          </ul>
        </div>

        <div class="mc-scr-crit-scroll">
          <table class="mc-scr-crit-mx">
            <caption class="mc-over">Domaines × niveaux</caption>
            <thead>
              <tr>
                <th scope="col">Domaine</th>
                <th v-for="lv in LEVELS" :key="lv" scope="col">{{ levelName(lv) }}</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="d in DOMAINS" :key="d">
                <th scope="row">
                  <button type="button" class="mc-scr-crit-rowh" :class="{ 'is-on': cell?.domain === d && cell?.level === null }" @click="pickCell(d, null)">{{ d }}</button>
                </th>
                <td v-for="lv in LEVELS" :key="lv">
                  <button
                    type="button"
                    class="mc-scr-crit-cell"
                    :class="{ 'is-on': cell?.domain === d && cell?.level === lv, 'is-zero': !count(d, lv) }"
                    :style="tint(count(d, lv), lv)"
                    :disabled="!count(d, lv)"
                    :aria-label="`${d}, ${levelName(lv)} : ${plural(count(d, lv), 'application', 'applications')}`"
                    @click="pickCell(d, lv)"
                  >{{ count(d, lv) || '·' }}</button>
                </td>
                <td class="mc-scr-crit-tot">{{ count(d, null) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <template v-if="groups.length">
        <section v-for="g in groups" :key="g.lv" class="mc-scr-crit-group" :aria-label="levelName(g.lv)">
          <h2 class="mc-scr-crit-h2">
            <span class="mc-scr-crit-sw lg" :class="`mc-scr-crit-lv-${g.lv}`" />
            {{ g.lv ? `Criticité ${criticityLabel[g.lv].toLowerCase()}` : 'Non évaluées' }}
            <span class="mc-scr-crit-count">{{ plural(g.apps.length, 'application', 'applications') }}</span>
          </h2>
          <p v-if="!g.lv" class="mc-scr-crit-note">Aucun des critères retenus n’est renseigné. À compléter depuis la fiche de chaque application.</p>
          <ul class="mc-scr-crit-rows">
            <li v-for="a in g.apps" :key="a.slug">
              <a class="mc-scr-crit-row" :href="ficheHref(a.slug)" @click="open(a, $event)">
                <span class="mc-scr-crit-tile"><McIcon name="app" /></span>
                <span class="mc-scr-crit-name">{{ a.name }}</span>
                <span class="mc-scr-crit-dom">{{ domainOf(a) }}</span>
                <McDicpBadge v-bind="a.dicp" />
                <McIcon class="mc-scr-crit-go" name="chevron-right" size="sm" />
              </a>
            </li>
          </ul>
        </section>
      </template>
      <McEmptyState v-else icon="search" title="Aucune application ne correspond" text="Modifiez la recherche ou choisissez une autre case.">
        <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
      </McEmptyState>
    </main>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-crit { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-crit-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-crit-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: grid; gap: 16px; }
.mc-scr-crit-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-crit-titles { flex: 1; min-width: 180px; }
.mc-scr-crit-titles .mc-over { margin: 0 0 2px; }
.mc-scr-crit-titles h1 { margin: 0; }
.mc-scr-crit-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-crit-search { width: 300px; }
.mc-scr-crit-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-crit-k { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.mc-scr-crit-letters { display: flex; gap: 6px; flex-wrap: wrap; }
.mc-scr-crit-letter { display: inline-flex; align-items: center; gap: 4px; height: 28px; padding: 0 10px 0 8px; border-radius: 999px; border: 1px solid var(--line); background: var(--surface); color: var(--ink-muted); font: 600 12px/16px var(--font-sans); cursor: pointer; }
.mc-scr-crit-letter:hover { border-color: var(--line-strong); color: var(--ink); }
.mc-scr-crit-letter.is-on { background: var(--navy); border-color: var(--navy); color: var(--on-navy); }
.mc-scr-crit-letter:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-crit-grow { flex: 1; }
.mc-scr-crit-card { display: grid; grid-template-columns: minmax(260px, 1fr) minmax(0, 2fr); gap: 24px; padding: 20px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
.mc-scr-crit-sum { display: grid; gap: 12px; align-content: start; }
.mc-scr-crit-sumtext { margin: 0; font-size: 14px; line-height: 20px; }
.mc-scr-crit-sumtext b { font: 700 28px/32px var(--font-display); margin-right: 2px; }
.mc-scr-crit-sub { color: var(--ink-subtle); font-size: 12px; }
.mc-scr-crit-stack { display: flex; gap: 2px; height: 28px; border-radius: var(--radius-sm); overflow: hidden; }
.mc-scr-crit-seg { flex-basis: 0; min-width: 22px; border: 0; padding: 0; font: 700 12px/28px var(--font-sans); cursor: pointer; }
.mc-scr-crit-seg:hover { filter: brightness(1.08); }
.mc-scr-crit-seg:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mc-scr-crit-lv-4 { background: var(--crit-4); color: var(--on-navy); }
.mc-scr-crit-lv-3 { background: var(--crit-3); color: var(--on-navy); }
.mc-scr-crit-lv-2 { background: var(--crit-2); color: var(--ink); }
.mc-scr-crit-lv-1 { background: var(--crit-1); color: var(--ink); }
.mc-scr-crit-lv-0 { background: var(--surface-sunken); color: var(--ink-muted); background-image: repeating-linear-gradient(135deg, transparent 0 4px, var(--line) 4px 5px); }
.mc-scr-crit-legend { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 6px 14px; font-size: 12px; color: var(--ink-muted); }
.mc-scr-crit-legend li { display: inline-flex; align-items: center; gap: 6px; }
.mc-scr-crit-sw { width: 12px; height: 12px; border-radius: 3px; flex: none; display: inline-block; }
.mc-scr-crit-sw.lg { width: 14px; height: 14px; }
.mc-scr-crit-scroll { overflow-x: auto; min-width: 0; }
.mc-scr-crit-mx { width: 100%; border-collapse: separate; border-spacing: 3px; font-size: 13px; }
.mc-scr-crit-mx caption { text-align: left; margin: 0 0 6px 3px; }
.mc-scr-crit-mx th { font-weight: 600; font-size: 11px; color: var(--ink-muted); text-align: center; white-space: nowrap; padding: 0 4px 4px; }
.mc-scr-crit-mx th[scope='row'] { text-align: left; padding: 0; }
.mc-scr-crit-mx thead th:first-child { text-align: left; }
.mc-scr-crit-rowh { border: 0; background: transparent; padding: 4px 8px 4px 0; font: 600 13px/18px var(--font-sans); color: var(--ink); cursor: pointer; text-align: left; white-space: nowrap; border-radius: var(--radius-xs); }
.mc-scr-crit-rowh:hover { color: var(--accent); }
.mc-scr-crit-rowh.is-on { color: var(--accent); text-decoration: underline; }
.mc-scr-crit-cell { width: 100%; min-width: 48px; height: 30px; border: 1px solid transparent; border-radius: var(--radius-xs); background: color-mix(in srgb, var(--c, var(--line)) var(--k, 0%), var(--surface)); color: var(--ink); font: 700 13px/1 var(--font-sans); cursor: pointer; }
.mc-scr-crit-cell:hover:not([disabled]) { border-color: var(--line-strong); }
.mc-scr-crit-cell.is-on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.mc-scr-crit-cell.is-zero { background: var(--surface-sunken); color: var(--line-strong); cursor: default; }
.mc-scr-crit-cell:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-crit-tot { text-align: center; font-weight: 700; color: var(--ink-muted); }
.mc-scr-crit-group { display: grid; gap: 8px; }
.mc-scr-crit-h2 { display: flex; align-items: center; gap: 8px; margin: 8px 0 0; font: 600 17px/24px var(--font-display); }
.mc-scr-crit-count { font: 400 12px/16px var(--font-sans); color: var(--ink-subtle); }
.mc-scr-crit-note { margin: -4px 0 0; font-size: 13px; color: var(--ink-muted); }
.mc-scr-crit-rows { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 6px 14px; }
.mc-scr-crit-row { display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 6px 10px 6px 8px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: var(--surface); color: var(--ink); text-decoration: none; box-shadow: var(--shadow-node); }
.mc-scr-crit-row:hover { border-color: var(--line-strong); box-shadow: var(--shadow-hover); }
.mc-scr-crit-row:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-crit-tile { width: 26px; height: 26px; border-radius: var(--radius-xs); background: var(--layer-applicatif-soft); color: var(--layer-applicatif); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-crit-name { font: 600 13px/16px var(--font-display); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-crit-dom { flex: 1; min-width: 0; font-size: 12px; color: var(--ink-subtle); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-crit-go { color: var(--ink-subtle); }
@media (min-width: 1800px) {
  .mc-scr-crit-wrap { max-width: 1760px; padding-inline: 40px; }
  .mc-scr-crit-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1280px) {
  .mc-scr-crit-wrap { padding-inline: 24px; }
  .mc-scr-crit-card { grid-template-columns: minmax(0, 1fr); }
}
</style>
