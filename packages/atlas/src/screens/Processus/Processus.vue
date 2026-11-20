<script setup lang="ts">
// Écran « Processus » : la cartographie des macro-processus (pilotage, réalisation, support),
// puis le diagramme BPMN d'un processus, dont les magasins de données sont des applications.
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import McPanelTransition from '../../components/McPanelTransition/McPanelTransition.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McNode from '../../components/McNode/McNode.vue'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McBpmnDiagram from '../../components/McBpmnDiagram/McBpmnDiagram.vue'
import type { McBpmnModel } from '../../components/McBpmnDiagram/bpmn'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McLegend, { type McLegendItem, type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McCheckbox from '../../components/McCheckbox/McCheckbox.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import SharePanel, { type ExportItem } from '../shared/SharePanel.vue'
import { copyLink, ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { getApplication, slugOf } from '../../data/applications'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { maxFitFor } from '../Infrastructure/canvasView'
import { BPMN_DIAGRAMS, MACROS, type Macro, type Proc } from '../../data/processus'

const toast = useToast()

/* ---------- Macro-processus ---------- */
const macros = reactive<Macro[]>(MACROS.map((m) => ({ ...m, processes: m.processes.map((pr) => ({ ...pr })) })))
const families = [
  { id: 'pilotage', label: 'Pilotage' },
  { id: 'realisation', label: 'Réalisation' },
  { id: 'support', label: 'Support' },
] as const
const processCount = macros.reduce((n, m) => n + m.processes.length, 0)
const allProcs = computed(() => macros.flatMap((m) => m.processes.map((pr) => ({ pr, code: pr.code, name: pr.name, macro: m }))))
/** « de » élidé devant une voyelle ou un h muet : « d’Achat de fournitures », « de Gestion ». */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöùûüh]/i.test(name) ? `d’${name}` : `de ${name}`)
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* ---------- Diagramme « Achat de fournitures » (S1.6) ---------- */
const achat: McBpmnModel = {
  lanes: [
    { id: 'dem', label: 'Service demandeur' },
    { id: 'bud', label: 'Budget et marchés' },
    { id: 'cpt', label: 'Comptabilité et moyens' },
  ],
  nodes: [
    { id: 'start', kind: 'start', lane: 'dem', x: 90, y: 120, label: 'Besoin en fournitures' },
    { id: 'demande', kind: 'task', lane: 'dem', x: 209, y: 120, label: 'Faire une demande d’achat' },
    { id: 'liste', kind: 'data', lane: 'dem', x: 209, y: 38, label: 'Liste des fournitures' },
    { id: 'approuver', kind: 'task', lane: 'bud', x: 309, y: 120, label: 'Approuver un achat' },
    { id: 'amande', kind: 'store', lane: 'bud', x: 309, y: 187, label: 'AMANDE' },
    { id: 'valide', kind: 'gateway', lane: 'bud', x: 436, y: 120, label: 'Commande validée ?' },
    { id: 'rejet', kind: 'end', lane: 'dem', x: 560, y: 80, label: 'Demande rejetée' },
    { id: 'commande', kind: 'task', lane: 'bud', x: 577, y: 120, label: 'Passer une commande' },
    { id: 'carambole', kind: 'store', lane: 'bud', x: 577, y: 187, label: 'CARAMBOLE' },
    { id: 'reception', kind: 'task', lane: 'dem', x: 717, y: 120, label: 'Réceptionner une livraison' },
    { id: 'bl', kind: 'data', lane: 'dem', x: 876, y: 120, label: 'Bon de livraison' },
    { id: 'facture', kind: 'task', lane: 'cpt', x: 717, y: 138, label: 'Enregistrer une facture' },
    { id: 'factu', kind: 'data', lane: 'cpt', x: 616, y: 40, label: 'Données de facturation' },
    { id: 'payer', kind: 'task', lane: 'cpt', x: 889, y: 138, label: 'Payer une facture' },
    { id: 'mandat', kind: 'data', lane: 'cpt', x: 889, y: 40, label: 'Mandat de paiement' },
    { id: 'maracuja', kind: 'store', lane: 'cpt', x: 1018, y: 138, label: 'MARACUJA' },
    { id: 'clore', kind: 'task', lane: 'bud', x: 889, y: 120, label: 'Clore une commande' },
    { id: 'fin', kind: 'end', lane: 'bud', x: 1024, y: 120, label: 'Achat terminé' },
  ],
  flows: [
    { from: 'start', to: 'demande', kind: 'sequence' },
    { from: 'demande', to: 'approuver', kind: 'sequence' },
    { from: 'approuver', to: 'valide', kind: 'sequence' },
    { from: 'valide', to: 'rejet', kind: 'sequence', label: 'non' },
    { from: 'valide', to: 'commande', kind: 'sequence', label: 'oui' },
    { from: 'commande', to: 'reception', kind: 'sequence' },
    { from: 'reception', to: 'facture', kind: 'sequence' },
    { from: 'facture', to: 'payer', kind: 'sequence' },
    { from: 'payer', to: 'clore', kind: 'sequence' },
    { from: 'clore', to: 'fin', kind: 'sequence' },
    { from: 'liste', to: 'demande', kind: 'association' },
    { from: 'approuver', to: 'amande', kind: 'association' },
    { from: 'commande', to: 'carambole', kind: 'association' },
    { from: 'reception', to: 'bl', kind: 'association' },
    { from: 'factu', to: 'facture', kind: 'association' },
    { from: 'payer', to: 'mandat', kind: 'association' },
    { from: 'payer', to: 'maracuja', kind: 'association' },
  ],
}
/** Diagrammes BPMN par code de processus (en mémoire) : celui des achats, puis ceux créés depuis l'inspecteur. */
const diagrams = reactive<Record<string, { title: string; model: McBpmnModel }>>({ 'S1.6': { title: 'Achat de fournitures', model: achat } })
const hasDiagram = (code: string) => !!diagrams[code]
const TASK_X0 = 250
const TASK_STEP = 170
/** Diagramme minimal d'un processus : début → tâches → fin, dans un seul couloir. */
function layoutSimple(code: string, laneLabel: string, taskLabels: string[]): McBpmnModel {
  const tasks = taskLabels.map((label, i) => ({ id: `${code}-t${i + 1}`, kind: 'task' as const, lane: 'acteur', x: TASK_X0 + i * TASK_STEP, y: 120, label }))
  const endX = TASK_X0 + taskLabels.length * TASK_STEP - 20
  const ids = ['start', ...tasks.map((t) => t.id), 'end']
  return {
    lanes: [{ id: 'acteur', label: laneLabel }],
    nodes: [
      { id: 'start', kind: 'start', lane: 'acteur', x: 110, y: 120, label: 'Début' },
      ...tasks,
      { id: 'end', kind: 'end', lane: 'acteur', x: endX, y: 120, label: 'Fin' },
    ],
    flows: ids.slice(1).map((to, i) => ({ from: ids[i], to, kind: 'sequence' as const })),
  }
}
// Les diagrammes simples enregistrés (liste « Diagrammes BPMN »).
for (const d of BPMN_DIAGRAMS) if (d.lane && d.tasks) diagrams[d.code] = { title: d.title, model: layoutSimple(d.code, d.lane, d.tasks) }
/** Diagrammes créés ici : on peut leur ajouter des tâches (5 au plus, pour tenir dans la largeur). */
const created = reactive(new Set<string>())
const MAX_TASKS = 5

interface StoreApp {
  name: string
  type: string
  statut: string
  description: string
  task: string
  taskId: string
  others: string[]
  domaine: string
  editeur: string
}
// Ce que la cartographie sait de chaque application vient de sa fiche (source unique src/data/applications.ts).
const storeApp = (name: string, task: string, taskId: string, others: string[]): StoreApp => {
  const a = getApplication(name)
  return {
    name,
    type: a?.nature ?? 'Application',
    statut: a?.statut ?? 'Non renseigné',
    description: a?.description ? `${a.description}.` : 'Description non renseignée.',
    task,
    taskId,
    others,
    domaine: a?.domaines[0] ?? 'Non renseigné',
    editeur: a?.fournisseur ?? a?.editeur ?? 'Non renseigné',
  }
}
const storeApps: Record<string, StoreApp> = {
  amande: storeApp('AMANDE', 'Approuver un achat', 'approuver', ['S1.3 Gestion financière et comptable']),
  carambole: storeApp('CARAMBOLE', 'Passer une commande', 'commande', ['S1.3 Gestion financière et comptable']),
  maracuja: storeApp('MARACUJA', 'Payer une facture', 'payer', ['S1.3 Gestion financière et comptable', 'P1.2 Pilotage budgétaire et contrôle de gestion']),
}

/* ---------- Vue et sélection ---------- */
const view = ref<string>('macro')
const views = computed<TabItem[]>(() => [
  { value: 'macro', label: 'Macro-processus', icon: 'layers' },
  { value: 'diagramme', label: 'Diagramme', icon: 'process' },
])
const selectedProc = ref<string | null>(null)
const selectedStore = ref<string | null>('carambole')
/** Tâche du diagramme ouverte dans l'inspecteur (pour la renommer). */
const selectedTask = ref<string | null>(null)
/** Processus dont le diagramme est affiché. */
const diagramCode = ref('S1.6')
watch([view, diagramCode], () => fit())

const diagram = computed(() => diagrams[diagramCode.value] ?? diagrams['S1.6'])
const diagramProc = computed(() => allProcs.value.find((x) => x.code === diagramCode.value))
const tasks = computed(() => diagram.value.model.nodes.filter((n) => n.kind === 'task').length)
const stores = computed(() => diagram.value.model.nodes.filter((n) => n.kind === 'store').length)
/** Formes mises en avant par la légende (isolement d'un type d'élément). */
const highlightKind = ref<string | null>(null)

const model = computed<McBpmnModel>(() => {
  const m = diagram.value.model
  const s = selectedStore.value ? storeApps[selectedStore.value] : undefined
  return {
    ...m,
    nodes: m.nodes.map((n) => ({ ...n, selected: n.id === selectedStore.value || n.id === s?.taskId || n.id === selectedTask.value || (highlightKind.value === n.kind && view.value === 'diagramme') })),
  }
})

function showDiagram(code: string) {
  diagramCode.value = code
  selectedStore.value = null
  selectedTask.value = null
  view.value = 'diagramme'
}
function openProcess(code: string) {
  if (hasDiagram(code) && !editing.value) {
    showDiagram(code)
    if (code === 'S1.6') selectedStore.value = 'carambole'
  } else selectedProc.value = code
}
const procObj = computed(() => allProcs.value.find((x) => x.code === selectedProc.value))
const store = computed(() => (selectedStore.value && diagram.value.model.nodes.some((n) => n.id === selectedStore.value) ? storeApps[selectedStore.value] : undefined))
const taskNode = computed(() => diagram.value.model.nodes.find((n) => n.id === selectedTask.value && n.kind === 'task'))

const inspected = computed<InspectedObject | undefined>(() => {
  if (view.value === 'diagramme') {
    const s = store.value
    if (s) return { name: s.name, type: s.type, layer: 'applicatif', icon: 'app', description: s.description }
    const t = taskNode.value
    if (t) return { name: t.label, type: 'Tâche', layer: 'metier', icon: 'process' }
    return { name: diagram.value.title, type: 'Diagramme BPMN', layer: 'metier', icon: 'process' }
  }
  const pr = procObj.value
  return pr ? { name: `${pr.code} ${pr.name}`, type: 'Processus', layer: 'metier', icon: 'process' } : undefined
})
function closeInspector() {
  if (view.value === 'diagramme') {
    if (selectedStore.value || selectedTask.value) {
      selectedStore.value = null
      selectedTask.value = null
    } else view.value = 'macro'
  } else selectedProc.value = null
}

/* ---------- Créer un diagramme, renommer ses tâches, en ajouter ---------- */
function createDiagram(code: string) {
  const pr = allProcs.value.find((x) => x.code === code)
  if (!pr) return
  if (hasDiagram(code)) return showDiagram(code)
  diagrams[code] = { title: pr.name, model: layoutSimple(code, 'Acteur à définir', ['À définir']) }
  created.add(code)
  showDiagram(code)
  selectedTask.value = `${code}-t1`
  toast.success(`Diagramme ${de(pr.name)} créé : nommez sa première tâche.`)
}
function renameTask(label: string) {
  const t = diagram.value.model.nodes.find((n) => n.id === selectedTask.value)
  if (t) t.label = label
}
function renameLane(label: string) {
  const lane = diagram.value.model.lanes[0]
  if (lane) lane.label = label
}
const canAddTask = computed(() => created.has(diagramCode.value) && tasks.value < MAX_TASKS)
function addTask() {
  const code = diagramCode.value
  const m = diagram.value.model
  const labels = m.nodes.filter((n) => n.kind === 'task').map((n) => n.label)
  diagram.value.model = layoutSimple(code, m.lanes[0]?.label ?? 'Acteur à définir', [...labels, 'Nouvelle tâche'])
  selectedStore.value = null
  selectedTask.value = `${code}-t${labels.length + 1}`
}
function removeTask() {
  const code = diagramCode.value
  const m = diagram.value.model
  const labels = m.nodes.filter((n) => n.kind === 'task' && n.id !== selectedTask.value).map((n) => n.label)
  if (!labels.length) return toast.info('Un diagramme garde au moins une tâche : renommez-la plutôt.')
  diagram.value.model = layoutSimple(code, m.lanes[0]?.label ?? 'Acteur à définir', labels)
  selectedTask.value = null
}
function deleteDiagram() {
  const code = diagramCode.value
  if (!created.has(code)) return
  const name = diagram.value.title
  delete diagrams[code]
  created.delete(code)
  diagramCode.value = 'S1.6'
  view.value = 'macro'
  selectedProc.value = code
  toast.success(`Diagramme ${de(name)} supprimé`)
}
const diagramTasks = computed<RelationGroup[]>(() => [
  {
    verb: 'Tâches',
    items: diagram.value.model.nodes.filter((n) => n.kind === 'task').map((n) => ({ id: n.id, name: n.label, layer: 'metier' as const, icon: 'process' as const })),
    ...(canAddTask.value ? { addLabel: 'Ajouter une tâche' } : {}),
  },
  ...(stores.value
    ? [{ verb: 'Applications utilisées', items: diagram.value.model.nodes.filter((n) => n.kind === 'store').map((n) => ({ id: n.id, name: n.label, layer: 'applicatif' as const, icon: 'app' as const })) }]
    : []),
])
function onDiagramRelation(item: RelationItem) {
  const id = String(item.id)
  if (item.layer === 'applicatif') {
    selectedTask.value = null
    selectedStore.value = id
  } else {
    selectedStore.value = null
    selectedTask.value = id
  }
}
/** Applications associées à la tâche ouverte. */
const taskStores = computed<RelationGroup[]>(() => {
  const t = taskNode.value
  if (!t) return []
  const m = diagram.value.model
  const ids = m.flows.filter((f) => f.kind === 'association' && (f.from === t.id || f.to === t.id)).map((f) => (f.from === t.id ? f.to : f.from))
  const items = m.nodes.filter((n) => ids.includes(n.id) && n.kind === 'store').map((n) => ({ id: n.id, name: n.label, layer: 'applicatif' as const, icon: 'app' as const }))
  return [{ verb: 'Outillée par', items, emptyLabel: 'Aucune application associée' }]
})

/* ---------- Mode modification : renommer les processus ---------- */
const editing = ref(false)
const renamed = new Set<string>()
function toggleEdit() {
  if (editing.value) {
    editing.value = false
    toast.success(renamed.size ? `Processus enregistrés : ${plural(renamed.size, 'processus renommé', 'processus renommés')}` : 'Aucune modification à enregistrer')
    renamed.clear()
    return
  }
  editing.value = true
  if (view.value === 'macro' && !selectedProc.value) selectedProc.value = allProcs.value[0]?.code ?? null
  toast.info(view.value === 'macro' ? 'Cliquez sur un processus pour le renommer dans le panneau de droite.' : 'Cliquez sur une tâche dans le panneau de droite pour la renommer.')
}
function renameProc(name: string) {
  const pr = procObj.value?.pr
  if (!pr) return
  pr.name = name
  renamed.add(pr.code)
  if (diagrams[pr.code] && created.has(pr.code)) diagrams[pr.code].title = name
}

/* ---------- Filtres et légende ---------- */
const filterOpen = ref(false)
const famOn = reactive<Record<string, boolean>>({ pilotage: true, realisation: true, support: true })
const withDiagram = ref(false)
const withoutDiagram = ref(false)
const legend = ref(false)
const isolated = ref<string | null>(null)
const filterActive = computed(() => !famOn.pilotage || !famOn.realisation || !famOn.support || withDiagram.value || withoutDiagram.value)
function clearFilters() {
  famOn.pilotage = famOn.realisation = famOn.support = true
  withDiagram.value = withoutDiagram.value = false
}
function keepProc(pr: Proc) {
  const d = hasDiagram(pr.code)
  if ((withDiagram.value || isolated.value === 'with') && !d) return false
  if ((withoutDiagram.value || isolated.value === 'without') && d) return false
  return true
}
const shownMacros = computed(() =>
  macros.filter((m) => famOn[m.family]).map((m) => ({ m, processes: m.processes.filter(keepProc) })).filter((x) => x.processes.length),
)
const shownFamilies = computed(() => families.filter((f) => shownMacros.value.some((x) => x.m.family === f.id)))
const shownCount = computed(() => shownMacros.value.reduce((n, x) => n + x.processes.length, 0))
watch([shownCount, () => shownMacros.value.length], () => view.value === 'macro' && fit())
watch(isolated, (k) => {
  highlightKind.value = view.value === 'diagramme' ? k : null
})
watch(view, () => {
  isolated.value = null
  highlightKind.value = null
})
const legendSections = computed<McLegendSection[]>(() => {
  if (view.value === 'macro') {
    const withD = allProcs.value.filter((x) => hasDiagram(x.code)).length
    return [
      { title: 'Types', items: [{ id: 'macro', label: 'Macro-processus', count: macros.length, layer: 'metier' }, { id: 'proc', label: 'Processus', count: allProcs.value.length, layer: 'metier' }] },
      {
        title: 'Diagramme BPMN',
        items: [
          { id: 'with', label: 'Avec un diagramme', count: withD, status: 'ok' },
          { id: 'without', label: 'Sans diagramme', count: allProcs.value.length - withD, status: 'unknown' },
        ],
      },
    ]
  }
  const n = (k: string) => diagram.value.model.nodes.filter((x) => x.kind === k).length
  return [
    {
      title: 'Éléments BPMN',
      items: ([
        { id: 'start', label: 'Début', count: n('start'), layer: 'metier' },
        { id: 'task', label: 'Tâche', count: n('task'), layer: 'metier' },
        { id: 'gateway', label: 'Passerelle exclusive', count: n('gateway'), layer: 'metier' },
        { id: 'data', label: 'Objet de données', count: n('data'), layer: 'fonctionnel' },
        { id: 'store', label: 'Application (magasin de données)', count: n('store'), layer: 'applicatif' },
        { id: 'end', label: 'Fin', count: n('end'), layer: 'metier' },
      ] as McLegendItem[]).filter((i) => i.count),
    },
    { title: 'Couloirs', items: diagram.value.model.lanes.map((l) => ({ id: `lane-${l.id}`, label: l.label, count: diagram.value.model.nodes.filter((x) => x.lane === l.id).length, layer: 'metier' as const })) },
  ]
})

function openFilters() {
  // Les filtres portent sur la cartographie : depuis un diagramme, on y revient.
  if (view.value === 'diagramme') {
    view.value = 'macro'
    filterOpen.value = true
  } else filterOpen.value = !filterOpen.value
}

/* ---------- Partager et exporter ---------- */
const share = ref<{ open: boolean; title: string; items: ExportItem[]; link?: string }>({ open: false, title: '', items: [] })
function exportView() {
  if (view.value === 'macro')
    share.value = { open: true, title: 'Cartographie des processus', items: shownMacros.value.flatMap((x) => x.processes.map((pr) => ({ name: `${pr.code} ${pr.name}`, layer: 'metier' as const }))) }
  else
    share.value = {
      open: true,
      title: `Diagramme ${de(diagram.value.title)}`,
      items: diagram.value.model.nodes.filter((n) => n.kind === 'task' || n.kind === 'store').map((n) => ({ name: n.label, layer: n.kind === 'store' ? ('applicatif' as const) : ('metier' as const) })),
      link: new URL(pathHref(`/processus?diagramme=${diagramCode.value}`), window.location.origin).href,
    }
}

/* ---------- Menus « Plus d'actions » ---------- */
const menu = ref<{ open: boolean; x: number; y: number; kind: 'proc' | 'store' | 'diagram' }>({ open: false, x: 0, y: 0, kind: 'proc' })
const menuItems = computed<(ContextMenuItem | 'separator')[]>(() => {
  if (menu.value.kind === 'store')
    return [
      { id: 'fiche', label: 'Ouvrir la fiche', icon: 'external' },
      { id: 'supplier', label: 'Voir son fournisseur', icon: 'building' },
      { id: 'link', label: 'Copier le lien de la fiche', icon: 'link' },
      'separator',
      { id: 'detach', label: 'Retirer du diagramme', icon: 'trash', danger: true },
    ]
  if (menu.value.kind === 'diagram')
    return [
      { id: 'macro', label: 'Revenir aux macro-processus', icon: 'layers' },
      { id: 'link', label: 'Copier le lien du diagramme', icon: 'link' },
      { id: 'export', label: 'Exporter le diagramme', icon: 'export' },
      ...(created.has(diagramCode.value) ? ['separator' as const, { id: 'delete', label: 'Supprimer le diagramme', icon: 'trash' as const, danger: true }] : []),
    ]
  const code = selectedProc.value ?? ''
  return [
    { id: 'rename', label: 'Renommer le processus', icon: 'pencil' },
    { id: 'diagram', label: hasDiagram(code) ? 'Ouvrir le diagramme' : 'Créer le diagramme', icon: hasDiagram(code) ? 'process' : 'plus' },
    { id: 'org', label: 'Voir l’organigramme', icon: 'org' },
    'separator',
    { id: 'link', label: 'Copier le lien', icon: 'link' },
    { id: 'export', label: 'Exporter le processus', icon: 'export' },
  ]
})
function openMenu(e: MouseEvent, kind: 'proc' | 'store' | 'diagram') {
  const r = root.value!.getBoundingClientRect()
  const b = (e.currentTarget as HTMLElement).getBoundingClientRect()
  menu.value = { open: true, kind, x: Math.max(8, Math.min(b.right - r.left - 260, r.width - 268)), y: Math.min(b.bottom - r.top + 6, r.height - 260) }
}
async function copied(path: string, what: string) {
  const ok = await copyLink(path)
  if (ok) toast.success(`Lien ${what} copié dans le presse-papiers`)
  else toast.info('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
}
function onMenu(item: ContextMenuItem) {
  const kind = menu.value.kind
  if (kind === 'store') {
    const s = store.value
    if (!s) return
    if (item.id === 'fiche') goFiche(s.name)
    else if (item.id === 'supplier') goPath(`/fournisseurs?nom=${encodeURIComponent(s.editeur)}`)
    else if (item.id === 'link') copied(`/fiche/${slugOf(s.name)}`, `vers la fiche ${de(s.name)}`)
    else if (item.id === 'detach') {
      const id = selectedStore.value!
      const m = diagram.value.model
      m.nodes = m.nodes.filter((n) => n.id !== id)
      m.flows = m.flows.filter((f) => f.from !== id && f.to !== id)
      selectedStore.value = null
      toast.success(`${s.name} retirée du diagramme ${de(diagram.value.title)}`)
    }
    return
  }
  if (kind === 'diagram') {
    if (item.id === 'macro') view.value = 'macro'
    else if (item.id === 'link') copied(`/processus?diagramme=${diagramCode.value}`, `vers le diagramme ${de(diagram.value.title)}`)
    else if (item.id === 'export') exportView()
    else if (item.id === 'delete') deleteDiagram()
    return
  }
  const pr = procObj.value
  if (!pr) return
  if (item.id === 'rename') {
    if (!editing.value) toggleEdit()
    nextTick(() => document.querySelector<HTMLInputElement>('.mc-scr-proc-rename input')?.select())
  } else if (item.id === 'diagram') createDiagram(pr.code)
  else if (item.id === 'org') goPath('/organigramme')
  else if (item.id === 'link') copied(`/processus?processus=${pr.code}`, `vers ${pr.code}`)
  else if (item.id === 'export')
    share.value = {
      open: true,
      title: `Processus ${pr.code} ${pr.name}`,
      items: [{ name: `${pr.code} ${pr.name}`, layer: 'metier' }, ...(diagrams[pr.code]?.model.nodes.filter((n) => n.kind === 'task' || n.kind === 'store').map((n) => ({ name: n.label, layer: n.kind === 'store' ? ('applicatif' as const) : ('metier' as const) })) ?? [])],
      link: new URL(pathHref(`/processus?processus=${pr.code}`), window.location.origin).href,
    }
}

/* ---------- Adresse : /processus?processus=M1.2 sélectionne, ?diagramme=S1.6 ouvre le diagramme ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    const d = typeof q.diagramme === 'string' ? q.diagramme.toUpperCase() : ''
    const pc = typeof q.processus === 'string' ? q.processus.toUpperCase() : ''
    if (d && hasDiagram(d)) showDiagram(d)
    else if (pc && allProcs.value.some((x) => x.code === pc)) {
      view.value = 'macro'
      selectedProc.value = pc
    }
  },
  { immediate: true },
)
const procInfos = computed<KeyValueItem[]>(() => {
  const pr = procObj.value
  if (!pr) return []
  return [
    { key: 'Macro-processus', value: `${pr.macro.code} ${pr.macro.name}` },
    { key: 'Famille', value: families.find((f) => f.id === pr.macro.family)?.label },
    { key: 'Pilote', value: null },
  ]
})
const storeGroups = computed<RelationGroup[]>(() => {
  const s = store.value
  if (!s) return []
  return [
    { verb: 'Dans ce processus', items: [{ id: s.taskId, name: s.task, layer: 'metier', icon: 'process' }] },
    { verb: 'Dans d’autres processus', items: s.others.map((o) => ({ id: o, name: o, layer: 'metier' as const, icon: 'process' as const })) },
    { verb: 'Domaine', items: [{ name: s.domaine, layer: 'fonctionnel', icon: 'folder' }] },
    { verb: 'Fournie par', items: [{ name: s.editeur, layer: 'applicatif', icon: 'building' }] },
  ]
})
function onStoreRelation(item: RelationItem) {
  const id = String(item.id ?? '')
  if (/^[PMS]\d\.\d/.test(id)) {
    view.value = 'macro'
    selectedProc.value = id.split(' ')[0]
  } else if (item.icon === 'folder') goPath(`/explorateur?domaine=${encodeURIComponent(item.name)}`)
  else if (item.layer === 'applicatif') goPath(`/fournisseurs?nom=${encodeURIComponent(item.name)}`)
  else if (item.layer === 'metier' && id) {
    // La tâche outillée par l'application : on l'ouvre dans l'inspecteur.
    selectedStore.value = null
    selectedTask.value = id
  }
}
function onDiagramSelect(id: string) {
  selectedTask.value = null
  selectedStore.value = selectedStore.value === id ? null : id
}

/* ---------- Barre du haut ---------- */
/** Ouvert depuis la liste « Diagrammes BPMN » (?depuis=diagrammes) : le fil d'Ariane y ramène. */
const fromList = computed(() => routeQuery.value.depuis === 'diagrammes')
const trail = computed<TrailStep[]>(() =>
  fromList.value && view.value === 'diagramme'
    ? [{ label: 'Diagrammes BPMN', icon: 'process' }, { label: diagram.value.title }]
    : view.value === 'macro'
      ? [{ label: 'Accueil' }, { label: 'Processus' }]
      : [
          { label: 'Accueil' },
          { label: 'Processus', layer: 'metier' },
          { label: diagramCode.value === 'S1.6' ? 'S1.6 Gestion des achats' : `${diagramCode.value} ${diagramProc.value?.name ?? ''}`, layer: 'metier' },
          { label: diagram.value.title },
        ],
)
function onTrail(_s: TrailStep, i: number) {
  if (fromList.value && view.value === 'diagramme') {
    if (i === 0) goPath('/diagrammes')
    return
  }
  if (i === 0) goPath('/')
  else if (view.value === 'diagramme' && i === 1) view.value = 'macro'
  else if (view.value === 'diagramme' && i === 2) {
    view.value = 'macro'
    selectedProc.value = diagramCode.value
  }
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}

/* ---------- Zoom, déplacement, recadrage ---------- */
const TOP = 132
const LEFT = 24
const BPMN_W = 1080
const BPMN_H = 720
const root = ref<HTMLElement>()
const macroEl = ref<HTMLElement>()
const zoom = ref(1)
const pan = ref({ x: LEFT, y: TOP })
const tool = ref<'select' | 'hand'>('select')
const size = ref({ w: 1440, h: 900 })
const panelW = computed(() => (inspected.value ? 320 + 32 : 0))
const macroW = computed(() => Math.max(720, (size.value.w - LEFT - 16 - panelW.value) / zoom.value))
async function fit() {
  if (view.value === 'diagramme') {
    const availW = size.value.w - LEFT - 16 - 320 - 32
    const availH = size.value.h - TOP - 80
    zoom.value = Math.max(0.4, Math.round(Math.min(maxFitFor(size.value.w, size.value.h), availW / BPMN_W, availH / Math.max(BPMN_H / 3, diagram.value.model.lanes.length * (BPMN_H / 3))) * 100) / 100)
  } else {
    for (let i = 0; i < 3; i++) {
      await nextTick()
      const h = macroEl.value?.offsetHeight ?? 0
      if (!h) break
      // Sur un grand écran, la cartographie grandit (130 % au plus) au lieu de s'étirer en largeur.
      const z = Math.max(0.5, Math.round(Math.min(maxFitFor(size.value.w, size.value.h), (size.value.h - TOP - 80) / h) * 100) / 100)
      if (z === zoom.value) break
      zoom.value = z
    }
  }
  pan.value = { x: LEFT, y: TOP }
}
let ro: ResizeObserver | undefined
onMounted(() => {
  const el = root.value!
  size.value = { w: el.clientWidth, h: el.clientHeight }
  fit()
  ro = new ResizeObserver(() => {
    const next = { w: el.clientWidth, h: el.clientHeight }
    if (next.w === size.value.w && next.h === size.value.h) return
    size.value = next
    fit()
  })
  ro.observe(el)
})
onBeforeUnmount(() => ro?.disconnect())
watch(() => view.value === 'macro' && !!inspected.value, () => view.value === 'macro' && fit())

let drag: { x: number; y: number; px: number; py: number } | null = null
function onPointerDown(e: PointerEvent) {
  if (tool.value !== 'hand' && e.button !== 1) return
  if ((e.target as HTMLElement).closest('.mc-float, .mc-tabs, .mc-scr-proc-bar')) return
  drag = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function onPointerMove(e: PointerEvent) {
  if (drag) pan.value = { x: drag.px + e.clientX - drag.x, y: drag.py + e.clientY - drag.y }
}
function onPointerUp() {
  drag = null
}
function onWheel(e: WheelEvent) {
  if ((e.target as HTMLElement).closest('.mc-float')) return
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) zoom.value = Math.round(Math.min(2, Math.max(0.4, zoom.value * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100
  else pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
}
function deselect() {
  if (view.value === 'diagramme') {
    selectedStore.value = null
    selectedTask.value = null
  } else selectedProc.value = null
}
</script>

<template>
  <div
    ref="root"
    class="mc-scr-proc mc-scr-map"
    :class="{ 'is-hand': tool === 'hand' }"
    :style="{ '--map-right': panelW ? panelW + 'px' : '16px' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" :label="view === 'macro' ? 'Cartographie des macro-processus' : `Diagramme BPMN ${diagram.title}`" @deselect="deselect" @fit="fit">
      <!-- Macro-processus : pilotage, réalisation, support -->
      <div v-if="view === 'macro'" ref="macroEl" class="mc-scr-proc-macro" :style="{ width: macroW + 'px' }" @click.self="selectedProc = null">
        <section v-for="f in shownFamilies" :key="f.id" class="mc-scr-proc-band" :aria-label="f.label">
          <p class="mc-over mc-scr-proc-family">{{ f.label }}</p>
          <div class="mc-scr-proc-row" :class="`is-${f.id}`">
            <McContainer
              v-for="x in shownMacros.filter((y) => y.m.family === f.id)"
              :key="x.m.code"
              class="mc-scr-proc-macrocard"
              :name="x.m.name"
              :type="x.m.code"
              layer="metier"
              icon="process"
              :count="x.processes.length"
              :count-label="`${x.processes.length} processus`"
              :collapsible="false"
            >
              <div class="mc-scr-proc-grid" :style="{ gridTemplateColumns: `repeat(${x.m.cols}, minmax(0, 1fr))` }">
                <McNode
                  v-for="pr in x.processes"
                  :key="pr.code"
                  layer="metier"
                  icon="process"
                  :type="pr.code"
                  :name="pr.name"
                  :subtitle="hasDiagram(pr.code) ? '1 diagramme BPMN' : 'Aucun diagramme'"
                  :selected="selectedProc === pr.code"
                  :title="pr.name"
                  @select="openProcess(pr.code)"
                  @open="openProcess(pr.code)"
                />
              </div>
            </McContainer>
          </div>
        </section>
        <div v-if="!shownMacros.length" class="mc-scr-proc-none">
          <McEmptyState icon="filter" layer="metier" title="Aucun processus ne correspond aux filtres" text="Cochez une autre famille ou retirez le filtre sur les diagrammes.">
            <template #action><McButton variant="outline" size="sm" icon="x" @click="clearFilters(); isolated = null">Effacer les filtres</McButton></template>
          </McEmptyState>
        </div>
      </div>

      <!-- Diagramme BPMN -->
      <div v-else class="mc-scr-proc-bpmn" :style="{ width: BPMN_W + 'px' }">
        <McBpmnDiagram :model="model" :title="diagram.title" :width="BPMN_W" @select="onDiagramSelect" />
      </div>

      <template #top>
        <div class="mc-scr-proc-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur les processus" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" :aria-expanded="share.open" @click="share.open ? (share.open = false) : exportView()"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton :variant="editing ? 'outline' : 'primary'" :icon="editing ? 'check' : 'pencil'" @click="toggleEdit">{{ editing ? 'Terminer' : 'Modifier' }}</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-proc-bar">
            <McTabs v-model="view" :tabs="views" variant="pill" aria-label="Vues des processus" />
            <template v-if="view === 'macro'">
              <span class="mc-cap">{{ filterActive || isolated ? `${shownCount} processus sur ${processCount}` : `${macros.length} macro-processus · ${processCount} processus` }}</span>
              <McButton variant="ghost" size="sm" icon="org" @click="goPath('/organigramme')">Organigramme</McButton>
            </template>
            <template v-else>
              <McTypeChip type="Diagramme BPMN" layer="metier" icon="process" />
              <span class="mc-cap">{{ plural(diagram.model.lanes.length, 'couloir', 'couloirs') }} · {{ plural(tasks, 'tâche', 'tâches') }} · {{ plural(stores, 'application', 'applications') }}</span>
            </template>
          </div>
        </div>
      </template>

      <template #right>
        <McPanelTransition>
          <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        </McPanelTransition>
        <McPanelTransition>
          <McInspector v-if="inspected" :key="view + (selectedStore ?? selectedTask ?? selectedProc ?? diagramCode)" :object="inspected" @close="closeInspector">
            <!-- Application d'un magasin de données -->
            <template v-if="view === 'diagramme' && store">
              <McRelationList :groups="storeGroups" @open="onStoreRelation" />
            </template>
            <!-- Tâche du diagramme : son libellé se modifie ici -->
            <template v-else-if="view === 'diagramme' && taskNode">
              <McTextField :model-value="taskNode.label" label="Libellé de la tâche" help="Un verbe à l’infinitif et un objet : « Approuver un achat »." @update:model-value="(v) => renameTask(String(v ?? ''))" />
              <McRelationList :groups="taskStores" @open="onDiagramRelation" />
              <div v-if="created.has(diagramCode)" class="mc-row mc-scr-proc-acts">
                <McButton size="sm" variant="outline" icon="chevron-left" @click="selectedTask = null">Tout le diagramme</McButton>
                <McButton size="sm" variant="ghost" icon="trash" @click="removeTask">Retirer la tâche</McButton>
              </div>
            </template>
            <!-- Le diagramme entier -->
            <template v-else-if="view === 'diagramme'">
              <McTextField v-if="created.has(diagramCode)" :model-value="diagram.model.lanes[0]?.label ?? ''" label="Acteur (couloir)" @update:model-value="(v) => renameLane(String(v ?? ''))" />
              <McRelationList :groups="diagramTasks" @open="onDiagramRelation" @add="addTask" />
              <p v-if="created.has(diagramCode) && !canAddTask" class="mc-cap">5 tâches au plus dans ce diagramme simple.</p>
            </template>
            <!-- Processus sans diagramme -->
            <template v-else-if="procObj">
              <McTextField v-if="editing" class="mc-scr-proc-rename" :model-value="procObj.pr.name" label="Nom du processus" @update:model-value="(v) => renameProc(String(v ?? ''))" />
              <McKeyValueList :items="procInfos" />
              <McButton v-if="hasDiagram(procObj.code)" size="sm" variant="outline" icon="process" @click="showDiagram(procObj.code)">Ouvrir le diagramme</McButton>
              <McEmptyState
                v-else
                size="compact"
                icon="process"
                layer="metier"
                title="Aucun diagramme BPMN"
                text="Dessinez le déroulé de ce processus pour relier ses tâches aux applications qui les outillent."
              >
                <template #action>
                  <McButton variant="outline" size="sm" icon="plus" @click="createDiagram(procObj.code)">Créer le diagramme</McButton>
                </template>
              </McEmptyState>
            </template>
            <template #statuses>
              <McStatusChip v-if="view === 'diagramme' && store" :status="store.statut === 'Active' ? 'ok' : 'neutral'" size="sm">{{ store.statut }}</McStatusChip>
              <McStatusChip v-else-if="view === 'diagramme' && !taskNode" size="sm">{{ diagramCode }}</McStatusChip>
            </template>
            <template #actions>
              <template v-if="view === 'diagramme' && store">
                <McButton size="sm" icon="external" :href="ficheHref(store.name)" @click.prevent="goFiche(store.name)">Ouvrir la fiche</McButton>
                <McIconButton size="sm" icon="more" label="Plus d’actions" @click="openMenu($event, 'store')" />
              </template>
              <template v-else-if="view === 'diagramme'">
                <McButton v-if="canAddTask" size="sm" variant="outline" icon="plus" @click="addTask">Ajouter une tâche</McButton>
                <McIconButton size="sm" icon="more" label="Plus d’actions" @click="openMenu($event, 'diagram')" />
              </template>
              <template v-else-if="procObj">
                <McButton v-if="hasDiagram(procObj.code)" size="sm" variant="outline" icon="process" @click="showDiagram(procObj.code)">Ouvrir le diagramme</McButton>
                <McButton v-else size="sm" variant="outline" icon="plus" @click="createDiagram(procObj.code)">Créer le diagramme</McButton>
                <McIconButton size="sm" icon="more" label="Plus d’actions" @click="openMenu($event, 'proc')" />
              </template>
            </template>
          </McInspector>
        </McPanelTransition>
      </template>

      <template #bottom>
        <div class="mc-scr-proc-bottom">
          <div v-if="filterOpen" class="mc-pop mc-scr-proc-filters" role="dialog" aria-label="Filtrer les processus">
            <div class="mc-row mc-scr-proc-filters-hd">
              <b>Filtrer les processus</b>
              <McIconButton size="sm" icon="x" label="Fermer les filtres" @click="filterOpen = false" />
            </div>
            <span class="mc-over">Famille</span>
            <McCheckbox v-model="famOn.pilotage">Pilotage (P)</McCheckbox>
            <McCheckbox v-model="famOn.realisation">Réalisation (M)</McCheckbox>
            <McCheckbox v-model="famOn.support">Support (S)</McCheckbox>
            <span class="mc-over">Diagramme BPMN</span>
            <McCheckbox v-model="withDiagram" :disabled="withoutDiagram">Avec un diagramme</McCheckbox>
            <McCheckbox v-model="withoutDiagram" :disabled="withDiagram">Sans diagramme</McCheckbox>
            <div class="mc-row mc-scr-proc-filters-hd">
              <span class="mc-cap">{{ plural(shownCount, 'processus affiché', 'processus affichés') }}</span>
              <McButton size="sm" variant="ghost" :disabled="!filterActive" @click="clearFilters">Effacer</McButton>
            </div>
          </div>
          <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" :filter-active="filterActive" :collaboration="false" :min-zoom="0.4" :max-zoom="2" @fit="fit" @filter="openFilters" />
        </div>
      </template>
    </McCanvas>

    <SharePanel v-if="share.open" class="mc-scr-proc-share" :title="share.title" :items="share.items" :notes="[]" :link="share.link" @close="share.open = false" />
    <McContextMenu v-model:open="menu.open" :items="menuItems" :header="menu.kind === 'store' ? store?.name : menu.kind === 'diagram' ? diagram.title : procObj?.code" :x="menu.x" :y="menu.y" @select="onMenu" />
    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-proc { position: relative; width: 100%; height: 100vh; min-height: 600px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-proc.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-proc-top { display: flex; flex-direction: column; gap: 16px; pointer-events: none; }
.mc-scr-proc-top > * { pointer-events: auto; }
.mc-scr-proc-bar { align-self: flex-start; display: flex; align-items: center; gap: 12px; }
.mc-scr-proc-macro, .mc-scr-proc-bpmn { position: absolute; left: 0; top: 0; }
.mc-scr-proc-macro { display: grid; gap: 14px; padding-bottom: 8px; }
.mc-scr-proc-band { display: grid; gap: 0; }
.mc-scr-proc-family { margin: 0 0 4px; color: var(--ink-subtle); }
.mc-scr-proc-row { display: grid; gap: 14px; align-items: start; }
.mc-scr-proc-row.is-pilotage { grid-template-columns: minmax(0, 1fr); }
.mc-scr-proc-row.is-realisation, .mc-scr-proc-row.is-support { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
.mc-scr-proc-macrocard { margin-top: 16px; }
.mc-scr-proc-macrocard > .gh b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-proc-macrocard > .gb { display: block; }
.mc-scr-proc-grid { display: grid; gap: 0 10px; }
.mc-scr-proc-grid > .mc-node { width: auto; min-width: 0; }
.mc-scr-proc-none { padding-top: 40px; display: flex; justify-content: center; }
.mc-scr-proc-bottom { position: relative; }
.mc-scr-proc-filters { position: absolute; bottom: calc(100% + 8px); left: 0; width: 280px; padding: 12px; display: grid; gap: 8px; z-index: 5; }
.mc-scr-proc-filters-hd { justify-content: space-between; gap: 8px; }
.mc-scr-proc-filters-hd b { font-size: 13px; }
.mc-scr-proc-filters .mc-over { margin-top: 4px; color: var(--ink-subtle); }
.mc-scr-proc-share { position: absolute; top: 76px; right: 16px; z-index: 40; }
.mc-scr-proc-acts { gap: 8px; flex-wrap: wrap; }
</style>
