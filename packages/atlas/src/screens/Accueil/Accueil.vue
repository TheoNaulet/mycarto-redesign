<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McHomeSearch from '../../components/McHomeSearch/McHomeSearch.vue'
import type { HomeSearchSuggestion } from '../../components/McHomeSearch/types'
import McLayerStack from '../../components/McLayerStack/McLayerStack.vue'
import type { LayerStackCell, LayerStackLayer } from '../../components/McLayerStack/types'
import McToastHost from '../../components/McToast/McToastHost.vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import { goFiche, goPath, pathHref } from '../bridge'
import { goTo, openPaletteItem, paletteItems, screenHref, type ScreenKey } from './nav'
import {
  catalogue,
  contracts,
  domainNames,
  endOfSupportSoftware,
  expiredContracts,
  invalidApplications,
  inventory,
  obsoleteSoftware,
  supplierSeeds,
} from '../../data/applications'

const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

const suggestions: HomeSearchSuggestion[] = [
  { label: 'APOGEE', layer: 'applicatif', icon: 'app' },
  { label: 'Scolarité', layer: 'fonctionnel', icon: 'folder' },
  { label: 'sophocle', layer: 'technique', icon: 'server' },
  { label: 'Tomcat 5', layer: 'technique', icon: 'software' },
]

const layers: LayerStackLayer[] = [
  {
    n: 1,
    layer: 'metier',
    name: 'Couche métier',
    cells: [
      { icon: 'process', label: 'Processus', count: catalogue.processus, maps: 2 },
      { icon: 'org', label: 'Unités organisationnelles', count: catalogue.unites, maps: 2 },
      { icon: 'shield', label: 'Traitements', description: 'Registre RGPD' },
      { icon: 'user', label: 'Référents métier', description: 'Par application' },
      { icon: 'globe', label: 'Pays', description: 'Aucun saisi', empty: true },
    ],
  },
  {
    n: 2,
    layer: 'fonctionnel',
    name: 'Couche fonctionnelle',
    cells: [
      { icon: 'folder', label: 'Domaines', count: domainNames.length, maps: 2 },
      { icon: 'pos', label: 'Zones du POS', count: catalogue.zonesPos, maps: 2 },
      { icon: 'database', label: 'Données', description: 'Objets de données' },
      { icon: 'user', label: 'Référents fonctionnels', description: 'Par application' },
    ],
  },
  {
    n: 3,
    layer: 'applicatif',
    name: 'Couche applicative',
    cells: [
      { icon: 'app', label: 'Applications', count: inventory.length, maps: 3, alert: { status: 'critical', label: `${invalidApplications.length} non valides` } },
      { icon: 'building', label: 'Fournisseurs', count: supplierSeeds.length },
      { icon: 'contract', label: 'Contrats', count: contracts.length, alert: { status: 'critical', label: `${expiredContracts.length} expirés` } },
      { icon: 'project', label: 'Projets', description: 'Portefeuille' },
    ],
  },
  {
    n: 4,
    layer: 'technique',
    name: 'Couche technique',
    cells: [
      { icon: 'pin', label: 'Sites', count: 3, maps: 2 },
      { icon: 'software', label: 'Logiciels', count: catalogue.logiciels, maps: 2, alert: { status: 'critical', label: `${obsoleteSoftware.length} obsolètes` } },
      { icon: 'server', label: 'Machines', description: 'Physiques et VM', maps: 2 },
      { icon: 'user', label: 'Référents techniques', description: 'Par application' },
    ],
  },
]

interface Todo {
  status: 'critical' | 'warn'
  icon: IconName
  title: string
  text: string
  count: number
  path: string
}
const todos: Todo[] = [
  { status: 'critical', icon: 'alert-octagon', title: 'Applications non valides', text: 'Champs obligatoires manquants', count: invalidApplications.length, path: '/explorateur?filtre=non-valides' },
  { status: 'critical', icon: 'alert-octagon', title: 'Contrats expirés', text: `Sur ${contracts.length} contrats`, count: expiredContracts.length, path: '/contrats' },
  { status: 'warn', icon: 'alert-triangle', title: 'Logiciels obsolètes', text: `${endOfSupportSoftware.length} autres en voie d'obsolescence`, count: obsoleteSoftware.length, path: '/applications-obsoletes' },
  { status: 'warn', icon: 'alert-triangle', title: 'Composants sans logiciel', text: 'Infrastructure incomplète', count: catalogue.composantsSansLogiciel, path: '/logiciels?filtre=sans-composant' },
]

interface Recent {
  title: string
  when: string
  path: string
  blocks: { layer: Layer; l: number; t: number; w: number; h: number }[]
}
const recents: Recent[] = [
  {
    title: 'Applications et flux de Scolarité',
    when: 'Il y a 5 min · par vous',
    path: '/carte',
    blocks: [
      { layer: 'fonctionnel', l: 4, t: 4, w: 30, h: 34 },
      { layer: 'applicatif', l: 40, t: 6, w: 18, h: 5 },
      { layer: 'applicatif', l: 40, t: 16, w: 18, h: 5 },
      { layer: 'applicatif', l: 40, t: 26, w: 18, h: 5 },
    ],
  },
  {
    title: 'Machines nécessaires à APOGEE',
    when: 'Hier · par William',
    path: '/infrastructure',
    blocks: [
      { layer: 'applicatif', l: 4, t: 4, w: 32, h: 34 },
      { layer: 'technique', l: 42, t: 6, w: 16, h: 6 },
      { layer: 'technique', l: 42, t: 18, w: 16, h: 6 },
      { layer: 'technique', l: 42, t: 30, w: 16, h: 6 },
    ],
  },
  {
    title: "Impact d'un arrêt de sophocle",
    when: 'Hier · par William',
    path: '/impact',
    blocks: [
      { layer: 'technique', l: 4, t: 14, w: 12, h: 12 },
      { layer: 'technique', l: 24, t: 14, w: 12, h: 12 },
      { layer: 'applicatif', l: 44, t: 6, w: 14, h: 6 },
      { layer: 'applicatif', l: 44, t: 18, w: 14, h: 6 },
      { layer: 'applicatif', l: 44, t: 30, w: 14, h: 6 },
    ],
  },
]

// Sous 1200px de large, les strates se décalent moins : plus de place pour les libellés.
const offset = ref(20)
const fit = () => (offset.value = window.innerWidth < 1200 ? 10 : 20)
onMounted(() => {
  fit()
  window.addEventListener('resize', fit)
})
onBeforeUnmount(() => window.removeEventListener('resize', fit))

const paletteOpen = ref(false)
const query = ref('')

function openSearch(q = '') {
  query.value = q
  paletteOpen.value = true
}

function onPick(s: HomeSearchSuggestion) {
  if (s.label === 'APOGEE') goFiche('APOGEE')
  else if (s.label === 'Scolarité') goTo('carte')
  else if (s.label === 'sophocle') goTo('impact')
  else openSearch(s.label)
}

/** La page de chaque case des couches. */
const cellRoutes: Record<string, string> = {
  Processus: '/processus',
  'Unités organisationnelles': '/organigramme',
  Traitements: '/traitements',
  'Référents métier': '/referents?type=metier',
  Pays: '/pays',
  Domaines: '/liens-domaines',
  'Zones du POS': '/pos',
  Données: '/donnees',
  'Référents fonctionnels': '/referents?type=fonctionnel',
  Applications: '/explorateur',
  Fournisseurs: '/fournisseurs',
  Contrats: '/contrats',
  Projets: '/projets',
  Sites: '/sites',
  Logiciels: '/logiciels',
  Machines: '/machines',
  'Référents techniques': '/referents?type=technique',
}
function onCell(cell: LayerStackCell) {
  goPath(cellRoutes[cell.label] ?? `/explorateur?q=${encodeURIComponent(cell.label)}`)
}

function onSelect(item: PaletteItem) {
  openPaletteItem(item)
}

/** Suit un lien vers un autre écran (dans Storybook, remplace toute la fenêtre). */
function follow(e: MouseEvent, to: ScreenKey) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goTo(to)
}
function followPath(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}
</script>

<template>
  <div class="mc-scr-acc">
    <McAppBar
      class="mc-scr-acc-bar"
      :meta="{ title: 'Cartographie V2', subtitle: 'Mise à jour le 18/05/2026 à 11:01' }"
      logo-src="/brand/logo-mycarto.svg"
      :home-href="screenHref('accueil')"
      @home="(e) => follow(e, 'accueil')"
      @search="openSearch()"
    >
      <template #actions>
        <McAvatarStack :people="people" label="Personnes connectées" />
        <McButton variant="outline" icon="dashboard" :href="pathHref('/tableaux-de-bord')" @click="(e) => followPath(e, '/tableaux-de-bord')">Tableaux de bord</McButton>
        <McButton variant="primary" icon="plus" :href="pathHref('/editeur')" @click="(e) => followPath(e, '/editeur')">Nouvelle carte</McButton>
      </template>
    </McAppBar>

    <main class="mc-scr-acc-main">
      <div class="mc-scr-acc-hero">
        <div class="mc-scr-acc-title">
          <p class="mc-over">{{ inventory.length }} applications · {{ domainNames.length }} domaines · {{ catalogue.sites }} sites</p>
          <h1>Le SI, couche par couche</h1>
        </div>
        <div class="mc-scr-acc-search">
          <McHomeSearch :suggestions="suggestions" :hotkey="false" @search="openSearch()" @pick="onPick" />
        </div>
      </div>

      <div class="mc-scr-acc-body">
        <div class="mc-scr-acc-stack">
          <McLayerStack :layers="layers" :columns="5" :offset="offset" @open="onCell" />
        </div>

        <aside class="mc-scr-acc-side">
          <section class="mc-float mc-scr-panel" aria-labelledby="mc-scr-todo">
            <div class="mc-scr-panel-head">
              <h2 id="mc-scr-todo" class="mc-over">À traiter</h2>
              <McButton variant="ghost" size="sm" :href="screenHref('explorateur')" @click="(e) => follow(e, 'explorateur')">Tout voir</McButton>
            </div>
            <a
              v-for="t in todos"
              :key="t.title"
              class="mc-scr-row"
              :href="pathHref(t.path)"
              target="_top"
              @click="followPath($event, t.path)"
            >
              <span class="mc-scr-tst" :class="t.status"><McIcon :name="t.icon" /></span>
              <span class="mc-scr-ttx"><b>{{ t.title }}</b><span>{{ t.text }}</span></span>
              <span class="mc-scr-tnum">{{ t.count }}</span>
              <McIcon name="chevron-right" size="sm" class="mc-scr-go" />
            </a>
          </section>

          <section class="mc-float mc-scr-panel" aria-labelledby="mc-scr-rec">
            <div class="mc-scr-panel-head">
              <h2 id="mc-scr-rec" class="mc-over">Récemment consultées</h2>
            </div>
            <a
              v-for="r in recents"
              :key="r.title"
              class="mc-scr-row"
              :href="pathHref(r.path)"
              target="_top"
              @click="followPath($event, r.path)"
            >
              <span class="mc-scr-thumb" aria-hidden="true">
                <i
                  v-for="(b, i) in r.blocks"
                  :key="i"
                  :class="`l-${b.layer}`"
                  :style="{ left: `${b.l}px`, top: `${b.t}px`, width: `${b.w}px`, height: `${b.h}px` }"
                />
              </span>
              <span class="mc-scr-ttx"><b>{{ r.title }}</b><span>{{ r.when }}</span></span>
            </a>
          </section>
        </aside>
      </div>
    </main>

    <McCommandPalette v-model:open="paletteOpen" v-model:query="query" :items="paletteItems" @select="onSelect" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-acc { position: relative; min-height: 100vh; display: flex; flex-direction: column; color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; padding-bottom: 24px; }
.mc-scr-acc-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-acc-main { flex: 1; display: flex; flex-direction: column; gap: 22px; padding: 24px var(--page-pad) 0; min-height: 0; width: 100%; max-width: var(--page-w); margin-inline: auto; box-sizing: border-box; }

.mc-scr-acc-hero { display: flex; align-items: flex-end; gap: 32px; flex-wrap: wrap; }
.mc-scr-acc-title { flex: 1 1 360px; min-width: 0; }
.mc-scr-acc-title .mc-over { margin: 0; }
.mc-scr-acc-title h1 { margin: 6px 0 0; font: 700 34px/40px var(--font-display); letter-spacing: -.01em; color: var(--ink); }
.mc-scr-acc-search { flex: 1 1 520px; max-width: 640px; display: flex; min-width: 0; }
.mc-scr-acc-search .mc-hsearch { max-width: none; }

.mc-scr-acc-body { flex: 1; display: flex; gap: 24px; flex-wrap: wrap; align-items: stretch; min-height: 0; }
.mc-scr-acc-stack { flex: 999 1 720px; min-width: 0; display: flex; flex-direction: column; }
.mc-scr-acc-stack .mc-lstack { flex: 1; }
.mc-scr-acc-side { flex: 1 1 340px; max-width: 360px; display: grid; gap: 16px; align-content: start; }

.mc-scr-panel { padding: 14px; display: grid; gap: 4px; align-content: start; }
.mc-scr-panel-head { display: flex; align-items: center; min-height: 28px; padding: 0 4px 6px; }
.mc-scr-panel-head h2 { flex: 1; margin: 0; }
.mc-scr-row { display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: var(--radius-sm); color: inherit; text-decoration: none; transition: background-color .12s; }
.mc-scr-row:hover { background: var(--surface-sunken); color: inherit; }
.mc-scr-row:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.mc-scr-row .mc-scr-go { color: var(--ink-subtle); transition: transform .12s, color .12s; }
.mc-scr-row:hover .mc-scr-go { color: var(--ink); transform: translateX(2px); }
.mc-scr-tst { width: 32px; height: 32px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-tst.critical { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-scr-tst.warn { background: var(--status-warn-soft); color: var(--status-warn); }
.mc-scr-ttx { flex: 1; display: grid; min-width: 0; }
.mc-scr-ttx b { font-weight: 600; font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-ttx span { font-size: 11px; line-height: 14px; color: var(--ink-subtle); }
.mc-scr-tnum { font: 700 20px/24px var(--font-display); font-variant-numeric: tabular-nums; color: var(--ink); }
.mc-scr-thumb { position: relative; width: 64px; height: 44px; border-radius: 8px; flex: none; box-sizing: border-box; background-color: var(--canvas); background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 6px 6px; border: 1px solid var(--line); overflow: hidden; }
.mc-scr-thumb i { position: absolute; border-radius: 2px; background: var(--lc); opacity: .75; }

/* Grands écrans : le contenu reste centré (1760px au plus) sous une barre pleine largeur, colonne latérale un peu plus large. */
@media (min-width: 1792px) {
  .mc-scr-acc-side { max-width: 400px; }
}
/* Écrans hauts : les couches gardent leur hauteur naturelle au lieu de s'étirer jusqu'en bas. */
@media (min-height: 1000px) {
  .mc-scr-acc-stack .mc-lstack { flex: none; }
}
/* Jusqu’à 1300px, « À traiter » et « Récemment consultées » passent sous les couches, côte à côte. */
@media (max-width: 1300px) {
  .mc-scr-acc-side { max-width: none; flex-basis: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
}
@media (max-width: 760px) {
  .mc-scr-acc-side { grid-template-columns: minmax(0, 1fr); }
}
</style>
