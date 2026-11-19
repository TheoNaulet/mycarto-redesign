<script setup lang="ts">
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
// Écran « Les applications et flux de Scolarité » : la carte d'un domaine, ses applications,
// les flux qui en partent, les domaines voisins, et l'inspecteur de l'objet sélectionné.
import { computed, onMounted, reactive, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer, Status } from '../../utils/types'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McFlowNode from '../../components/McFlowNode/McFlowNode.vue'
import McEdgeLayer from '../../components/McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeKind, type McEdgeSpec } from '../../components/McEdge/edge'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McLensPicker from '../../components/McLensPicker/McLensPicker.vue'
import { MC_LENSES, NO_LENS } from '../../components/McLensPicker/lenses'
import McMinimap, { type McMinimapBlock } from '../../components/McMinimap/McMinimap.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McDicpBadge from '../../components/McDicpBadge/McDicpBadge.vue'
import McStickyNote from '../../components/McStickyNote/McStickyNote.vue'
import McPresenceCursor from '../../components/McPresenceCursor/McPresenceCursor.vue'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { useCanvasView } from '../Infrastructure/canvasView'
import SearchPalette from '../Accueil/SearchPalette.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import MapAnnotations from '../Infrastructure/MapAnnotations.vue'
import MapShareDialog from '../Infrastructure/MapShareDialog.vue'
import type { ExportItem } from '../shared/SharePanel.vue'
import { logicielId } from '../../data/logiciels'
import { TYPES_REFERENT, type TypeReferent } from '../../data/referents'
import { noteTexts } from '../../data/annotations'
import { domainCount, getApplication, missingFields, type Application } from '../../data/applications'

const toast = useToast()

/* ---------- Géométrie ----------
 * Nœud : 48px de haut (onglet de 14px au-dessus, hors boîte). Pilule de flux : 26px.
 * Dans un conteneur : bord 1 + en-tête 40 + onglet 14 avant le premier enfant, puis un pas de 72 (48 + 10 + 14). */
const NODE_H = 48
const PILL_H = 26
const COL1 = 249 // Scolarité : 236 + 1 + 12
const COL2 = 497
const W1 = 184
const W2 = 200
const RIGHT_X = 800
const RIGHT_W = 214
const RIGHT_NODE_W = RIGHT_W - 2 - 24

type Kind = 'app' | 'partner'
interface MapNode {
  id: string
  type: string
  kind: Kind
  icon: IconName
  sub?: string
  description: string
  domain: string
  main?: boolean
}
const N: Record<string, MapNode> = {
  CNOUS: { id: 'CNOUS', type: 'Partenaire', kind: 'partner', icon: 'building', sub: 'Partenaire', description: 'Centre national des œuvres universitaires et scolaires.', domain: 'Hors SI' },
  APOGEE: { id: 'APOGEE', type: 'Application', kind: 'app', icon: 'app', sub: '32 utilisateurs', description: 'Gestion des étudiants et des enseignements.', domain: 'Scolarité', main: true },
  'APOGEE WEB': { id: 'APOGEE WEB', type: 'Application', kind: 'app', icon: 'app', sub: 'Module de APOGEE', description: 'Inscriptions et réinscriptions en ligne des étudiants.', domain: 'Scolarité' },
  UNICAMPUS: { id: 'UNICAMPUS', type: 'Application', kind: 'app', icon: 'app', sub: 'Application mobile', description: 'Portail des services numériques étudiants.', domain: 'Scolarité' },
  NOTES: { id: 'NOTES', type: 'Application', kind: 'app', icon: 'app', sub: 'Saisie des notes', description: 'Saisie des notes par les enseignants et publication des résultats.', domain: 'Scolarité' },
  CALCIUM: { id: 'CALCIUM', type: 'Application', kind: 'app', icon: 'app', sub: 'Agenda partagé', description: 'Agendas partagés des personnels et des étudiants.', domain: 'Scolarité' },
  DIEGO: { id: 'DIEGO', type: 'Application', kind: 'app', icon: 'app', sub: 'Dossiers étudiants', description: 'Dossiers des étudiants et pièces justificatives.', domain: 'Scolarité' },
  'ALERTES-DIPLOMES': { id: 'ALERTES-DIPLOMES', type: 'Application', kind: 'app', icon: 'app', sub: 'Information des diplômés', description: 'Prévient les diplômés que leur diplôme est disponible.', domain: 'Scolarité' },
  OpenLDAP: { id: 'OpenLDAP', type: 'Application', kind: 'app', icon: 'app', sub: 'Annuaire', description: 'Annuaire central des comptes et des groupes.', domain: 'Référentiel' },
  TROMBINOSCOPE: { id: 'TROMBINOSCOPE', type: 'Application', kind: 'app', icon: 'app', sub: 'Photos des étudiants', description: 'Photos d’identité des étudiants et des personnels.', domain: 'Référentiel' },
  C2I: { id: 'C2I', type: 'Application', kind: 'app', icon: 'app', sub: 'Certification', description: 'Certification informatique et internet des étudiants.', domain: 'Pédagogie' },
  SIHAM: { id: 'SIHAM', type: 'Application', kind: 'app', icon: 'app', sub: 'Gestion des personnels', description: 'Gestion administrative et paie des personnels.', domain: 'Ressources humaines' },
  HARPEGE: { id: 'HARPEGE', type: 'Application', kind: 'app', icon: 'app', sub: 'Carrières', description: 'Gestion des personnels.', domain: 'Ressources humaines' },
  Koha: { id: 'Koha', type: 'Application', kind: 'app', icon: 'app', sub: 'Catalogue', description: 'Catalogue et prêts de la bibliothèque universitaire.', domain: 'Documentation' },
}

// Les descriptions viennent de la fiche de chaque application (source unique src/data/applications.ts).
for (const n of Object.values(N)) {
  const d = getApplication(n.id)?.description
  if (n.kind === 'app' && d) n.description = d.endsWith('.') ? d : `${d}.`
}

/** Position de chaque nœud libre (hors conteneurs de droite). */
const fixedBoxes: Record<string, McBox> = {
  CNOUS: { x: 20, y: 349, w: 172, h: NODE_H },
  APOGEE: { x: COL1, y: 349, w: W1, h: NODE_H },
  'APOGEE WEB': { x: COL1, y: 620, w: W1, h: NODE_H },
  UNICAMPUS: { x: COL1, y: 700, w: W1, h: NODE_H },
  NOTES: { x: COL2, y: 430, w: W2, h: NODE_H },
  CALCIUM: { x: COL2, y: 520, w: W2, h: NODE_H },
  DIEGO: { x: COL2, y: 620, w: W2, h: NODE_H },
  'ALERTES-DIPLOMES': { x: COL2, y: 700, w: W2, h: NODE_H },
}
const scolariteNodes = ['APOGEE', 'APOGEE WEB', 'UNICAMPUS', 'NOTES', 'CALCIUM', 'DIEGO', 'ALERTES-DIPLOMES']

/** Flux en pilule, alignés sur le centre de leur cible quand c'est possible. */
interface Pill {
  id: string
  label: string
  meta?: string
  cy: number
  direction?: 'one' | 'both'
  edge: string
  data: string
}
const pills = reactive<Pill[]>([
  { id: 'p-auth', label: 'Flux d’authentification', cy: 229, direction: 'both', edge: 'LDAP · temps réel', data: 'Comptes étudiants' },
  { id: 'p-maj', label: 'Maj des données étudiantes', cy: 301, edge: 'Synchrone · semestrielle', data: 'Identité, photo' },
  { id: 'p-c2i', label: 'Inscriptions au C2I', cy: 373, edge: 'Fichier plat · annuelle', data: 'Inscriptions pédagogiques' },
])
const pillBox = (p: Pill): McBox => ({ x: COL2, y: p.cy - PILL_H / 2, w: W2, h: PILL_H })

/** Une chaîne de flux : source → (pilule) → cible. */
interface Chain {
  id: string
  from: string
  to: string
  pill?: string
  /** Libellé du flux (celui de la pilule quand il y en a une). */
  name: string
  /** Liaison et fréquence : « LDAP · temps réel ». */
  label: string
  /** Données échangées. */
  data: string
  /** Rang du départ sur la source et nombre de départs (chaque lien a son propre point de départ). */
  port?: [number, number]
  midX?: number
}
// Départs d'APOGEE : 5 liens, 9px d'écart. Le lien du milieu (C2I) part droit.
// Les liens qui montent tournent d'autant plus tôt que leur cible est haute, ceux qui descendent pareil : aucun croisement.
const chains = reactive<Chain[]>([
  { id: 'c-cnous', from: 'CNOUS', to: 'APOGEE', name: 'Export données boursiers', label: 'Fichier plat · quotidienne', data: 'Données des étudiants boursiers' },
  { id: 'c-auth', from: 'APOGEE', pill: 'p-auth', to: 'OpenLDAP', name: 'Flux d’authentification', label: 'LDAP · temps réel', data: 'Comptes étudiants', port: [0, 5], midX: 453 },
  { id: 'c-maj', from: 'APOGEE', pill: 'p-maj', to: 'TROMBINOSCOPE', name: 'Maj des données étudiantes', label: 'Synchrone · semestrielle', data: 'Identité, photo', port: [1, 5], midX: 469 },
  { id: 'c-c2i', from: 'APOGEE', pill: 'p-c2i', to: 'C2I', name: 'Inscriptions au C2I', label: 'Fichier plat · annuelle', data: 'Inscriptions pédagogiques', port: [2, 5] },
  { id: 'c-notes', from: 'APOGEE', to: 'NOTES', name: 'Mise à disposition des résultats', label: 'Web service · quotidienne', data: 'Résultats et notes', port: [3, 5], midX: 469 },
  { id: 'c-calcium', from: 'APOGEE', to: 'CALCIUM', name: 'Maj des emplois du temps', label: 'Synchrone · semestrielle', data: 'Inscriptions aux enseignements', port: [4, 5], midX: 453 },
  { id: 'c-diego', from: 'APOGEE WEB', to: 'DIEGO', name: 'Dossiers des inscrits', label: 'Web service · temps réel', data: 'Pièces justificatives' },
  { id: 'c-alertes', from: 'UNICAMPUS', to: 'ALERTES-DIPLOMES', name: 'Information des diplômés', label: 'Fichier plat · hebdomadaire', data: 'Diplômes disponibles' },
])
/** Le flux d'un identifiant sélectionné : sa pilule ou son lien. */
const fluxOf = (id: string | null) => (id ? chains.find((c) => c.pill === id || c.id === id) : undefined)
const PORT_SPREAD = 9

/* ---------- Conteneurs de droite : empilés, ils suivent le repli ---------- */
interface RightDomain {
  name: string
  count: number
  children: string[]
}
const rightDomains: RightDomain[] = [
  { name: 'Référentiel', count: domainCount('Référentiel'), children: ['OpenLDAP', 'TROMBINOSCOPE'] },
  { name: 'Pédagogie', count: domainCount('Pédagogie'), children: ['C2I'] },
  { name: 'Ressources humaines', count: domainCount('Ressources humaines'), children: ['SIHAM', 'HARPEGE'] },
  { name: 'Documentation', count: domainCount('Documentation'), children: ['Koha'] },
]
const scolariteCount = domainCount('Scolarité')
const collapsed = ref<Record<string, boolean>>({ Scolarité: false, Référentiel: false, Pédagogie: false, 'Ressources humaines': true, Documentation: true })
const groupHeight = (n: number, isCollapsed: boolean) => (isCollapsed ? 42 : 1 + 40 + n * (14 + NODE_H) + (n - 1) * 10 + 12 + 1)
const rightLayout = computed(() => {
  let y = 150
  return rightDomains.map((d) => {
    const c = !!collapsed.value[d.name]
    const h = groupHeight(d.children.length, c)
    const top = y
    y += h + 44
    return { ...d, top, h, collapsed: c }
  })
})

/** Boîtes de tous les nœuds visibles, en coordonnées du canevas. */
const boxes = computed<Record<string, McBox>>(() => {
  const out: Record<string, McBox> = {}
  for (const [id, b] of Object.entries(fixedBoxes)) {
    if (collapsed.value['Scolarité'] && scolariteNodes.includes(id)) continue
    out[id] = b
  }
  for (const d of rightLayout.value) {
    if (d.collapsed) continue
    d.children.forEach((id, i) => {
      out[id] = { x: RIGHT_X + 13, y: d.top + 1 + 40 + 14 + i * 72, w: RIGHT_NODE_W, h: NODE_H }
    })
  }
  return out
})
const visiblePills = computed(() => (collapsed.value['Scolarité'] ? [] : pills))

/* ---------- Sélection ---------- */
const selected = ref<string | null>('APOGEE')
const related = computed(() => {
  const s = selected.value
  const set = new Set<string>()
  if (!s) return set
  set.add(s)
  for (const c of chains) {
    if (c.from === s || c.to === s || c.pill === s || c.id === s) {
      set.add(c.from)
      set.add(c.to)
      if (c.pill) set.add(c.pill)
    }
  }
  const dom = rightDomains.find((d) => d.name === s)
  if (dom) dom.children.forEach((c) => set.add(c))
  if (s === 'Scolarité') scolariteNodes.forEach((c) => set.add(c))
  return set
})
const isNodeSelection = computed(() => !!selected.value && (N[selected.value] !== undefined || !!fluxOf(selected.value)))
function chainKind(c: Chain): McEdgeKind {
  const s = selected.value
  if (!s || !isNodeSelection.value) return 'flow'
  return c.from === s || c.to === s || c.pill === s || c.id === s ? 'hover' : 'dim'
}

/* ---------- Lentilles ---------- */
const lens = ref(NO_LENS)
const lensOn = computed(() => lens.value !== NO_LENS)
const legend = ref(false)
const isolated = ref<string | null>(null)
type LensValue = [Status, string]
// Les valeurs des lentilles se lisent dans la fiche de chaque application ; CNOUS est un partenaire, sans fiche.
const appOf = (id: string) => getApplication(id)
const DICP_WORD = ['', 'faible', 'modérée', 'forte', 'très forte']
function obsolescenceValue(a: Application): LensValue {
  const o = a.obsolescence
  if (!o || o.status === 'unknown') return ['unknown', 'Non renseigné']
  return [o.status, o.status === 'ok' ? 'Supporté' : o.label]
}
function contractValue(a: Application): LensValue {
  if (!a.contrats.length) return ['unknown', 'Sans contrat']
  // Le contrat qui court le plus loin dit l'échéance.
  const by = (d: string) => d.split('/').reverse().join('')
  const c = [...a.contrats].sort((x, y) => by(y.end).localeCompare(by(x.end)))[0]
  if (c.level === 'expire') return ['critical', `Expiré le ${c.end}`]
  if (c.level === 'moins6') return ['critical', `Expire le ${c.end}`]
  if (c.level === 'de6a12') return ['warn', `Expire le ${c.end}`]
  return ['ok', 'Contrat > 1 an']
}
function dicpValue(a: Application): LensValue {
  const keys = ['d', 'i', 'c', 'p'] as const
  const max = Math.max(...keys.map((k) => a.dicp[k]))
  if (!max) return ['unknown', 'Non renseignée']
  const top = keys.filter((k) => a.dicp[k] === max).map((k) => k.toUpperCase())
  const what = top.length > 1 ? `${top.slice(0, -1).join(', ')} et ${top[top.length - 1]} ${DICP_WORD[max]}s` : `${top[0]} ${DICP_WORD[max]}`
  return [max === 4 ? 'critical' : max === 3 ? 'warn' : 'ok', what.charAt(0).toUpperCase() + what.slice(1)]
}
function statutValue(a: Application): LensValue {
  if (!a.statut) return ['unknown', 'Non renseigné']
  return a.statut === 'Active' ? ['ok', 'Active'] : ['warn', 'En projet']
}
function qualiteValue(a: Application): LensValue {
  const n = missingFields(a).length
  if (!n) return ['ok', 'Complète']
  return n >= 3 ? ['critical', `${n} champs manquants`] : ['warn', `${n} champ${n > 1 ? 's' : ''} manquant${n > 1 ? 's' : ''}`]
}
const lensValues = (read: (a: Application) => LensValue, partner: LensValue) =>
  Object.fromEntries(Object.keys(N).map((id) => [id, appOf(id) ? read(appOf(id)!) : partner])) as Record<string, LensValue>
const LENS_DATA: Record<string, { levels: Record<Status, string>; values: Record<string, LensValue> }> = {
  obsolescence: {
    levels: { critical: 'Obsolète', warn: 'Fin de support sous 12 mois', ok: 'Supporté', unknown: 'Non renseigné' },
    values: lensValues(obsolescenceValue, ['unknown', 'Non renseigné']),
  },
  contrats: {
    levels: { critical: 'Expiré ou sous 6 mois', warn: 'Expire dans 6 à 12 mois', ok: 'Plus d’un an', unknown: 'Sans contrat' },
    values: lensValues(contractValue, ['ok', 'Convention 2028']),
  },
  dicp: {
    levels: { critical: 'Très forte', warn: 'Forte', ok: 'Modérée ou faible', unknown: 'Non renseignée' },
    values: lensValues(dicpValue, ['unknown', 'Non renseignée']),
  },
  statut: {
    levels: { critical: 'Arrêtée', warn: 'En projet', ok: 'Active', unknown: 'Non renseigné' },
    values: lensValues(statutValue, ['unknown', 'Non renseigné']),
  },
  qualite: {
    levels: { critical: '3 champs manquants ou plus', warn: '1 ou 2 champs manquants', ok: 'Complète', unknown: 'Non évaluée' },
    values: lensValues(qualiteValue, ['unknown', 'Non évaluée']),
  },
}
/** Sans lentille, une règle signale déjà les objets en alerte. */
const BASE_ALERTS: Record<string, LensValue> = Object.fromEntries(
  Object.entries(LENS_DATA.obsolescence.values).filter(([id, v]) => id !== 'APOGEE' && v[0] === 'critical'),
)
const lensValue = (id: string): LensValue | undefined => (lensOn.value ? LENS_DATA[lens.value]?.values[id] : BASE_ALERTS[id])
const statusOf = (id: string) => lensValue(id)?.[0]
const subOf = (id: string) => (lensOn.value ? (lensValue(id)?.[1] ?? N[id].sub) : N[id].sub)
const lensLabel = computed(() => MC_LENSES.find((l) => l.id === lens.value)?.label ?? '')

const legendSections = computed<McLegendSection[]>(() => {
  const ids = Object.keys(boxes.value)
  const apps = ids.filter((i) => N[i].kind === 'app').length
  const partners = ids.filter((i) => N[i].kind === 'partner').length
  const sections: McLegendSection[] = [
    {
      title: 'Types',
      items: [
        { id: 'type-Domaine', label: 'Domaine', count: 5, layer: 'fonctionnel' },
        { id: 'type-Application', label: 'Application', count: apps, layer: 'applicatif' },
        { id: 'type-Partenaire', label: 'Partenaire', count: partners, layer: 'applicatif' },
        { id: 'type-Flux', label: 'Flux', count: visiblePills.value.length + chains.filter((c) => !c.pill).length, layer: 'applicatif' },
      ],
    },
  ]
  const data = LENS_DATA[lens.value]
  if (lensOn.value && data) {
    const levels: Status[] = ['critical', 'warn', 'ok', 'unknown']
    sections.push({
      title: lensLabel.value,
      items: levels.map((s) => ({ id: s, label: data.levels[s], status: s, count: ids.filter((i) => data.values[i]?.[0] === s).length })),
    })
  }
  return sections
})
watch(lens, () => (isolated.value = null))

function dimmedNode(id: string) {
  if (isNodeSelection.value && !related.value.has(id)) return true
  const iso = isolated.value
  if (!iso) return false
  if (iso.startsWith('type-')) return iso !== `type-${N[id].type}`
  return statusOf(id) !== iso
}
function dimmedPill(p: Pill) {
  if (isNodeSelection.value && !related.value.has(p.id)) return true
  const iso = isolated.value
  return !!iso && iso !== 'type-Flux'
}

/* ---------- Liens, calculés depuis les positions réelles ---------- */
const edges = computed<McEdgeSpec[]>(() => {
  const b = boxes.value
  const list: McEdgeSpec[] = []
  for (const c of chains) {
    const src = b[c.from]
    if (!src) continue
    const kind = isolated.value ? 'dim' : chainKind(c)
    const [i, n] = c.port ?? [0, 1]
    const pill = c.pill ? pills.find((p) => p.id === c.pill) : undefined
    if (pill) {
      if (!visiblePills.value.includes(pill)) continue
      const pb = pillBox(pill)
      list.push({ id: `${c.id}-a`, ...edgeBetween(src, pb, i, n, PORT_SPREAD), midX: c.midX, kind, label: c.label })
      const dst = b[c.to]
      if (dst) list.push({ id: `${c.id}-b`, ...edgeBetween(pb, dst), kind, label: c.label })
    } else {
      const dst = b[c.to]
      if (!dst) continue
      list.push({ id: c.id, ...edgeBetween(src, dst, i, n, PORT_SPREAD), midX: c.midX, kind, label: c.label, selected: selected.value === c.id })
    }
  }
  return list
})
function onEdgeSelect(id: string) {
  const c = chains.find((x) => id === x.id || id.startsWith(x.id + '-'))
  if (c) selected.value = c.pill ?? c.id
}

/* ---------- Inspecteur ---------- */
const inspTab = ref('infos')
watch(selected, () => (inspTab.value = 'infos'))
const apogeeTabs: TabItem[] = [
  { value: 'infos', label: 'Infos' },
  { value: 'relations', label: 'Relations', count: 14 },
  { value: 'cartes', label: 'Cartes', count: 4 },
]
const inspected = computed<InspectedObject | undefined>(() => {
  const s = selected.value
  if (!s) return undefined
  if (N[s]) return { name: s, type: N[s].type, layer: 'applicatif' as Layer, icon: N[s].icon, description: N[s].description }
  const f = fluxOf(s)
  if (f) return { name: f.name, type: 'Flux', layer: 'applicatif', icon: 'flow', description: `Données échangées : ${f.data}.` }
  if (s === 'Scolarité' || rightDomains.some((d) => d.name === s))
    return { name: s, type: 'Domaine', layer: 'fonctionnel', icon: 'folder', description: s === 'Scolarité' ? 'Vie de l’étudiant, de l’inscription au diplôme.' : undefined }
  return undefined
})
const apogee = getApplication('APOGEE')!
const apogeeInfos: KeyValueItem[] = [
  { key: 'Statut', value: apogee.statut },
  { key: 'Sécurité', value: 'DICP' },
  { key: 'Utilisateurs', value: apogee.utilisateurs ? `${apogee.utilisateurs} · ${apogee.publics}` : null },
  { key: 'Mise en service', value: apogee.miseEnService },
  { key: 'Fin de service', value: apogee.finDeService },
  { key: 'Éditeur', value: apogee.editeur, href: pathHref('/fournisseurs') },
]
const REF_LAYER = { Métier: 'metier', Technique: 'technique', Fonctionnel: 'fonctionnel' } as const
const CONTRACT_STATUS = { expire: 'critical', moins6: 'warn', de6a12: 'warn', plus1an: 'ok', inconnue: 'unknown' } as const
const apogeeReferents: RelationGroup[] = [
  { verb: 'Référents', items: apogee.referents.map((r) => ({ name: r.name, layer: REF_LAYER[r.role], icon: 'user', meta: r.role })) },
  {
    verb: 'Fournie par',
    items: [
      ...(apogee.fournisseur ? [{ name: apogee.fournisseur, layer: 'applicatif' as Layer, icon: 'building' as IconName, meta: 'Fournisseur' }] : []),
      ...apogee.contrats.map((c) => ({
        id: c.ref,
        name: `${c.ref} · ${c.supplier}`,
        layer: 'applicatif' as Layer,
        icon: 'contract' as IconName,
        status: CONTRACT_STATUS[c.level],
        statusLabel: c.level === 'expire' ? `Expiré le ${c.end}` : c.level === 'plus1an' ? '> 1 an' : `Expire le ${c.end}`,
      })),
    ],
  },
]
const apogeeRelations: RelationGroup[] = [
  {
    verb: 'Hébergée sur',
    items: [
      { name: 'sophocle', layer: 'technique', icon: 'cloud', status: 'critical', statusLabel: 'Voir l’impact', meta: 'VM' },
      { name: 'Tomcat 5', layer: 'technique', icon: 'software', status: 'critical', statusLabel: 'Plus supporté' },
    ],
  },
  { verb: 'Appartient à', items: [{ name: 'Scolarité', layer: 'fonctionnel', icon: 'folder' }] },
  {
    verb: 'Échange avec',
    items: ['CNOUS', 'OpenLDAP', 'TROMBINOSCOPE', 'C2I', 'NOTES', 'CALCIUM'].map((n) => ({ name: n, layer: 'applicatif' as Layer, icon: N[n].icon })),
  },
]
const neighbourGroups = computed<RelationGroup[]>(() => {
  const s = selected.value
  if (!s || !N[s]) return []
  const out: RelationItem[] = []
  const inn: RelationItem[] = []
  for (const c of chains) {
    if (c.from === s) out.push({ name: c.to, layer: 'applicatif', icon: N[c.to].icon, meta: c.pill ? pills.find((p) => p.id === c.pill)?.label : undefined })
    if (c.to === s) inn.push({ name: c.from, layer: 'applicatif', icon: N[c.from].icon })
  }
  const g: RelationGroup[] = [{ verb: 'Appartient à', items: [{ name: N[s].domain, layer: 'fonctionnel', icon: 'folder' }] }]
  if (out.length) g.push({ verb: 'Envoie vers', items: out })
  if (inn.length) g.push({ verb: 'Reçoit de', items: inn })
  return g
})
const shortInfos = computed<KeyValueItem[]>(() => {
  const s = selected.value
  if (!s || !N[s]) return []
  const v = LENS_DATA.obsolescence.values[s]
  return [
    { key: 'Statut', value: LENS_DATA.statut.values[s]?.[1] ?? null },
    { key: 'Domaine', value: N[s].domain },
    { key: 'Obsolescence', value: v && v[0] !== 'unknown' ? v[1] : null },
  ]
})
const headerChip = computed(() => {
  const s = selected.value
  if (!s || !N[s]) return undefined
  if (s === 'APOGEE') return { status: 'critical' as Status, label: lensOn.value ? (lensValue(s)?.[1] ?? 'Infra obsolète') : 'Infra obsolète' }
  const v = lensValue(s)
  return v ? { status: v[0], label: v[1] } : undefined
})
/** Rôle d'un référent (« Métier ») → onglet de l'écran Référents (« metier »). */
const REF_TYPE = Object.fromEntries(Object.entries(TYPES_REFERENT).map(([k, v]) => [v.role, k])) as Record<string, TypeReferent>
function openRelation(item: RelationItem) {
  if (item.name === 'sophocle') return goPath('/impact')
  if (item.icon === 'software') return goPath(`/logiciels?id=${logicielId(item.name)}`)
  if (item.icon === 'server' || item.icon === 'cloud') return goPath(`/machines?id=${encodeURIComponent(item.name)}`)
  if (item.icon === 'contract') return goPath(`/contrats?ref=${encodeURIComponent(String(item.id ?? item.name.split(' ')[0]))}`)
  if (item.icon === 'building' && item.name !== 'CNOUS') return goPath('/fournisseurs')
  if (item.icon === 'user') return goPath(`/referents?type=${REF_TYPE[item.meta ?? ''] ?? 'metier'}`)
  if (N[item.name]) selected.value = item.name
  else if (item.name === 'Scolarité' || rightDomains.some((d) => d.name === item.name)) selected.value = item.name
  else if (item.icon === 'folder') goPath(`/explorateur?domaine=${encodeURIComponent(item.name)}`)
}

/* ---------- Fiche d'une application ---------- */
const isApp = (id: string | null) => !!id && N[id]?.kind === 'app'
const OTHER_MAPS: { label: string; path: string; icon: IconName }[] = [
  { label: 'Infrastructure', path: '/infrastructure', icon: 'server' },
  { label: 'Impact d’un arrêt', path: '/impact', icon: 'impact' },
  { label: 'Place dans le POS', path: '/pos', icon: 'pos' },
]
function openFiche(id: string) {
  if (isApp(id)) goFiche(id)
}

/** Modifier l'objet sélectionné : une application s'ouvre dans le formulaire de l'explorateur, un domaine dans sa liste,
 *  un flux dans sa fenêtre de modification ; le partenaire se modifie dans l'éditeur de la carte. */
function editSelected() {
  const s = selected.value
  if (!s) return
  const f = fluxOf(s)
  if (f) return openFluxEdit(f)
  if (isDomain(s)) return goPath(`/explorateur?domaine=${encodeURIComponent(s)}`)
  const a = getApplication(s)
  if (a?.inventaire) goPath(`/explorateur?modifier=${a.slug}`)
  else if (a) goFiche(a.name)
  else goPath('/editeur')
}
const isDomain = (s: string) => s === 'Scolarité' || rightDomains.some((d) => d.name === s)
/** Double-clic sur l'en-tête d'un domaine : Scolarité est la carte ouverte ; les autres ouvrent la liste de leurs applications. */
function openDomain(name: string) {
  if (name === 'Scolarité') selected.value = 'Scolarité'
  else goPath(`/explorateur?domaine=${encodeURIComponent(name)}`)
}

/* ---------- Modifier un flux ---------- */
const LIAISONS = ['LDAP', 'Synchrone', 'Asynchrone', 'Web service', 'API REST', 'Fichier plat', 'Messagerie']
const FREQUENCES = ['temps réel', 'quotidienne', 'hebdomadaire', 'mensuelle', 'semestrielle', 'annuelle']
const liaisonOptions: McSelectOption[] = LIAISONS.map((l) => ({ value: l, label: l }))
const frequenceOptions: McSelectOption[] = FREQUENCES.map((f) => ({ value: f, label: f.charAt(0).toUpperCase() + f.slice(1) }))
const fluxModal = ref(false)
const fluxForm = reactive({ id: '', name: '', liaison: '' as string | number | null, frequence: '' as string | number | null, data: '' })
let fluxOriginal = ''
const splitLabel = (label: string) => {
  const [l, f] = label.split(' · ')
  return { liaison: l ?? '', frequence: f ?? '' }
}
function openFluxEdit(c: Chain) {
  const { liaison, frequence } = splitLabel(c.label)
  Object.assign(fluxForm, { id: c.id, name: c.name, liaison, frequence, data: c.data })
  fluxOriginal = JSON.stringify(fluxForm)
  fluxModal.value = true
}
const fluxDirty = computed(() => fluxModal.value && JSON.stringify(fluxForm) !== fluxOriginal)
function saveFlux() {
  const c = chains.find((x) => x.id === fluxForm.id)
  if (!c || !fluxForm.name.trim()) return
  c.name = fluxForm.name.trim()
  c.label = `${fluxForm.liaison} · ${fluxForm.frequence}`
  c.data = fluxForm.data.trim() || c.data
  const p = c.pill ? pills.find((x) => x.id === c.pill) : undefined
  if (p) Object.assign(p, { label: c.name, edge: c.label, data: c.data })
  fluxModal.value = false
  toast.success(`Flux « ${c.name} » modifié : ${c.label}`)
}
const fluxInfos = computed<KeyValueItem[]>(() => {
  const f = fluxOf(selected.value)
  if (!f) return []
  const { liaison, frequence } = splitLabel(f.label)
  return [
    { key: 'Liaison', value: liaison },
    { key: 'Fréquence', value: frequence },
    { key: 'Données', value: f.data },
  ]
})
const fluxGroups = computed<RelationGroup[]>(() => {
  const f = fluxOf(selected.value)
  if (!f) return []
  return [
    { verb: 'Source', items: [{ name: f.from, layer: 'applicatif', icon: N[f.from].icon }] },
    { verb: 'Cible', items: [{ name: f.to, layer: 'applicatif', icon: N[f.to].icon }] },
  ]
})

/* ---------- Menu contextuel ---------- */
const menu = ref({ open: false, x: 0, y: 0, target: '' })
const menuItems = computed<(ContextMenuItem | 'separator')[]>(() => {
  const isApogee = menu.value.target === 'APOGEE'
  return [
    { id: 'fiche', label: 'Ouvrir la fiche', icon: 'external', shortcut: 'Entrée', disabled: !isApp(menu.value.target) },
    { id: 'impact', label: 'Voir l’impact d’un arrêt', icon: 'impact', disabled: !isApogee },
    { id: 'isoler', label: 'Isoler ses flux', icon: 'flow' },
    'separator',
    { id: 'copier', label: 'Copier le lien', icon: 'link', shortcut: '⌘L' },
  ]
})
const root = ref<HTMLElement>()
function openMenu(e: MouseEvent, id: string) {
  e.preventDefault()
  selected.value = id
  const r = root.value!.getBoundingClientRect()
  menu.value = { open: true, x: Math.min(e.clientX - r.left, r.width - 276), y: Math.min(e.clientY - r.top, r.height - 220), target: id }
}
async function onMenu(item: ContextMenuItem) {
  const target = menu.value.target
  if (item.id === 'fiche') openFiche(target)
  else if (item.id === 'impact') goPath('/impact')
  else if (item.id === 'isoler') {
    // La sélection estompe tout ce qui n'échange pas avec l'objet : ses flux restent seuls en couleur.
    isolated.value = null
    selected.value = target
  } else if (item.id === 'copier') {
    const ok = await copyLink(isApp(target) ? `/fiche/${getApplication(target)?.slug ?? ''}` : undefined)
    if (ok) toast.success(`Lien de ${target} copié`)
    else toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
  }
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [
  { label: 'Accueil' },
  { label: 'Domaines', layer: 'fonctionnel' },
  { label: 'Scolarité', layer: 'fonctionnel' },
  { label: 'Applications et flux' },
]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
  else if (i === 1) goPath('/liens-domaines')
  else if (i === 2) selected.value = 'Scolarité'
}
const paletteOpen = ref(false)

/* ---------- Exporter et partager ---------- */
const shareOpen = ref(false)
const STATIC_NOTE = 'APOGEE dépend encore de Tomcat 5. Migration prévue ?'
/** Objets de la carte, la sélection en tête (l'export « Sélection seulement » la reprend). */
const exportItems = computed<ExportItem[]>(() => {
  const nodes = Object.keys(boxes.value).map((id) => ({ name: id, layer: (N[id].kind === 'partner' ? 'metier' : 'applicatif') as Layer }))
  const domains = ['Scolarité', ...rightDomains.map((d) => d.name)].map((name) => ({ name, layer: 'fonctionnel' as Layer }))
  const flux = visiblePills.value.map((p) => ({ name: p.label, layer: 'applicatif' as Layer }))
  const all = [...domains, ...nodes, ...flux]
  const s = selected.value
  const i = s ? all.findIndex((x) => x.name === s || x.name === fluxOf(s)?.name) : -1
  return i > 0 ? [all[i], ...all.slice(0, i), ...all.slice(i + 1)] : all
})
const exportSelection = computed(() => (selected.value && exportItems.value.some((x) => x.name === selected.value || x.name === fluxOf(selected.value)?.name) ? 1 : 0))

/* ---------- Post-its et commentaires ---------- */
const annotations = ref<InstanceType<typeof MapAnnotations>>()
function placeNote() {
  const c = viewCenter()
  annotations.value?.placeNote(c.x, c.y)
}
function placeComment() {
  const c = viewCenter()
  annotations.value?.placeComment(c.x + 40, c.y - 40)
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]
const view = ref('flux')
// Les autres vues de la carte ouvrent leur écran : la liste des applications du domaine, le POS.
watch(view, (v) => {
  if (v === 'flux') return
  goPath(v === 'pos' ? '/pos' : '/explorateur?domaine=Scolarit%C3%A9')
  setTimeout(() => (view.value = 'flux'), 0)
})
const views: TabItem[] = [
  { value: 'apps', label: 'Applications', icon: 'app' },
  { value: 'flux', label: 'Applications et flux', icon: 'flow' },
  { value: 'pos', label: 'POS', icon: 'layers' },
]

/* ---------- Zoom, déplacement, vue d'ensemble ---------- */
const CONTENT = { x: 0, y: 120, w: 1040, h: 700 }
const mapCollapsed = ref(false)
// Le contenu se cale en haut à gauche, sous les vues ; la vue d'ensemble occupe le coin bas gauche, laissé libre par la carte.
const { zoom, pan, tool, fit, viewport, vars, viewCenter, handlers } = useCanvasView(root, {
  content: () => CONTENT,
  rightPanel: () => (inspected.value || legend.value ? 352 : 0),
  top: 120,
  bottom: 110,
  left: 0,
  align: 'start',
})
// Sous 92 %, le domaine Scolarité passe dans le coin de la vue d'ensemble (1366 × 768…) : elle s'ouvre repliée.
onMounted(() => {
  if (zoom.value < 0.92) mapCollapsed.value = true
})
const minimapBlocks = computed<McMinimapBlock[]>(() => {
  const pct = (b: McBox) => ({
    x: ((b.x - CONTENT.x) / CONTENT.w) * 100,
    y: ((b.y - CONTENT.y) / CONTENT.h) * 100,
    w: (b.w / CONTENT.w) * 100,
    h: (b.h / CONTENT.h) * 100,
  })
  const list: McMinimapBlock[] = [{ layer: 'fonctionnel', ...pct({ x: 236, y: 150, w: 520, h: collapsed.value['Scolarité'] ? 42 : 640 }) }]
  for (const d of rightLayout.value) list.push({ layer: 'fonctionnel', ...pct({ x: RIGHT_X, y: d.top, w: RIGHT_W, h: d.h }) })
  for (const b of Object.values(boxes.value)) list.push({ layer: 'applicatif', ...pct(b) })
  return list
})
const objectCount = computed(() => Object.keys(boxes.value).length + visiblePills.value.length + 5)

/* ---------- Divers ---------- */
const pos = (b: McBox) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px' })
const nodeIds = computed(() => Object.keys(boxes.value).filter((id) => fixedBoxes[id]))
function select(id: string) {
  selected.value = id
}
</script>

<template>
  <div
    ref="root"
    class="mc-scr-carte mc-scr-map"
    :class="{ 'is-hand': tool === 'hand' }"
    :style="vars"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Carte Applications et flux du domaine Scolarité" @deselect="selected = null" @fit="fit">
      <!-- Domaine principal : ses objets sont posés sur le canevas, le conteneur garde la place. -->
      <McContainer
        v-model:collapsed="collapsed['Scolarité']"
        name="Scolarité"
        type="Domaine"
        layer="fonctionnel"
        icon="folder"
        :count="scolariteCount"
        :count-label="`${scolariteCount} applications`"
        :selected="selected === 'Scolarité'"
        style="left: 236px; top: 150px; width: 520px"
        @select="select('Scolarité')"
        @open="openDomain('Scolarité')"
      >
        <div class="mc-scr-spacer" style="height: 586px" @click.self="selected = null" />
      </McContainer>

      <McContainer
        v-for="d in rightLayout"
        :key="d.name"
        v-model:collapsed="collapsed[d.name]"
        :name="d.name"
        type="Domaine"
        layer="fonctionnel"
        icon="folder"
        :count="d.count"
        :count-label="`${d.count} applications`"
        :selected="selected === d.name"
        :dimmed="isNodeSelection && !d.children.some((c) => related.has(c))"
        :style="{ left: RIGHT_X + 'px', top: d.top + 'px', width: RIGHT_W + 'px' }"
        @select="select(d.name)"
        @open="openDomain(d.name)"
      >
        <McNode
          v-for="c in d.children"
          :key="c"
          layer="applicatif"
          :icon="N[c].icon"
          :type="N[c].type"
          :name="c"
          :subtitle="subOf(c)"
          :status="statusOf(c)"
          :lens="lensOn"
          :selected="selected === c"
          :dimmed="dimmedNode(c)"
          :style="{ width: RIGHT_NODE_W + 'px' }"
          @select="select(c)"
          @open="openFiche(c)"
          @contextmenu="openMenu($event, c)"
        />
      </McContainer>

      <!-- Les liens passent au-dessus du fond des domaines, sous les nœuds et les pilules. -->
      <McEdgeLayer :edges="edges" @select="onEdgeSelect" />

      <McFlowNode
        v-for="p in visiblePills"
        :key="p.id"
        class="mc-scr-abs"
        :style="pos(pillBox(p))"
        :label="p.label"
        :direction="p.direction"
        :width="W2"
        :selected="selected === p.id"
        :hover="isNodeSelection && selected !== p.id && related.has(p.id)"
        :dimmed="dimmedPill(p)"
        @select="select(p.id)"
      />

      <McNode
        v-for="id in nodeIds"
        :key="id"
        :style="pos(boxes[id])"
        layer="applicatif"
        :icon="N[id].icon"
        :type="N[id].type"
        :name="id"
        :subtitle="subOf(id)"
        :status="statusOf(id)"
        :lens="lensOn"
        :main="N[id].main"
        :selected="selected === id"
        :dimmed="dimmedNode(id)"
        @select="select(id)"
        @open="openFiche(id)"
        @contextmenu="openMenu($event, id)"
      />

      <McStickyNote
        text="APOGEE dépend encore de Tomcat 5. Migration prévue ?"
        pinned-to="APOGEE"
        :rotation="-1.5"
        :author="{ initials: 'WV', name: 'William', color: 4 }"
        date="07/07"
        class="mc-scr-abs"
        style="left: 28px; top: 470px"
      />
      <McPresenceCursor name="Samuel" :color="5" class="mc-scr-abs" style="left: 880px; top: 722px" />
      <MapAnnotations ref="annotations" screen="carte" :zoom="zoom" />

      <template #top>
        <div class="mc-scr-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home.prevent="goPath('/')" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" @click="shareOpen = true"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton variant="primary" icon="pencil" :href="pathHref('/editeur')" @click.prevent="goPath('/editeur')">Modifier</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-views">
            <McTabs v-model="view" :tabs="views" variant="pill" aria-label="Vues de la carte" />
          </div>
        </div>
      </template>

      <template #right>
        <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        <a v-if="legend && lens === 'dicp'" class="mc-float mc-scr-carte-more" :href="pathHref('/criticite')" @click.prevent="goPath('/criticite')">
          <McIcon name="shield" size="sm" />Voir toutes les applications par criticité<McIcon name="arrow-right" size="sm" />
        </a>
        <McInspector v-if="inspected" v-model:tab="inspTab" :object="inspected" :tabs="selected === 'APOGEE' ? apogeeTabs : []" @close="selected = null">
          <template v-if="headerChip" #statuses>
            <McStatusChip :status="headerChip.status" size="sm">{{ headerChip.label }}</McStatusChip>
          </template>
          <template #actions>
            <template v-if="selected === 'APOGEE'">
              <McButton size="sm" icon="external" @click="openFiche('APOGEE')">Ouvrir la fiche</McButton>
              <McButton size="sm" variant="outline" icon="impact" @click="goPath('/impact')">Voir l’impact</McButton>
              <button type="button" class="mc-ibtn sm" aria-label="Plus d’actions" @click="openMenu($event, 'APOGEE')"><McIcon name="more" size="sm" /></button>
            </template>
            <template v-else>
              <McButton v-if="isApp(selected)" size="sm" icon="external" @click="openFiche(selected!)">Ouvrir la fiche</McButton>
              <McButton size="sm" variant="outline" icon="pencil" @click="editSelected">Modifier</McButton>
              <button type="button" class="mc-ibtn sm" aria-label="Plus d’actions" @click="openMenu($event, selected!)"><McIcon name="more" size="sm" /></button>
            </template>
          </template>
          <template #default="{ tab }">
            <template v-if="selected === 'APOGEE'">
              <template v-if="tab === 'infos'">
                <McKeyValueList :items="apogeeInfos">
                  <template #value="{ item }">
                    <McStatusChip v-if="item.key === 'Statut'" size="sm">Active</McStatusChip>
                    <McDicpBadge v-else-if="item.key === 'Sécurité'" :d="2" :i="4" :c="3" :p="4" />
                    <a v-else-if="item.href" :href="item.href" class="mc-scr-link" @click.prevent="goPath('/fournisseurs')">{{ item.value }}</a>
                    <span v-else>{{ item.value }}</span>
                  </template>
                </McKeyValueList>
                <hr class="mc-hr" />
                <McRelationList :groups="apogeeReferents" @open="openRelation" />
              </template>
              <McRelationList v-else-if="tab === 'relations'" :groups="apogeeRelations" @open="openRelation" />
              <div v-else class="mc-scr-carte-maps">
                <p class="mc-scr-note">4 cartes montrent APOGEE.</p>
                <button type="button" class="mc-scr-carte-map is-on" aria-current="true" @click="fit"><McIcon name="flow" size="sm" />Applications et flux<span>Carte ouverte</span></button>
                <a v-for="m in OTHER_MAPS" :key="m.path" class="mc-scr-carte-map" :href="pathHref(m.path)" @click.prevent="goPath(m.path)"><McIcon :name="m.icon" size="sm" />{{ m.label }}<McIcon name="arrow-right" size="sm" /></a>
              </div>
            </template>
            <template v-else-if="N[selected!]">
              <McKeyValueList :items="shortInfos" />
              <McRelationList :groups="neighbourGroups" @open="openRelation" />
            </template>
            <template v-else-if="fluxOf(selected)">
              <McKeyValueList :items="fluxInfos" />
              <McRelationList :groups="fluxGroups" @open="openRelation" />
              <McButton size="sm" variant="ghost" icon="pencil" class="mc-scr-carte-fluxedit" @click="openFluxEdit(fluxOf(selected)!)">Modifier la liaison, la fréquence ou les données</McButton>
            </template>
            <template v-else>
              <p class="mc-scr-note">
                Domaine fonctionnel{{ selected === 'Scolarité' ? ' : c’est la carte ouverte.' : '. Double-cliquez sur son en-tête pour voir ses applications.' }}
              </p>
              <McButton size="sm" variant="outline" icon="app" @click="goPath(`/explorateur?domaine=${encodeURIComponent(selected!)}`)">Voir les applications de {{ selected }}</McButton>
            </template>
          </template>
        </McInspector>
      </template>

      <template #bottom-left>
        <McMinimap v-model:viewport="viewport" v-model:collapsed="mapCollapsed" :blocks="minimapBlocks" :count="objectCount" :zoom="zoom" />
      </template>

      <template #bottom>
        <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit" @filter="legend = true" @sticky="placeNote" @comment="placeComment">
          <template #lens><McLensPicker v-model:lens="lens" @change="(l) => (legend = l.id !== NO_LENS)" /></template>
        </McToolbar>
      </template>
    </McCanvas>

    <MapShareDialog v-model:open="shareOpen" title="Applications et flux de Scolarité" :items="exportItems" :selection-count="exportSelection" :notes="[STATIC_NOTE, ...noteTexts('carte')]" />
    <McModal
      v-model:open="fluxModal"
      :title="`Modifier le flux ${fluxForm.name}`"
      :type="{ label: 'Flux', icon: 'flow', layer: 'applicatif' }"
      :subtitle="fluxOf(fluxForm.id) ? `${fluxOf(fluxForm.id)!.from} → ${fluxOf(fluxForm.id)!.to}` : undefined"
      :dirty="fluxDirty"
      :confirm-disabled="!fluxForm.name.trim() || !fluxForm.liaison || !fluxForm.frequence"
      @confirm="saveFlux"
    >
      <div class="mc-scr-carte-form">
        <McTextField v-model="fluxForm.name" label="Libellé" required placeholder="ex. Flux d’authentification" />
        <div class="mc-grid2">
          <McSelect v-model="fluxForm.liaison" label="Liaison" required :options="liaisonOptions" />
          <McSelect v-model="fluxForm.frequence" label="Fréquence" required :options="frequenceOptions" />
        </div>
        <McTextField v-model="fluxForm.data" label="Données échangées" placeholder="ex. Comptes étudiants" />
      </div>
    </McModal>
    <McContextMenu v-model:open="menu.open" :items="menuItems" :header="menu.target" :x="menu.x" :y="menu.y" @select="onMenu" />
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-carte { position: relative; width: 100%; height: 100vh; min-height: 640px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-carte.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-carte .mc-canvas-layer > .mc-scr-abs { position: absolute; margin: 0; }
.mc-scr-carte .mc-canvas-layer > .mc-flow.mc-scr-abs { z-index: 1; }
.mc-scr-carte .mc-canvas-layer > .mc-node { z-index: 1; }
.mc-scr-carte .mc-canvas-layer > .mc-sticky, .mc-scr-carte .mc-canvas-layer > .mc-cursor { z-index: 2; }
/* La barre du haut : l'AppBar, puis les vues en pilules sous elle, sans bloquer le canevas autour. */
.mc-scr-top { display: flex; flex-direction: column; gap: 16px; pointer-events: none; }
.mc-scr-top > * { pointer-events: auto; }
.mc-scr-views { align-self: flex-start; }
.mc-scr-spacer { width: 100%; }
/* L'inspecteur prend toute la hauteur disponible ; la légende, sa taille. */
.mc-scr-carte .mc-canvas-right { align-items: stretch; }
.mc-scr-carte .mc-canvas-right > .mc-legend { flex: none; align-self: flex-end; }
.mc-scr-carte .mc-canvas-right > .mc-insp { flex: 1 1 auto; min-height: 0; overflow: hidden; }
.mc-scr-link { color: var(--accent); }
.mc-scr-note { margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 18px; }
.mc-scr-carte-more { flex: none; align-self: flex-end; display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 13px; line-height: 16px; font-weight: 600; color: var(--accent); text-decoration: none; }
.mc-scr-carte-more:hover { text-decoration: underline; }
.mc-scr-carte-maps { display: grid; gap: 4px; }
.mc-scr-carte-maps .mc-scr-note { margin-bottom: 4px; }
.mc-scr-carte-map { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 8px; height: 34px; padding: 0 8px; border-radius: var(--radius-sm); font-size: 13px; color: var(--ink); cursor: pointer; }
.mc-scr-carte-map:hover { background: var(--surface-sunken); }
.mc-scr-carte-map:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mc-scr-carte-map > .mc-ico:first-child { color: var(--ink-muted); }
.mc-scr-carte-map > .mc-ico:last-child, .mc-scr-carte-map > span { margin-left: auto; color: var(--ink-subtle); font-size: 12px; }
.mc-scr-carte-map.is-on { background: var(--accent-soft); }
.mc-scr-carte-fluxedit { justify-self: start; }
.mc-scr-carte-form { display: grid; gap: 16px; }
</style>
