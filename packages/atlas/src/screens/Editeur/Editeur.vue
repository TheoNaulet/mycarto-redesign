<script setup lang="ts">
// Écran « Éditeur de carte » : la carte des applications et flux de Scolarité en mode modification.
// Contenu de la carte à gauche (afficher, masquer, filtrer), canevas au centre, propriétés de la sélection à droite,
// barre d'édition en bas. Chaque modification est annulable (bouton ou Ctrl/Cmd + Z) et marque le brouillon.
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McNode from '../../components/McNode/McNode.vue'
import McFlowNode from '../../components/McFlowNode/McFlowNode.vue'
import McEdgeLayer from '../../components/McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeSpec } from '../../components/McEdge/edge'
import McStickyNote from '../../components/McStickyNote/McStickyNote.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McTag from '../../components/McTag/McTag.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath, queryParam } from '../bridge'

/** Ouvert depuis la liste « Modèles de carte » (?depuis=modeles) : le retour y ramène. */
const fromModels = queryParam('depuis') === 'modeles'
import { publishedMapEdits, publishMap } from '../../data/publication'
import { domainCount } from '../../data/applications'

const scolariteCount = domainCount('Scolarité')
import { maxFitFor } from '../Infrastructure/canvasView'

const toast = useToast()

/* ---------- Modèle de la carte ---------- */
const NODE_W = 184
const NODE_H = 48
const PILL_W = 210
const PILL_H = 26
const DOMAIN = { x: 330, y: 150, w: 420 }

type NodeType = 'Application' | 'Partenaire'
interface EdNode {
  id: string
  name: string
  type: NodeType
  sub: string
  x: number
  y: number
  main?: boolean
}
interface EdFlow {
  id: string
  code: string
  label: string
  source: string
  target: string
  liaison: string
  frequence: string
  declenchement: string
  traitement: string
  both: boolean
  data: string[]
  showLabel: boolean
  highlight: boolean
  x: number
  cy: number
}
interface EdNote {
  id: string
  text: string
  x: number
  y: number
}
interface EdState {
  nodes: EdNode[]
  flows: EdFlow[]
  notes: EdNote[]
}

const initial = (): EdState => ({
  nodes: [
    { id: 'APOGEE', name: 'APOGEE', type: 'Application', sub: '32 utilisateurs', x: 350, y: 256, main: true },
    { id: 'APOGEE WEB', name: 'APOGEE WEB', type: 'Application', sub: 'Module de APOGEE', x: 350, y: 380 },
    { id: 'NOTES', name: 'NOTES', type: 'Application', sub: '', x: 350, y: 470 },
    { id: 'DIEGO', name: 'DIEGO', type: 'Application', sub: '', x: 350, y: 560 },
    { id: 'CNOUS', name: 'CNOUS', type: 'Partenaire', sub: 'Partenaire', x: 860, y: 168 },
    { id: 'CALCIUM', name: 'CALCIUM', type: 'Application', sub: '', x: 860, y: 256 },
    { id: 'OpenLDAP', name: 'OpenLDAP', type: 'Application', sub: '', x: 860, y: 414 },
  ],
  flows: [
    { id: 'f-bourse', code: 'FX00008', label: 'Export données boursiers', source: 'APOGEE', target: 'CNOUS', liaison: 'Fichier plat', frequence: 'Quotidienne', declenchement: 'Planifié', traitement: 'Automatique', both: false, data: ['Données boursiers'], showLabel: true, highlight: false, x: 590, cy: 192 },
    { id: 'f-maj', code: 'FX00011', label: 'Maj des données étudiantes', source: 'APOGEE', target: 'CALCIUM', liaison: 'Synchrone', frequence: 'Semestrielle', declenchement: 'Manuel', traitement: 'Automatique', both: false, data: ['Données de santé'], showLabel: true, highlight: false, x: 590, cy: 280 },
    { id: 'f-auth', code: 'FX00014', label: 'Flux d’authentification', source: 'APOGEE', target: 'OpenLDAP', liaison: 'LDAP', frequence: 'Temps réel', declenchement: 'Automatique', traitement: 'Automatique', both: true, data: ['Comptes étudiants'], showLabel: true, highlight: false, x: 590, cy: 438 },
  ],
  notes: [],
})

/** La carte repart de la dernière version publiée pendant la session, sinon de la version d'origine. */
const startState = (): EdState => (publishedMapEdits.value ? clone(publishedMapEdits.value.state as EdState) : initial())
const state = reactive<EdState>(startState())
/** Valeurs publiées, pour marquer les champs modifiés. */
const published = ref<EdState>(startState())

function clone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T
}
const nodeById = (id: string) => state.nodes.find((n) => n.id === id)
const flowById = (id: string) => state.flows.find((f) => f.id === id)

/* ---------- Historique des modifications (Annuler) ---------- */
const history = ref<string[]>([])
let lastKey = ''
let lastAt = 0
/** Enregistre l'état avant une modification. Les frappes successives d'un même champ ne font qu'un pas. */
function change(key: string, run: () => void) {
  const now = Date.now()
  if (key !== lastKey || now - lastAt > 1200 || !history.value.length) history.value.push(JSON.stringify(state))
  lastKey = key
  lastAt = now
  run()
  markDirty()
}
function undo() {
  const prev = history.value.pop()
  if (!prev) return
  const s = JSON.parse(prev) as EdState
  state.nodes = s.nodes
  state.flows = s.flows
  state.notes = s.notes
  lastKey = ''
  if (selected.value && !nodeById(selected.value) && !flowById(selected.value)) selected.value = null
  markDirty()
}

/* ---------- Brouillon ---------- */
const now = ref(Date.now())
const savedAt = ref(Date.now() - 10_000)
const dirty = ref(false)
let saveTimer: ReturnType<typeof setTimeout> | undefined
let clock: ReturnType<typeof setInterval> | undefined
function markDirty() {
  dirty.value = true
  clearTimeout(saveTimer)
  // Enregistrement automatique du brouillon après quelques secondes sans modification.
  saveTimer = setTimeout(() => {
    dirty.value = false
    savedAt.value = Date.now()
    now.value = Date.now()
  }, 6000)
}
const draftLabel = computed(() => {
  if (dirty.value) return 'Modifications non enregistrées'
  const s = Math.max(0, Math.round((now.value - savedAt.value) / 1000))
  if (s < 3) return 'Brouillon enregistré à l’instant'
  if (s < 60) return `Brouillon enregistré il y a ${s} s`
  return `Brouillon enregistré il y a ${Math.floor(s / 60)} min`
})
function publish() {
  clearTimeout(saveTimer)
  dirty.value = false
  savedAt.value = Date.now()
  now.value = Date.now()
  published.value = clone(state)
  publishMap(state, { nodes: state.nodes.length, flows: state.flows.length, notes: state.notes.length })
  toast.success('Version publiée enregistrée', { actionLabel: 'Voir l’historique', onAction: () => goPath('/historique') })
}

/* ---------- Contenu de la carte : visibilité ---------- */
const visible = reactive({ domaines: true, applications: true, flux: true, partenaires: false, libelles: false })
type LayerKey = keyof typeof visible
const filter = ref('')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const matches = (s: string) => !filter.value.trim() || norm(s).includes(norm(filter.value.trim()))

const shownNode = (n: EdNode) => (n.type === 'Partenaire' ? visible.partenaires : visible.applications)
const shownNodes = computed(() => state.nodes.filter(shownNode))
const shownFlows = computed(() => (visible.flux ? state.flows : []))

const appNodes = computed(() => state.nodes.filter((n) => n.type === 'Application'))
const partnerNodes = computed(() => state.nodes.filter((n) => n.type === 'Partenaire'))
interface LayerRow {
  key: LayerKey
  label: string
  layer: 'fonctionnel' | 'applicatif'
  count?: number
  children?: { id: string; label: string }[]
}
const layerRows = computed<LayerRow[]>(() => {
  const q = filter.value.trim()
  const sub = (items: { id: string; label: string }[]) => items.filter((i) => matches(i.label))
  return [
    { key: 'domaines', label: 'Domaines', layer: 'fonctionnel', count: 1, children: q ? sub([{ id: 'Scolarité', label: 'Scolarité' }]) : [] },
    { key: 'applications', label: 'Applications', layer: 'applicatif', count: appNodes.value.length, children: q ? sub(appNodes.value.map((n) => ({ id: n.id, label: n.name }))) : [] },
    { key: 'flux', label: 'Flux fonctionnels', layer: 'applicatif', count: state.flows.length, children: sub(state.flows.map((f) => ({ id: f.id, label: f.label }))) },
    { key: 'partenaires', label: 'Partenaires', layer: 'applicatif', count: partnerNodes.value.length, children: q ? sub(partnerNodes.value.map((n) => ({ id: n.id, label: n.name }))) : [] },
    { key: 'libelles', label: 'Libellés des flux', layer: 'fonctionnel' },
  ]
})
function toggleLayer(k: LayerKey) {
  visible[k] = !visible[k]
}
function pickFromList(id: string) {
  if (id === 'Scolarité') {
    visible.domaines = true
    selected.value = 'Scolarité'
    return
  }
  const n = nodeById(id)
  if (n) {
    if (n.type === 'Partenaire') visible.partenaires = true
    else visible.applications = true
  } else visible.flux = true
  selected.value = id
}

/* ---------- Sélection ---------- */
const selected = ref<string | null>('f-maj')
const selFlow = computed(() => (selected.value ? flowById(selected.value) : undefined))
const selNode = computed(() => (selected.value ? nodeById(selected.value) : undefined))
const panelTab = ref('selection')
const panelTabs: TabItem[] = [
  { value: 'selection', label: 'Sélection' },
  { value: 'affichage', label: 'Affichage' },
  { value: 'regles', label: 'Règles de couleur' },
]
watch(selected, (s) => {
  if (s) panelTab.value = 'selection'
})

/* ---------- Géométrie : boîtes et liens ---------- */
const nodeBox = (n: EdNode): McBox => ({ x: n.x, y: n.y, w: NODE_W, h: NODE_H })
const pillBox = (f: EdFlow): McBox => ({ x: f.x, y: f.cy - PILL_H / 2, w: PILL_W, h: PILL_H })
const shownIds = computed(() => new Set(shownNodes.value.map((n) => n.id)))
const edgeLabel = (f: EdFlow) => `${f.liaison} · ${f.frequence.toLowerCase()}`

const edges = computed<McEdgeSpec[]>(() => {
  const list: McEdgeSpec[] = []
  for (const f of shownFlows.value) {
    const src = nodeById(f.source)
    const dst = nodeById(f.target)
    const pb = pillBox(f)
    const sel = selected.value === f.id
    const kind = f.highlight ? 'hover' : 'flow'
    if (src && shownIds.value.has(src.id)) {
      // Plusieurs flux partent du même nœud : chacun a son point de départ, rangés de haut en bas.
      const siblings = shownFlows.value.filter((g) => g.source === f.source).sort((a, b) => a.cy - b.cy)
      const i = siblings.indexOf(f)
      list.push({ id: `${f.id}-a`, ...edgeBetween(nodeBox(src), pb, i, siblings.length, 9), kind, selected: sel })
    }
    if (dst && shownIds.value.has(dst.id)) list.push({ id: `${f.id}-b`, ...edgeBetween(pb, nodeBox(dst)), kind, selected: sel })
  }
  return list
})
/** Libellé du lien écrit sous la pilule : au repos avec « Libellés des flux », toujours pour le flux sélectionné. */
const flowLabelShown = (f: EdFlow) => f.showLabel && (visible.libelles || selected.value === f.id)
function onEdgeSelect(id: string) {
  selected.value = id.replace(/-[ab]$/, '')
}

/** Hauteur du domaine : il s'allonge quand ses applications descendent. */
const inDomain = (n: EdNode) => n.x >= DOMAIN.x && n.x + NODE_W <= DOMAIN.x + DOMAIN.w + 40
const domainHeight = computed(() => {
  const bottom = Math.max(...state.nodes.filter((n) => n.type === 'Application' && inDomain(n)).map((n) => n.y + NODE_H), 0)
  return Math.max(560, bottom + 40 - DOMAIN.y)
})

/** Emplacement du prochain objet ajouté : la zone de dépôt. */
const dropSlot = computed(() => {
  let y = 520
  const taken = (yy: number) => state.nodes.some((n) => Math.abs(n.x - 793) < 120 && Math.abs(n.y - yy) < 60)
  while (taken(y + 36)) y += 140
  return { x: 770, y }
})

/* ---------- Champs du flux sélectionné ---------- */
const opts = (xs: string[]): McSelectOption[] => xs.map((x) => ({ value: x, label: x }))
const LIAISONS = opts(['Synchrone', 'Asynchrone', 'Fichier plat', 'Web service', 'LDAP'])
const FREQUENCES = opts(['Temps réel', 'Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Semestrielle', 'Annuelle'])
const DECLENCHEMENTS = opts(['Manuel', 'Automatique', 'Planifié'])
const TRAITEMENTS = opts(['Automatique', 'Manuel', 'Mixte'])
const DONNEES = ['Données de santé', 'Identité', 'Photo', 'Comptes étudiants', 'Données boursiers', 'Inscriptions pédagogiques', 'Notes et résultats']
const nodeOptions = computed<McSelectOption[]>(() => state.nodes.map((n) => ({ value: n.id, label: n.name })))

type FlowField = 'label' | 'source' | 'target' | 'liaison' | 'frequence' | 'declenchement' | 'traitement'
/** Champ du flux sélectionné, lié en v-model : chaque écriture passe par l'historique. */
function flowModel(k: FlowField) {
  return computed<string>({
    get: () => selFlow.value?.[k] ?? '',
    set: (v) => {
      const f = selFlow.value
      if (!f || f[k] === v) return
      change(`${f.id}.${k}`, () => (f[k] = v))
    },
  })
}
const fLabel = flowModel('label')
const fSource = flowModel('source')
const fTarget = flowModel('target')
const fLiaison = flowModel('liaison')
const fFrequence = flowModel('frequence')
const fDeclenchement = flowModel('declenchement')
const fTraitement = flowModel('traitement')
/** McSelect écrit `McSelectValue | null` : on n'accepte qu'une chaîne. */
const asSelect = (m: { value: string }) =>
  computed<McSelectValue | null>({ get: () => m.value || null, set: (v) => v !== null && (m.value = String(v)) })
const sSource = asSelect(fSource)
const sTarget = asSelect(fTarget)
const sLiaison = asSelect(fLiaison)
const sFrequence = asSelect(fFrequence)
const sDeclenchement = asSelect(fDeclenchement)
const sTraitement = asSelect(fTraitement)
const flowModified = (k: FlowField) => {
  const f = selFlow.value
  const p = f && published.value.flows.find((x) => x.id === f.id)
  return !!f && !!p && p[k] !== f[k]
}
const labelError = computed(() => (selFlow.value && !selFlow.value.label.trim() ? 'Donnez un libellé au flux : il est écrit sur la carte.' : undefined))

function flowToggle(k: 'showLabel' | 'highlight') {
  return computed<boolean>({
    get: () => !!selFlow.value?.[k],
    set: (v) => {
      const f = selFlow.value
      if (f) change(`${f.id}.${k}`, () => (f[k] = v))
    },
  })
}
const fShowLabel = flowToggle('showLabel')
const fHighlight = flowToggle('highlight')

/* Données échangées */
const addingData = ref(false)
const newData = ref<McSelectValue | null>(null)
const dataOptions = computed(() => opts(DONNEES.filter((d) => !selFlow.value?.data.includes(d))))
watch(newData, (v) => {
  const f = selFlow.value
  if (!f || v === null) return
  change(`${f.id}.data`, () => f.data.push(String(v)))
  lastKey = ''
  newData.value = null
  addingData.value = false
})
function removeData(d: string) {
  const f = selFlow.value
  if (!f) return
  change(`${f.id}.data-rm`, () => (f.data = f.data.filter((x) => x !== d)))
  lastKey = ''
}
watch(selected, () => {
  addingData.value = false
})

/* ---------- Champs du nœud sélectionné ---------- */
function nodeModel(k: 'name' | 'sub') {
  return computed<string>({
    get: () => selNode.value?.[k] ?? '',
    set: (v) => {
      const n = selNode.value
      if (n && n[k] !== v) change(`${n.id}.${k}`, () => (n[k] = v))
    },
  })
}
const nName = nodeModel('name')
const nSub = nodeModel('sub')
const nodeFlows = computed(() => (selNode.value ? state.flows.filter((f) => f.source === selNode.value!.id || f.target === selNode.value!.id) : []))

/* ---------- Outils ---------- */
type Tool = 'select' | 'hand' | 'link'
const tool = ref<Tool>('select')
const linkFrom = ref<string | null>(null)
watch(tool, () => (linkFrom.value = null))
let seq = 1

function addNode() {
  const slot = dropSlot.value
  const id = `new-${seq++}`
  change(`add-${id}`, () => state.nodes.push({ id, name: 'Nouvelle application', type: 'Application', sub: 'À renseigner', x: slot.x + 23, y: slot.y + 36 }))
  visible.applications = true
  selected.value = id
  tool.value = 'select'
}
function startLink() {
  tool.value = tool.value === 'link' ? 'select' : 'link'
  if (tool.value === 'link') toast.info('Cliquez sur la source, puis sur la cible du flux.')
}
function addFlow(from: string, to: string) {
  const src = nodeById(from)!
  const dst = nodeById(to)!
  const id = `f-new-${seq++}`
  const x = Math.round((src.x + NODE_W + dst.x) / 2 - PILL_W / 2)
  let cy = dst.y + NODE_H / 2
  while (state.flows.some((f) => Math.abs(f.x - x) < PILL_W && Math.abs(f.cy - cy) < 34)) cy += 36
  change(`add-${id}`, () =>
    state.flows.push({ id, code: `FX000${20 + seq}`, label: 'Nouveau flux', source: from, target: to, liaison: 'Synchrone', frequence: 'Quotidienne', declenchement: 'Automatique', traitement: 'Automatique', both: false, data: [], showLabel: true, highlight: false, x, cy }),
  )
  visible.flux = true
  selected.value = id
  tool.value = 'select'
}
function addNote() {
  const id = `note-${seq++}`
  change(`add-${id}`, () => state.notes.push({ id, text: '', x: 600, y: 600 }))
}
function noteText(n: EdNote) {
  return computed<string>({ get: () => n.text, set: (v) => change(`${n.id}.text`, () => (n.text = v)) })
}
const noteModels = computed(() => state.notes.map((n) => ({ note: n, text: noteText(n) })))

function reorganize() {
  change('reorg', () => {
    const left = state.nodes.filter((n) => n.type === 'Application' && inDomain(n)).sort((a, b) => a.y - b.y)
    left.forEach((n, i) => {
      n.x = 350
      n.y = 236 + i * 92
    })
    const right = state.nodes.filter((n) => !left.includes(n)).sort((a, b) => a.y - b.y)
    right.forEach((n, i) => {
      n.x = 860
      n.y = 168 + i * 92
    })
    // Les pilules suivent leur cible ; deux flux vers la même cible se décalent.
    const used: number[] = []
    for (const f of [...state.flows].sort((a, b) => (nodeById(a.target)?.y ?? 0) - (nodeById(b.target)?.y ?? 0))) {
      const t = nodeById(f.target)
      f.x = 590
      let cy = t ? t.y + NODE_H / 2 : f.cy
      while (used.some((u) => Math.abs(u - cy) < 34)) cy += 36
      used.push(cy)
      f.cy = cy
    }
  })
  lastKey = ''
  toast.success('Carte réorganisée', { actionLabel: 'Annuler', onAction: undo })
}
function removeSelected() {
  const s = selected.value
  if (!s) return
  const n = nodeById(s)
  if (n) {
    change(`rm-${s}`, () => {
      state.nodes = state.nodes.filter((x) => x.id !== s)
      state.flows = state.flows.filter((f) => f.source !== s && f.target !== s)
    })
    toast.success(`${n.name} retirée de la carte`, { actionLabel: 'Annuler', onAction: undo })
  } else if (flowById(s)) {
    const label = flowById(s)!.label
    change(`rm-${s}`, () => (state.flows = state.flows.filter((f) => f.id !== s)))
    toast.success(`Flux « ${label} » retiré de la carte`, { actionLabel: 'Annuler', onAction: undo })
  } else return
  lastKey = ''
  selected.value = null
}

function onNodeSelect(id: string) {
  if (tool.value === 'link') {
    if (!linkFrom.value) {
      linkFrom.value = id
      selected.value = id
    } else if (linkFrom.value !== id) addFlow(linkFrom.value, id)
    return
  }
  if (!movedSinceDown) selected.value = id
}

/* ---------- Déplacer un nœud ---------- */
let nodeDrag: { id: string; x: number; y: number; nx: number; ny: number; moved: boolean } | null = null
let movedSinceDown = false
function onNodeDown(e: PointerEvent, n: EdNode) {
  movedSinceDown = false
  if (tool.value !== 'select' || e.button !== 0) return
  e.stopPropagation()
  nodeDrag = { id: n.id, x: e.clientX, y: e.clientY, nx: n.x, ny: n.y, moved: false }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onNodeMove(e: PointerEvent) {
  if (!nodeDrag) return
  const dx = (e.clientX - nodeDrag.x) / zoom.value
  const dy = (e.clientY - nodeDrag.y) / zoom.value
  if (!nodeDrag.moved && Math.hypot(dx, dy) < 4) return
  const n = nodeById(nodeDrag.id)
  if (!n) return
  const d = nodeDrag
  if (!d.moved) {
    d.moved = true
    movedSinceDown = true
    lastKey = ''
    change(`move-${d.id}`, () => {})
  }
  // Aligné sur la trame de 8px.
  n.x = Math.round((d.nx + dx) / 8) * 8
  n.y = Math.round((d.ny + dy) / 8) * 8
}
function onNodeUp() {
  if (nodeDrag?.moved) {
    lastKey = ''
    selected.value = nodeDrag.id
  }
  nodeDrag = null
}

/* ---------- Zoom, déplacement, recadrage ---------- */
const root = ref<HTMLElement>()
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const size = ref({ w: 1440, h: 900 })
const TOP = 84
const BOTTOM = 84
/** Place prise par les panneaux de gauche et de droite, marges comprises : leur largeur suit celle de l'écran (CSS). */
function sides() {
  const el = root.value
  const r = el?.getBoundingClientRect()
  const l = el?.querySelector('.mc-scr-ed-layers')?.getBoundingClientRect()
  const p = el?.querySelector('.mc-scr-ed-panel')?.getBoundingClientRect()
  return { left: r && l ? l.right - r.left : 264, right: r && p ? r.right - p.left : 336 }
}
function bounds() {
  const xs = state.nodes.map((n) => n.x)
  const ys = state.nodes.map((n) => n.y)
  const x0 = Math.min(DOMAIN.x, ...xs)
  const y0 = Math.min(DOMAIN.y, ...ys) - 20
  const x1 = Math.max(DOMAIN.x + DOMAIN.w, ...xs.map((x) => x + NODE_W), 1000)
  const y1 = Math.max(DOMAIN.y + domainHeight.value, ...ys.map((y) => y + NODE_H))
  return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }
}
function fit() {
  const b = bounds()
  const { left, right } = sides()
  const availW = size.value.w - left - right - 32
  const availH = size.value.h - TOP - BOTTOM
  const z = Math.max(0.3, Math.min(maxFitFor(size.value.w, size.value.h), availW / b.w, availH / b.h))
  zoom.value = Math.round(z * 100) / 100
  pan.value = {
    x: Math.round(left + 16 + (availW - b.w * zoom.value) / 2 - b.x * zoom.value),
    y: Math.round(TOP + (availH - b.h * zoom.value) / 2 - b.y * zoom.value),
  }
}
let ro: ResizeObserver | undefined
let canvasDrag: { x: number; y: number; px: number; py: number } | null = null
function onPointerDown(e: PointerEvent) {
  if (tool.value !== 'hand' && e.button !== 1) return
  if ((e.target as HTMLElement).closest('.mc-float')) return
  canvasDrag = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (canvasDrag) pan.value = { x: canvasDrag.px + e.clientX - canvasDrag.x, y: canvasDrag.py + e.clientY - canvasDrag.y }
}
function onPointerUp() {
  canvasDrag = null
}
function onWheel(e: WheelEvent) {
  if ((e.target as HTMLElement).closest('.mc-float')) return
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) {
    const old = zoom.value
    const z = Math.round(Math.min(2, Math.max(0.3, old * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100
    const r = root.value!.getBoundingClientRect()
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    pan.value = { x: cx - ((cx - pan.value.x) * z) / old, y: cy - ((cy - pan.value.y) * z) / old }
    zoom.value = z
  } else pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
}

/* ---------- Clavier ---------- */
function isTyping(t: EventTarget | null) {
  const el = t as HTMLElement | null
  return !!el && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName))
}
function onKey(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
    // Même dans un champ : chaque saisie est déjà un pas de l'historique de la carte.
    e.preventDefault()
    undo()
    return
  }
  if (isTyping(e.target) || e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key === 'Escape') {
    if (tool.value === 'link') tool.value = 'select'
    else selected.value = null
  } else if (e.key === 'Delete' || e.key === 'Backspace') removeSelected()
  else if (e.key.toLowerCase() === 'v') tool.value = 'select'
  else if (e.key.toLowerCase() === 'h') tool.value = 'hand'
  else if (e.key.toLowerCase() === 'a') addNode()
  else if (e.key.toLowerCase() === 'r') startLink()
}

onMounted(() => {
  const el = root.value!
  size.value = { w: el.clientWidth, h: el.clientHeight }
  fit()
  ro = new ResizeObserver(() => {
    const w = el.clientWidth
    const h = el.clientHeight
    if (w === size.value.w && h === size.value.h) return
    size.value = { w, h }
    fit()
  })
  ro.observe(el)
  clock = setInterval(() => (now.value = Date.now()), 1000)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  ro?.disconnect()
  clearInterval(clock)
  clearTimeout(saveTimer)
  document.removeEventListener('keydown', onKey)
})

/* ---------- Divers ---------- */
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]
const pos = (b: McBox) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px' })
const density = ref('default')
const showGrid = ref(true)
const lensDefault = ref<McSelectValue | null>('aucune')
const lensOptions: McSelectOption[] = [
  { value: 'aucune', label: 'Aucune' },
  { value: 'obsolescence', label: 'Obsolescence' },
  { value: 'contrats', label: 'Échéance des contrats' },
  { value: 'dicp', label: 'Criticité DICP' },
  { value: 'statut', label: 'Statut' },
]
const lensInToolbar = ref(true)
const nodeSub = (n: EdNode) => (density.value === 'compact' ? undefined : n.sub || undefined)
</script>

<template>
  <div
    ref="root"
    class="mc-scr-ed"
    :class="{ 'is-hand': tool === 'hand', 'is-link': tool === 'link', 'no-grid': !showGrid }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Édition de la carte Applications et flux de Scolarité" @deselect="selected = null" @fit="fit">
      <McContainer
        v-if="visible.domaines"
        name="Scolarité"
        type="Domaine"
        layer="fonctionnel"
        icon="folder"
        :count="scolariteCount"
        :count-label="`${scolariteCount} applications`"
        :collapsible="false"
        :selected="selected === 'Scolarité'"
        :style="{ left: DOMAIN.x + 'px', top: DOMAIN.y + 'px', width: DOMAIN.w + 'px' }"
        @select="selected = 'Scolarité'"
      >
        <div :style="{ height: domainHeight - 42 + 'px' }" @click.self="selected = null" />
      </McContainer>

      <McEdgeLayer :edges="edges" @select="onEdgeSelect" />

      <button
        type="button"
        class="mc-scr-ed-drop"
        :style="{ left: dropSlot.x + 'px', top: dropSlot.y + 'px' }"
        @click="addNode"
      >
        <McIcon name="plus" size="sm" />Déposer un objet ici
      </button>

      <McFlowNode
        v-for="f in shownFlows"
        :key="f.id"
        class="mc-scr-ed-abs"
        :style="pos(pillBox(f))"
        :label="f.label || 'Sans libellé'"
        :direction="f.both ? 'both' : 'one'"
        :width="PILL_W"
        :selected="selected === f.id"
        :hover="f.highlight && selected !== f.id"
        @select="selected = f.id"
      />

      <template v-for="f in shownFlows" :key="`lbl-${f.id}`">
        <span v-if="flowLabelShown(f)" class="mc-edge-label mc-scr-ed-lbl" :class="{ 'is-sel': selected === f.id }" :style="{ left: f.x + 10 + 'px', top: f.cy + PILL_H / 2 + 5 + 'px' }">{{ edgeLabel(f) }}</span>
      </template>

      <McNode
        v-for="n in shownNodes"
        :key="n.id"
        class="mc-scr-ed-node"
        :class="{ 'is-link-from': linkFrom === n.id }"
        :style="pos(nodeBox(n))"
        layer="applicatif"
        :icon="n.type === 'Partenaire' ? 'building' : 'app'"
        :type="n.type"
        :name="n.name || 'Sans nom'"
        :subtitle="nodeSub(n)"
        :density="density === 'compact' ? 'compact' : 'default'"
        :main="n.main"
        :selected="selected === n.id"
        @select="onNodeSelect(n.id)"
        @pointerdown="onNodeDown($event, n)"
        @pointermove="onNodeMove"
        @pointerup="onNodeUp"
        @pointercancel="onNodeUp"
      />

      <McStickyNote
        v-for="m in noteModels"
        :key="m.note.id"
        v-model:text="m.text.value"
        editable
        class="mc-scr-ed-abs mc-scr-ed-note"
        :style="{ left: m.note.x + 'px', top: m.note.y + 'px' }"
        :rotation="-1.5"
        :author="{ initials: 'TN', name: 'Théo', color: 1 }"
        date="Aujourd’hui"
      />
    </McCanvas>

    <!-- Barre du haut -->
    <header class="mc-float mc-scr-ed-top">
      <McIconButton icon="chevron-left" :label="fromModels ? 'Retour aux modèles de carte' : 'Quitter l’édition'" @click="goPath(fromModels ? '/modeles-carte' : '/carte')" />
      <span class="mc-scr-ed-title">
        <b>Les applications et flux de Scolarité</b>
        <span :class="{ 'is-dirty': dirty }" aria-live="polite">
          <McIcon :name="dirty ? 'pencil' : 'check'" size="sm" />{{ draftLabel }}
        </span>
      </span>
      <span class="mc-sep" aria-hidden="true" />
      <McStatusChip status="neutral" size="sm">Modèle : applis et flux d’un domaine</McStatusChip>
      <span class="mc-scr-ed-grow" />
      <McAvatarStack :people="people" label="3 personnes sur la carte" />
      <button type="button" class="mc-scr-ed-zoom" title="Recadrer sur tout" @click="fit">{{ Math.round(zoom * 100) }} %</button>
      <McButton variant="outline" icon="eye" class="mc-scr-ed-ico" title="Aperçu" @click="goPath('/carte')"><span class="mc-scr-ed-lbl2">Aperçu</span></McButton>
      <McButton variant="primary" @click="publish">Publier la carte</McButton>
    </header>

    <!-- Contenu de la carte -->
    <aside class="mc-float mc-scr-ed-layers" aria-label="Contenu de la carte">
      <McSearchField v-model="filter" size="sm" placeholder="Filtrer les objets" />
      <span class="mc-over mc-scr-ed-over">Contenu de la carte</span>
      <template v-for="r in layerRows" :key="r.key">
        <div class="mc-scr-ed-ly" :class="[`l-${r.layer}`, { 'is-off': !visible[r.key] }]">
          <span class="mc-scr-ed-ld" />
          <span class="mc-scr-ed-grow">{{ r.label }}</span>
          <span v-if="r.count !== undefined" class="mc-count">{{ r.count }}</span>
          <McIconButton
            :icon="visible[r.key] ? 'eye' : 'eye-off'"
            size="sm"
            :label="`${visible[r.key] ? 'Masquer' : 'Afficher'} : ${r.label.toLowerCase()}`"
            @click="toggleLayer(r.key)"
          />
        </div>
        <button
          v-for="c in r.children"
          :key="c.id"
          type="button"
          class="mc-scr-ed-ly is-sub"
          :class="{ 'is-sel': selected === c.id, 'is-off': !visible[r.key] }"
          @click="pickFromList(c.id)"
        >
          <span class="mc-scr-ed-grow">{{ c.label || 'Sans libellé' }}</span>
        </button>
      </template>
      <p v-if="filter && !layerRows.some((r) => r.children?.length)" class="mc-cap mc-scr-ed-none">Aucun objet ne correspond à « {{ filter }} ».</p>
      <hr class="mc-hr" />
      <span class="mc-over mc-scr-ed-over">Modèle</span>
      <div class="mc-scr-ed-ly">
        <span class="mc-scr-ed-grow">Les applis et flux d’un domaine</span>
        <McTag size="sm">DOMAINE02B</McTag>
      </div>
      <McButton variant="ghost" size="sm" icon="pencil" class="mc-scr-ed-start" @click="goPath('/types-objets')">Modifier le modèle</McButton>
    </aside>

    <!-- Propriétés -->
    <aside class="mc-float mc-scr-ed-panel" aria-label="Propriétés">
      <div class="mc-scr-ed-sec">
        <McTabs v-model="panelTab" :tabs="panelTabs" aria-label="Panneau de propriétés" />
      </div>

      <template v-if="panelTab === 'selection'">
        <!-- Flux -->
        <template v-if="selFlow">
          <div class="mc-scr-ed-sec l-applicatif">
            <div class="mc-scr-ed-head">
              <span class="mc-scr-ed-tile"><McIcon :name="selFlow.both ? 'flow' : 'arrow-right'" size="lg" /></span>
              <div>
                <b class="title">{{ selFlow.label || 'Sans libellé' }}</b>
                <span class="mc-code">{{ selFlow.code }}</span>
              </div>
              <McIconButton icon="trash" size="sm" label="Retirer le flux de la carte" @click="removeSelected" />
            </div>
            <McTextField v-model="fLabel" label="Libellé" required :error="labelError" :modified="flowModified('label')" />
            <div class="mc-grid2 mc-scr-ed-grid">
              <McSelect v-model="sSource" label="Source" size="sm" :options="nodeOptions" :modified="flowModified('source')" />
              <McSelect v-model="sTarget" label="Cible" size="sm" :options="nodeOptions" :modified="flowModified('target')" />
              <McSelect v-model="sLiaison" label="Liaison" size="sm" :options="LIAISONS" :modified="flowModified('liaison')" />
              <McSelect v-model="sFrequence" label="Fréquence" size="sm" :options="FREQUENCES" :modified="flowModified('frequence')" />
              <McSelect v-model="sDeclenchement" label="Déclenchement" size="sm" :options="DECLENCHEMENTS" :modified="flowModified('declenchement')" />
              <McSelect v-model="sTraitement" label="Traitement" size="sm" :options="TRAITEMENTS" :modified="flowModified('traitement')" />
            </div>
          </div>
          <div class="mc-scr-ed-sec">
            <span class="mc-over">Données échangées</span>
            <div class="mc-rel">
              <div v-for="d in selFlow.data" :key="d" class="row l-fonctionnel">
                <span class="tile"><McIcon name="database" size="sm" /></span>
                <span class="grow">{{ d }}</span>
                <McIconButton icon="x" size="sm" :label="`Retirer ${d}`" @click="removeData(d)" />
              </div>
              <p v-if="!selFlow.data.length" class="mc-cap mc-scr-ed-none">Aucune donnée liée à ce flux.</p>
              <McSelect
                v-if="addingData"
                v-model="newData"
                size="sm"
                aria-label="Donnée à ajouter"
                placeholder="Choisir une donnée"
                :options="dataOptions"
                @close="!newData && (addingData = false)"
              />
              <button v-else type="button" class="add" :disabled="!dataOptions.length" @click="addingData = true">
                <McIcon name="plus" size="sm" />Ajouter une donnée
              </button>
            </div>
          </div>
          <div class="mc-scr-ed-sec">
            <span class="mc-over">Sur la carte</span>
            <McSwitch v-model="fShowLabel" label="Afficher le libellé du lien" block />
            <McSwitch v-model="fHighlight" label="Mettre en évidence" block />
          </div>
        </template>

        <!-- Nœud -->
        <template v-else-if="selNode">
          <div class="mc-scr-ed-sec l-applicatif">
            <div class="mc-scr-ed-head">
              <span class="mc-scr-ed-tile"><McIcon :name="selNode.type === 'Partenaire' ? 'building' : 'app'" size="lg" /></span>
              <div>
                <b class="title">{{ selNode.name || 'Sans nom' }}</b>
                <span class="mc-cap">{{ selNode.type }}</span>
              </div>
              <McIconButton icon="trash" size="sm" label="Retirer de la carte" @click="removeSelected" />
            </div>
            <McTextField v-model="nName" label="Nom" required :error="selNode.name.trim() ? undefined : 'Donnez un nom à l’objet.'" />
            <McTextField v-model="nSub" label="Sous-titre sur la carte" placeholder="ex. 32 utilisateurs" help="Un fait court, écrit sous le nom." />
          </div>
          <div class="mc-scr-ed-sec">
            <span class="mc-over">Flux</span>
            <div class="mc-rel">
              <button v-for="f in nodeFlows" :key="f.id" type="button" class="row l-applicatif mc-scr-ed-rowbtn" @click="selected = f.id">
                <span class="tile"><McIcon :name="f.both ? 'flow' : 'arrow-right'" size="sm" /></span>
                <span class="grow">{{ f.label || 'Sans libellé' }}</span>
                <span class="mc-cap">{{ f.source === selNode.id ? 'vers ' + (nodeById(f.target)?.name ?? '') : 'de ' + (nodeById(f.source)?.name ?? '') }}</span>
              </button>
              <p v-if="!nodeFlows.length" class="mc-cap mc-scr-ed-none">Aucun flux. Outil « Relier » pour en tracer un.</p>
            </div>
            <McButton variant="ghost" size="sm" icon="link" class="mc-scr-ed-start" @click="tool = 'link'; linkFrom = selNode.id">Relier à un autre objet</McButton>
          </div>
        </template>

        <!-- Domaine -->
        <div v-else-if="selected === 'Scolarité'" class="mc-scr-ed-sec l-fonctionnel">
          <div class="mc-scr-ed-head">
            <span class="mc-scr-ed-tile"><McIcon name="folder" size="lg" /></span>
            <div><b class="title">Scolarité</b><span class="mc-cap">Domaine · objet principal de la carte</span></div>
          </div>
          <p class="mc-cap mc-scr-ed-none">Le domaine principal vient du modèle : il ne se retire pas de la carte. Ses applications s’y rangent d’elles-mêmes.</p>
        </div>

        <McEmptyState v-else size="compact" icon="cursor" title="Rien n’est sélectionné" text="Cliquez sur une application ou un flux pour le modifier, ou ajoutez un objet depuis la barre du bas." />
      </template>

      <div v-else-if="panelTab === 'affichage'" class="mc-scr-ed-sec">
        <span class="mc-over">Affichage de la carte</span>
        <McToggleGroup
          v-model="density"
          label="Densité des nœuds"
          :options="[
            { value: 'default', label: 'Détaillée' },
            { value: 'compact', label: 'Compacte' },
          ]"
        />
        <McSwitch v-model="visible.libelles" label="Libellés des flux" help="Écrit la liaison et la fréquence sur chaque lien." block />
        <McSwitch v-model="showGrid" label="Trame de points" block />
      </div>

      <div v-else class="mc-scr-ed-sec">
        <span class="mc-over">Règles de couleur</span>
        <McSelect v-model="lensDefault" label="Lentille à l’ouverture" :options="lensOptions" help="Les lecteurs peuvent en changer depuis la barre d’outils." />
        <McSwitch v-model="lensInToolbar" label="Proposer les lentilles aux lecteurs" block />
      </div>
    </aside>

    <!-- Barre d'édition -->
    <div class="mc-float mc-toolbar mc-scr-ed-tools" role="toolbar" aria-label="Outils d’édition">
      <McIconButton icon="cursor" size="lg" label="Sélection" shortcut="V" :variant="tool === 'select' ? 'on' : 'default'" @click="tool = 'select'" />
      <McIconButton icon="hand" size="lg" label="Main" shortcut="H" :variant="tool === 'hand' ? 'on' : 'default'" @click="tool = 'hand'" />
      <span class="mc-sep" aria-hidden="true" />
      <McIconButton icon="plus" size="lg" label="Ajouter un objet" shortcut="A" @click="addNode" />
      <McIconButton icon="link" size="lg" label="Relier deux objets" shortcut="R" :variant="tool === 'link' ? 'on' : 'default'" @click="startLink" />
      <McIconButton icon="sticky" size="lg" label="Post-it" @click="addNote" />
      <span class="mc-sep" aria-hidden="true" />
      <McButton variant="ghost" icon="layers" class="mc-scr-ed-ico" title="Réorganiser" @click="reorganize"><span class="mc-scr-ed-lbl2">Réorganiser</span></McButton>
      <span class="mc-sep" aria-hidden="true" />
      <McIconButton icon="undo" size="lg" label="Annuler" shortcut="⌘Z" :disabled="!history.length" @click="undo" />
    </div>

    <p v-if="tool === 'link'" class="mc-float mc-scr-ed-hint" role="status">
      <McIcon name="link" size="sm" />{{ linkFrom ? `Source : ${nodeById(linkFrom)?.name}. Cliquez sur la cible.` : 'Cliquez sur la source du flux.' }}
      <McButton variant="ghost" size="sm" @click="tool = 'select'">Arrêter</McButton>
    </p>

    <McToastHost :offset="88" />
  </div>
</template>

<style>
.mc-scr-ed { --ed-lw: 248px; --ed-rw: var(--panel-w); position: relative; width: 100%; height: 100vh; min-height: 640px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-ed.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-ed.is-link .mc-canvas-layer .mc-node { cursor: crosshair; }
.mc-scr-ed.no-grid .mc-canvas-root { background-image: none; }
.mc-scr-ed .mc-canvas-layer > .mc-scr-ed-abs { position: absolute; margin: 0; z-index: 1; }
.mc-scr-ed .mc-canvas-layer > .mc-node { z-index: 1; touch-action: none; transition: left .2s ease-out, top .2s ease-out; }
.mc-scr-ed .mc-canvas-layer > .mc-flow { transition: top .2s ease-out; }
.mc-scr-ed .mc-canvas-layer > .mc-scr-ed-note { z-index: 2; width: 200px; }
.mc-scr-ed .mc-node.is-link-from { box-shadow: 0 0 0 2px var(--accent); }
.mc-scr-ed-grow { flex: 1; min-width: 0; }
.mc-scr-ed .mc-canvas-layer > .mc-scr-ed-lbl { position: absolute; z-index: 1; pointer-events: none; white-space: nowrap; }
.mc-scr-ed .mc-scr-ed-lbl.is-sel { border-color: var(--accent); color: var(--accent); }

.mc-scr-ed-drop { position: absolute; width: 230px; height: 120px; box-sizing: border-box; display: flex; align-items: center; justify-content: center; gap: 8px; border: 1.5px dashed var(--accent); border-radius: 12px; background: color-mix(in srgb, var(--accent) 6%, transparent); color: var(--accent); font: 13px/18px var(--font-sans); cursor: pointer; }
.mc-scr-ed-drop:hover { background: color-mix(in srgb, var(--accent) 12%, transparent); }
.mc-scr-ed-drop:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.mc-scr-ed-top { position: absolute; left: 16px; right: 16px; top: 16px; height: 52px; display: flex; align-items: center; gap: 10px; padding: 0 10px 0 8px; box-sizing: border-box; z-index: 7; }
.mc-scr-ed-title { display: grid; min-width: 0; }
.mc-scr-ed-title b { font: 600 14px/18px var(--font-display); color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-ed-title > span { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; line-height: 14px; color: var(--ink-subtle); white-space: nowrap; }
.mc-scr-ed-title > span.is-dirty { color: var(--status-warn); }
.mc-scr-ed-title .mc-ico { width: 12px; height: 12px; }
.mc-scr-ed-zoom { min-width: 48px; height: var(--control-sm); border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink-muted); font: 600 12px/16px var(--font-sans); font-variant-numeric: tabular-nums; cursor: pointer; }
.mc-scr-ed-zoom:hover { background: var(--surface-sunken); color: var(--ink); }

.mc-scr-ed-layers { position: absolute; left: 16px; top: 84px; bottom: 16px; width: var(--ed-lw); z-index: 6; padding: 10px; box-sizing: border-box; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
.mc-scr-ed-layers > .mc-hr { width: 100%; margin: 6px 0; }
.mc-scr-ed-over { padding: 8px 8px 2px; }
.mc-scr-ed-ly { display: flex; align-items: center; gap: 8px; min-height: 30px; padding: 0 2px 0 8px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: 13px/18px var(--font-sans); text-align: left; flex: none; }
.mc-scr-ed-ly .mc-scr-ed-grow { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-ed-ld { width: 8px; height: 8px; border-radius: 2px; background: var(--lc); flex: none; }
.mc-scr-ed-ly.is-off { color: var(--ink-subtle); }
.mc-scr-ed-ly.is-off .mc-scr-ed-ld { opacity: .45; }
.mc-scr-ed-ly.is-sub { padding-left: 26px; cursor: pointer; }
.mc-scr-ed-ly.is-sub:hover { background: var(--surface-sunken); }
.mc-scr-ed-ly.is-sel { background: var(--accent-soft); font-weight: 600; }
.mc-scr-ed-ly.is-sub:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mc-scr-ed-none { margin: 0; padding: 0 8px; }
.mc-scr-ed-start { align-self: flex-start; justify-self: start; }

.mc-scr-ed-panel { position: absolute; right: 16px; top: 84px; bottom: 16px; width: var(--ed-rw); z-index: 6; box-sizing: border-box; overflow-y: auto; }
.mc-scr-ed-sec { display: grid; gap: 10px; padding: 14px 16px; border-top: 1px solid var(--line); }
.mc-scr-ed-sec:first-child { border-top: 0; padding-bottom: 0; }
.mc-scr-ed-panel > .mc-empty { padding: 32px 16px; }
.mc-scr-ed-head { display: flex; gap: 10px; align-items: center; }
.mc-scr-ed-head > div { display: grid; flex: 1; min-width: 0; }
.mc-scr-ed-head .title { font-size: 15px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-ed-head .mc-code { color: var(--ink-subtle); }
.mc-scr-ed-tile { width: 36px; height: 36px; border-radius: 10px; background: var(--ls); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-ed-grid { gap: 10px; }
.mc-scr-ed-rowbtn { width: 100%; border: 0; color: var(--ink); font: inherit; font-size: 13px; text-align: left; cursor: pointer; }
.mc-scr-ed-rowbtn:hover { background: var(--accent-soft); }
.mc-scr-ed-rowbtn .mc-cap { flex: none; }

.mc-scr-ed-tools { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 6; }
.mc-scr-ed-hint { position: absolute; left: 50%; bottom: 80px; transform: translateX(-50%); z-index: 6; margin: 0; display: flex; align-items: center; gap: 8px; padding: 6px 6px 6px 12px; font-size: 13px; color: var(--ink); white-space: nowrap; }
.mc-scr-ed-hint > .mc-ico { color: var(--accent); }

/* Écran plus étroit : le panneau de gauche et celui de droite se resserrent. */
@media (max-width: 1360px) {
  .mc-scr-ed { --ed-lw: 224px; --ed-rw: 300px; }
}
/* Jusqu'à 1280 px : la barre d'édition se centre entre les deux panneaux, « Réorganiser » et « Aperçu » passent en icônes. */
@media (max-width: 1280px) {
  .mc-scr-ed-tools, .mc-scr-ed-hint { left: calc(50% + (var(--ed-lw) - var(--ed-rw)) / 2); }
  .mc-scr-ed-lbl2 { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  .mc-scr-ed .mc-btn.mc-scr-ed-ico { width: var(--control-md); padding: 0; }
}
@media (max-width: 1100px) {
  .mc-scr-ed { --ed-lw: 208px; --ed-rw: 288px; }
}
</style>
