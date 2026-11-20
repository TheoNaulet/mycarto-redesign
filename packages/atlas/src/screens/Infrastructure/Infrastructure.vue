<script setup lang="ts">
// Écran « Machines nécessaires à APOGEE » : les composants de l'application, par environnement,
// et les machines qui les hébergent. Lentille Obsolescence allumée d'entrée.
import { computed, reactive, ref, watch } from 'vue'
import type { IconName } from '../../icons/icons'
import type { Status } from '../../utils/types'
import McPanelTransition from '../../components/McPanelTransition/McPanelTransition.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McEdgeLayer from '../../components/McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeSpec } from '../../components/McEdge/edge'
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
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import McToastHost from '../../components/McToast/McToastHost.vue'
import AppEditModal from '../shared/AppEditModal.vue'
import { useToast } from '../../components/McToast/useToast'
import SearchPalette from '../Accueil/SearchPalette.vue'
import McModal from '../../components/McModal/McModal.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import MapAnnotations from './MapAnnotations.vue'
import MapShareDialog from './MapShareDialog.vue'
import type { ExportItem } from '../shared/SharePanel.vue'
import { OBSOLESCENCE, echeanceOf, frDate, getLogiciel, logiciels } from '../../data/logiciels'
import { noteTexts } from '../../data/annotations'
import { machines as parcMachines, machineObsolescence, osOf } from '../../data/infrastructure'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import MapEditBar from '../shared/MapEditBar.vue'
import { useMapEdit } from '../shared/mapEdit'

const toast = useToast()
const paletteOpen = ref(false)
const appEdit = ref<InstanceType<typeof AppEditModal>>()
/** Modifier l'objet sélectionné : APOGEE dans sa fenêtre de modification, ici même ; une machine dans l'écran Machines,
 *  un composant ou un environnement dans sa fenêtre de modification (la carte suit). */
function editSelected() {
  const s = selected.value
  if (!s) return
  if (s === 'APOGEE') return void appEdit.value?.openApp('APOGEE')
  if (s === 'PROD' || s === 'DEV') return openEnvEdit(s)
  const n = byId.value[s]
  if (n?.kind === 'machine') goPath(machinePath(n.id))
  else if (n) openCompEdit(n)
}
const machinePath = (name: string) => `/machines?id=${encodeURIComponent(name)}`
/** Lien vers le logiciel dans l'écran Logiciels, s'il y est référencé. */
const logicielPath = (name: string) => {
  const l = getLogiciel(name)
  return l ? `/logiciels?id=${l.id}` : undefined
}
import { isNarrowWindow, useCanvasView } from './canvasView'

/* ---------- Géométrie ----------
 * APOGEE (150, 150), 580 de large. Ses environnements sont ses enfants : le premier commence à
 * (163, 191). Dans un environnement, les nœuds sont posés sur le canevas : deux colonnes, un pas de 80.
 * Les machines sont alignées sur les couloirs entre deux rangées : les liens d'hébergement y passent sans rien couvrir. */
const NODE_H = 48
const COL = [184, 460]
const NODE_W = 230
const ROW_Y = [250, 330, 410, 490, 570]
const DEV_Y = 716
const MACHINE_X = 800
const MACHINE_W = 230
const LEFT_MID = 437

type Env = 'PROD' | 'DEV'
type Kind = 'composant' | 'machine'
interface InfraNode {
  id: string
  kind: Kind
  type: string
  icon: IconName
  /** Logiciel (composant) ou système (machine). */
  software: string
  status: Status
  /** Raison de l'état, dite sous le nom quand la lentille est allumée. */
  reason: string
  box: McBox
  env?: Env
  host?: string
  description: string
}

const comp = (id: string, col: number, row: number, software: string, status: Status, reason: string, host: string, description: string): InfraNode => ({
  id,
  kind: 'composant',
  type: 'Composant',
  icon: 'chip',
  software,
  status,
  reason,
  box: { x: COL[col], y: ROW_Y[row], w: NODE_W, h: NODE_H },
  env: 'PROD',
  host,
  description,
})
const machine = (id: string, type: string, icon: IconName, cy: number, software: string, status: Status, reason: string, description: string): InfraNode => ({
  id,
  kind: 'machine',
  type,
  icon,
  software,
  status,
  reason,
  box: { x: MACHINE_X, y: cy - NODE_H / 2, w: MACHINE_W, h: NODE_H },
  description,
})

const NODES = reactive<InfraNode[]>([
  comp('Oracle Forms', 0, 0, 'Oracle 11R2', 'ok', 'Oracle 11R2', 'franklin', 'Écrans de gestion de la scolarité centrale.'),
  comp('Oracle Reports', 1, 0, 'Oracle 11R2', 'ok', 'Oracle 11R2', 'franklin', 'Éditions : relevés de notes, attestations, listes.'),
  comp('Serveur Web Forms', 0, 1, 'Tomcat 5', 'critical', 'Tomcat 5 · plus supporté', 'sophocle', 'Sert les écrans Forms aux navigateurs des gestionnaires.'),
  comp('Services Web Apogee', 1, 1, 'WebObjects 5.3', 'warn', 'WebObjects 5.3 · fin 31/03/2027', 'franklin', 'Services web consommés par les applications voisines.'),
  comp('WS_APOGEE', 0, 2, 'Apache 2.6', 'warn', 'Apache 2.6 · fin 11/09/2024', 'sophocle', 'Frontal des services web exposés aux partenaires.'),
  comp('APOGEE_PROD', 1, 2, 'Oracle 11R2', 'ok', 'Oracle 11R2', 'pythagore', 'Base de données de production.'),
  comp('Serveur APP Apogee', 0, 3, 'Version non renseignée', 'unknown', 'Version non renseignée', 'pythagore', 'Serveur d’application des traitements métier.'),
  comp('API Étudiant APOGEE', 1, 3, 'Apache 2.6', 'warn', 'Apache 2.6 · fin 11/09/2024', 'sophocle', 'API des données étudiantes pour le portail et les applications mobiles.'),
  comp('Batchs nocturnes', 0, 4, 'Oracle 11R2', 'ok', 'Oracle 11R2', 'pythagore', 'Traitements de nuit : synchronisations, calculs des résultats.'),
  { ...comp('APOGEE_DEV', 0, 0, 'Oracle 11R2', 'ok', 'Oracle 11R2', 'cupidon', 'Base de développement et de recette.'), env: 'DEV', box: { x: COL[0], y: DEV_Y, w: NODE_W, h: NODE_H } },
  machine('franklin', 'VM', 'cloud', 307, 'Debian 12', 'ok', 'Debian 12 · supporté', 'Machine virtuelle du cluster philosophe.'),
  machine('sophocle', 'Machine', 'server', 387, 'Red Hat 5', 'critical', 'Plus supporté : Tomcat 5', 'Serveur physique de la salle machine B, baie 3.'),
  machine('pythagore', 'VM', 'cloud', 547, 'Ubuntu 22.04', 'warn', 'Ubuntu 22.04 · fin 30/04/2027', 'Machine virtuelle du cluster philosophe.'),
  machine('cupidon', 'VM', 'cloud', DEV_Y + NODE_H / 2, 'Debian 12', 'ok', 'Debian 12 · supporté', 'Machine virtuelle de développement.'),
])
// Dérivés de NODES : ils suivent les ajouts et retraits du mode modification.
const byId = computed(() => Object.fromEntries(NODES.map((n) => [n.id, n])) as Record<string, InfraNode>)
const components = computed(() => NODES.filter((n) => n.kind === 'composant'))
const machines = computed(() => NODES.filter((n) => n.kind === 'machine'))
const hostedBy = (m: string) => components.value.filter((c) => c.host === m)
const machineSub = (m: InfraNode) => `${m.software} · héberge ${hostedBy(m.id).length} composant${hostedBy(m.id).length > 1 ? 's' : ''}`

/** Coude des liens de la colonne de droite : un par lien, pour qu'aucun segment vertical n'en recouvre un autre. */
const RIGHT_MID: Record<string, number> = { 'Oracle Reports': 750, 'Services Web Apogee': 762, 'API Étudiant APOGEE': 750, APOGEE_PROD: 774 }

/** Noms des environnements, modifiables. */
const envNames = reactive<Record<Env, string>>({ PROD: 'Production', DEV: 'Développement' })
const envCount = (e: Env) => components.value.filter((c) => c.env === e).length

/* ---------- Sélection ---------- */
const selected = ref<string | null>('sophocle')
const related = computed(() => {
  const s = selected.value
  const set = new Set<string>()
  if (!s || !byId.value[s]) return set
  set.add(s)
  const n = byId.value[s]
  if (n.host) set.add(n.host)
  if (n.kind === 'machine') hostedBy(s).forEach((c) => set.add(c.id))
  return set
})
const nodeSelected = computed(() => !!selected.value && !!byId.value[selected.value])

/* ---------- Lentille ---------- */
const LENSES = MC_LENSES.filter((l) => l.id === NO_LENS || l.id === 'obsolescence')
const lens = ref('obsolescence')
const lensOn = computed(() => lens.value !== NO_LENS)
// Écran étroit : la légende attend dans la barre d'outils, l'inspecteur garde la hauteur.
const legend = ref(!isNarrowWindow())
const isolated = ref<string | null>(null)
watch(lens, (l) => {
  isolated.value = null
  legend.value = l !== NO_LENS
})
const LEVELS: Record<Status, string> = {
  critical: 'Plus supporté',
  warn: 'Fin de support dépassée ou < 12 mois',
  ok: 'Supporté',
  unknown: 'Version non renseignée',
}
const legendSections = computed<McLegendSection[]>(() => {
  const sections: McLegendSection[] = []
  if (lensOn.value) {
    sections.push({
      title: 'Obsolescence',
      items: (['critical', 'warn', 'ok', 'unknown'] as Status[]).map((s) => ({ id: s, label: LEVELS[s], status: s, count: NODES.filter((n) => n.status === s).length })),
    })
  }
  sections.push({
    title: 'Types',
    items: [
      { id: 'type-composant', label: 'Composant', count: components.value.length, layer: 'technique' },
      { id: 'type-machine', label: 'Machine et VM', count: machines.value.length, layer: 'technique' },
    ],
  })
  return sections
})
function dimmed(n: InfraNode) {
  if (nodeSelected.value && !related.value.has(n.id)) return true
  const iso = isolated.value
  if (!iso) return false
  if (iso.startsWith('type-')) return iso !== `type-${n.kind}`
  return n.status !== iso
}
const subOf = (n: InfraNode) => (lensOn.value ? n.reason : n.kind === 'machine' ? machineSub(n) : n.software)

/* ---------- Liens d'hébergement ---------- */
const edges = computed<McEdgeSpec[]>(() =>
  components.value.flatMap((c) => {
    const m = c.host ? byId.value[c.host] : undefined
    if (!m) return []
    const midX = c.box.x === COL[0] ? LEFT_MID : (RIGHT_MID[c.id] ?? 762)
    const on = nodeSelected.value && related.value.has(c.id) && related.value.has(m.id)
    return [{ id: `h-${c.id}`, ...edgeBetween(c.box, m.box), midX, kind: 'host' as const, selected: on }]
  }),
)
function onEdgeSelect(id: string) {
  const c = byId.value[id.replace(/^h-/, '')]
  if (c?.host) selected.value = c.host
}

/* ---------- Inspecteur ---------- */
const inspected = computed<InspectedObject | undefined>(() => {
  const n = selected.value ? byId.value[selected.value] : undefined
  if (n) return { name: n.id, type: n.type === 'Machine' ? 'Machine physique' : n.type === 'VM' ? 'Machine virtuelle' : n.type, layer: 'technique', icon: n.icon, description: n.description }
  if (selected.value === 'APOGEE') return { name: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app', description: 'Gestion des étudiants et des enseignements.' }
  if (selected.value === 'PROD' || selected.value === 'DEV')
    return { name: envNames[selected.value], type: 'Environnement', layer: 'technique', icon: 'layers' }
  return undefined
})
const headerChip = computed(() => {
  const n = selected.value ? byId.value[selected.value] : undefined
  if (!n) return undefined
  if (n.id === 'sophocle') return { status: 'critical' as Status, label: 'Plus supporté : Tomcat 5' }
  return { status: n.status, label: n.status === 'ok' ? 'Supporté' : n.reason }
})
const infos = computed<KeyValueItem[]>(() => {
  const n = selected.value ? byId.value[selected.value] : undefined
  if (!n) return []
  if (n.kind === 'machine')
    return [
      { key: 'Système', value: n.software },
      { key: 'Type', value: n.type === 'Machine' ? 'Serveur physique' : 'Machine virtuelle' },
      { key: 'Composants hébergés', value: hostedBy(n.id).length },
      { key: 'Obsolescence', value: n.status === 'unknown' ? null : n.reason },
    ]
  return [
    { key: 'Logiciel', value: n.status === 'unknown' ? null : n.software },
    { key: 'Machine', value: n.host ?? null },
    { key: 'Environnement', value: envNames[n.env ?? 'PROD'] },
    { key: 'Application', value: 'APOGEE' },
    { key: 'Obsolescence', value: n.status === 'unknown' ? null : n.reason },
  ]
})
const rel = (n: InfraNode, withStatus = true): RelationItem => ({
  name: n.id,
  layer: 'technique',
  icon: n.icon,
  // Un état à signaler remplace le fait gris : la ligne reste courte.
  ...(withStatus && n.status !== 'ok'
    ? { status: n.status, statusLabel: n.status === 'unknown' ? 'Non renseigné' : n.software }
    : { meta: n.kind === 'machine' ? n.type : n.software }),
})
const relations = computed<RelationGroup[]>(() => {
  const n = selected.value ? byId.value[selected.value] : undefined
  if (!n) return []
  if (n.kind === 'machine') return [{ verb: 'Héberge', items: hostedBy(n.id).map((c) => rel(c)) }]
  return [
    { verb: 'Hébergé sur', items: n.host && byId.value[n.host] ? [rel(byId.value[n.host])] : [] },
    { verb: 'Composant de', items: [{ name: 'APOGEE', layer: 'applicatif', icon: 'app' }] },
  ]
})
const plural = (n: number, one: string) => `${n} ${one}${n > 1 ? 's' : ''}`
const apogeeRelations = computed<RelationGroup[]>(() => [
  {
    verb: 'Environnements',
    items: (['PROD', 'DEV'] as Env[]).map((e) => ({ id: e, name: envNames[e], layer: 'technique' as const, icon: 'layers' as IconName, meta: plural(envCount(e), 'composant') })),
  },
  { verb: 'Hébergée sur', items: machines.value.map((m) => rel(m)) },
])
/** Composants d'un environnement sélectionné. */
const envRelations = computed<RelationGroup[]>(() => {
  const e = selected.value === 'PROD' || selected.value === 'DEV' ? (selected.value as Env) : null
  if (!e) return []
  return [{ verb: 'Composants', items: components.value.filter((c) => c.env === e).map((c) => rel(c)) }]
})
function openRelation(item: RelationItem) {
  if (byId.value[item.name]) selected.value = item.name
  else if (item.name === 'APOGEE') selected.value = 'APOGEE'
  else if (item.id === 'PROD' || item.id === 'DEV') selected.value = item.id
}

/* ---------- Modifier un composant ---------- */
const logicielOptions: McSelectOption[] = [...logiciels]
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((l) => ({ value: l.name, label: l.name, status: OBSOLESCENCE[l.obsolescence].status }))
// Les machines de la carte d'abord, puis le reste du parc (choisie, elle s'ajoute à la carte).
const machineOptions = computed<McSelectOption[]>(() => [
  ...machines.value.map((m) => ({ value: m.id, label: `${m.id} · ${m.software}` })),
  ...parcMachines.filter((m) => !byId.value[m.name]).map((m) => ({ value: m.name, label: `${m.name} · ${osOf(m).name}` })),
])
const envOptions = computed<McSelectOption[]>(() => (['PROD', 'DEV'] as Env[]).map((e) => ({ value: e, label: envNames[e] })))
const compModal = ref(false)
const compForm = reactive({ id: '', software: null as string | number | null, host: null as string | number | null, env: 'PROD' as string | number | null, description: '' })
let compOriginal = ''
function openCompEdit(n: InfraNode) {
  Object.assign(compForm, { id: n.id, software: getLogiciel(n.software) ? getLogiciel(n.software)!.name : null, host: n.host ?? null, env: n.env ?? 'PROD', description: n.description })
  compOriginal = JSON.stringify(compForm)
  compModal.value = true
}
const compDirty = computed(() => compModal.value && JSON.stringify(compForm) !== compOriginal)
/** État d'obsolescence d'un logiciel, dit comme sur la carte : « Apache 2.6 · fin 11/09/2024 ». */
function obsolescenceOf(name: string): { status: Status; reason: string } {
  const l = getLogiciel(name)
  if (!l) return { status: 'unknown', reason: 'Version non renseignée' }
  const fin = echeanceOf(l)
  if (l.obsolescence === 'obsolete') return { status: 'critical', reason: `${l.name} · plus supporté` }
  if (l.obsolescence === 'bientot') return { status: 'warn', reason: `${l.name}${fin ? ` · fin ${frDate(fin)}` : ''}` }
  return { status: 'ok', reason: l.name }
}
function saveComp() {
  const n = byId.value[compForm.id]
  if (!n) return
  edit.record()
  const before = { software: n.software, status: n.status, reason: n.reason, host: n.host, env: n.env, description: n.description, box: { ...n.box } }
  const software = compForm.software ? String(compForm.software) : 'Version non renseignée'
  const { status, reason } = obsolescenceOf(software)
  Object.assign(n, { software, status, reason, host: String(compForm.host ?? n.host), description: compForm.description.trim() || n.description })
  const env = (compForm.env ?? 'PROD') as Env
  if (env !== n.env) {
    // Le composant passe dans l'autre environnement : il prend sa première place libre.
    const slot = freeSlot(env)
    if (!slot) return toast.info(`Plus de place libre en ${envNames[env]}`)
    n.env = env
    n.box = { ...n.box, ...slot }
  }
  ensureHostOnMap(n.host)
  compModal.value = false
  toast.success(`Composant ${n.id} modifié${status !== before.status ? ` : ${LEVELS[status].toLowerCase()}` : ''}`, {
    actionLabel: 'Annuler',
    onAction: () => Object.assign(n, before),
  })
}

/* ---------- Renommer un environnement ---------- */
const envModal = ref(false)
const envForm = reactive({ id: 'PROD' as Env, name: '' })
function openEnvEdit(e: Env) {
  Object.assign(envForm, { id: e, name: envNames[e] })
  envModal.value = true
}
function saveEnv() {
  const name = envForm.name.trim()
  if (!name) return
  edit.record()
  envNames[envForm.id] = name
  envModal.value = false
  toast.success(`Environnement renommé : ${name}`)
}

/* ---------- Mode modification ----------
 * « Modifier » rend cette carte modifiable sur place : ajouter un composant ou une machine du parc,
 * retirer un objet (×). Chaque pas s'annule ; Abandonner revient à l'état d'entrée. */
const edit = useMapEdit({
  name: 'Machines nécessaires à APOGEE',
  get: () => ({ nodes: NODES, envNames }),
  set: (v: { nodes: InfraNode[]; envNames: Record<Env, string> }) => {
    NODES.splice(0, NODES.length, ...v.nodes)
    Object.assign(envNames, v.envNames)
    if (selected.value && !byId.value[selected.value] && !['APOGEE', 'PROD', 'DEV'].includes(selected.value)) selected.value = null
  },
})
/** Production : deux colonnes, cinq rangées. Développement : deux colonnes, qui s'allonge vers le bas. */
function freeSlot(env: Env): { x: number; y: number } | null {
  const taken = new Set(components.value.filter((c) => c.env === env).map((c) => `${c.box.x}:${c.box.y}`))
  const rows = env === 'PROD' ? ROW_Y : Array.from({ length: 20 }, (_, k) => DEV_Y + k * 80)
  for (const y of rows) for (const x of COL) if (!taken.has(`${x}:${y}`)) return { x, y }
  return null
}
/** Rangées de l'environnement de développement (pour la hauteur de son cadre). */
const devRows = computed(() => Math.max(1, ...components.value.filter((c) => c.env === 'DEV').map((c) => Math.round((c.box.y - DEV_Y) / 80) + 1)))
/** Machine du parc posée sous les autres, si elle n'est pas déjà sur la carte. */
function ensureHostOnMap(name?: string) {
  if (!name || byId.value[name]) return
  const x = parcMachines.find((m) => m.name === name)
  if (!x) return
  const os = osOf(x)
  const o = machineObsolescence(x)
  const cy = Math.max(...machines.value.map((m) => m.box.y + NODE_H / 2), ROW_Y[0]) + 80
  NODES.push(machine(x.name, x.kind, x.kind === 'Machine' ? 'server' : 'cloud', cy, os.name, o.status, o.status === 'ok' ? `${os.name} · supporté` : o.reason, x.description))
}
const parcOptions = computed<McSelectOption[]>(() => parcMachines.map((m) => ({ value: m.name, label: `${m.name} · ${osOf(m).name}` })))

const addCompOpen = ref(false)
const addComp = reactive({ name: '', software: null as string | number | null, env: 'PROD' as string | number | null, host: null as string | number | null })
function openAddComp() {
  Object.assign(addComp, { name: '', software: null, env: 'PROD', host: null })
  addCompOpen.value = true
}
const addCompError = computed(() => {
  const n = addComp.name.trim()
  if (!n) return 'Donnez un nom au composant.'
  if (byId.value[n] || n === 'APOGEE') return 'Un objet de la carte porte déjà ce nom.'
  if (!addComp.host) return 'Choisissez la machine qui l’héberge.'
  if (!freeSlot((addComp.env ?? 'PROD') as Env)) return 'Plus de place libre dans cet environnement.'
  return ''
})
function saveAddComp() {
  if (addCompError.value) return
  const env = (addComp.env ?? 'PROD') as Env
  const slot = freeSlot(env)!
  const software = addComp.software ? String(addComp.software) : 'Version non renseignée'
  const { status, reason } = obsolescenceOf(software)
  edit.record()
  const host = String(addComp.host)
  ensureHostOnMap(host)
  NODES.push({ ...comp(addComp.name.trim(), 0, 0, software, status, reason, host, ''), env, box: { x: slot.x, y: slot.y, w: NODE_W, h: NODE_H } })
  addCompOpen.value = false
  selected.value = addComp.name.trim()
  toast.success(`Composant ${addComp.name.trim()} ajouté en ${envNames[env]}`, { actionLabel: 'Annuler', onAction: edit.undo })
}

const addMachOpen = ref(false)
const addMach = reactive({ machine: null as string | number | null, comp: null as string | number | null })
const parcFree = computed<McSelectOption[]>(() => parcOptions.value.filter((o) => !byId.value[String(o.value)]))
const compOptions = computed<McSelectOption[]>(() => components.value.map((c) => ({ value: c.id, label: `${c.id} · ${envNames[c.env ?? 'PROD']}` })))
function openAddMach() {
  Object.assign(addMach, { machine: null, comp: null })
  addMachOpen.value = true
}
function saveAddMach() {
  if (!addMach.machine || !addMach.comp) return
  const c = byId.value[String(addMach.comp)]
  if (!c) return
  edit.record()
  ensureHostOnMap(String(addMach.machine))
  c.host = String(addMach.machine)
  addMachOpen.value = false
  selected.value = String(addMach.machine)
  toast.success(`${addMach.machine} ajoutée : elle héberge ${c.id}`, { actionLabel: 'Annuler', onAction: edit.undo })
}

/** Retirer un objet de la carte. Une machine qui héberge encore des composants reste : il faut d'abord les déplacer. */
function removeNode(n: InfraNode) {
  if (n.kind === 'machine' && hostedBy(n.id).length) {
    toast.info(`${n.id} héberge ${plural(hostedBy(n.id).length, 'composant')} : déplacez-les d’abord sur une autre machine.`)
    return
  }
  edit.record()
  NODES.splice(NODES.indexOf(n), 1)
  if (selected.value === n.id) selected.value = null
  toast.success(`${n.id} retiré de la carte`, { actionLabel: 'Annuler', onAction: edit.undo })
}

/* ---------- Exporter, post-its, commentaires ---------- */
const shareOpen = ref(false)
const exportItems = computed<ExportItem[]>(() => {
  const all: ExportItem[] = [{ name: 'APOGEE', layer: 'applicatif' }, ...NODES.map((n) => ({ name: n.id, layer: 'technique' as const }))]
  const i = selected.value ? all.findIndex((x) => x.name === selected.value) : -1
  return i > 0 ? [all[i], ...all.slice(0, i), ...all.slice(i + 1)] : all
})
const annotations = ref<InstanceType<typeof MapAnnotations>>()
function placeNote() {
  const c = viewCenter()
  annotations.value?.placeNote(c.x, c.y)
}
/** Le bouton Commentaire arme le mode placement : le prochain clic sur la carte pose l'épingle. */
function placeComment() {
  annotations.value?.armComment()
}
/** Double-clic : une machine s'ouvre dans l'écran Machines, un composant dans sa fenêtre de modification. */
function openNode(n: InfraNode) {
  if (n.kind === 'machine') goPath(machinePath(n.id))
  else openCompEdit(n)
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [
  { label: 'Accueil', href: pathHref('/') },
  { label: 'Scolarité', layer: 'fonctionnel', href: pathHref('/carte') },
  { label: 'APOGEE', layer: 'applicatif', href: ficheHref('APOGEE') },
  { label: 'Infrastructure' },
]
const TRAIL_PATHS = ['/', '/carte', '/fiche/apogee']
function onTrail(_s: TrailStep, i: number) {
  if (TRAIL_PATHS[i]) goPath(TRAIL_PATHS[i])
}
function onHome(e: MouseEvent) {
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]
const view = ref('infra')
const views: TabItem[] = [
  { value: 'fiche', label: 'Fiche', icon: 'info' },
  { value: 'flux', label: 'Flux', icon: 'flow' },
  { value: 'infra', label: 'Infrastructure', icon: 'server' },
  { value: 'pos', label: 'POS', icon: 'pos' },
  { value: 'historique', label: 'Historique', icon: 'history' },
]
// Mêmes onglets que la fiche d'APOGEE : les autres vues s'ouvrent sur la fiche, à leur onglet, qui garde cette barre
// (on revient ici d'un clic sur « Infrastructure »).
const VIEW_PATHS: Record<string, string> = { fiche: '/fiche/apogee', flux: '/fiche/apogee?vue=flux', pos: '/fiche/apogee?vue=pos', historique: '/fiche/apogee?vue=historique' }
watch(view, (v) => {
  if (!VIEW_PATHS[v]) return
  goPath(VIEW_PATHS[v])
  // Dans Storybook la page change ; ailleurs, l'onglet revient sur la vue courante.
  setTimeout(() => (view.value = 'infra'), 0)
})

/* ---------- Zoom et vue d'ensemble ---------- */
const CONTENT = { x: 140, y: 136, w: 910, h: 680 }
const root = ref<HTMLElement>()
const { zoom, pan, tool, fit, viewport, pct, vars, viewCenter, handlers } = useCanvasView(root, {
  content: () => CONTENT,
  rightPanel: () => (inspected.value || legend.value ? 352 : 0),
  top: 132,
})
const mapCollapsed = ref(false)
const minimapBlocks = computed<McMinimapBlock[]>(() => [
  { layer: 'applicatif', ...pct({ x: 150, y: 150, w: 580, h: 656 }) },
  ...NODES.map((n) => ({ layer: 'technique' as const, ...pct(n.box) })),
])

const pos = (b: McBox) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px' })
</script>

<template>
  <div
    ref="root"
    class="mc-scr-infra mc-scr-map"
    :class="{ 'is-hand': tool === 'hand', 'is-editing': edit.on.value }"
    :style="vars"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Carte Infrastructure de APOGEE" @deselect="selected = null" @fit="fit">
      <McContainer
        name="APOGEE"
        type="Application"
        layer="applicatif"
        icon="app"
        :count="components.length"
        :count-label="`${components.length} composants`"
        :collapsible="false"
        :selected="selected === 'APOGEE'"
        class="mc-scr-infra-app"
        style="left: 150px; top: 150px; width: 580px"
        @select="selected = 'APOGEE'"
        @open="goFiche('APOGEE')"
      >
        <McContainer
          :name="envNames.PROD"
          layer="technique"
          variant="env"
          :count="envCount('PROD')"
          :count-label="plural(envCount('PROD'), 'composant')"
          :collapsible="false"
          :selected="selected === 'PROD'"
          class="mc-scr-infra-env is-prod"
          @select="selected = 'PROD'"
        >
          <div class="mc-scr-infra-spacer" style="height: 402px" @click.self="selected = null" />
        </McContainer>
        <McContainer
          :name="envNames.DEV"
          layer="technique"
          variant="env"
          :count="envCount('DEV')"
          :count-label="plural(envCount('DEV'), 'composant')"
          :collapsible="false"
          :selected="selected === 'DEV'"
          class="mc-scr-infra-env"
          @select="selected = 'DEV'"
        >
          <div class="mc-scr-infra-spacer" :style="{ height: 82 + (devRows - 1) * 80 + 'px' }" @click.self="selected = null" />
        </McContainer>
      </McContainer>

      <McEdgeLayer :edges="edges" @select="onEdgeSelect" />

      <McNode
        v-for="n in NODES"
        :key="n.id"
        :style="pos(n.box)"
        layer="technique"
        :icon="n.icon"
        :type="n.type"
        :name="n.id"
        :subtitle="subOf(n)"
        :status="lensOn ? n.status : n.status === 'critical' ? 'critical' : undefined"
        :lens="lensOn"
        :selected="selected === n.id"
        :dimmed="dimmed(n)"
        @select="selected = n.id"
        @open="openNode(n)"
      />
      <template v-if="edit.on.value">
        <McIconButton
          v-for="n in NODES"
          :key="`rm-${n.id}`"
          size="sm"
          icon="x"
          class="mc-scr-infra-rm"
          :style="{ left: n.box.x + n.box.w - 14 + 'px', top: n.box.y + 'px' }"
          :label="`Retirer ${n.id} de la carte`"
          @click.stop="removeNode(n)"
        />
      </template>
      <MapAnnotations ref="annotations" screen="infrastructure" :zoom="zoom" />

      <template #top>
        <div class="mc-scr-infra-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home="onHome" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" @click="shareOpen = true"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton v-if="edit.on.value" variant="primary" icon="check" @click="edit.finish()">Terminer</McButton>
              <McButton v-else variant="primary" icon="pencil" @click="edit.begin()">Modifier</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-infra-views">
            <McTabs v-model="view" :tabs="views" variant="pill" aria-label="Vues de APOGEE" />
            <McFilterChip v-if="lensOn" label="Lentille : Obsolescence" @remove="lens = NO_LENS" />
          </div>
        </div>
      </template>

      <template #right>
        <McPanelTransition>
          <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        </McPanelTransition>
        <McPanelTransition>
          <McInspector v-if="inspected" :object="inspected" @close="selected = null">
            <template v-if="headerChip" #statuses>
              <McStatusChip :status="headerChip.status" size="sm">{{ headerChip.label }}</McStatusChip>
            </template>
            <template #actions>
              <McButton v-if="selected === 'sophocle'" size="sm" variant="secondary" icon="impact" @click="goPath('/impact')">Voir l’impact d’un arrêt</McButton>
              <McButton v-else-if="selected && byId[selected]?.kind === 'machine'" size="sm" variant="secondary" icon="server" :href="pathHref(machinePath(selected))" @click.prevent="goPath(machinePath(selected))">Ouvrir dans Machines</McButton>
              <McButton v-else-if="selected === 'APOGEE'" size="sm" variant="secondary" icon="external" :href="ficheHref('APOGEE')" @click.prevent="goFiche('APOGEE')">Ouvrir la fiche</McButton>
              <McButton size="sm" variant="outline" icon="pencil" @click="editSelected">Modifier</McButton>
            </template>
            <template #default>
              <template v-if="selected === 'APOGEE'">
                <McKeyValueList :items="[{ key: 'Composants', value: components.length }, { key: 'Machines', value: machines.length }, { key: 'Éditeur', value: 'AMUE' }]">
                  <template #value="{ item }">
                    <a v-if="item.key === 'Éditeur'" :href="pathHref('/fournisseurs')" class="mc-scr-infra-link" @click.prevent="goPath('/fournisseurs')">{{ item.value }}</a>
                    <span v-else>{{ item.value }}</span>
                  </template>
                </McKeyValueList>
                <McRelationList :groups="apogeeRelations" @open="openRelation" />
              </template>
              <template v-else-if="selected && byId[selected]">
                <p v-if="selected === 'sophocle'" class="mc-scr-infra-note">
                  <b>sophocle</b> héberge Tomcat 5, plus supporté depuis le 30/09/2012. Son arrêt toucherait les écrans Forms et les services web de APOGEE.
                </p>
                <McKeyValueList :items="infos">
                  <template #value="{ item }">
                    <a v-if="(item.key === 'Logiciel' || item.key === 'Système') && logicielPath(String(item.value))" :href="pathHref(logicielPath(String(item.value))!)" class="mc-scr-infra-link" @click.prevent="goPath(logicielPath(String(item.value))!)">{{ item.value }}</a>
                    <a v-else-if="item.key === 'Machine'" :href="pathHref(machinePath(String(item.value)))" class="mc-scr-infra-link" @click.prevent="goPath(machinePath(String(item.value)))">{{ item.value }}</a>
                    <span v-else>{{ item.value }}</span>
                  </template>
                </McKeyValueList>
                <McRelationList :groups="relations" @open="openRelation" />
              </template>
              <template v-else>
                <p class="mc-scr-infra-note">Regroupement sans objet : il range les composants de APOGEE par environnement.</p>
                <McRelationList :groups="envRelations" @open="openRelation" />
              </template>
            </template>
          </McInspector>
        </McPanelTransition>
      </template>

      <template #bottom-left>
        <McMinimap v-model:viewport="viewport" v-model:collapsed="mapCollapsed" :blocks="minimapBlocks" :count="NODES.length + 3" :zoom="zoom" />
      </template>

      <template #bottom>
        <MapEditBar
          v-if="edit.on.value"
          :count="edit.count.value"
          :count-label="edit.countLabel.value"
          hint="Ajoutez un composant ou une machine ; retirez un objet avec ×"
          @undo="edit.undo()"
          @discard="edit.discard()"
          @finish="edit.finish()"
        >
          <McButton variant="ghost" icon="plus" @click="openAddComp">Composant</McButton>
          <McButton variant="ghost" icon="server" @click="openAddMach">Machine</McButton>
        </MapEditBar>
        <McToolbar v-else v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit" @filter="legend = true" @sticky="placeNote" @comment="placeComment" :commenting="annotations?.placing ?? false">
          <template #lens><McLensPicker v-model:lens="lens" :lenses="LENSES" /></template>
        </McToolbar>
      </template>
    </McCanvas>
    <MapShareDialog v-model:open="shareOpen" title="Machines nécessaires à APOGEE" :items="exportItems" :selection-count="selected && exportItems[0]?.name === selected ? 1 : 0" :notes="noteTexts('infrastructure')" />
    <McModal
      v-model:open="compModal"
      :title="`Modifier ${compForm.id}`"
      :type="{ label: 'Composant', icon: 'chip', layer: 'technique' }"
      subtitle="Composant de APOGEE"
      :dirty="compDirty"
      @confirm="saveComp"
    >
      <div class="mc-scr-infra-form">
        <McSelect v-model="compForm.software" label="Logiciel" clearable :options="logicielOptions" help="L’obsolescence du composant suit celle du logiciel." />
        <div class="mc-grid2">
          <McSelect v-model="compForm.host" label="Hébergé sur" required :options="machineOptions" />
          <McSelect v-model="compForm.env" label="Environnement" required :options="envOptions" />
        </div>
        <McTextField v-model="compForm.description" label="Description" placeholder="ex. Base de données de production" />
      </div>
    </McModal>
    <McModal v-model:open="envModal" title="Renommer l’environnement" :type="{ label: 'Environnement', icon: 'layers', layer: 'technique' }" :confirm-disabled="!envForm.name.trim()" @confirm="saveEnv">
      <McTextField v-model="envForm.name" label="Nom" required placeholder="ex. Recette" />
    </McModal>
    <McModal
      v-model:open="addCompOpen"
      title="Ajouter un composant"
      :type="{ label: 'Composant', icon: 'chip', layer: 'technique' }"
      subtitle="Composant de APOGEE"
      confirm-label="Ajouter"
      confirm-icon="plus"
      :confirm-disabled="!!addCompError"
      :footer-note="addComp.name.trim() ? addCompError || undefined : undefined"
      @confirm="saveAddComp"
    >
      <div class="mc-scr-infra-form">
        <McTextField v-model="addComp.name" label="Nom" required placeholder="ex. Serveur de recette" />
        <McSelect v-model="addComp.software" label="Logiciel" clearable :options="logicielOptions" />
        <div class="mc-grid2">
          <McSelect v-model="addComp.env" label="Environnement" required :options="envOptions" />
          <McSelect v-model="addComp.host" label="Hébergé sur" required :options="machineOptions" />
        </div>
      </div>
    </McModal>
    <McModal
      v-model:open="addMachOpen"
      title="Ajouter une machine du parc"
      :type="{ label: 'Machine', icon: 'server', layer: 'technique' }"
      subtitle="Elle rejoint la carte avec le composant qu’elle héberge"
      confirm-label="Ajouter"
      confirm-icon="plus"
      :confirm-disabled="!addMach.machine || !addMach.comp"
      @confirm="saveAddMach"
    >
      <div class="mc-scr-infra-form">
        <McSelect v-model="addMach.machine" label="Machine" required :options="parcFree" />
        <McSelect v-model="addMach.comp" label="Héberge le composant" required :options="compOptions" help="Le composant quitte sa machine actuelle pour celle-ci." />
      </div>
    </McModal>
    <SearchPalette v-model:open="paletteOpen" />
    <AppEditModal ref="appEdit" />
    <McToastHost contained :offset="96" />
  </div>
</template>

<style>
.mc-scr-infra { position: relative; width: 100%; height: 100vh; min-height: 560px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-infra.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-infra .mc-canvas-layer > .mc-node { z-index: 1; }
.mc-scr-infra-env { width: 100%; }
.mc-scr-infra-env.is-prod { --gbg: color-mix(in srgb, var(--layer-technique-soft) 70%, transparent); }
.mc-scr-infra .mc-canvas-right { align-items: stretch; }
.mc-scr-infra .mc-canvas-right > .mc-legend { flex: none; }
.mc-scr-infra .mc-canvas-right > .mc-insp { flex: 0 1 auto; min-height: 0; overflow: hidden auto; }
/* Le corps de l’inspecteur garde sa largeur : les longues valeurs passent à la ligne. */
.mc-scr-infra .mc-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-infra-top { display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.mc-scr-infra-top > * { pointer-events: auto; }
.mc-scr-infra-views { align-self: flex-start; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-infra-spacer { width: 100%; }
.mc-scr-infra-note { margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 18px; }
.mc-scr-infra-note b { color: var(--ink); }
.mc-scr-infra-link { color: var(--accent); }
.mc-scr-infra-form { display: grid; gap: 16px; }
.mc-scr-infra-rm { position: absolute; z-index: 3; background: var(--surface); box-shadow: var(--shadow-node); border-radius: 999px; }
.mc-scr-infra.is-editing .mc-canvas-layer > .mc-node { outline: 1px dashed transparent; outline-offset: 3px; border-radius: var(--radius-md); }
.mc-scr-infra.is-editing .mc-canvas-layer > .mc-node:hover { outline-color: var(--accent); }
</style>
