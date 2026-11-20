<script setup lang="ts">
// Écran Explorateur : la liste des objets d'un type, à filtrer, trier, sélectionner, inspecter et modifier.
import { logoFor } from '../../logos/logoFor'
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import McTree, { type TreeNode } from '../../components/McTree/McTree.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort, RowKey } from '../../components/McDataTable/types'
import McBulkBar from '../../components/McBulkBar/McBulkBar.vue'
import McPagination from '../../components/McPagination/McPagination.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McModal from '../../components/McModal/McModal.vue'
import McSelect, { type McSelectOption as SelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McDicpBadge from '../../components/McDicpBadge/McDicpBadge.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import McInspector from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McCheckbox from '../../components/McCheckbox/McCheckbox.vue'
import McIcon from '../../icons/McIcon.vue'
import AdminNav from './AdminNav.vue'
import ImportPanel, { type ImportResult } from '../shared/ImportPanel.vue'
import AppEditModal from '../shared/AppEditModal.vue'
import { goToScreen } from './shell'
import { goFiche, goPath, inApp, pathHref } from '../bridge'
import { applications, blankRow, groupes, rowFromApp, sessionRows, typeInfo, typeTree, type AppRow, type Domaine, type Statut } from './data'
import { domainNames, getApplication, slugOf } from '../../data/applications'
import { deletedApps, moveToTrash } from '../../data/session'
import { downloadCsv, normCol, parseCsv } from './csv'

const toast = useToast()

/* ---------- Types d'objets ---------- */
const typeId = ref<string | null>('application')
const expanded = ref<string[]>(['applicatif'])
const typeQuery = ref('')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** L'arbre des types, avec le nombre d'applications de la session (créations, imports, suppressions). */
const liveTree = computed<TreeNode[]>(() =>
  typeTree.map((g) => (g.id === 'applicatif' ? { ...g, children: g.children?.map((c) => (c.id === 'application' ? { ...c, count: liveRows.value.length } : c)) } : g)),
)
const shownTree = computed<TreeNode[]>(() => {
  const q = norm(typeQuery.value.trim())
  if (!q) return liveTree.value
  return liveTree.value
    .map((g) => (norm(g.label).includes(q) ? g : { ...g, children: g.children?.filter((c) => norm(c.label).includes(q)) }))
    .filter((g) => g.children?.length)
})
const treeExpanded = computed({
  get: () => (typeQuery.value.trim() ? shownTree.value.map((g) => g.id) : expanded.value),
  set: (v: string[]) => {
    if (!typeQuery.value.trim()) expanded.value = v
  },
})
const type = computed(() => typeInfo[typeId.value ?? 'application'] ?? typeInfo.application)
/** Types qui ont leur propre écran : les choisir l'ouvre. */
const TYPE_SCREENS: Record<string, string> = {
  domaine: '/liens-domaines',
  processus: '/processus',
  acteur: '/organigramme',
  bloc: '/pos',
  fonction: '/pos',
  flux: '/carte',
  partenaire: '/carte',
  projet: '/projets',
  fournisseur: '/fournisseurs',
  contrat: '/contrats',
  machine: '/machines',
  composant: '/machines',
  logiciel: '/logiciels',
  diagramme: '/processus',
  tache: '/processus',
}
watch(typeId, (t, old) => {
  const to = t ? TYPE_SCREENS[t] : undefined
  if (!to) return
  goPath(to)
  typeId.value = old ?? 'application'
})
const isApps = computed(() => typeId.value === 'application')
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const indef = computed(() => (type.value.feminine ? 'une' : 'un'))
const newLabel = computed(() => `${type.value.feminine ? 'Nouvelle' : 'Nouveau'} ${type.value.one}`)

/* ---------- Données ---------- */
// Les lignes de la session (modifications, créations, imports gardés d'une visite à l'autre), sans les supprimées.
const rows = sessionRows
const today = () => new Date().toLocaleDateString('fr-FR')
const liveRows = computed(() => rows.value.filter((r) => !deletedApps.has(slugOf(r.name))))
const loading = ref(true)
const simulateError = ref(false)
const retrying = ref(false)
const errorText = computed(() => (simulateError.value ? 'Le serveur n’a pas répondu. Vérifiez votre connexion puis réessayez.' : undefined))
let loadTimer: ReturnType<typeof setTimeout> | undefined

function load(ms = 600) {
  loading.value = true
  clearTimeout(loadTimer)
  loadTimer = setTimeout(() => (loading.value = false), ms)
}
onMounted(() => load())
onBeforeUnmount(() => clearTimeout(loadTimer))

function retry() {
  retrying.value = true
  setTimeout(() => {
    retrying.value = false
    simulateError.value = false
    load(400)
  }, 900)
}

/* ---------- Recherche, filtres, tri, pages ---------- */
const query = ref('')
const view = ref('table')
watch(view, (v) => {
  if (v === 'carte') goToScreen('carte')
})

interface Filter {
  id: 'statut' | 'domaine' | 'validite' | 'import'
  label: string
  test: (r: AppRow) => boolean
}
/** Une ligne à qui il manque un champ obligatoire (mêmes règles que la fiche : la preuve est facultative). */
function rowInvalid(r: AppRow) {
  const fournisseur = getApplication(r.name)?.fournisseur
  return !r.statut || !r.nature || !r.description || !r.domaine || (!r.editeur && !fournisseur) || !r.hebergement || !r.miseEnService || !r.dicp.d || !r.dicp.i || !r.dicp.c
}
const invalidFilter = (): Filter => ({ id: 'validite', label: 'Non valides : champs obligatoires manquants', test: rowInvalid })
const domainFilter = (d: string): Filter => ({ id: 'domaine', label: `Domaine : ${d}`, test: (r) => r.domaine === d || !!getApplication(r.name)?.domaines.includes(d) })
const defaultFilters = (): Filter[] => [
  { id: 'statut', label: 'Statut : Active, Prévue', test: (r) => (['Active', 'Prévue'] as Statut[]).includes(r.statut) },
  { id: 'domaine', label: 'Domaine : Scolarité, Référentiel', test: (r) => (['Scolarité', 'Référentiel'] as Domaine[]).includes(r.domaine) },
]
// Toutes les applications par défaut ; « Filtrer » propose des filtres de départ.
const filters = ref<Filter[]>([])
const removeFilter = (id: Filter['id']) => (filters.value = filters.value.filter((f) => f.id !== id))
function clearAll() {
  filters.value = []
  query.value = ''
}
/** « Filtrer » : d'abord les filtres de départ, puis les non valides, puis les modèles de requête pour aller plus loin. */
function addFilters() {
  if (!filters.value.length) filters.value = defaultFilters()
  else if (!filters.value.some((f) => f.id === 'validite')) filters.value = [...filters.value, invalidFilter()]
  else goPath('/requetes')
}
const filterHint = computed(() =>
  !filters.value.length ? 'Ajouter les filtres de départ' : !filters.value.some((f) => f.id === 'validite') ? 'Ajouter le filtre « non valides »' : 'Composer une requête plus fine',
)

const filtered = computed(() => {
  if (!isApps.value) return []
  const q = norm(query.value.trim())
  return liveRows.value.filter(
    (r) => filters.value.every((f) => f.test(r)) && (!q || norm(`${r.name} ${r.description} ${r.nature}`).includes(q)),
  )
})

const sort = ref<DataTableSort | null>({ key: 'name', dir: 'asc' })
const obsRank = { critical: 0, warn: 1, unknown: 2, ok: 3 } as const
const sortValue = (r: AppRow, key: string): string | number | null => {
  if (key === 'obsolescence') return r.obsolescence ? obsRank[r.obsolescence.status] : null
  const v = (r as unknown as Record<string, unknown>)[key]
  return typeof v === 'number' || typeof v === 'string' ? v : null
}
const sorted = computed(() => {
  const s = sort.value
  if (!s) return filtered.value
  return [...filtered.value].sort((a, b) => {
    const va = sortValue(a, s.key)
    const vb = sortValue(b, s.key)
    if (va === null && vb === null) return 0
    if (va === null) return 1
    if (vb === null) return -1
    const c = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb), 'fr', { numeric: true, sensitivity: 'base' })
    return s.dir === 'asc' ? c : -c
  })
})

const page = ref(1)
const pageSize = ref(25)
const pageRows = computed(() => sorted.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
watch([query, filters, typeId], () => (page.value = 1))

const searchCount = computed(() => {
  const n = filtered.value.length
  return n ? `${n} résultat${n > 1 ? 's' : ''}` : 'Aucun résultat'
})

/* ---------- Colonnes : le nom toujours, les autres au choix ---------- */
const optionalColumns: DataTableColumn<AppRow>[] = [
  { key: 'nature', label: 'Nature', sortable: true },
  { key: 'statut', label: 'Statut', sortable: true },
  { key: 'obsolescence', label: 'Obsolescence', sortable: true, sortValue: (r) => sortValue(r, 'obsolescence') },
  { key: 'hebergement', label: 'Hébergement', sortable: true },
  { key: 'domaine', label: 'Domaine', sortable: true },
  { key: 'editeur', label: 'Éditeur', sortable: true },
  { key: 'groupe', label: 'Groupe propriétaire', sortable: true },
  { key: 'miseEnService', label: 'Mise en service', sortable: true },
  { key: 'machine', label: 'Machine', sortable: true },
  { key: 'description', label: 'Description', muted: true },
]
const DEFAULT_COLS = ['nature', 'statut', 'obsolescence', 'hebergement', 'description']
const visibleCols = ref<string[]>([...DEFAULT_COLS])
const colsOpen = ref(false)
const colsBox = ref<HTMLElement | null>(null)
function toggleCol(key: string, on: boolean) {
  visibleCols.value = on ? optionalColumns.map((c) => c.key).filter((k) => k === key || visibleCols.value.includes(k)) : visibleCols.value.filter((k) => k !== key)
}
function onColsDoc(e: PointerEvent) {
  if (colsOpen.value && colsBox.value && !colsBox.value.contains(e.target as Node)) colsOpen.value = false
}
function onColsKey(e: KeyboardEvent) {
  if (e.key === 'Escape') colsOpen.value = false
}
onMounted(() => {
  document.addEventListener('pointerdown', onColsDoc, true)
  document.addEventListener('keydown', onColsKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onColsDoc, true)
  document.removeEventListener('keydown', onColsKey)
})
const columns = computed<DataTableColumn<AppRow>[]>(() => [
  { key: 'name', label: cap(type.value.one), sortable: true },
  // En liste étroite, la description (texte long) laisse la place aux autres colonnes.
  ...optionalColumns.filter((c) => visibleCols.value.includes(c.key) && !(compact.value && c.key === 'description' && visibleCols.value.length > 1)),
])

/* ---------- Largeur : en dessous de 860px de liste, bascule compacte sans icônes-libellés ni description ---------- */
const mainEl = ref<HTMLElement | null>(null)
const compact = ref(false)
let ro: ResizeObserver | undefined
onMounted(() => {
  if (!mainEl.value || typeof ResizeObserver === 'undefined') return
  ro = new ResizeObserver(([e]) => (compact.value = e.contentRect.width < 860))
  ro.observe(mainEl.value)
})
onBeforeUnmount(() => ro?.disconnect())

/* ---------- Sélection ---------- */
const selected = ref<RowKey[]>([])
const selectedRows = computed(() => liveRows.value.filter((r) => selected.value.includes(r.id)))
watch(typeId, () => (selected.value = []))
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* ---------- Modification groupée : statut, hébergement, groupe pour toutes les lignes choisies ---------- */
const bulkOpen = ref(false)
const bulkForm = ref<{ statut: McSelectValue | null; hebergement: McSelectValue | null; groupe: McSelectValue | null }>({ statut: null, hebergement: null, groupe: null })
const bulkChanges = computed(() => Object.values(bulkForm.value).filter((v) => v !== null).length)
function bulkEdit() {
  if (selectedRows.value.length === 1) return openEdit(selectedRows.value[0])
  bulkForm.value = { statut: null, hebergement: null, groupe: null }
  bulkOpen.value = true
}
function applyBulk() {
  const ids = selectedRows.value.map((r) => r.id)
  const f = bulkForm.value
  const before = rows.value
  rows.value = rows.value.map((r) =>
    ids.includes(r.id)
      ? {
          ...r,
          ...(f.statut ? { statut: f.statut as Statut } : {}),
          ...(f.hebergement ? { hebergement: f.hebergement as AppRow['hebergement'], ...(f.hebergement === 'SaaS' ? { machine: '' } : {}) } : {}),
          ...(f.groupe ? { groupe: String(f.groupe) } : {}),
          modifiee: today(),
        }
      : r,
  )
  bulkOpen.value = false
  toast.success(`${plural(ids.length, 'application modifiée', 'applications modifiées')}`, { actionLabel: 'Annuler', onAction: () => (rows.value = before) })
}

/* ---------- Export : un vrai fichier CSV des lignes choisies, colonnes affichées ---------- */
const cellText = (r: AppRow, key: string): string => {
  if (key === 'obsolescence') return r.obsolescence?.label ?? ''
  const v = (r as unknown as Record<string, unknown>)[key]
  return v === null || v === undefined ? '' : String(v)
}
function bulkExport() {
  const list = selectedRows.value
  const cols = columns.value
  downloadCsv([cols.map((c) => c.label), ...list.map((r) => cols.map((c) => cellText(r, c.key)))], `applications-${list.length}-${new Date().toISOString().slice(0, 10)}.csv`)
  toast.success(`${plural(list.length, 'application exportée', 'applications exportées')} en CSV (lisible dans Excel)`)
}

/* ---------- Suppression : dans la corbeille, avec Annuler ---------- */
const trashNotice = ref(0)
function bulkDelete() {
  const removed = selectedRows.value
  const undoTrash = moveToTrash(removed.map((r) => r.name))
  selected.value = []
  if (inspected.value && removed.some((r) => r.id === inspected.value!.id)) inspectedId.value = null
  trashNotice.value += removed.length
  toast.success(`${plural(removed.length, 'application placée', 'applications placées')} dans la corbeille`, {
    actionLabel: 'Annuler',
    onAction: () => {
      undoTrash()
      trashNotice.value = Math.max(0, trashNotice.value - removed.length)
    },
  })
}

/* ---------- Import : les lignes du fichier deviennent des applications du tableau ---------- */
const importOpen = ref(false)
/** Le dernier fichier choisi ou déposé dans la fenêtre d'import (lu ici une fois l'import terminé). */
let pickedFile: File | null = null
function catchFile(e: Event) {
  if (!importOpen.value) return
  const t = e.target as HTMLInputElement | null
  if (e.type === 'change' && t?.type === 'file' && t.files?.[0]) pickedFile = t.files[0]
  if (e.type === 'drop') {
    const f = (e as DragEvent).dataTransfer?.files?.[0]
    if (f) pickedFile = f
  }
}
onMounted(() => {
  document.addEventListener('change', catchFile, true)
  document.addEventListener('drop', catchFile, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('change', catchFile, true)
  document.removeEventListener('drop', catchFile, true)
})
watch(importOpen, (o) => {
  if (o) pickedFile = null
})
/** Le fichier d'exemple de la fenêtre d'import : l'inventaire en cinq colonnes. */
const exampleTable = () => [['Nom', 'Statut', 'Hébergement', 'Editeur', 'Domaine fonctionnel'], ...applications.map((a) => [a.name, a.statut, a.hebergement, a.editeur ?? '', a.domaine])]
const pickValue = <T extends string>(v: string, list: readonly T[], fallback: T): T => list.find((x) => normCol(x) === normCol(v)) ?? list.find((x) => normCol(v) && normCol(x).startsWith(normCol(v).slice(0, 4))) ?? fallback
async function onImported(res: ImportResult) {
  const file = pickedFile && pickedFile.name === res.fileName && /\.csv$/i.test(pickedFile.name) ? pickedFile : null
  const table = file ? parseCsv(await file.text()) : exampleTable()
  const [head, ...lines] = table
  const col = (field: string) => {
    const name = Object.entries(res.mapping).find(([, f]) => f === field)?.[0]
    return name ? head.indexOf(name) : -1
  }
  const at = { nom: col('nom'), statut: col('statut'), nature: col('nature'), hebergement: col('hebergement'), editeur: col('editeur'), domaine: col('domaine'), description: col('description'), miseEnService: col('miseEnService') }
  const val = (line: string[], i: number) => (i >= 0 ? (line[i] ?? '').trim() : '')
  const before = rows.value
  let next = [...rows.value]
  let id = Math.max(...next.map((r) => r.id))
  let added = 0
  let updated = 0
  for (const line of lines) {
    const name = val(line, at.nom)
    if (!name) continue
    const patch: Partial<AppRow> = { modifiee: today() }
    if (val(line, at.statut)) patch.statut = /pr[eé]vu/i.test(val(line, at.statut)) ? 'Prévue' : 'Active'
    if (val(line, at.nature)) patch.nature = /module/i.test(val(line, at.nature)) ? 'Module applicatif' : 'Application'
    if (val(line, at.hebergement)) patch.hebergement = /saas/i.test(val(line, at.hebergement)) ? 'SaaS' : 'On-premise'
    if (val(line, at.editeur)) patch.editeur = val(line, at.editeur)
    if (val(line, at.domaine)) patch.domaine = pickValue(val(line, at.domaine), domainNames, val(line, at.domaine)) as Domaine
    if (val(line, at.description)) patch.description = val(line, at.description)
    if (val(line, at.miseEnService)) patch.miseEnService = val(line, at.miseEnService)
    const i = next.findIndex((r) => normCol(r.name) === normCol(name))
    if (i >= 0) {
      next[i] = { ...next[i], ...patch }
      deletedApps.delete(slugOf(next[i].name))
      updated++
    } else {
      next.push({ ...blankRow(++id), name, ...patch })
      added++
    }
  }
  rows.value = next
  // Les lignes du fichier, et elles seules, sous un filtre qu'on peut retirer.
  const names = new Set(lines.map((l) => normCol(val(l, at.nom))).filter(Boolean))
  filters.value = [{ id: 'import', label: `Importées : ${res.fileName}`, test: (r) => names.has(normCol(r.name)) }]
  query.value = ''
  const parts = []
  if (added) parts.push(plural(added, 'application ajoutée', 'applications ajoutées'))
  if (updated) parts.push(plural(updated, 'mise à jour', 'mises à jour'))
  toast.success(`Import de « ${res.fileName} » : ${parts.join(', ') || 'aucune ligne'}`, { actionLabel: 'Annuler', onAction: () => (rows.value = before) })
}

/* ---------- Inspecteur ---------- */
const inspectedId = ref<number | null>(null)
const inspected = computed(() => liveRows.value.find((r) => r.id === inspectedId.value) ?? null)
const inspTab = ref('infos')
const inspTabs = computed(() => [
  { value: 'infos', label: 'Informations' },
  { value: 'relations', label: 'Relations', count: relationGroups.value.reduce((n, g) => n + g.items.length, 0) },
  { value: 'historique', label: 'Historique' },
])
function inspect(r: AppRow) {
  inspectedId.value = r.id
}

const kvItems = computed<KeyValueItem[]>(() => {
  const r = inspected.value
  if (!r) return []
  return [
    { key: 'Statut', value: r.statut },
    { key: 'Nature', value: r.nature },
    { key: 'Domaine', value: r.domaine, href: '#domaine' },
    { key: 'Sécurité', value: 'dicp' },
    { key: 'Hébergement', value: r.hebergement },
    { key: 'Machine', value: r.machine, code: true, href: r.machine ? `/machines?id=${encodeURIComponent(r.machine)}` : undefined },
    { key: 'Mise en service', value: r.miseEnService },
    { key: 'Fin de service', value: r.finDeService },
    { key: 'Éditeur', value: r.editeur, href: r.editeur ? '/fournisseurs' : undefined },
    { key: 'Groupe propriétaire', value: r.groupe },
  ]
})

const relationGroups = computed<RelationGroup[]>(() => {
  const r = inspected.value
  if (!r) return []
  const all = liveRows.value
  const i = all.indexOf(r)
  const peers = Array.from({ length: Math.min(r.flux, 7) }, (_, k) => all[(i + 3 + k * 7) % all.length]).filter(
    (p, k, arr) => p.id !== r.id && arr.indexOf(p) === k,
  )
  return [
    {
      verb: 'Appartient à',
      items: [{ id: `d-${r.domaine}`, name: r.domaine, layer: 'metier', icon: 'folder' }],
      max: 1,
    },
    {
      verb: 'Hébergée sur',
      items: r.machine
        ? [
            { id: `m-${r.machine}`, name: r.machine, layer: 'technique', icon: 'server', meta: 'Production' },
            ...(r.obsolescence && r.obsolescence.status !== 'ok' && r.obsolescence.status !== 'unknown'
              ? [{ id: `s-${r.id}`, name: r.obsolescence.label, layer: 'technique' as const, icon: 'software' as const, status: r.obsolescence.status, statusLabel: r.obsolescence.status === 'critical' ? 'Obsolète' : 'Fin de support proche' }]
              : []),
          ]
        : [],
      addLabel: 'Ajouter une machine',
      emptyLabel: r.hebergement === 'SaaS' ? 'Hébergée en SaaS chez l’éditeur' : 'Aucune machine liée',
    },
    {
      verb: 'Échange avec',
      items: peers.map((p, k) => ({ id: p.id, name: p.name, layer: 'applicatif', icon: 'app', meta: `${1 + ((k * 2 + r.id) % 4)} flux` })),
      addLabel: 'Ajouter un flux',
      emptyLabel: 'Aucun flux déclaré',
    },
  ]
})
function openRelation(item: RelationItem) {
  const target = rows.value.find((r) => r.id === item.id)
  if (target) {
    inspTab.value = 'infos'
    inspect(target)
  } else if (item.icon === 'app') goFiche(item.name)
  else if (item.icon === 'folder') filterDomain(item.name)
  else if (item.icon === 'server') goPath(`/machines?id=${encodeURIComponent(item.name)}`)
  else if (item.icon === 'software') goPath(`/logiciels?id=${encodeURIComponent(item.name)}`)
}
/** Ajouter une relation : le formulaire s'ouvre sur la bonne section. */
function addRelation(verb: string) {
  if (!inspected.value) return
  openEdit(inspected.value, verb === 'Hébergée sur' ? 'hebergement' : 'relations')
}
function filterDomain(d: string) {
  filters.value = [...filters.value.filter((f) => f.id !== 'domaine'), domainFilter(d)]
}
function openKv(item: KeyValueItem, e: Event) {
  e.preventDefault()
  if (item.href === '#domaine' && item.value) filterDomain(String(item.value))
  else if (item.href) goPath(item.href)
}

const historyItems = computed<KeyValueItem[]>(() => {
  const r = inspected.value
  if (!r) return []
  return [
    { key: r.modifiee, value: 'Description modifiée par T. Naulet' },
    { key: r.creee, value: `Statut passé à « ${r.statut} » par L. Martin` },
    { key: r.creee, value: 'Créée par import Excel' },
  ]
})

function openFiche(r: AppRow | null = inspected.value) {
  if (r) goFiche(r.name)
}

/* ---------- Modale de modification (partagée avec les cartes et la fiche) ---------- */
const editor = ref<InstanceType<typeof AppEditModal>>()
function openEdit(r: AppRow, section?: string) {
  editor.value?.openEdit(r, section)
}
function openCreate(from?: AppRow) {
  if (!isApps.value) {
    // Les autres types se créent sur leur propre page.
    const to = TYPE_SCREENS[typeId.value ?? '']
    if (to) goPath(to)
    return
  }
  editor.value?.openCreate(from)
}
/** Options de la modification groupée. */
const opts = (list: string[]): SelectOption[] => list.map((v) => ({ value: v, label: v }))
const statutOptions = opts(['Active', 'Prévue'])
const groupeOptions = opts(groupes)
const hebergementOptions = opts(['On-premise', 'SaaS'])
function onSaved(r: AppRow, kind: 'edit' | 'added' | 'create') {
  if (kind === 'added') inspectedId.value = r.id
  if (kind === 'create') {
    inspectedId.value = r.id
    query.value = ''
    filters.value = []
  }
}

/* ---------- Adresse : /explorateur?filtre=non-valides, ?domaine=Scolarité, ?modifier=apogee, ?type=domaine ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    const f: Filter[] = []
    if (q.filtre === 'non-valides') f.push(invalidFilter())
    if (typeof q.domaine === 'string' && q.domaine) f.push(domainFilter(q.domaine))
    if (f.length) filters.value = f
    if (typeof q.q === 'string') query.value = q.q
    if (typeof q.type === 'string' && typeInfo[q.type]) typeId.value = q.type
    if (typeof q.modifier === 'string') {
      const slug = q.modifier
      const inTable = liveRows.value.find((x) => slugOf(x.name) === slug)
      const known = getApplication(slug)
      // Une application hors inventaire (citée par une carte) : elle rejoint le tableau à l'enregistrement.
      const r = inTable ?? (known ? rowFromApp(known, Math.max(...rows.value.map((x) => x.id)) + 1) : undefined)
      if (r && q.dupliquer) nextTick(() => openCreate(r))
      else if (r) {
        if (inTable) inspect(r)
        nextTick(() => openEdit(r))
      } else toast.error(`Aucune application « ${slug} » à modifier. Cherchez-la dans la liste.`)
    }
  },
  { immediate: true },
)


</script>

<template>
  <div class="mc-scr-explo">
    <AdminNav active="Explorateur" />

    <!-- Types d'objets -->
    <aside class="mc-scr-types" aria-label="Types d'objets">
      <McSearchField v-model="typeQuery" size="sm" placeholder="Filtrer les types" />
      <McTree v-model="typeId" v-model:expanded="treeExpanded" :nodes="shownTree" class="mc-scr-tree" />
      <p v-if="!shownTree.length" class="mc-cap mc-scr-none">Aucun type ne correspond à « {{ typeQuery }} ».</p>
      <span class="mc-scr-grow" />
      <div v-if="!inApp()" class="mc-scr-dev">
        <span class="mc-over">Démonstration</span>
        <McSwitch v-model="simulateError" label="Simuler une erreur de chargement" block />
      </div>
    </aside>

    <!-- Liste -->
    <main ref="mainEl" class="mc-scr-main" :class="{ 'is-compact': compact }">
      <header class="mc-scr-head">
        <div class="mc-scr-titles">
          <p class="mc-over">{{ type.layer }}</p>
          <h1 class="title-lg">{{ type.plural }}</h1>
        </div>
        <McSearchField
          v-model="query"
          class="mc-scr-search"
          :placeholder="`Rechercher ${indef} ${type.one}`"
          :count="query ? searchCount : undefined"
        />
        <McToggleGroup
          v-model="view"
          label="Affichage"
          :icon-only="compact"
          :options="[
            { value: 'table', label: 'Tableau', icon: 'list' },
            { value: 'carte', label: 'Carte', icon: 'map' },
          ]"
        />
        <McButton variant="outline" icon="upload" @click="importOpen = true">Importer</McButton>
        <McButton icon="plus" @click="openCreate()">{{ newLabel }}</McButton>
      </header>

      <div class="mc-scr-filters">
        <McButton variant="outline" size="sm" icon="filter" :title="filterHint" @click="addFilters">Filtrer</McButton>
        <McFilterChip v-for="f in filters" :key="f.id" :label="f.label" @remove="removeFilter(f.id)" />
        <McButton v-if="filters.length || query" variant="ghost" size="sm" @click="clearAll">Tout effacer</McButton>
        <a v-if="filters.some((f) => f.id === 'validite')" class="mc-scr-link" :href="pathHref('/requetes')" @click.prevent="goPath('/requetes')">Requête plus fine…</a>
        <span class="mc-scr-grow" />
        <span v-if="trashNotice" class="mc-scr-trashnote" role="status">
          <McIcon name="trash" size="sm" />{{ trashNotice }} placée{{ trashNotice > 1 ? 's' : '' }} dans la corbeille ·
          <a :href="pathHref('/corbeille')" @click.prevent="goPath('/corbeille')">Ouvrir la corbeille</a>
          <McIconButton size="sm" icon="x" label="Masquer" @click="trashNotice = 0" />
        </span>
        <div ref="colsBox" class="mc-scr-cols">
          <McButton variant="ghost" size="sm" icon="settings" :aria-expanded="colsOpen" @click="colsOpen = !colsOpen">Colonnes</McButton>
          <div v-if="colsOpen" class="mc-float mc-scr-colpop" role="dialog" aria-label="Colonnes affichées">
            <p class="mc-over">Colonnes affichées</p>
            <McCheckbox :model-value="true" disabled :label="`${cap(type.one)} (toujours)`" />
            <McCheckbox v-for="c in optionalColumns" :key="c.key" :model-value="visibleCols.includes(c.key)" :label="c.label" @update:model-value="(v: boolean) => toggleCol(c.key, v)" />
            <div class="mc-scr-colfoot">
              <McButton variant="ghost" size="sm" @click="visibleCols = [...DEFAULT_COLS]">Rétablir</McButton>
              <McButton variant="ghost" size="sm" @click="colsOpen = false">Fermer</McButton>
            </div>
          </div>
        </div>
      </div>

      <div class="mc-scr-tablezone">
        <McDataTable
          v-model:selected="selected"
          v-model:sort="sort"
          class="mc-scr-table"
          :columns="columns"
          :rows="pageRows"
          row-key="id"
          selectable
          icon="app"
          :logo="(r: AppRow) => logoFor(r.name, r.editeur)"
          layer="applicatif"
          :caption="type.plural"
          :local-sort="false"
          :loading="loading"
          :loading-rows="12"
          :error="errorText"
          :retrying="retrying"
          :empty-title="isApps ? 'Aucune application ne correspond à ces filtres' : `Les ${type.many} ont leur propre page`"
          :empty-text="isApps ? 'Modifiez la recherche ou retirez un filtre.' : 'Ouvrez-la pour les consulter et les modifier.'"
          @open="inspect"
          @retry="retry"
        >
          <template #cell-statut="{ row }">
            <McStatusChip size="sm">{{ row.statut }}</McStatusChip>
          </template>
          <template #cell-obsolescence="{ row }">
            <McStatusChip v-if="row.obsolescence" :status="row.obsolescence.status" size="sm">{{ row.obsolescence.label }}</McStatusChip>
            <span v-else class="mc-dt-nil">—</span>
          </template>
          <template #actions="{ row }">
            <McIconButton size="sm" icon="external" :label="`Ouvrir la fiche de ${row.name}`" @click="openFiche(row)" />
            <McIconButton size="sm" icon="pencil" :label="`Modifier ${row.name}`" @click="openEdit(row)" />
            <McIconButton size="sm" icon="more" :label="`Plus d'actions sur ${row.name}`" @click="inspect(row)" />
          </template>
          <template #empty-action>
            <McButton v-if="isApps" variant="outline" size="sm" icon="x" @click="clearAll">Effacer les filtres</McButton>
            <McButton v-else variant="outline" size="sm" icon="external" @click="openCreate()">Ouvrir la page des {{ type.many }}</McButton>
          </template>
        </McDataTable>

        <McBulkBar :count="selected.length" floating @clear="selected = []">
          <McButton variant="ghost" size="sm" icon="pencil" @click="bulkEdit">Modifier</McButton>
          <McButton variant="ghost" size="sm" icon="map" @click="goPath('/carte')">Voir sur une carte</McButton>
          <McButton variant="ghost" size="sm" icon="export" @click="bulkExport">Exporter</McButton>
          <McButton variant="ghost" size="sm" icon="trash" @click="bulkDelete">Supprimer</McButton>
        </McBulkBar>

        <Transition name="mc-scr-insp">
          <McInspector
            v-if="inspected"
            v-model:tab="inspTab"
            class="mc-scr-insp"
            :object="{ name: inspected.name, type: 'Application', layer: 'applicatif', icon: 'app', logo: logoFor(inspected.name, inspected.editeur), description: inspected.description }"
            :tabs="inspTabs"
            @close="inspectedId = null"
          >
            <template #statuses>
              <McStatusChip size="sm">{{ inspected.statut }}</McStatusChip>
              <McStatusChip v-if="inspected.obsolescence && inspected.obsolescence.status === 'critical'" status="critical" size="sm">Infra obsolète</McStatusChip>
            </template>
            <template #actions>
              <McButton size="sm" variant="secondary" icon="external" @click="openFiche()">Ouvrir la fiche</McButton>
              <McButton size="sm" variant="outline" icon="pencil" @click="openEdit(inspected)">Modifier</McButton>
              <McIconButton size="sm" icon="map" label="Voir sur une carte" @click="goToScreen('carte')" />
            </template>
            <template #default="{ tab }">
              <McKeyValueList
                v-if="tab === 'infos'"
                :items="kvItems"
                :meta="[`Créée le ${inspected.creee} par T. Naulet`, `Modifiée le ${inspected.modifiee}`]"
                @open="openKv"
              >
                <template #value="{ item }">
                  <McStatusChip v-if="item.key === 'Statut'" size="sm">{{ item.value }}</McStatusChip>
                  <McDicpBadge v-else-if="item.key === 'Sécurité'" v-bind="inspected.dicp" />
                  <span v-else-if="item.value === undefined || item.value === null || item.value === ''" class="mc-scr-empty">Non renseigné</span>
                  <a v-else-if="item.href" :href="item.href" class="mc-kv-link" :class="{ 'mc-code': item.code }" @click="openKv(item, $event)">{{ item.value }}</a>
                  <template v-else>{{ item.value }}</template>
                </template>
              </McKeyValueList>
              <McRelationList v-else-if="tab === 'relations'" :groups="relationGroups" :visible="4" @open="openRelation" @add="addRelation" />
              <McKeyValueList v-else :items="historyItems" />
            </template>
          </McInspector>
        </Transition>
      </div>

      <McPagination
        v-if="isApps && !errorText"
        v-model:page="page"
        v-model:page-size="pageSize"
        :total="filtered.length"
        :noun="{ one: 'application', many: 'applications' }"
      />
    </main>

    <!-- Modification -->
    <AppEditModal ref="editor" @saved="onSaved" />

    <!-- Modification groupée -->
    <McModal
      v-model:open="bulkOpen"
      :title="`Modifier ${plural(selectedRows.length, 'application', 'applications')}`"
      :type="{ label: 'Application', icon: 'app', layer: 'applicatif' }"
      :subtitle="selectedRows.slice(0, 4).map((r) => r.name).join(', ') + (selectedRows.length > 4 ? '…' : '')"
      confirm-label="Appliquer"
      :confirm-disabled="!bulkChanges"
      :footer-note="bulkChanges ? `${plural(bulkChanges, 'champ changé', 'champs changés')} pour ${plural(selectedRows.length, 'application', 'applications')}` : 'Choisissez au moins un champ à changer'"
      :dirty="bulkChanges > 0"
      @confirm="applyBulk"
    >
      <div class="mc-scr-sec">
        <p class="mc-cap mc-scr-tip">Les champs laissés sur « Ne pas changer » gardent leur valeur dans chaque application.</p>
        <div class="mc-grid2">
          <McSelect v-model="bulkForm.statut" label="Statut" :options="statutOptions" clearable placeholder="Ne pas changer" />
          <McSelect v-model="bulkForm.hebergement" label="Mode d'hébergement" :options="hebergementOptions" clearable placeholder="Ne pas changer" :help="bulkForm.hebergement === 'SaaS' ? 'Les machines liées seront détachées.' : undefined" />
          <McSelect v-model="bulkForm.groupe" label="Groupe propriétaire" :options="groupeOptions" clearable placeholder="Ne pas changer" />
        </div>
      </div>
    </McModal>

    <ImportPanel v-model:open="importOpen" result-path="/explorateur" @imported="onImported" />

    <McToastHost :offset="64" />
  </div>
</template>

<style>
.mc-scr-explo { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-explo .mc-scr-grow { flex: 1; }

.mc-scr-types { width: 240px; flex: none; display: flex; flex-direction: column; gap: 10px; padding: 16px 12px; border-right: 1px solid var(--line); background: var(--surface); box-sizing: border-box; overflow-y: auto; }
.mc-scr-types .mc-scr-none { margin: 0; padding: 0 8px; }
.mc-scr-dev { display: grid; gap: 8px; padding: 10px 12px; border: 1px dashed var(--line-strong); border-radius: var(--radius-sm); font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-dev .mc-switch-row label { font-size: 12px; line-height: 16px; }

.mc-scr-main { flex: 1 1 600px; min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 20px 24px; box-sizing: border-box; height: 100%; }
.mc-scr-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-titles { flex: 1; min-width: 160px; }
.mc-scr-titles .mc-over { margin: 0 0 2px; }
.mc-scr-titles h1 { margin: 0; }
.mc-scr-search { width: 240px; }
.mc-scr-main.is-compact .mc-scr-search { width: 180px; }
.mc-scr-main.is-compact .mc-scr-titles { min-width: 120px; }
.mc-scr-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-link { font-size: 12px; color: var(--accent); }
.mc-scr-trashnote { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-trashnote a { color: var(--accent); }
.mc-scr-cols { position: relative; }
.mc-scr-colpop { position: absolute; right: 0; top: calc(100% + 6px); z-index: 30; width: 240px; padding: 12px; display: grid; gap: 8px; box-sizing: border-box; }
.mc-scr-colpop .mc-over { margin: 0 0 2px; }
.mc-scr-colfoot { display: flex; justify-content: space-between; border-top: 1px solid var(--line); padding-top: 8px; }

.mc-scr-tablezone { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.mc-scr-tablezone > .mc-scr-table { flex: 1; min-height: 0; overflow: auto; }
.mc-scr-tablezone .mc-table td.muted { width: 100%; max-width: 0; min-width: 140px; }

.mc-scr-insp { position: absolute; top: 0; right: 0; max-height: 100%; z-index: 12; }
.mc-scr-insp .body { overflow-y: auto; min-height: 0; }
.mc-scr-insp .mc-scr-empty { color: var(--ink-subtle); }
.mc-scr-insp-enter-active, .mc-scr-insp-leave-active { transition: opacity .16s ease-out, translate .16s ease-out; }
.mc-scr-insp-enter-from, .mc-scr-insp-leave-to { opacity: 0; translate: 12px 0; }

.mc-scr-tip { margin: 0; }

/* Petits écrans (menu en rail) : la liste des types s'affine et la page respire un peu moins. */
@media (max-width: 1179px) {
  .mc-scr-types { width: 212px; padding-inline: 10px; }
  .mc-scr-main { padding: 16px 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .mc-scr-insp-enter-active, .mc-scr-insp-leave-active { transition: none; }
}
</style>
