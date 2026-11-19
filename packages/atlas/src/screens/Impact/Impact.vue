<script setup lang="ts">
import { goFiche, goPath, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import MapAnnotations from '../Infrastructure/MapAnnotations.vue'
import MapShareDialog from '../Infrastructure/MapShareDialog.vue'
import type { ExportItem } from '../shared/SharePanel.vue'
import { noteTexts } from '../../data/annotations'
import { getApplication } from '../../data/applications'
// Écran « Impact d'un arrêt de sophocle » : la machine arrêtée, les applications qu'elle héberge,
// celles que les flux touchent, niveau par niveau, et le panneau de simulation à droite.
import { computed, ref, watch } from 'vue'
import type { IconName } from '../../icons/icons'
import type { Criticity, Layer, Status } from '../../utils/types'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McCountBadge from '../../components/McCountBadge/McCountBadge.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McEdgeLayer from '../../components/McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeSpec } from '../../components/McEdge/edge'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McLensPicker from '../../components/McLensPicker/McLensPicker.vue'
import { MC_LENSES, NO_LENS, type McLens } from '../../components/McLensPicker/lenses'
import McMinimap, { type McMinimapBlock } from '../../components/McMinimap/McMinimap.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McToggleGroup, { type McToggleOption } from '../../components/McToggleGroup/McToggleGroup.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McDicpBadge from '../../components/McDicpBadge/McDicpBadge.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useCanvasView } from '../Infrastructure/canvasView'

/* ---------- Données ----------
 * Nœud : 48px de haut. Colonnes : machine, hébergées, touchées (niveau 1), niveau 2, niveau 3.
 * Chaque cible de flux est alignée sur un départ quand c'est possible ; sinon l'écart vertical dépasse 20px (coudes nets). */
const NODE_H = 48
type Role = 'machine' | 'hosted' | 'flow'
interface ImpactNode {
  id: string
  type: string
  layer: Layer
  icon: IconName
  role: Role
  /** 0 machine, 0 hébergée, 1 à 3 : niveau de flux. */
  level: number
  /** Ce qui relie l'objet à l'arrêt : nom du flux, ou raison. */
  via: string
  d: Criticity
  domain: string
  /** Flux asynchrone : retiré quand on exclut les flux asynchrones. */
  async?: boolean
  /** Objet amont (pour le lien). */
  from?: string
  box: McBox
}
const X = { machine: 48, hosted: 320, l1: 616, l2: 880, l3: 1120 }
const W = { machine: 190, hosted: 190, l1: 200, l2: 180, l3: 180 }
const box = (x: number, y: number, w: number): McBox => ({ x, y, w, h: NODE_H })
const l1y = (k: number) => 182 + 82 * k

const NODES: ImpactNode[] = [
  { id: 'sophocle', type: 'Machine', layer: 'technique', icon: 'server', role: 'machine', level: 0, via: 'Arrêt simulé', d: 0, domain: '', box: box(X.machine, 489, W.machine) },
  { id: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app', role: 'hosted', level: 0, via: '32 utilisateurs', d: 2, domain: 'Scolarité', from: 'sophocle', box: box(X.hosted, 346, W.hosted) },
  { id: 'APOGEE WEB', type: 'Application', layer: 'applicatif', icon: 'app', role: 'hosted', level: 0, via: 'Réinscriptions', d: 3, domain: 'Scolarité', from: 'sophocle', box: box(X.hosted, 633, W.hosted) },
  { id: 'CNOUS', type: 'Partenaire', layer: 'applicatif', icon: 'building', role: 'flow', level: 1, via: 'Export données boursiers', d: 0, domain: '', from: 'APOGEE', box: box(X.l1, l1y(0), W.l1) },
  { id: 'CALCIUM', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Maj des données étudiantes', d: 0, domain: 'Scolarité', async: true, from: 'APOGEE', box: box(X.l1, l1y(1), W.l1) },
  { id: 'NOTES', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Mise à disposition des résultats', d: 2, domain: 'Scolarité', from: 'APOGEE', box: box(X.l1, l1y(2), W.l1) },
  { id: 'TROMBINOSCOPE', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Maj des photos', d: 1, domain: 'Référentiel', from: 'APOGEE', box: box(X.l1, l1y(3), W.l1) },
  { id: 'OpenLDAP', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Flux d’authentification', d: 3, domain: 'Référentiel', from: 'APOGEE', box: box(X.l1, l1y(4), W.l1) },
  { id: 'ALERTES-DIPLOMES', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Information des diplômés', d: 1, domain: 'Scolarité', async: true, from: 'APOGEE WEB', box: box(X.l1, l1y(5), W.l1) },
  { id: 'EXTRACTIONS DEVU', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 1, via: 'Génération de suivi', d: 1, domain: 'Pilotage', async: true, from: 'APOGEE WEB', box: box(X.l1, l1y(6), W.l1) },
  { id: 'ENT', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 2, via: 'Publication des notes', d: 3, domain: 'Services numériques', from: 'NOTES', box: box(X.l2, l1y(2), W.l2) },
  { id: 'HORIZON', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 2, via: 'Photos des cartes', d: 2, domain: 'Vie étudiante', from: 'TROMBINOSCOPE', box: box(X.l2, l1y(3), W.l2) },
  { id: 'MOODLE', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 2, via: 'Comptes des cours', d: 4, domain: 'Pédagogie', from: 'OpenLDAP', box: box(X.l2, l1y(4), W.l2) },
  { id: 'PIX', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 3, via: 'Certification', d: 1, domain: 'Pédagogie', async: true, from: 'HORIZON', box: box(X.l3, l1y(3), W.l3) },
  { id: 'COMPILATIO', type: 'Application', layer: 'applicatif', icon: 'app', role: 'flow', level: 3, via: 'Détection du plagiat', d: 2, domain: 'Pédagogie', from: 'MOODLE', box: box(X.l3, l1y(4), W.l3) },
]
const byId = Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, ImpactNode>

/** Ordre des départs sur chaque source (de haut en bas), et coude de chaque lien. */
const PORTS: Record<string, { spread: number; order: string[]; midX?: Record<string, number> }> = {
  sophocle: { spread: 12, order: ['APOGEE', 'APOGEE WEB'] },
  // Les liens qui montent tournent d'autant plus tôt que leur cible est haute, ceux qui descendent pareil : aucun croisement.
  APOGEE: { spread: 10, order: ['CNOUS', 'CALCIUM', 'NOTES', 'TROMBINOSCOPE', 'OpenLDAP'], midX: { CNOUS: 536, CALCIUM: 552, TROMBINOSCOPE: 552, OpenLDAP: 536 } },
  'APOGEE WEB': { spread: 12, order: ['ALERTES-DIPLOMES', 'EXTRACTIONS DEVU'] },
}

/* ---------- Réglages de la simulation ---------- */
const depth = ref('1')
const depthOptions: McToggleOption[] = [
  { value: '1', label: '1 niveau' },
  { value: '2', label: '2 niveaux' },
  { value: 'all', label: 'Tout' },
]
const maxLevel = computed(() => (depth.value === 'all' ? 3 : Number(depth.value)))
const includeAsync = ref(true)

const excludedByAsync = (n: ImpactNode): boolean => {
  if (n.async && !includeAsync.value) return true
  return n.from ? excludedByAsync(byId[n.from]) : false
}
/** Objets touchés, selon la profondeur et le type de flux. */
const included = computed(() => NODES.filter((n) => n.level <= maxLevel.value && !excludedByAsync(n)))
/** Le niveau suivant, montré estompé : ce que la profondeur laisse de côté. */
const preview = computed(() => NODES.filter((n) => n.level === maxLevel.value + 1 && !excludedByAsync(n)))
const isIncluded = (id: string) => included.value.some((n) => n.id === id)

const hosted = computed(() => included.value.filter((n) => n.role === 'hosted'))
const touched = computed(() => included.value.filter((n) => n.role === 'flow'))
const touchedL1 = computed(() => touched.value.filter((n) => n.level === 1))
const domains = computed(() => new Set(included.value.filter((n) => n.domain).map((n) => n.domain)).size)

/* ---------- Lentille ---------- */
const impactLens: McLens = { id: 'impact', label: 'Impact', description: 'Ce que touche l’arrêt simulé', icon: 'impact', tone: 'critical' }
const lenses: McLens[] = [MC_LENSES[0], impactLens, ...MC_LENSES.filter((l) => l.id === 'dicp')]
const lens = ref('impact')
const lensOn = computed(() => lens.value !== NO_LENS)
const legend = ref(false)
const isolated = ref<string | null>(null)
watch(lens, () => (isolated.value = null))
function statusOf(n: ImpactNode): Status | undefined {
  if (lens.value === 'impact') return n.role === 'flow' ? 'warn' : 'critical'
  if (lens.value === 'dicp') {
    if (n.role === 'machine') return 'critical'
    return n.d === 4 ? 'critical' : n.d === 3 ? 'warn' : n.d === 0 ? 'unknown' : 'ok'
  }
  return n.role === 'machine' ? 'critical' : undefined
}
const levelLabels: Record<string, Record<Status, string>> = {
  impact: { critical: 'Arrêtée ou hébergée', warn: 'Touchée par un flux', ok: 'Non touchée', unknown: 'Non renseigné' },
  dicp: { critical: 'Très forte', warn: 'Forte', ok: 'Modérée ou faible', unknown: 'Non renseignée' },
}
const legendSections = computed<McLegendSection[]>(() => {
  const shown = included.value
  const s: McLegendSection[] = [
    {
      title: 'Types',
      items: [
        { id: 'type-Machine', label: 'Machine', count: shown.filter((n) => n.type === 'Machine').length, layer: 'technique' },
        { id: 'type-Application', label: 'Application', count: shown.filter((n) => n.type === 'Application').length, layer: 'applicatif' },
        { id: 'type-Partenaire', label: 'Partenaire', count: shown.filter((n) => n.type === 'Partenaire').length, layer: 'applicatif' },
      ],
    },
  ]
  const labels = levelLabels[lens.value]
  if (labels) {
    const levels: Status[] = lens.value === 'impact' ? ['critical', 'warn'] : ['critical', 'warn', 'ok', 'unknown']
    s.push({
      title: lens.value === 'impact' ? 'Impact' : 'Criticité DICP',
      items: levels.map((st) => ({ id: st, label: labels[st], status: st, count: shown.filter((n) => statusOf(n) === st).length })),
    })
  }
  return s
})

/* ---------- Sélection ---------- */
const selected = ref<string | null>('sophocle')
/** Le chemin de l'arrêt jusqu'à l'objet sélectionné. */
const path = computed(() => {
  const set = new Set<string>()
  let cur = selected.value ? byId[selected.value] : undefined
  while (cur) {
    set.add(cur.id)
    cur = cur.from ? byId[cur.from] : undefined
  }
  return set
})
function dimmed(n: ImpactNode) {
  if (!isIncluded(n.id)) return true
  const iso = isolated.value
  if (iso) return iso.startsWith('type-') ? iso !== `type-${n.type}` : statusOf(n) !== iso
  return false
}
function subtitle(n: ImpactNode) {
  if (n.role === 'machine') return 'Arrêt simulé'
  if (n.role === 'hosted') return `D ${['non renseignée', 'faible', 'modérée', 'forte', 'très forte'][n.d]} · ${n.via.toLowerCase()}`
  if (!isIncluded(n.id)) return `Niveau ${n.level}`
  return n.level > 1 ? `Niveau ${n.level} · ${n.via}` : n.via
}

/* ---------- Liens ---------- */
const edges = computed<McEdgeSpec[]>(() => {
  const list: McEdgeSpec[] = []
  for (const n of [...included.value, ...preview.value]) {
    if (!n.from) continue
    const src = byId[n.from]
    const p = PORTS[src.id]
    // Les départs gardent leur place même quand un flux est masqué : les liens restants ne bougent pas.
    const order = p ? p.order : [n.id]
    const i = Math.max(0, order.indexOf(n.id))
    const live = isIncluded(n.id)
    const onPath = selected.value && selected.value !== 'sophocle' ? path.value.has(n.id) : true
    list.push({
      id: `${src.id}->${n.id}`,
      ...edgeBetween(src.box, n.box, i, order.length, p?.spread),
      midX: p?.midX?.[n.id],
      kind: !live ? 'dim' : onPath ? 'impact' : 'dim',
      arrow: live,
      port: live,
      label: n.via,
    })
  }
  return list
})

/* ---------- Panneau de simulation ---------- */
// La disponibilité (D) de chaque application est celle de sa fiche.
for (const n of NODES) {
  const a = n.type === 'Application' ? getApplication(n.id) : undefined
  if (a) n.d = a.dicp.d
}
const simulation: InspectedObject = { name: 'Arrêt de sophocle', type: 'Simulation', layer: 'technique', icon: 'impact' }
/** Application sélectionnée sur la carte, pour ouvrir sa fiche. */
const selectedApp = computed(() => (selected.value && byId[selected.value]?.type === 'Application' ? selected.value : null))
const critical = computed(() =>
  [...hosted.value, ...touched.value]
    .map((n, idx) => ({ n, idx }))
    .sort((a, b) => (a.n.role === b.n.role ? 0 : a.n.role === 'hosted' ? -1 : 1) || b.n.d - a.n.d || a.idx - b.idx)
    .slice(0, 5)
    .map((x) => x.n),
)
/* ---------- Exporter le rapport, partager ---------- */
const shareOpen = ref(false)
const depthLabel = computed(() => (maxLevel.value === 3 ? 'tous les niveaux' : maxLevel.value === 1 ? '1 niveau' : '2 niveaux'))
const reportTitle = computed(() => `Impact d’un arrêt de sophocle (${depthLabel.value})`)
/** Les objets touchés, selon la profondeur et les flux retenus ; la sélection en tête. */
const exportItems = computed<ExportItem[]>(() => {
  const all = included.value.map((n) => ({ name: n.id, layer: n.layer }))
  const i = selected.value ? all.findIndex((x) => x.name === selected.value) : -1
  return i > 0 ? [all[i], ...all.slice(0, i), ...all.slice(i + 1)] : all
})
function exportReport() {
  shareOpen.value = true
}
/** Partager : le panneau de partage, son lien à copier (avec la vue et la lentille) et l'export. */
function share() {
  shareOpen.value = true
}
const annotations = ref<InstanceType<typeof MapAnnotations>>()
function placeNote() {
  const c = viewCenter()
  annotations.value?.placeNote(c.x, c.y)
}
function placeComment() {
  const c = viewCenter()
  annotations.value?.placeComment(c.x + 40, c.y - 40)
}
/** Double-clic sur un objet : sa fiche, la machine dans l'écran Machines, le partenaire sur la carte des flux. */
function openNode(n: ImpactNode) {
  if (n.type === 'Application') goFiche(n.id)
  else if (n.role === 'machine') goPath(`/machines?id=${encodeURIComponent(n.id)}`)
  else goPath('/carte')
}
function onEdgeSelect(id: string) {
  const to = id.split('->')[1]
  if (to && byId[to]) selected.value = to
}
function stopSimulation() {
  goPath('/carte')
}
const paletteOpen = ref(false)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [
  { label: 'Accueil' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'sophocle', layer: 'technique' },
  { label: 'Impact d’un arrêt' },
]
const TRAIL_PATHS = ['/', '/carte', '/infrastructure']
function onTrail(_s: TrailStep, i: number) {
  if (TRAIL_PATHS[i]) goPath(TRAIL_PATHS[i])
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

/* ---------- Zoom, déplacement, vue d'ensemble ---------- */
const root = ref<HTMLElement>()
const mapCollapsed = ref(false)
const contentRight = computed(() => (maxLevel.value >= 2 ? X.l3 + W.l3 : X.l2 + W.l2))
// Les colonnes se calent en haut à gauche, sous les puces ; le panneau de simulation reste ouvert à droite.
const { zoom, pan, tool, fit, viewport, pct, vars, viewCenter, handlers } = useCanvasView(root, {
  content: () => ({ x: 0, y: 140, w: contentRight.value + 8, h: 620 }),
  rightPanel: () => 368,
  top: 140,
  bottom: 110,
  left: 0,
  align: 'start',
})
watch(depth, () => fit())
const minimapBlocks = computed<McMinimapBlock[]>(() => [...included.value, ...preview.value].map((n) => ({ layer: n.layer, ...pct(n.box) })))

const pos = (b: McBox) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px' })
const shownNodes = computed(() => [...included.value, ...preview.value])
const colHeads = computed(() => [
  { x: X.machine, label: 'Machine arrêtée' },
  { x: X.hosted, label: 'Hébergées', count: hosted.value.length, alert: true },
  { x: X.l1, label: 'Touchées par les flux', count: touchedL1.value.length },
  ...(maxLevel.value >= 2 ? [{ x: X.l2, label: 'Niveau 2', count: touched.value.filter((n) => n.level === 2).length }] : []),
  ...(maxLevel.value >= 3 ? [{ x: X.l3, label: 'Niveau 3', count: touched.value.filter((n) => n.level === 3).length }] : []),
])
</script>

<template>
  <div
    ref="root"
    class="mc-scr-impact mc-scr-map"
    :class="{ 'is-hand': tool === 'hand' }"
    :style="vars"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Carte de l’impact d’un arrêt de sophocle" @deselect="selected = null" @fit="fit">
      <span v-for="h in colHeads" :key="h.label" class="mc-scr-colh" :style="{ left: h.x + 'px' }">
        {{ h.label }}
        <McCountBadge v-if="h.count !== undefined" :count="h.count" :variant="h.alert ? 'alert' : 'default'" />
      </span>

      <McEdgeLayer :edges="edges" @select="onEdgeSelect" />

      <McNode
        v-for="n in shownNodes"
        :key="n.id"
        :style="pos(n.box)"
        :layer="n.layer"
        :icon="n.icon"
        :type="n.type"
        :name="n.id"
        :subtitle="subtitle(n)"
        :status="isIncluded(n.id) ? statusOf(n) : undefined"
        :lens="lensOn && isIncluded(n.id)"
        :selected="selected === n.id"
        :dimmed="dimmed(n)"
        @select="selected = n.id"
        @open="openNode(n)"
      />
      <MapAnnotations ref="annotations" screen="impact" :zoom="zoom" />

      <template #top>
        <div class="mc-scr-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home.prevent="goPath('/')" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" @click="exportReport"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton variant="primary" icon="pencil" :href="pathHref('/editeur')" @click.prevent="goPath('/editeur')">Modifier</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-chips">
            <McFilterChip label="Simulation : arrêt de sophocle" @remove="stopSimulation" />
            <McFilterChip v-if="lensOn" :label="`Lentille : ${lenses.find((l) => l.id === lens)?.label}`" @remove="lens = NO_LENS" />
          </div>
        </div>
      </template>

      <template #right>
        <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        <McInspector :object="simulation" class="mc-scr-sim" @close="stopSimulation">
          <template #statuses>
            <span class="mc-scr-cap">Rien n’est modifié</span>
          </template>
          <div class="mc-scr-sum">
            <div><b>{{ hosted.length }}</b><span>{{ hosted.length > 1 ? 'applications hébergées' : 'application hébergée' }}</span></div>
            <div><b>{{ touched.length }}</b><span>{{ touched.length > 1 ? 'touchées par les flux' : 'touchée par les flux' }}</span></div>
            <div><b>{{ domains }}</b><span>{{ domains > 1 ? 'domaines' : 'domaine' }}</span></div>
          </div>
          <div class="mc-scr-field">
            <span class="mc-over">Profondeur</span>
            <McToggleGroup v-model="depth" :options="depthOptions" label="Profondeur de l’impact" />
          </div>
          <McSwitch v-model="includeAsync" label="Inclure les flux asynchrones" block />
          <hr class="mc-hr" />
          <div class="mc-scr-field">
            <span class="mc-over">Les plus critiques</span>
            <div class="mc-scr-ilist" role="list">
              <button v-for="n in critical" :key="n.id" type="button" class="mc-scr-irow" :class="{ 'is-on': selected === n.id }" role="listitem" :title="n.type === 'Application' ? `Double-cliquez pour ouvrir la fiche de ${n.id}` : undefined" @click="selected = n.id" @dblclick="openNode(n)">
                <McDicpBadge only="D" :d="n.d" />
                <span class="grow">{{ n.id }}</span>
                <McStatusChip v-if="n.role === 'hosted'" status="critical" size="sm">Hébergée</McStatusChip>
                <McStatusChip v-else :status="n.level === 1 ? 'warn' : 'neutral'" size="sm">{{ n.level === 1 ? 'Par flux' : `Niveau ${n.level}` }}</McStatusChip>
              </button>
            </div>
            <McButton v-if="selectedApp" variant="outline" size="sm" icon="external" @click="goFiche(selectedApp)">Ouvrir la fiche de {{ selectedApp }}</McButton>
            <McButton v-else-if="selected === 'sophocle'" variant="outline" size="sm" icon="server" @click="goPath('/machines?id=sophocle')">Voir sophocle dans les machines</McButton>
            <McButton v-else-if="selected === 'CNOUS'" variant="outline" size="sm" icon="flow" @click="goPath('/carte')">Voir CNOUS sur la carte des flux</McButton>
          </div>
          <hr class="mc-hr" />
          <div class="mc-scr-field">
            <McButton icon="export" @click="exportReport">Exporter le rapport d’impact</McButton>
            <McButton variant="outline" icon="comment" @click="share">Partager avec un commentaire</McButton>
          </div>
        </McInspector>
      </template>

      <template #bottom-left>
        <McMinimap v-model:viewport="viewport" v-model:collapsed="mapCollapsed" :blocks="minimapBlocks" :count="34" :zoom="zoom" />
      </template>

      <template #bottom>
        <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit" @filter="legend = true" @sticky="placeNote" @comment="placeComment">
          <template #lens><McLensPicker v-model:lens="lens" :lenses="lenses" @change="(l) => (legend = l.id !== NO_LENS)" /></template>
        </McToolbar>
      </template>
    </McCanvas>
    <MapShareDialog v-model:open="shareOpen" :title="reportTitle" :items="exportItems" :selection-count="selected && exportItems[0]?.name === selected ? 1 : 0" :notes="noteTexts('impact')" />
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost contained :offset="96" />
  </div>
</template>

<style>
.mc-scr-impact { position: relative; width: 100%; height: 100vh; min-height: 640px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-impact.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-impact .mc-canvas-layer > .mc-node { z-index: 1; }
.mc-scr-impact .mc-scr-top { display: flex; flex-direction: column; gap: 16px; pointer-events: none; }
.mc-scr-impact .mc-scr-top > * { pointer-events: auto; }
.mc-scr-chips { align-self: flex-start; display: flex; gap: 8px; }
.mc-scr-colh { position: absolute; top: 140px; display: flex; align-items: center; gap: 8px; font: 600 11px/14px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--ink-muted); white-space: nowrap; }
.mc-scr-colh .mc-count { letter-spacing: 0; }
/* Panneau de simulation : la tuile dit l'arrêt (rouge), pas la couche. */
.mc-scr-impact .mc-canvas-right { align-items: stretch; }
.mc-scr-impact .mc-canvas-right > .mc-legend { flex: none; align-self: flex-end; }
.mc-scr-impact .mc-canvas-right > .mc-insp { flex: 1 1 auto; min-height: 0; }
.mc-scr-sim .hd .tile { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-scr-sim .hd .mc-chip.type { display: none; }
.mc-scr-cap { font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
.mc-scr-sim .body { padding-top: 4px; gap: 16px; align-content: start; }
.mc-scr-sum { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.mc-scr-sum div { padding: 10px; border-radius: var(--radius-sm); background: var(--surface-sunken); display: grid; }
.mc-scr-sum b { font: 700 22px/26px var(--font-display); font-variant-numeric: tabular-nums; color: var(--ink); }
.mc-scr-sum span { font-size: 11px; line-height: 14px; color: var(--ink-muted); }
.mc-scr-field { display: grid; gap: 8px; }
.mc-scr-ilist { display: grid; gap: 4px; }
.mc-scr-irow { display: flex; align-items: center; gap: 10px; height: 34px; padding: 0 8px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: 400 13px/16px var(--font-sans); text-align: left; cursor: pointer; }
.mc-scr-irow:hover, .mc-scr-irow.is-on { background: var(--surface-sunken); }
.mc-scr-irow:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mc-scr-irow .grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
