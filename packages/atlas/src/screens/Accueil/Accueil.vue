<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
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
import { journalEntries } from '../../data/journal'

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

/** Une carte récente : un aperçu schématique (blocs aux couleurs des couches, reliés par des traits). */
interface Recent {
  title: string
  kind: string
  icon: IconName
  when: string
  path: string
  /** Blocs dans un repère de 200 × 112. */
  blocks: { layer: Layer; x: number; y: number; w: number; h: number; alert?: boolean }[]
  /** Liens entre blocs, par index. */
  links: [number, number][]
}
const recents: Recent[] = [
  {
    title: 'Applications et flux de Scolarité',
    kind: 'Flux',
    icon: 'map',
    when: 'Il y a 5 min · par vous',
    path: '/carte',
    blocks: [
      { layer: 'fonctionnel', x: 12, y: 14, w: 64, h: 84 },
      { layer: 'applicatif', x: 120, y: 18, w: 66, h: 16 },
      { layer: 'applicatif', x: 120, y: 48, w: 66, h: 16 },
      { layer: 'applicatif', x: 120, y: 78, w: 66, h: 16 },
    ],
    links: [[0, 1], [0, 2], [0, 3], [1, 2]],
  },
  {
    title: 'Les flux d’APOGEE',
    kind: 'Flux',
    icon: 'flow',
    when: 'Ce matin · par Samuel',
    path: '/carte',
    blocks: [
      { layer: 'applicatif', x: 72, y: 44, w: 56, h: 24 },
      { layer: 'applicatif', x: 12, y: 14, w: 46, h: 16 },
      { layer: 'applicatif', x: 142, y: 14, w: 46, h: 16 },
      { layer: 'applicatif', x: 12, y: 82, w: 46, h: 16 },
      { layer: 'applicatif', x: 142, y: 82, w: 46, h: 16 },
    ],
    links: [[0, 1], [0, 2], [0, 3], [0, 4]],
  },
  {
    title: 'Machines nécessaires à APOGEE',
    kind: 'Infrastructure',
    icon: 'server',
    when: 'Hier · par William',
    path: '/infrastructure',
    blocks: [
      { layer: 'applicatif', x: 12, y: 38, w: 62, h: 36 },
      { layer: 'technique', x: 128, y: 14, w: 58, h: 18 },
      { layer: 'technique', x: 128, y: 47, w: 58, h: 18 },
      { layer: 'technique', x: 128, y: 80, w: 58, h: 18 },
    ],
    links: [[0, 1], [0, 2], [0, 3]],
  },
  {
    title: "Impact d'un arrêt de sophocle",
    kind: 'Impact',
    icon: 'impact',
    when: 'Hier · par William',
    path: '/impact',
    blocks: [
      { layer: 'technique', x: 12, y: 44, w: 34, h: 24, alert: true },
      { layer: 'technique', x: 72, y: 44, w: 34, h: 24 },
      { layer: 'applicatif', x: 138, y: 14, w: 50, h: 18 },
      { layer: 'applicatif', x: 138, y: 47, w: 50, h: 18 },
      { layer: 'applicatif', x: 138, y: 80, w: 50, h: 18 },
    ],
    links: [[0, 1], [1, 2], [1, 3], [1, 4]],
  },
]
const mid = (b: Recent['blocks'][number]) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })

/** Les dernières modifications de l'équipe (le journal complet est dans l'écran Historique). */
const activity = journalEntries.slice(0, 3)
const colorOfPerson = (name: string) => people.find((p) => p.name === name)?.color
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const shortDate = (iso: string, heure: string) => {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS[m! - 1]}, ${heure}`
}

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

          <section class="mc-float mc-scr-panel" aria-labelledby="mc-scr-act">
            <div class="mc-scr-panel-head">
              <h2 id="mc-scr-act" class="mc-over">Dernières modifications</h2>
              <McButton variant="ghost" size="sm" :href="pathHref('/journal')" @click="(e) => followPath(e, '/journal')">Historique</McButton>
            </div>
            <a
              v-for="e in activity"
              :key="e.id"
              class="mc-scr-row mc-scr-act"
              :href="pathHref('/journal')"
              target="_top"
              @click="followPath($event, '/journal')"
            >
              <McAvatar :name="e.par" :color="colorOfPerson(e.par)" />
              <span class="mc-scr-ttx">
                <b>{{ e.objet }}</b>
                <span class="mc-scr-act-txt">{{ e.texte }}</span>
                <span>{{ e.par }} · {{ shortDate(e.date, e.heure) }}</span>
              </span>
            </a>
          </section>
        </aside>
      </div>

      <section class="mc-scr-maps" aria-labelledby="mc-scr-rec">
        <h2 id="mc-scr-rec" class="mc-over">Cartes récentes</h2>
        <div class="mc-scr-maps-grid">
          <a
            v-for="r in recents"
            :key="r.title"
            class="mc-float mc-scr-map"
            :href="pathHref(r.path)"
            target="_top"
            @click="followPath($event, r.path)"
          >
            <svg class="mc-scr-map-prev" viewBox="0 0 200 112" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <line
                v-for="([a, b], i) in r.links"
                :key="`l${i}`"
                :x1="mid(r.blocks[a]!).x"
                :y1="mid(r.blocks[a]!).y"
                :x2="mid(r.blocks[b]!).x"
                :y2="mid(r.blocks[b]!).y"
              />
              <rect
                v-for="(b, i) in r.blocks"
                :key="`b${i}`"
                :class="[`l-${b.layer}`, { 'is-alert': b.alert }]"
                :x="b.x"
                :y="b.y"
                :width="b.w"
                :height="b.h"
                rx="3"
              />
            </svg>
            <span class="mc-scr-map-txt">
              <b>{{ r.title }}</b>
              <span><McIcon :name="r.icon" size="sm" />{{ r.kind }} · {{ r.when }}</span>
            </span>
          </a>
        </div>
      </section>
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

.mc-scr-acc-body { display: flex; gap: 24px; flex-wrap: wrap; align-items: stretch; min-height: 0; }
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

.mc-scr-act { align-items: flex-start; padding-block: 6px; }
.mc-scr-panel:has(.mc-scr-act) { gap: 0; }
.mc-scr-act .mc-avatar { margin-top: 1px; }
.mc-scr-ttx .mc-scr-act-txt { color: var(--ink-muted); font-size: 12px; line-height: 16px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-maps { display: grid; gap: 10px; }
.mc-scr-maps h2 { margin: 0; padding-left: 4px; }
.mc-scr-maps-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.mc-scr-map { display: grid; padding: 8px; gap: 10px; color: inherit; text-decoration: none; transition: border-color .12s, transform .12s; }
.mc-scr-map:hover { color: inherit; border-color: var(--line-strong); transform: translateY(-1px); }
.mc-scr-map:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-map-prev { display: block; width: 100%; height: auto; aspect-ratio: 200 / 112; box-sizing: border-box; border-radius: var(--radius-sm); border: 1px solid var(--line); background-color: var(--canvas); background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 10px 10px; }
.mc-scr-map-prev line { stroke: var(--ink-subtle); stroke-width: 1.2; opacity: .55; }
.mc-scr-map-prev rect { fill: color-mix(in srgb, var(--lc) 18%, var(--surface)); stroke: var(--lc); stroke-width: 1.2; }
.mc-scr-map-prev rect.is-alert { fill: var(--status-critical-soft); stroke: var(--status-critical); }
.mc-scr-map-txt { display: grid; gap: 2px; padding: 0 4px 4px; min-width: 0; }
.mc-scr-map-txt b { font-weight: 600; font-size: 13px; line-height: 18px; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-map-txt span { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; line-height: 14px; color: var(--ink-subtle); }

/* Grands écrans : le contenu reste centré (1760px au plus) sous une barre pleine largeur, colonne latérale un peu plus large. */
@media (min-width: 1792px) {
  .mc-scr-acc-side { max-width: 400px; }
}
/* Jusqu’à 1300px, « À traiter » et « Dernières modifications » passent sous les couches, côte à côte. */
@media (max-width: 1300px) {
  .mc-scr-acc-side { max-width: none; flex-basis: 100%; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
}
@media (max-width: 760px) {
  .mc-scr-acc-side { grid-template-columns: minmax(0, 1fr); }
}
</style>
