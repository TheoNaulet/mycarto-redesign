<script setup lang="ts">
// Écran « L'organigramme » : les directions de la collectivité et leurs services, en cartes à onglet.
// Clic sur une direction : elle est sélectionnée et l'inspecteur montre ses services et ses applications.
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McCountBadge from '../../components/McCountBadge/McCountBadge.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McCheckbox from '../../components/McCheckbox/McCheckbox.vue'
import McModal from '../../components/McModal/McModal.vue'
import McNode from '../../components/McNode/McNode.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McIcon from '../../icons/McIcon.vue'
import SharePanel, { type ExportItem } from '../shared/SharePanel.vue'
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { getApplication, isValid } from '../../data/applications'

const toast = useToast()

/* ---------- Données ---------- */
interface App {
  name: string
  invalid?: boolean
}
interface Service {
  name: string
  /** Nom court, dans l'inspecteur. */
  short?: string
  apps?: App[]
}
interface Direction {
  code: string
  uo: string
  name: string
  services: Service[]
  /** Applications rattachées à la direction elle-même, hors service. */
  own?: App[]
}

const directions = reactive<Direction[]>([
  {
    code: 'DRH',
    uo: 'UO0029',
    name: 'Direction des Ressources Humaines',
    services: [
      { name: 'Santé au travail et interventions sociales', short: 'Santé au travail', apps: [{ name: 'SAUT', invalid: true }, { name: 'CARAMBOLE' }, { name: 'ALERTES-DIPLOMES' }] },
      { name: 'Carrière et organisation', apps: [{ name: 'SANGRIA' }, { name: 'QUICKCONNECT' }, { name: 'JEFYADMIN', invalid: true }, { name: 'FOAD', invalid: true }] },
      { name: 'Communication interne', apps: [{ name: 'ABRICOT', invalid: true }] },
      { name: 'Recrutement et compétences', short: 'Recrutement', apps: [{ name: 'FEVE', invalid: true }] },
    ],
    own: [{ name: 'MANGUE', invalid: true }],
  },
  { code: 'DI', uo: 'UO0031', name: 'Direction Informatique', services: ['Courrier et atelier numérique', 'Assistance et maintenance', 'Production', 'Études'].map((name) => ({ name })) },
  {
    code: 'DAJAF',
    uo: 'UO0034',
    name: 'Affaires juridiques, administratives et financières',
    services: ['Affaires juridiques et assurances', 'Secrétariat administratif', 'Gestion des affaires sociales', 'Marchés des bâtiments', 'Central des marchés', 'Affaires financières'].map((name) => ({ name })),
  },
  {
    code: 'LDAR',
    uo: 'UO0041',
    name: 'Laboratoire d’analyses et de recherche',
    services: ['Pôle chimie', 'Pôle vétérinaire', 'Pôle microbiologie', 'Administration des ventes', 'Prélèvement et logistique', 'Innovation agronomique', 'Qualité, hygiène et sécurité'].map((name) => ({ name })),
  },
  { code: 'DPAS', uo: 'UO0052', name: 'Politiques d’autonomie et de solidarité', services: ['Régulation et prospective', 'Accompagnement en établissement', 'Accompagnement à domicile', 'Accès aux droits'].map((name) => ({ name })) },
  { code: 'DEF', uo: 'UO0058', name: 'Enfance et famille', services: ['Établissement enfance et famille', 'Protection maternelle et infantile', 'Accueil familial', 'Aide à l’enfance'].map((name) => ({ name })) },
  { code: 'DDSLI', uo: 'UO0063', name: 'Développement social, logement et insertion', services: ['Insertion', 'Logement', 'Action sociale'].map((name) => ({ name })) },
  {
    code: 'DESC',
    uo: 'UO0067',
    name: 'Éducation, sport et culture',
    services: ['Archives départementales', 'Bibliothèque départementale', 'Pôle archéologique', 'Musées et archéologie', 'Sport et culture', 'Éducation'].map((name) => ({ name })),
  },
  { code: 'DVD', uo: 'UO0074', name: 'Voirie départementale', services: ['Domanialité et foncier', 'Comptabilité et moyens', 'Entretien et exploitation', 'Ingénierie et grands travaux'].map((name) => ({ name })) },
  { code: 'DATEDD', uo: 'UO0080', name: 'Aménagement et développement durable', services: ['Politiques territoriales', 'Budget et marchés', 'Aménagement, mobilité, environnement'].map((name) => ({ name })) },
  { code: 'DB', uo: 'UO0085', name: 'Direction des Bâtiments', services: ['Énergie', 'Patrimoine et logistique'].map((name) => ({ name })) },
])

// Une application est « non valide » quand sa fiche a un champ obligatoire vide (source unique src/data/applications.ts).
for (const d of directions) for (const app of [...d.services.flatMap((sv) => sv.apps ?? []), ...(d.own ?? [])]) app.invalid = !isValid(app.name)

const appsOf = (d: Direction) => [...d.services.flatMap((s) => s.apps ?? []), ...(d.own ?? [])]
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* ---------- Filtres (bouton Filtrer de la barre d'outils) et légende ---------- */
const filterOpen = ref(false)
const fWithApps = ref(false)
const fInvalid = ref(false)
const fWithoutApps = ref(false)
const legend = ref(false)
/** Ligne isolée dans la légende : « apps » (directions avec applications), « invalid » (avec une application non valide). */
const isolated = ref<string | null>(null)
const filterActive = computed(() => fWithApps.value || fInvalid.value || fWithoutApps.value)
function clearFilters() {
  fWithApps.value = fInvalid.value = fWithoutApps.value = false
}
function keepDirection(d: Direction) {
  const apps = appsOf(d)
  if (fWithApps.value && !apps.length) return false
  if (fWithoutApps.value && apps.length) return false
  if (fInvalid.value && !apps.some((a) => a.invalid)) return false
  if (isolated.value === 'apps' && !apps.length) return false
  if (isolated.value === 'invalid' && !apps.some((a) => a.invalid)) return false
  if (isolated.value === 'empty' && apps.length) return false
  return true
}

/* ---------- Recherche : filtre directions et services en direct ---------- */
const query = ref('')
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const shown = computed(() => {
  const q = norm(query.value.trim())
  const list = directions.filter(keepDirection)
  if (!q) return list.map((d) => ({ dir: d, services: d.services }))
  return list.flatMap((d) => {
    if (norm(`${d.code} ${d.name}`).includes(q)) return [{ dir: d, services: d.services }]
    const services = d.services.filter((s) => norm(s.name).includes(q))
    return services.length ? [{ dir: d, services }] : []
  })
})
const serviceCount = computed(() => shown.value.reduce((n, s) => n + s.services.length, 0))
const caption = computed(() => `${plural(shown.value.length, 'direction', 'directions')} · ${plural(serviceCount.value, 'service', 'services')}`)
const searchCount = computed(() => (query.value.trim() ? (shown.value.length ? caption.value : 'Aucun résultat') : undefined))
const allApps = computed(() => directions.flatMap(appsOf))
const legendSections = computed<McLegendSection[]>(() => [
  {
    title: 'Types',
    items: [
      { id: 'dir', label: 'Direction (onglet : sigle)', count: directions.length, layer: 'metier' },
      { id: 'sv', label: 'Service', count: directions.reduce((n, d) => n + d.services.length, 0), layer: 'metier' },
    ],
  },
  {
    title: 'Applications rattachées',
    items: [
      { id: 'apps', label: 'Directions avec des applications', count: directions.filter((d) => appsOf(d).length).length, status: 'ok' },
      { id: 'invalid', label: 'Directions avec une application non valide', count: directions.filter((d) => appsOf(d).some((a) => a.invalid)).length, status: 'critical' },
      { id: 'empty', label: 'Directions sans application', count: directions.filter((d) => !appsOf(d).length).length, status: 'unknown' },
    ],
  },
])

/* ---------- Sélection et inspecteur ---------- */
const selected = ref<string | null>('DRH')
const current = computed(() => directions.find((d) => d.code === selected.value))
const inspected = computed<InspectedObject | undefined>(() =>
  current.value ? { name: current.value.name, type: 'Unité organisationnelle', layer: 'metier', icon: 'org' } : undefined,
)
const currentApps = computed(() => (current.value ? appsOf(current.value) : []))
const invalidCount = computed(() => currentApps.value.filter((a) => a.invalid).length)
const appGroups = computed<RelationGroup[]>(() => {
  const d = current.value
  if (!d) return []
  const toItems = (apps: App[]) =>
    apps.map((a) => ({ name: a.name, layer: 'applicatif' as const, icon: 'app' as const, ...(a.invalid ? { status: 'critical' as const, statusLabel: 'Non valide' } : {}) }))
  const groups: RelationGroup[] = d.services.filter((s) => s.apps?.length).map((s) => ({ verb: s.short ?? s.name, items: toItems(s.apps!) }))
  if (d.own?.length) groups.push({ verb: 'Rattachées à la direction', items: toItems(d.own) })
  return groups
})
const serviceGroups = computed<RelationGroup[]>(() =>
  current.value ? [{ verb: 'Services', items: current.value.services.map((s) => ({ name: s.name, layer: 'metier' as const, icon: 'org' as const })) }] : [],
)
function select(code: string) {
  selected.value = code
}
function openApp(item: RelationItem) {
  goFiche(item.name)
}

/* ---------- Mode modification : renommer directions et services, ajouter un service (en mémoire) ---------- */
const editing = ref(false)
/** Directions et services modifiés depuis l'entrée en modification. */
const edited = new Set<unknown>()
const edits = ref(0)
const mark = (o: unknown) => {
  edited.add(o)
  edits.value = edited.size
}
function toggleEdit() {
  if (editing.value) {
    editing.value = false
    toast.success(edits.value ? `Organigramme enregistré : ${plural(edits.value, 'modification', 'modifications')}` : 'Aucune modification à enregistrer')
    edited.clear()
    edits.value = 0
    return
  }
  editing.value = true
  if (!selected.value) selected.value = shown.value[0]?.dir.code ?? directions[0].code
  toast.info('Modification de l’organigramme : renommez une direction ou ses services dans le panneau de droite.')
}
function renameDirection(v: string) {
  if (!current.value) return
  current.value.name = v
  mark(current.value)
}
function renameService(sv: Service, v: string) {
  sv.name = v
  sv.short = undefined
  mark(sv)
}
function addService() {
  const d = current.value
  if (!d) return
  const sv: Service = { name: `Nouveau service ${d.services.length + 1}` }
  d.services.push(sv)
  mark(sv)
  nextTick(() => {
    const inputs = document.querySelectorAll<HTMLInputElement>('.mc-scr-org-edit-sv input')
    const last = inputs[inputs.length - 1]
    last?.focus()
    last?.select()
  })
}
function removeService(sv: Service) {
  const d = current.value
  if (!d) return
  if (sv.apps?.length) {
    d.own = [...(d.own ?? []), ...sv.apps]
    toast.info(`${plural(sv.apps.length, 'application rattachée', 'applications rattachées')} à la direction ${d.code}`)
  }
  d.services.splice(d.services.indexOf(sv), 1)
  mark(sv)
}

/* ---------- Carte des applications d'une unité (vue en place) ---------- */
const mapOpen = ref(false)
const mapGroups = computed(() => {
  const d = current.value
  if (!d) return []
  const groups = d.services.filter((s) => s.apps?.length).map((s) => ({ name: s.name, apps: s.apps! }))
  if (d.own?.length) groups.push({ name: 'Rattachées à la direction', apps: d.own })
  return groups
})
const appDetail = (name: string) => {
  const a = getApplication(name)
  return a?.domaines[0] ?? a?.nature ?? undefined
}

/* ---------- Partager et exporter ---------- */
const share = ref<{ open: boolean; title: string; items: ExportItem[]; link?: string }>({ open: false, title: '', items: [] })
function exportAll() {
  share.value = {
    open: true,
    title: 'Organigramme',
    items: [...directions.map((d) => ({ name: d.code, layer: 'metier' as const })), ...allApps.value.map((a) => ({ name: a.name, layer: 'applicatif' as const }))],
  }
}
function exportUnit(d: Direction) {
  share.value = {
    open: true,
    title: `Organigramme de l’unité ${d.code}`,
    items: [{ name: d.code, layer: 'metier' }, ...d.services.map((s) => ({ name: s.name, layer: 'metier' as const })), ...appsOf(d).map((a) => ({ name: a.name, layer: 'applicatif' as const }))],
    link: new URL(pathHref(`/organigramme?unite=${d.code}`), window.location.origin).href,
  }
}

/* ---------- Menu « Plus d'actions » d'une unité ---------- */
const menu = ref({ open: false, x: 0, y: 0 })
const menuItems = computed<(ContextMenuItem | 'separator')[]>(() => [
  { id: 'edit', label: editing.value ? 'Terminer la modification' : 'Modifier l’unité', icon: 'pencil' },
  { id: 'add', label: 'Ajouter un service', icon: 'plus' },
  { id: 'apps', label: 'Voir les applications', icon: 'app', disabled: !currentApps.value.length },
  { id: 'invalid', label: 'Lister les applications non valides', icon: 'list', disabled: !invalidCount.value },
  'separator',
  { id: 'link', label: 'Copier le lien', icon: 'link' },
  { id: 'export', label: 'Exporter l’unité', icon: 'export' },
])
function openMenu(e: MouseEvent) {
  const r = root.value!.getBoundingClientRect()
  const b = (e.currentTarget as HTMLElement).getBoundingClientRect()
  menu.value = { open: true, x: Math.max(8, Math.min(b.right - r.left - 260, r.width - 268)), y: Math.min(b.bottom - r.top + 6, r.height - 300) }
}
async function onMenu(item: ContextMenuItem) {
  const d = current.value
  if (!d) return
  if (item.id === 'edit') toggleEdit()
  else if (item.id === 'add') {
    if (!editing.value) editing.value = true
    addService()
  } else if (item.id === 'apps') mapOpen.value = true
  else if (item.id === 'invalid') goPath('/explorateur?filtre=non-valides')
  else if (item.id === 'link') {
    const ok = await copyLink(`/organigramme?unite=${d.code}`)
    if (ok) toast.success(`Lien vers ${d.code} copié dans le presse-papiers`)
    else toast.info('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
  } else if (item.id === 'export') exportUnit(d)
}

/* ---------- Adresse : /organigramme?unite=DRH sélectionne l'unité ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    const u = typeof q.unite === 'string' ? q.unite.toUpperCase() : ''
    if (u && directions.some((d) => d.code === u)) selected.value = u
  },
  { immediate: true },
)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche métier', layer: 'metier' }, { label: 'Organigramme' }]
function onTrail(_s: TrailStep, i: number) {
  // L'accueil range les objets par couche : la couche métier y est.
  if (i === 0 || i === 1) goPath('/')
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
const view = ref('organigramme')
const views: TabItem[] = [
  { value: 'organigramme', label: 'Organigramme', icon: 'org' },
  { value: 'processus', label: 'Processus', icon: 'process' },
]
watch(view, (v) => {
  if (v === 'processus') {
    goPath('/processus')
    // Reste sur l'organigramme si la navigation ne quitte pas l'écran.
    setTimeout(() => (view.value = 'organigramme'), 300)
  }
})
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}

/* ---------- Zoom, déplacement, recadrage ---------- */
const GRID_X = 24
const GRID_Y = 132
const root = ref<HTMLElement>()
const gridEl = ref<HTMLElement>()
const zoom = ref(1)
const pan = ref({ x: GRID_X, y: GRID_Y })
const tool = ref<'select' | 'hand'>('select')
const size = ref({ w: 1440, h: 900 })
const panelW = computed(() => (inspected.value ? 320 + 32 : 0))
/** Largeur de la grille en unités du canevas : elle remplit la place laissée par l'inspecteur. */
const gridW = computed(() => Math.max(560, (size.value.w - GRID_X - 16 - panelW.value) / zoom.value))
/** Colonnes de directions : 4 au moins, une de plus par tranche de 354px sur les grands écrans (5 à 1920, 7 à 2560). */
const gridCols = computed(() => Math.max(4, Math.floor((gridW.value + 14) / 354)))
async function fit() {
  for (let i = 0; i < 3; i++) {
    await nextTick()
    const h = gridEl.value?.offsetHeight ?? 0
    if (!h) return
    const z = Math.round(Math.min(1, (size.value.h - GRID_Y - 80) / h) * 100) / 100
    if (z === zoom.value) break
    zoom.value = Math.max(0.5, z)
  }
  pan.value = { x: GRID_X, y: GRID_Y }
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
watch(() => !!inspected.value, () => fit())
watch([query, filterActive, isolated, fWithApps, fInvalid, fWithoutApps], () => fit())

let drag: { x: number; y: number; px: number; py: number } | null = null
function onPointerDown(e: PointerEvent) {
  if (tool.value !== 'hand' && e.button !== 1) return
  if ((e.target as HTMLElement).closest('.mc-float, .mc-tabs, .mc-scr-org-bar')) return
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
  if (e.ctrlKey || e.metaKey) zoom.value = Math.round(Math.min(2, Math.max(0.5, zoom.value * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100
  else pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
}
</script>

<template>
  <div
    ref="root"
    class="mc-scr-org"
    :class="{ 'is-hand': tool === 'hand' }"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @wheel="onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Organigramme : directions et services" @deselect="selected = null" @fit="fit">
      <div ref="gridEl" class="mc-scr-org-grid" :style="{ width: gridW + 'px', '--org-cols': gridCols }" @click.self="selected = null">
        <McContainer
          v-for="s in shown"
          :key="s.dir.code"
          class="mc-scr-org-dir"
          :name="s.dir.name"
          :type="s.dir.code"
          layer="metier"
          :collapsible="false"
          :selected="selected === s.dir.code"
          tabindex="0"
          :aria-current="selected === s.dir.code || undefined"
          @click="select(s.dir.code)"
          @keydown.enter.self.prevent="select(s.dir.code)"
          @keydown.space.self.prevent="select(s.dir.code)"
        >
          <div v-for="sv in s.services" :key="sv.name" class="mc-scr-org-sv">
            <span class="mc-scr-org-svn">{{ sv.name }}</span>
            <McCountBadge v-if="sv.apps?.length" :count="sv.apps.length" :label="plural(sv.apps.length, 'application', 'applications')" />
          </div>
        </McContainer>
      </div>
      <div v-if="!shown.length" class="mc-scr-org-none" :style="{ width: gridW + 'px' }">
        <McEmptyState icon="search" layer="metier" :title="`Aucune direction ni aucun service ne contient « ${query} »`" text="Vérifiez l’orthographe ou cherchez un sigle : DRH, DI, DESC…">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton></template>
        </McEmptyState>
      </div>

      <template #top>
        <div class="mc-scr-org-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur l’organigramme" />
              <McButton variant="outline" icon="export" :aria-expanded="share.open" @click="share.open ? (share.open = false) : exportAll()">Exporter</McButton>
              <McButton :variant="editing ? 'outline' : 'primary'" :icon="editing ? 'check' : 'pencil'" @click="toggleEdit">{{ editing ? 'Terminer' : 'Modifier' }}</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-org-bar">
            <McTabs v-model="view" :tabs="views" variant="pill" aria-label="Vues de la couche métier" />
            <span class="mc-cap" aria-live="polite">{{ caption }}</span>
            <McSearchField v-model="query" size="sm" class="mc-scr-org-search" placeholder="Filtrer les directions et services" :count="searchCount" />
          </div>
        </div>
      </template>

      <template #right>
        <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        <McInspector v-if="inspected && current" :key="current.code" :object="inspected" @close="selected = null">
          <template #statuses>
            <span class="mc-code mc-scr-org-uo">{{ current.uo }}</span>
          </template>
          <template #actions>
            <McButton size="sm" icon="map" :disabled="!currentApps.length" :title="currentApps.length ? undefined : 'Aucune application rattachée à cette unité'" @click="mapOpen = true">Carte des applications</McButton>
            <McIconButton size="sm" icon="more" label="Plus d’actions" :aria-expanded="menu.open" @click="openMenu" />
          </template>
          <div v-if="editing" class="mc-scr-org-edit">
            <McTextField :model-value="current.name" label="Nom de la direction" @update:model-value="(v) => renameDirection(String(v ?? ''))" />
            <div class="mc-scr-org-edit-svs">
              <span class="mc-field-label">Services</span>
              <div v-for="(sv, i) in current.services" :key="i" class="mc-scr-org-edit-sv">
                <McTextField :model-value="sv.name" :aria-label="`Nom du service ${i + 1}`" @update:model-value="(v) => renameService(sv, String(v ?? ''))" />
                <McIconButton size="sm" icon="trash" :label="`Retirer le service ${sv.name}`" @click="removeService(sv)" />
              </div>
              <McButton size="sm" variant="outline" icon="plus" @click="addService">Ajouter un service</McButton>
            </div>
          </div>
          <div class="mc-row mc-scr-org-chips">
            <McStatusChip size="sm">{{ plural(current.services.length, 'service', 'services') }}</McStatusChip>
            <McStatusChip size="sm">{{ currentApps.length ? plural(currentApps.length, 'application', 'applications') : 'Aucune application' }}</McStatusChip>
            <McStatusChip v-if="invalidCount" status="critical" size="sm">{{ plural(invalidCount, 'non valide', 'non valides') }}</McStatusChip>
          </div>
          <template v-if="currentApps.length">
            <McRelationList :groups="appGroups" :visible="5" @open="openApp" />
          </template>
          <template v-else>
            <McRelationList :groups="serviceGroups" :visible="8" @open="(item) => (query = item.name)" />
            <McEmptyState
              size="compact"
              icon="app"
              title="Aucune application rattachée"
              text="Rattachez une application à un service depuis sa fiche : elle apparaîtra ici."
            />
          </template>
        </McInspector>
      </template>

      <template #bottom>
        <div class="mc-scr-org-bottom">
          <div v-if="filterOpen" class="mc-pop mc-scr-org-filters" role="dialog" aria-label="Filtrer les directions">
            <div class="mc-row mc-scr-org-filters-hd">
              <b>Filtrer les directions</b>
              <McIconButton size="sm" icon="x" label="Fermer les filtres" @click="filterOpen = false" />
            </div>
            <McCheckbox v-model="fWithApps" :disabled="fWithoutApps">Avec des applications rattachées</McCheckbox>
            <McCheckbox v-model="fInvalid" :disabled="fWithoutApps">Avec une application non valide</McCheckbox>
            <McCheckbox v-model="fWithoutApps" :disabled="fWithApps || fInvalid">Sans application</McCheckbox>
            <div class="mc-row mc-scr-org-filters-ft">
              <span class="mc-cap">{{ plural(shown.length, 'direction affichée', 'directions affichées') }}</span>
              <McButton size="sm" variant="ghost" :disabled="!filterActive" @click="clearFilters">Effacer</McButton>
            </div>
          </div>
          <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" :filter-active="filterActive" :collaboration="false" :min-zoom="0.5" :max-zoom="2" @fit="fit" @filter="filterOpen = !filterOpen" />
        </div>
      </template>
    </McCanvas>

    <SharePanel v-if="share.open" class="mc-scr-org-share" :title="share.title" :items="share.items" :notes="[]" :link="share.link" @close="share.open = false" />
    <McContextMenu v-model:open="menu.open" :items="menuItems" :header="current?.code" :x="menu.x" :y="menu.y" @select="onMenu" />
    <McModal
      v-if="current"
      v-model:open="mapOpen"
      size="lg"
      :title="`Carte des applications de l’unité ${current.code}`"
      :type="{ label: 'Unité organisationnelle', icon: 'org', layer: 'metier' }"
      :subtitle="`${plural(currentApps.length, 'application', 'applications')} · ${invalidCount ? plural(invalidCount, 'non valide', 'non valides') : 'toutes valides'}`"
    >
      <div class="mc-scr-org-map">
        <McContainer v-for="g in mapGroups" :key="g.name" :name="g.name" type="Service" layer="metier" :collapsible="false">
          <div class="mc-scr-org-map-nodes">
            <McNode
              v-for="a in g.apps"
              :key="a.name"
              :name="a.name"
              type="Application"
              layer="applicatif"
              icon="app"
              :subtitle="appDetail(a.name)"
              :status="a.invalid ? 'critical' : undefined"
              :lens="a.invalid"
              tabindex="0"
              :title="`Ouvrir la fiche de ${a.name}`"
              @click="goFiche(a.name)"
              @keydown.enter.prevent="goFiche(a.name)"
            />
          </div>
        </McContainer>
      </div>
      <template #footer="{ close }">
        <span class="left"><McIcon name="info" size="sm" />Cliquez sur une application pour ouvrir sa fiche.</span>
        <McButton v-if="invalidCount" variant="outline" icon="list" @click="goPath('/explorateur?filtre=non-valides')">Lister les non valides</McButton>
        <McButton variant="primary" @click="close()">Fermer</McButton>
      </template>
    </McModal>
    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-org { position: relative; width: 100%; height: 100vh; min-height: 600px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-org.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-org-top { display: flex; flex-direction: column; gap: 16px; pointer-events: none; }
.mc-scr-org-top > * { pointer-events: auto; }
.mc-scr-org-bar { align-self: flex-start; display: flex; align-items: center; gap: 12px; }
.mc-scr-org-search { width: 260px; }
.mc-scr-org-grid, .mc-scr-org-none { position: absolute; left: 0; top: 0; }
.mc-scr-org-grid { display: grid; grid-template-columns: repeat(var(--org-cols, 4), minmax(0, 1fr)); gap: 16px 14px; align-items: start; padding-bottom: 8px; }
.mc-scr-org-dir { cursor: pointer; margin-top: 18px; }
.mc-scr-org-dir > .mc-tab { letter-spacing: .06em; font-weight: 700; }
.mc-scr-org-dir > .gh { cursor: pointer; }
.mc-scr-org-dir > .gh b { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-org-dir > .gb { display: grid; gap: 6px; }
.mc-scr-org-dir:hover:not(.is-selected) { border-color: color-mix(in srgb, var(--lc) 60%, transparent); }
.mc-scr-org-sv { display: flex; align-items: center; gap: 6px; min-height: 26px; padding: 4px 8px; border-radius: 6px; background: var(--surface); font-size: 12px; line-height: 16px; color: var(--ink); box-sizing: border-box; }
.mc-scr-org-svn { flex: 1; min-width: 0; }
.mc-scr-org-none { padding-top: 40px; display: flex; justify-content: center; }
.mc-scr-org-uo { font-size: 12px; color: var(--ink-subtle); }
.mc-scr-org-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-org-bottom { position: relative; }
.mc-scr-org-filters { position: absolute; bottom: calc(100% + 8px); left: 0; width: 300px; padding: 12px; display: grid; gap: 10px; z-index: 5; }
.mc-scr-org-filters-hd, .mc-scr-org-filters-ft { justify-content: space-between; gap: 8px; }
.mc-scr-org-filters-hd b { font-size: 13px; }
.mc-scr-org-share { position: absolute; top: 76px; right: 16px; z-index: 40; }
.mc-scr-org-edit { display: grid; gap: 12px; padding-bottom: 12px; margin-bottom: 4px; border-bottom: 1px solid var(--line); }
.mc-scr-org-edit-svs { display: grid; gap: 6px; justify-items: start; }
.mc-scr-org-edit-sv { display: flex; gap: 4px; align-items: center; width: 100%; }
.mc-scr-org-edit-sv > .mc-field { flex: 1; min-width: 0; }
.mc-scr-org-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; padding-top: 18px; }
.mc-scr-org-map-nodes { display: grid; gap: 8px; }
.mc-scr-org-map .mc-node { cursor: pointer; width: 100%; }
/* Petits écrans : recherche plus courte, pour que la barre d'outils tienne à gauche de l'inspecteur et que le fil d'Ariane reste lisible. */
@media (max-width: 1180px) {
  .mc-scr-org-search { width: 200px; }
  .mc-scr-org-top .mc-cmdk { width: 176px; }
}
</style>
