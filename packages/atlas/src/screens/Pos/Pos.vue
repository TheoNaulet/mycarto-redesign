<script setup lang="ts">
// Écran « POS complet » : le plan d'occupation des sols, zone par zone, lu par la lentille
// « Couverture applicative » : chaque îlot est teinté selon son nombre d'applications, les îlots vides sont les trous du SI.
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import McPanelTransition from '../../components/McPanelTransition/McPanelTransition.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McLensPicker from '../../components/McLensPicker/McLensPicker.vue'
import { MC_LENSES, NO_LENS, type McLens } from '../../components/McLensPicker/lenses'
import McMinimap, { type McMinimapBlock } from '../../components/McMinimap/McMinimap.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import { goFiche, goPath, pathHref } from '../bridge'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import SearchPalette from '../Accueil/SearchPalette.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McIcon from '../../icons/McIcon.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import MapAnnotations from '../Infrastructure/MapAnnotations.vue'
import MapShareDialog from '../Infrastructure/MapShareDialog.vue'
import MapEditBar from '../shared/MapEditBar.vue'
import { useMapEdit } from '../shared/mapEdit'
import type { ExportItem } from '../shared/SharePanel.vue'
import { applications } from '../../data/applications'
import { noteTexts } from '../../data/annotations'

const toast = useToast()
const paletteOpen = ref(false)
import { isNarrowWindow, useCanvasView } from '../Infrastructure/canvasView'

/* ---------- Données ---------- */
interface Ilot {
  name: string
  /** Applications de l'îlot, quand on les connaît ; sinon seulement leur nombre. */
  apps?: string[]
  n: number
}
interface Quartier {
  name: string
  ilots: Ilot[]
  /** Îlots vides non nommés sur la carte (« +N vides »). */
  moreEmpty: number
  description?: string
}
interface Zone {
  name: string
  side: 'left' | 'right'
  cols: 2 | 3
  quartiers: Quartier[]
}

const i = (name: string, n = 0, apps?: string[]): Ilot => ({ name, n, apps })
const ZONES = reactive<Zone[]>([
  {
    name: 'Support',
    side: 'left',
    cols: 3,
    quartiers: [
      { name: 'Ressources humaines', ilots: [i('Gestion prévisionnelle', 1), i('Proximité', 2), i('Carrière', 1), i('Paie', 1), i('Dossier personnel', 1), i('Quartier RH', 2), i('Pensions'), i('Recrutement')], moreEmpty: 9 },
      {
        name: 'Gestion des SI',
        description: 'Pilotage, connaissance et exploitation du système d’information.',
        ilots: [
          i('Gouvernance', 1, ['DIEGO']),
          i('Connaissance du parc', 1, ['GLPI']),
          i('Production', 1, ['RGRHUM']),
          i('Sécurité des SI', 1, ['NETBACKUP']),
          i('Quartier GSI', 2, ['QUICKCONNECT', 'PRESENCES', 'CT SYNCHRO']),
          i('Soutien utilisateurs'),
        ],
        moreEmpty: 3,
      },
      { name: 'Finances', ilots: [i('Actifs', 2), i('Paiement', 1), i('Comptabilité générale', 2), i('Budgétaire', 1), i('Dépense', 2), i('Projets', 1), i('Quartier Finances', 1)], moreEmpty: 3 },
      { name: 'Juridique', ilots: [i('Informatique et libertés', 1), i('Contentieux'), i('Conformité')], moreEmpty: 4 },
      { name: 'Documentation', ilots: [i('Gestion documentaire', 1), i('Courrier'), i('Archives')], moreEmpty: 6 },
      { name: 'Achat', ilots: [i('Quartier Achat', 3), i('Marchés')], moreEmpty: 2 },
      { name: 'Immobilier', ilots: [i('Biens immobiliers', 1), i('Services aux occupants')], moreEmpty: 2 },
      { name: 'Moyens généraux', ilots: [i('Abonnements'), i('Véhicules'), i('Logistique')], moreEmpty: 2 },
      { name: 'Sécurité', ilots: [i('Entreprises'), i('Personnes')], moreEmpty: 1 },
    ],
  },
  {
    name: 'Opération',
    side: 'left',
    cols: 3,
    quartiers: [
      {
        name: 'Enseignement supérieur',
        description: 'Vie de l’étudiant, de l’inscription au diplôme.',
        ilots: [i('Scolarité', 10, ['APOGEE', 'APOGEE WEB', 'UNICAMPUS', 'NOTES', 'CALCIUM', 'DIEGO', 'ALERTES-DIPLOMES', 'C2I', 'TROMBINOSCOPE', 'CELCAT']), i('Quartier', 1)],
        moreEmpty: 0,
      },
      { name: 'Scolarité de l’élève', ilots: [i('Inscriptions'), i('Orientation')], moreEmpty: 3 },
      { name: 'Recherche', ilots: [i('Quartier', 1)], moreEmpty: 0 },
      { name: 'Gestion financière des EPLE', ilots: [i('Quartier')], moreEmpty: 2 },
      { name: 'TIC pour l’éducation', ilots: [i('Quartier')], moreEmpty: 0 },
      { name: 'Action sociale et santé', ilots: [i('Quartier')], moreEmpty: 0 },
    ],
  },
  {
    name: 'Référentiels',
    side: 'right',
    cols: 2,
    quartiers: [
      { name: 'Profils et habilitations', ilots: [i('Quartier', 4)], moreEmpty: 0 },
      { name: 'Prestations et services', ilots: [i('Quartier', 2)], moreEmpty: 0 },
      { name: 'Administrations de l’État', ilots: [i('Structures', 1), i('Agents')], moreEmpty: 2 },
      { name: 'Usagers', ilots: [i('Groupes'), i('Personnes')], moreEmpty: 3 },
      { name: 'Nomenclatures', ilots: [i('NNO'), i('Budgétaires')], moreEmpty: 4 },
      { name: 'Fournisseurs et tiers', ilots: [i('Quartier')], moreEmpty: 0 },
    ],
  },
  {
    name: 'Pilotage et contrôle',
    side: 'right',
    cols: 2,
    quartiers: [
      { name: 'Performance et décisionnel', ilots: [i('Pilotage budgétaire', 1), i('Quartier', 1)], moreEmpty: 3 },
      { name: 'Audit et inspection', ilots: [i('Quartier')], moreEmpty: 0 },
      { name: 'Contrôle interne', ilots: [i('Quartier')], moreEmpty: 0 },
    ],
  },
  {
    name: 'Échange',
    side: 'right',
    cols: 2,
    quartiers: [
      { name: 'Communication interpersonnelle', ilots: [i('Échange d’information', 1), i('Messagerie et agenda', 1), i('Quartier', 1)], moreEmpty: 2 },
      { name: 'Échange usagers', ilots: [i('Quartier', 1)], moreEmpty: 3 },
      { name: 'Échange avec les administrations', ilots: [i('Relation administrative', 1)], moreEmpty: 2 },
    ],
  },
])

/* ---------- Mode modification (sur place) ---------- */
// « Modifier » rend le plan modifiable ici même : ajouter, renommer ou supprimer un quartier, gérer ses îlots.
const edit = useMapEdit<Zone[]>({ name: 'POS complet', get: () => ZONES, set: (v) => ZONES.splice(0, ZONES.length, ...v) })
const editing = edit.on

const appsOf = (q: Quartier) => q.ilots.reduce((s, x) => s + x.n, 0)
const ilotCount = (q: Quartier) => q.ilots.length + q.moreEmpty
const emptyCount = (q: Quartier) => q.ilots.filter((x) => x.n === 0).length + q.moreEmpty
const zoneApps = (z: Zone) => z.quartiers.reduce((s, q) => s + appsOf(q), 0)
const plural = (n: number, one: string, many = one + 's') => `${n} ${n > 1 ? many : one}`
const allQuartiers = computed(() => ZONES.flatMap((z) => z.quartiers.map((q) => ({ zone: z, q }))))
const stats = computed(() => ({
  zones: ZONES.length,
  quartiers: allQuartiers.value.length,
  apps: ZONES.reduce((s, z) => s + zoneApps(z), 0),
  ilots: allQuartiers.value.reduce((s, x) => s + ilotCount(x.q), 0),
  empty: allQuartiers.value.reduce((s, x) => s + emptyCount(x.q), 0),
  emptyQuartiers: allQuartiers.value.filter((x) => appsOf(x.q) === 0).length,
}))
const occupancy = computed(() => Math.round(((stats.value.ilots - stats.value.empty) / stats.value.ilots) * 100))

/** Teinte d'un îlot : 0 vide, 1, 2 à 3, 4 et plus. */
const shade = (n: number) => (n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : 3)

/* ---------- Lentille et légende ---------- */
const COVERAGE: McLens = { id: 'couverture', label: 'Couverture applicative', description: 'Applications par îlot', icon: 'pos', tone: 'ok' }
const LENSES = [MC_LENSES[0], COVERAGE]
const lens = ref(COVERAGE.id)
const lensOn = computed(() => lens.value !== NO_LENS)
// Écran étroit : la légende attend dans la barre d'outils, l'inspecteur garde la hauteur.
const legend = ref(!isNarrowWindow())
const isolated = ref<string | null>(null)
const showEmpty = ref(true)
watch(lens, (l) => {
  isolated.value = null
  legend.value = l !== NO_LENS
})
watch(showEmpty, (on) => {
  if (!on && isolated.value === 'ilot-vide') isolated.value = null
})
const legendSections = computed<McLegendSection[]>(() => [
  {
    title: `Îlots · ${occupancy.value} % occupés`,
    items: [
      { id: 'ilot-occupe', label: 'Avec au moins une application', count: stats.value.ilots - stats.value.empty, layer: 'applicatif' },
      { id: 'ilot-vide', label: 'Vides : les trous du SI', count: showEmpty.value ? stats.value.empty : 0, status: 'unknown' },
    ],
  },
  {
    title: 'Quartiers',
    items: [
      { id: 'quartier-couvert', label: 'Couverts', count: stats.value.quartiers - stats.value.emptyQuartiers, layer: 'fonctionnel' },
      { id: 'quartier-vide', label: 'Sans application', count: stats.value.emptyQuartiers, status: 'unknown' },
    ],
  },
])
const ilotDim = (x: Ilot) => (isolated.value === 'ilot-occupe' ? x.n === 0 : isolated.value === 'ilot-vide' ? x.n > 0 : false)
const quartierDim = (q: Quartier) => (isolated.value === 'quartier-couvert' ? appsOf(q) === 0 : isolated.value === 'quartier-vide' ? appsOf(q) > 0 : false)
const visibleIlots = (q: Quartier) => (showEmpty.value ? q.ilots : q.ilots.filter((x) => x.n > 0))

/* ---------- Sélection ---------- */
const collapsed = ref<Record<string, boolean>>({})
const selected = ref<string | null>('Gestion des SI')
/** Îlot sélectionné dans le quartier sélectionné (clic sur une puce du plan ou une ligne de l'inspecteur). */
const selectedIlot = ref<string | null>(null)
watch(selected, () => (selectedIlot.value = null))
const current = computed(() => allQuartiers.value.find((x) => x.q.name === selected.value))
const currentIlot = computed(() => (selectedIlot.value ? current.value?.q.ilots.find((x) => x.name === selectedIlot.value) : undefined))
const inspected = computed<InspectedObject | undefined>(() => {
  const c = current.value
  if (!c) return undefined
  const x = currentIlot.value
  if (x) return { name: x.name, type: 'Îlot', layer: 'fonctionnel', icon: 'pos', description: `Îlot du quartier ${c.q.name}, zone ${c.zone.name}.` }
  return { name: c.q.name, type: 'Quartier', layer: 'fonctionnel', icon: 'pos', description: c.q.description }
})
function selectIlot(q: Quartier, x: Ilot) {
  selected.value = q.name
  // Le watch sur `selected` remet l'îlot à zéro : on le pose après.
  nextTick(() => (selectedIlot.value = x.name))
}
/** Applications d'un îlot : celles qu'on connaît, puis le reste compté. */
const ilotGroups = computed<RelationGroup[]>(() => {
  const x = currentIlot.value
  if (!x) return []
  const known = x.apps ?? []
  const items: RelationItem[] = known.map((a) => ({ name: a, layer: 'applicatif', icon: 'app' }))
  if (x.n > known.length) items.push({ id: 'non-detaillees', name: plural(x.n - known.length, 'application non détaillée', 'applications non détaillées'), layer: 'applicatif', icon: 'list' })
  return [{ verb: 'Applications', items, emptyLabel: 'Aucune application' }]
})
const infos = computed<KeyValueItem[]>(() => {
  const c = current.value
  if (!c) return []
  return [
    { key: 'Zone', value: c.zone.name },
    { key: 'Îlots', value: `${ilotCount(c.q)}, dont ${plural(emptyCount(c.q), 'vide')}` },
    { key: 'Applications', value: appsOf(c.q) },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const c = current.value
  if (!c) return []
  const out: RelationGroup[] = []
  const unknown: RelationItem[] = []
  for (const x of c.q.ilots) {
    if (x.n === 0) continue
    if (x.apps && x.apps.length >= x.n) out.push({ verb: x.name, items: x.apps.map((a) => ({ name: a, layer: 'applicatif', icon: 'app' })) })
    else unknown.push({ id: `ilot:${x.name}`, name: x.name, layer: 'fonctionnel', icon: 'pos', meta: plural(x.n, 'application') })
  }
  if (unknown.length) out.push({ verb: 'Îlots occupés', items: unknown })
  const empty = c.q.ilots.filter((x) => x.n === 0)
  out.push({
    verb: 'Îlots vides',
    items: empty.map((x) => ({ id: `ilot:${x.name}`, name: x.name, layer: 'fonctionnel', icon: 'pos', status: 'unknown', statusLabel: 'Vide' })),
    emptyLabel: c.q.moreEmpty ? undefined : 'Aucun îlot vide',
  })
  if (c.q.moreEmpty) out[out.length - 1].items.push({ id: 'more', name: `${plural(c.q.moreEmpty, 'autre îlot', 'autres îlots')} sans application`, layer: 'fonctionnel', icon: 'pos' })
  return out
})
function openRelation(item: RelationItem) {
  const c = current.value
  if (item.icon === 'app') goFiche(item.name)
  else if (c && typeof item.id === 'string' && item.id.startsWith('ilot:')) {
    const x = c.q.ilots.find((y) => y.name === item.id!.toString().slice(5))
    if (x) selectIlot(c.q, x)
  } else if (c && item.id === 'more') openEdit(true)
  else if (item.id === 'non-detaillees') openPicker()
}

/* ---------- Rattacher une application ---------- */
const pickerOpen = ref(false)
const pickerIlot = ref<string | number | null>(null)
const pickerQuery = ref('')
const pickerApp = ref<string | null>(null)
const norm = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const pickerIlotOptions = computed<McSelectOption[]>(() => (current.value?.q.ilots ?? []).map((x) => ({ value: x.name, label: `${x.name} · ${x.n ? plural(x.n, 'application') : 'vide'}` })))
const pickerTarget = computed(() => current.value?.q.ilots.find((x) => x.name === pickerIlot.value))
const pickerList = computed(() => {
  const q = norm(pickerQuery.value.trim())
  const taken = new Set(pickerTarget.value?.apps ?? [])
  return [...applications]
    .filter((a) => !taken.has(a.name) && (!q || norm(a.name).includes(q) || norm(a.description ?? '').includes(q)))
    .sort((a, b) => Number(b.inventaire) - Number(a.inventaire) || a.name.localeCompare(b.name))
    .slice(0, 40)
})
function openPicker() {
  const c = current.value
  if (!c) return
  pickerIlot.value = currentIlot.value?.name ?? c.q.ilots.find((x) => x.n === 0)?.name ?? c.q.ilots[0]?.name ?? null
  pickerQuery.value = ''
  pickerApp.value = null
  pickerOpen.value = true
}
function attach() {
  const c = current.value
  const x = pickerTarget.value
  const name = pickerApp.value
  if (!c || !x || !name) return
  const before = { apps: x.apps ? [...x.apps] : undefined, n: x.n }
  edit.record()
  x.apps = [...(x.apps ?? []), name]
  x.n += 1
  pickerOpen.value = false
  selectIlot(c.q, x)
  toast.success(`${name} rattachée à l’îlot ${x.name} (${c.q.name})`, {
    actionLabel: 'Annuler',
    onAction: () => Object.assign(x, before),
  })
}

/* ---------- Modifier un quartier et ses îlots ---------- */
const editOpen = ref(false)
const editForm = reactive({ name: '', description: '', ilots: [] as { orig: string | null; name: string; n: number }[] })
let editOriginal = ''
async function openEdit(focusNew = false) {
  const c = current.value
  if (!c) return
  editForm.name = c.q.name
  editForm.description = c.q.description ?? ''
  editForm.ilots = c.q.ilots.map((x) => ({ orig: x.name, name: x.name, n: x.n }))
  editOriginal = JSON.stringify(editForm)
  editOpen.value = true
  if (focusNew) addIlotRow()
}
function addIlotRow() {
  editForm.ilots.push({ orig: null, name: '', n: 0 })
  nextTick(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>('.mc-scr-pos-edit-ilot input')
    inputs[inputs.length - 1]?.focus()
  })
}
function removeIlotRow(idx: number) {
  editForm.ilots.splice(idx, 1)
}
const editDirty = computed(() => editOpen.value && JSON.stringify(editForm) !== editOriginal)
const editError = computed(() => {
  if (!editForm.name.trim()) return 'Le quartier doit avoir un nom.'
  const c = current.value
  if (c && allQuartiers.value.some((x) => x.q !== c.q && x.q.name === editForm.name.trim())) return 'Un autre quartier porte déjà ce nom.'
  const names = editForm.ilots.map((x) => x.name.trim()).filter(Boolean)
  if (new Set(names).size !== names.length) return 'Deux îlots portent le même nom.'
  if (editForm.ilots.some((x) => x.orig && !x.name.trim())) return 'Un îlot existant doit garder un nom.'
  return ''
})
function saveEdit() {
  const c = current.value
  if (!c || editError.value) return
  const q = c.q
  edit.record()
  const byName = Object.fromEntries(q.ilots.map((x) => [x.name, x]))
  const added = editForm.ilots.filter((r) => !r.orig && r.name.trim()).length
  q.ilots = editForm.ilots
    .filter((r) => r.name.trim())
    .map((r) => (r.orig && byName[r.orig] ? Object.assign(byName[r.orig], { name: r.name.trim() }) : i(r.name.trim())))
  q.description = editForm.description.trim() || undefined
  const renamed = q.name !== editForm.name.trim()
  q.name = editForm.name.trim()
  if (renamed) selected.value = q.name
  editOpen.value = false
  toast.success(`Quartier ${q.name} enregistré${added ? ` · ${plural(added, 'îlot ajouté', 'îlots ajoutés')}` : ''}`)
}

/** Ajoute un quartier vide à une zone, puis ouvre sa fiche pour le nommer. */
function addQuartier(z?: Zone) {
  const zone = z ?? (current.value?.zone ?? ZONES[0])
  edit.record()
  let name = 'Nouveau quartier'
  for (let k = 2; allQuartiers.value.some((x) => x.q.name === name); k++) name = `Nouveau quartier ${k}`
  zone.quartiers.push({ name, ilots: [], moreEmpty: 0 })
  collapsed.value[zone.name] = false
  selected.value = name
  nextTick(() => openEdit(true))
}
function removeQuartier() {
  const c = current.value
  if (!c) return
  edit.record()
  c.zone.quartiers.splice(c.zone.quartiers.indexOf(c.q), 1)
  editOpen.value = false
  selected.value = null
  toast.success(`Quartier ${c.q.name} supprimé`, { actionLabel: 'Annuler', onAction: edit.undo })
}
/** En modification, un clic sur un quartier ouvre directement sa fiche. */
function onQuartier(q: Quartier) {
  if (!editing.value) return select(q)
  selected.value = q.name
  nextTick(() => openEdit())
}
function onAddIlot(q: Quartier) {
  selected.value = q.name
  nextTick(() => openEdit(true))
}

/* ---------- Exporter, post-its, commentaires ---------- */
const shareOpen = ref(false)
const exportItems = computed<ExportItem[]>(() => {
  const zones = ZONES.map((z) => ({ name: z.name, layer: 'fonctionnel' as const }))
  const quartiers = allQuartiers.value.map((x) => ({ name: x.q.name, layer: 'fonctionnel' as const }))
  const apps = allQuartiers.value.flatMap((x) => x.q.ilots.flatMap((y) => y.apps ?? [])).map((a) => ({ name: a, layer: 'applicatif' as const }))
  const all = [...zones, ...quartiers, ...apps]
  const k = selected.value ? all.findIndex((x) => x.name === selected.value) : -1
  return k > 0 ? [all[k], ...all.slice(0, k), ...all.slice(k + 1)] : all
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
function select(q: Quartier) {
  selected.value = selected.value === q.name ? null : q.name
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil', href: pathHref('/') }, { label: 'POS complet' }]
function onTrail(_s: TrailStep, idx: number) {
  if (idx === 0) goPath('/')
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

/* ---------- Zoom et vue d'ensemble ---------- */
const ZONES_X = 24
const ZONES_Y = 150
const ZONES_W = 1392
const zonesEl = ref<HTMLElement>()
const contentH = ref(1080)
const root = ref<HTMLElement>()
const { zoom, pan, tool, fit, viewport, pct, vars, viewCenter, handlers } = useCanvasView(root, {
  content: () => ({ x: ZONES_X, y: ZONES_Y - 24, w: ZONES_W, h: contentH.value + 24 }),
  rightPanel: () => (inspected.value || legend.value ? 352 : 0),
  top: 124,
  // Le plan entier reste visible au recadrage, même sur 1024 px avec l'inspecteur ouvert.
  minFit: 0.4,
})
const mapCollapsed = ref(false)
const zoneBoxes = ref<{ x: number; y: number; w: number; h: number }[]>([])
let ro: ResizeObserver | undefined
function measure() {
  const el = zonesEl.value
  if (!el) return
  contentH.value = el.offsetHeight
  const base = el.getBoundingClientRect()
  const z = zoom.value
  zoneBoxes.value = [...el.querySelectorAll<HTMLElement>('.mc-group')].map((g) => {
    const r = g.getBoundingClientRect()
    return { x: ZONES_X + (r.left - base.left) / z, y: ZONES_Y + (r.top - base.top) / z, w: r.width / z, h: r.height / z }
  })
}
onMounted(async () => {
  await nextTick()
  measure()
  fit()
  ro = new ResizeObserver(() => measure())
  if (zonesEl.value) ro.observe(zonesEl.value)
})
onBeforeUnmount(() => ro?.disconnect())
const minimapBlocks = computed<McMinimapBlock[]>(() => zoneBoxes.value.map((b) => ({ layer: 'fonctionnel', ...pct(b) })))
</script>

<template>
  <div
    ref="root"
    class="mc-scr-pos mc-scr-map"
    :style="vars"
    :class="{ 'is-hand': tool === 'hand', 'is-lens': lensOn, 'is-editing': editing }"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Plan d’occupation des sols complet" @deselect="selected = null" @fit="fit">
      <div ref="zonesEl" class="mc-scr-pos-zones" :style="{ left: ZONES_X + 'px', top: ZONES_Y + 'px', width: ZONES_W + 'px' }">
        <div v-for="side in ['left', 'right']" :key="side" class="mc-scr-pos-col">
          <McContainer
            v-for="z in ZONES.filter((x) => x.side === side)"
            :key="z.name"
            v-model:collapsed="collapsed[z.name]"
            :name="z.name"
            type="Zone"
            layer="fonctionnel"
            variant="zone"
            icon="pos"
            :count="zoneApps(z)"
            :count-label="`${plural(z.quartiers.length, 'quartier')} · ${plural(zoneApps(z), 'application')}`"
          >
            <div class="mc-scr-pos-grid" :class="`is-${z.cols}`">
              <button
                v-for="q in z.quartiers"
                :key="q.name"
                type="button"
                class="mc-scr-pos-q"
                :class="{ 'is-sel': selected === q.name, 'is-dim': quartierDim(q) }"
                :aria-pressed="selected === q.name"
                @click.stop="onQuartier(q)"
              >
                <span class="mc-scr-pos-qh">
                  <span class="mc-scr-pos-qn">{{ q.name }}</span>
                  <em>{{ appsOf(q) }} appli.</em>
                </span>
                <span class="mc-scr-pos-ilots">
                  <span
                    v-for="x in visibleIlots(q)"
                    :key="x.name"
                    class="mc-scr-pos-ilot"
                    :class="[`d${shade(x.n)}`, { 'is-dim': ilotDim(x), 'is-on': selected === q.name && selectedIlot === x.name }]"
                    @click.stop="selectIlot(q, x)"
                    :title="x.n ? `${x.name} : ${plural(x.n, 'application')}` : `${x.name} : aucune application`"
                  >
                    {{ x.name }}<b v-if="x.n">{{ x.n }}</b>
                  </span>
                  <span v-if="showEmpty && q.moreEmpty" class="mc-scr-pos-ilot more" :class="{ 'is-dim': isolated === 'ilot-occupe' }">+{{ q.moreEmpty }} vides</span>
                  <span v-if="!showEmpty && !appsOf(q)" class="mc-scr-pos-ilot more">{{ plural(emptyCount(q), 'îlot vide masqué', 'îlots vides masqués') }}</span>
                  <span v-if="editing" class="mc-scr-pos-ilot add" role="button" tabindex="0" :aria-label="`Ajouter un îlot à ${q.name}`" @click.stop="onAddIlot(q)" @keydown.enter.stop.prevent="onAddIlot(q)">+ îlot</span>
                </span>
              </button>
              <button v-if="editing" type="button" class="mc-scr-pos-q mc-scr-pos-qadd" @click.stop="addQuartier(z)">+ Ajouter un quartier</button>
            </div>
          </McContainer>
        </div>
      </div>
      <MapAnnotations ref="annotations" screen="pos" :zoom="zoom" />

      <template #top>
        <div class="mc-scr-pos-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home="onHome" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" @click="shareOpen = true"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton v-if="!editing" variant="primary" icon="pencil" @click="edit.begin()">Modifier</McButton>
              <McButton v-else variant="primary" icon="check" @click="edit.finish()">Terminer</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-pos-bar">
            <McFilterChip v-if="lensOn" label="Lentille : Couverture applicative" @remove="lens = NO_LENS" />
            <span class="mc-scr-pos-cap">
              {{ stats.zones }} zones · {{ stats.quartiers }} quartiers · {{ stats.apps }} applications
            </span>
            <span v-if="lensOn" class="mc-scr-pos-scale" aria-label="Applications par îlot">
              <span class="mc-scr-pos-ilot d0">0</span><span class="mc-scr-pos-ilot d1">1</span><span class="mc-scr-pos-ilot d2">2 à 3</span><span class="mc-scr-pos-ilot d3">4 et +</span>
            </span>
            <span class="mc-scr-pos-switch"><McSwitch v-model="showEmpty" label="Afficher les îlots vides" /></span>
          </div>
        </div>
      </template>

      <template #right>
        <McPanelTransition>
          <McLegend v-if="legend" v-model:isolated="isolated" title="Couverture applicative" :sections="legendSections" :sort="false" @close="legend = false" />
        </McPanelTransition>
        <McPanelTransition>
          <McInspector v-if="inspected" :object="inspected" @close="selected = null">
            <template #statuses>
              <template v-if="currentIlot">
                <McStatusChip v-if="currentIlot.n" size="sm">{{ plural(currentIlot.n, 'application') }}</McStatusChip>
                <McStatusChip v-else status="unknown" size="sm">Aucune application</McStatusChip>
              </template>
              <template v-else>
                <McStatusChip v-if="current && appsOf(current.q)" size="sm">{{ plural(appsOf(current.q), 'application') }}</McStatusChip>
                <McStatusChip v-else status="unknown" size="sm">Aucune application</McStatusChip>
              </template>
            </template>
            <template #actions>
              <McButton size="sm" variant="secondary" icon="plus" @click="openPicker">Rattacher une application</McButton>
              <McButton v-if="currentIlot" size="sm" variant="outline" icon="pos" @click="selectedIlot = null">Voir le quartier</McButton>
              <McButton v-else size="sm" variant="outline" icon="pencil" @click="openEdit()">Modifier</McButton>
            </template>
            <template #default>
              <template v-if="currentIlot && current">
                <McKeyValueList :items="[{ key: 'Quartier', value: current.q.name }, { key: 'Zone', value: current.zone.name }, { key: 'Applications', value: currentIlot.n }]" />
                <p v-if="!currentIlot.n" class="mc-scr-pos-note">Aucune application n’occupe cet îlot : c’est un trou du SI. Rattachez l’application qui couvre ce besoin.</p>
                <McRelationList :groups="ilotGroups" @open="openRelation" />
              </template>
              <template v-else>
                <McKeyValueList :items="infos" />
                <McRelationList :groups="groups" @open="openRelation" />
              </template>
            </template>
          </McInspector>
        </McPanelTransition>
      </template>

      <template #bottom-left>
        <McMinimap v-model:viewport="viewport" v-model:collapsed="mapCollapsed" :blocks="minimapBlocks" :count="stats.zones + stats.quartiers + stats.ilots" :zoom="zoom" />
      </template>

      <template #bottom>
        <MapEditBar v-if="editing" :count="edit.count.value" :count-label="edit.countLabel.value" hint="Cliquez sur un quartier pour le renommer et gérer ses îlots" @undo="edit.undo" @discard="edit.discard" @finish="edit.finish">
          <McButton variant="ghost" icon="plus" @click="addQuartier()">Quartier</McButton>
          <McButton variant="ghost" icon="app" :disabled="!current" @click="openPicker">Rattacher une application</McButton>
        </MapEditBar>
        <McToolbar v-else v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit" @filter="legend = true" @sticky="placeNote" @comment="placeComment" :commenting="annotations?.placing ?? false">
          <template #lens><McLensPicker v-model:lens="lens" :lenses="LENSES" /></template>
        </McToolbar>
      </template>
    </McCanvas>
    <MapShareDialog v-model:open="shareOpen" title="POS complet" :items="exportItems" :selection-count="selected && exportItems[0]?.name === selected ? 1 : 0" :notes="noteTexts('pos')" />

    <McModal
      v-model:open="pickerOpen"
      :title="pickerTarget ? `Rattacher une application à ${pickerTarget.name}` : 'Rattacher une application'"
      :type="{ label: 'Îlot', icon: 'pos', layer: 'fonctionnel' }"
      :subtitle="current ? `Quartier ${current.q.name} · zone ${current.zone.name}` : undefined"
      confirm-label="Rattacher"
      confirm-icon="plus"
      :confirm-disabled="!pickerApp || !pickerTarget"
      @confirm="attach"
    >
      <div class="mc-scr-pos-form">
        <McSelect v-if="!currentIlot" v-model="pickerIlot" label="Îlot" required :options="pickerIlotOptions" />
        <McSearchField v-model="pickerQuery" placeholder="Rechercher une application" :count="pickerQuery.trim() ? `${pickerList.length}${pickerList.length === 40 ? '+' : ''} résultat${pickerList.length > 1 ? 's' : ''}` : undefined" />
        <div class="mc-scr-pos-pick" role="listbox" aria-label="Applications">
          <button
            v-for="a in pickerList"
            :key="a.slug"
            type="button"
            role="option"
            class="mc-scr-pos-pickrow"
            :class="{ 'is-on': pickerApp === a.name }"
            :aria-selected="pickerApp === a.name"
            @click="pickerApp = a.name"
            @dblclick="pickerApp = a.name; attach()"
          >
            <McIcon name="app" size="sm" />
            <span class="grow"><b>{{ a.name }}</b><small v-if="a.description">{{ a.description }}</small></span>
            <McIcon v-if="pickerApp === a.name" name="check" size="sm" />
          </button>
          <p v-if="!pickerList.length" class="mc-scr-pos-note">Aucune application ne correspond à « {{ pickerQuery }} ».</p>
        </div>
      </div>
    </McModal>

    <McModal
      v-model:open="editOpen"
      :title="`Modifier le quartier ${current?.q.name ?? ''}`"
      :type="{ label: 'Quartier', icon: 'pos', layer: 'fonctionnel' }"
      :subtitle="current ? `Zone ${current.zone.name}` : undefined"
      :dirty="editDirty"
      :confirm-disabled="!!editError"
      :footer-note="editError || undefined"
      @confirm="saveEdit"
    >
      <div class="mc-scr-pos-form">
        <McTextField v-model="editForm.name" label="Nom du quartier" required />
        <McTextField v-model="editForm.description" label="Description" placeholder="ex. Pilotage, connaissance et exploitation du SI" />
        <div class="mc-scr-pos-edit">
          <span class="mc-over">Îlots</span>
          <div v-for="(r, k) in editForm.ilots" :key="k" class="mc-scr-pos-edit-ilot">
            <McTextField v-model="r.name" size="sm" :aria-label="`Nom de l’îlot ${k + 1}`" :placeholder="r.orig ? r.orig : 'ex. Recrutement'" />
            <span class="mc-scr-pos-edit-n">{{ r.orig ? (r.n ? plural(r.n, 'appli.', 'appli.') : 'vide') : 'nouveau' }}</span>
            <McIconButton v-if="!r.orig || !r.n" size="sm" icon="x" label="Retirer cet îlot" @click="removeIlotRow(k)" />
          </div>
          <McButton variant="ghost" size="sm" icon="plus" class="mc-scr-pos-edit-add" @click="addIlotRow">Ajouter un îlot</McButton>
          <p v-if="current?.q.moreEmpty" class="mc-scr-pos-note">{{ plural(current.q.moreEmpty, 'autre îlot vide', 'autres îlots vides') }} sans nom sur le plan.</p>
        </div>
        <McButton v-if="editing" variant="ghost" size="sm" icon="trash" class="mc-scr-pos-edit-del" :disabled="!!(current && appsOf(current.q))" :title="current && appsOf(current.q) ? 'Détachez d’abord ses applications' : undefined" @click="removeQuartier">Supprimer ce quartier</McButton>
      </div>
    </McModal>
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost contained :offset="96" />
  </div>
</template>

<style>
.mc-scr-pos { position: relative; width: 100%; height: 100vh; min-height: 560px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-pos.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-pos-top { display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.mc-scr-pos-top > * { pointer-events: auto; }
.mc-scr-pos-bar { align-self: flex-start; max-width: calc(100% - 336px); display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
.mc-scr-pos-cap { font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-pos-scale { display: inline-flex; gap: 4px; }
.mc-scr-pos-switch { display: inline-flex; align-items: center; height: 32px; padding: 0 12px; border-radius: var(--radius-pill); background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-node); }

/* Zones : deux colonnes, comme le plan imprimé. */
.mc-scr-pos-zones { position: absolute; display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr); gap: 24px; align-items: start; }
.mc-scr-pos-col { display: grid; gap: 24px; align-content: start; min-width: 0; }
.mc-scr-pos-col > .mc-group { margin-top: 14px; }
.mc-scr-pos-col > .mc-group > .gb { display: block; }
.mc-scr-pos-grid { display: grid; gap: 10px; }
.mc-scr-pos-grid.is-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mc-scr-pos-grid.is-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }

/* Quartier : une carte cliquable, ses îlots en puces. */
.mc-scr-pos-q { all: unset; box-sizing: border-box; display: grid; gap: 8px; align-content: start; min-width: 0; padding: 10px; border-radius: var(--radius-sm); background: var(--surface); border: 1px solid var(--line); cursor: pointer; transition: box-shadow .12s, border-color .12s, opacity .2s; }
.mc-scr-pos-q:hover { border-color: var(--line-strong); box-shadow: var(--shadow-hover); }
.mc-scr-pos-q:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-pos-q.is-sel { background: var(--accent-soft); border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.mc-scr-pos-q.is-dim { opacity: .32; }
.mc-scr-pos-qh { display: flex; gap: 6px; align-items: baseline; }
.mc-scr-pos-qn { flex: 1; min-width: 0; font: 600 13px/16px var(--font-display); color: var(--ink); }
.mc-scr-pos-qh em { font: 600 11px/14px var(--font-sans); font-style: normal; color: var(--ink-subtle); font-variant-numeric: tabular-nums; white-space: nowrap; }
.mc-scr-pos-ilots { display: flex; flex-wrap: wrap; gap: 4px; }
.mc-scr-pos-ilot { box-sizing: border-box; display: inline-flex; align-items: center; gap: 4px; height: 22px; padding: 0 7px; border-radius: 6px; font-size: 11px; line-height: 14px; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; background: var(--surface-sunken); color: var(--ink-muted); transition: opacity .2s; }
.mc-scr-pos-ilot b { font-weight: 700; font-variant-numeric: tabular-nums; }
.mc-scr-pos-ilot.d0 { background: transparent; border: 1px dashed var(--line-strong); color: var(--ink-subtle); }
.mc-scr-pos-ilot.more { background: transparent; color: var(--ink-subtle); padding: 0 2px; }
.mc-scr-pos-ilot.is-dim { opacity: .25; }
.mc-scr-pos-ilot.add { background: transparent; border: 1px dashed var(--accent); color: var(--accent); font-weight: 600; cursor: pointer; }
.mc-scr-pos-ilot.add:hover { background: var(--accent-soft); }
.mc-scr-pos.is-editing .mc-scr-pos-q:not(.is-sel):hover { border-style: dashed; border-color: var(--accent); }
.mc-scr-pos-qadd { place-content: center; min-height: 64px; border-style: dashed; color: var(--accent); font: 600 12px/16px var(--font-sans); text-align: center; background: transparent; }
.mc-scr-pos-qadd:hover { background: var(--accent-soft); }
.mc-scr-pos-edit-del { justify-self: start; color: var(--status-critical); }
/* Lentille allumée : la teinte dit le nombre d'applications. */
.mc-scr-pos.is-lens .mc-scr-pos-ilot.d1 { background: var(--crit-1); color: var(--ink); }
.mc-scr-pos.is-lens .mc-scr-pos-ilot.d2 { background: var(--crit-2); color: var(--ink); }
.mc-scr-pos.is-lens .mc-scr-pos-ilot.d3 { background: var(--crit-3); color: var(--on-navy); }
.mc-scr-pos-scale .mc-scr-pos-ilot.d1 { background: var(--crit-1); color: var(--ink); }
.mc-scr-pos-scale .mc-scr-pos-ilot.d2 { background: var(--crit-2); color: var(--ink); }
.mc-scr-pos-scale .mc-scr-pos-ilot.d3 { background: var(--crit-3); color: var(--on-navy); }
[data-theme="dark"] .mc-scr-pos.is-lens .mc-scr-pos-ilot.d2, [data-theme="dark"] .mc-scr-pos-scale .mc-scr-pos-ilot.d2 { color: var(--on-navy); }
[data-theme="dark"] .mc-scr-pos.is-lens .mc-scr-pos-ilot.d3, [data-theme="dark"] .mc-scr-pos-scale .mc-scr-pos-ilot.d3 { color: var(--navy-deep); }

.mc-scr-pos .mc-canvas-right { align-items: stretch; }
.mc-scr-pos .mc-canvas-right > .mc-legend { flex: none; }
.mc-scr-pos .mc-canvas-right > .mc-insp { flex: 0 1 auto; min-height: 0; overflow: hidden auto; }
.mc-scr-pos .mc-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-pos-ilots .mc-scr-pos-ilot:not(.more) { cursor: pointer; }
.mc-scr-pos-ilots .mc-scr-pos-ilot:not(.more):hover { box-shadow: 0 0 0 1px var(--line-strong); }
.mc-scr-pos-ilot.is-on { box-shadow: 0 0 0 2px var(--accent) !important; }
.mc-scr-pos-note { margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 18px; }
.mc-scr-pos-form { display: grid; gap: 14px; }
.mc-scr-pos-pick { display: grid; gap: 2px; max-height: 320px; overflow-y: auto; margin: 0 -6px; padding: 0 6px; }
.mc-scr-pos-pickrow { all: unset; box-sizing: border-box; display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 6px 8px; border-radius: var(--radius-sm); cursor: pointer; color: var(--ink); }
.mc-scr-pos-pickrow:hover { background: var(--surface-sunken); }
.mc-scr-pos-pickrow.is-on { background: var(--accent-soft); }
.mc-scr-pos-pickrow:focus-visible { outline: 2px solid var(--accent); outline-offset: -2px; }
.mc-scr-pos-pickrow > .mc-ico { color: var(--ink-muted); flex: none; }
.mc-scr-pos-pickrow.is-on > .mc-ico:last-child { color: var(--accent); }
.mc-scr-pos-pickrow .grow { flex: 1; min-width: 0; display: grid; }
.mc-scr-pos-pickrow b { font: 600 13px/16px var(--font-sans); }
.mc-scr-pos-pickrow small { font-size: 12px; line-height: 16px; color: var(--ink-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-pos-edit { display: grid; gap: 8px; }
.mc-scr-pos-edit-ilot { display: flex; align-items: center; gap: 8px; }
.mc-scr-pos-edit-ilot > :first-child { flex: 1; min-width: 0; }
.mc-scr-pos-edit-n { flex: none; width: 64px; font-size: 12px; color: var(--ink-subtle); }
.mc-scr-pos-edit-add { justify-self: start; }
</style>
