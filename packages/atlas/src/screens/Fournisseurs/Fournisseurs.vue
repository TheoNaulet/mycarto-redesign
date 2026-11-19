<script setup lang="ts">
// Écran « Fournisseurs » : glossaire des fournisseurs de la couche applicative.
// Grille de nœuds (ou liste), recherche, tri, filtres d'état du contrat, index alphabétique, inspecteur.
import { computed, getCurrentInstance, nextTick, reactive, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McNode from '../../components/McNode/McNode.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McInspector from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import type { Status } from '../../utils/types'
import McContainer from '../../components/McContainer/McContainer.vue'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import SharePanel from '../shared/SharePanel.vue'
import { download, fileSlug } from '../shared/exportFile'
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { hasApplication, supplierSeeds } from '../../data/applications'

const toast = useToast()

/* ---------- Données ---------- */
type Etat = 'expire' | 'bientot' | 'ok' | 'sans'
const ETATS: Record<Etat, { status: Status; label: string; filter: string; rank: number }> = {
  expire: { status: 'critical', label: 'Contrat expiré', filter: 'Contrat expiré', rank: 0 },
  bientot: { status: 'warn', label: 'Expire < 1 an', filter: 'Expire < 1 an', rank: 1 },
  ok: { status: 'ok', label: 'Contrat > 1 an', filter: 'Contrat > 1 an', rank: 2 },
  sans: { status: 'unknown', label: 'Sans contrat', filter: 'Sans contrat', rank: 3 },
}
interface Contrat {
  ref: string
  fin: string
}
interface Fournisseur {
  id: number
  name: string
  apps: string[]
  etat: Etat
  contrats: Contrat[]
}
// Les fournisseurs et ce qu'ils fournissent viennent de la source unique src/data/applications.ts.
const raw = supplierSeeds
const fournisseurs = reactive<Fournisseur[]>(raw.map(([name, apps, etat, contrats], i) => ({ id: i + 1, name, apps, etat, contrats: [...contrats] })))
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const initial = (s: string) => norm(s).charAt(0).toUpperCase()
/** « de » élidé devant une voyelle ou un h muet : « d’AMUE », « de Microsoft ». */
const de = (name: string) => (/^[aeiouyàâäéèêëîïôöùûüh]/i.test(name) ? `d’${name}` : `de ${name}`)

/* ---------- Recherche, filtre d'état, lettre ---------- */
const query = ref('')
const etat = ref<Etat | 'tous'>('tous')
const letter = ref<string | null>(null)
const bySearch = computed(() => {
  const q = norm(query.value.trim())
  return q ? fournisseurs.filter((f) => norm(`${f.name} ${f.apps.join(' ')}`).includes(q)) : fournisseurs
})
const byEtat = computed(() => (etat.value === 'tous' ? bySearch.value : bySearch.value.filter((f) => f.etat === etat.value)))
const filtered = computed(() => (letter.value ? byEtat.value.filter((f) => initial(f.name) === letter.value) : byEtat.value))
const counts = computed(() => {
  const c: Record<Etat, number> = { expire: 0, bientot: 0, ok: 0, sans: 0 }
  for (const f of bySearch.value) c[f.etat]++
  return c
})
const filterChips: Etat[] = ['expire', 'bientot', 'sans']
function setEtat(e: Etat | 'tous') {
  etat.value = e
}
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const available = computed(() => new Set(byEtat.value.map((f) => initial(f.name))))
const results = ref<HTMLElement>()
function pickLetter(l: string) {
  letter.value = letter.value === l ? null : l
  const top = results.value?.getBoundingClientRect().top ?? 0
  // Ramène la liste sous la barre du haut seulement si elle est hors de vue.
  if (top < 92 || top > window.innerHeight - 80) results.value?.scrollIntoView({ block: 'start', behavior: 'smooth' })
}
watch([query, etat], () => {
  if (letter.value && !available.value.has(letter.value)) letter.value = null
})
function clearAll() {
  query.value = ''
  etat.value = 'tous'
  letter.value = null
}

/* ---------- Tri ---------- */
const sortBy = ref<McSelectValue | null>('apps')
const sortOptions = [
  { value: 'name', label: 'Trier : nom' },
  { value: 'apps', label: 'Trier : nombre d’applications' },
]
const sort = ref<DataTableSort | null>({ key: 'apps', dir: 'desc' })
watch(sortBy, (v) => {
  if (v === 'name') sort.value = { key: 'name', dir: 'asc' }
  else if (v === 'apps') sort.value = { key: 'apps', dir: 'desc' }
})
watch(sort, (s) => {
  if (s && (s.key === 'name' || s.key === 'apps')) sortBy.value = s.key
})
const byName = (a: Fournisseur, b: Fournisseur) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' })
const sorted = computed(() => {
  const s = sort.value ?? { key: 'name', dir: 'asc' }
  const dir = s.dir === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    let c = 0
    if (s.key === 'apps') c = (a.apps.length - b.apps.length) * dir
    else if (s.key === 'etat') c = (ETATS[a.etat].rank - ETATS[b.etat].rank) * dir
    else if (s.key === 'contrats') c = (a.contrats.length - b.contrats.length) * dir
    else c = byName(a, b) * dir
    return c || byName(a, b)
  })
})

/* ---------- Affichage ---------- */
// « Carte » : les fournisseurs en conteneurs, leurs applications en nœuds (mêmes filtres, même tri).
const view = ref('grille')
interface Row {
  id: number
  name: string
  apps: number
  etat: string
  contrats: number
  echeance: string
}
const rows = computed<Row[]>(() =>
  sorted.value.map((f) => ({ id: f.id, name: f.name, apps: f.apps.length, etat: f.etat, contrats: f.contrats.length, echeance: f.contrats[0]?.fin ?? '' })),
)
const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Fournisseur', sortable: true },
  { key: 'apps', label: 'Applications', sortable: true, align: 'right', width: '140px' },
  { key: 'contrats', label: 'Contrats', sortable: true, align: 'right', width: '120px' },
  { key: 'etat', label: 'État du contrat', sortable: true, width: '180px' },
  { key: 'echeance', label: 'Échéance', width: '140px' },
]

/* ---------- Inspecteur ---------- */
const inspectedId = ref<number | null>(null)
const inspected = computed(() => fournisseurs.find((f) => f.id === inspectedId.value))
function inspect(id: number) {
  inspectedId.value = inspectedId.value === id ? null : id
}
const kv = computed<KeyValueItem[]>(() => {
  const f = inspected.value
  if (!f) return []
  return [
    { key: 'Applications', value: f.apps.length },
    { key: 'Contrats', value: f.contrats.length || null },
    { key: 'Prochaine échéance', value: (f.contrats.find((c) => etatFor(isoOf(c.fin)) !== 'expire') ?? f.contrats[f.contrats.length - 1])?.fin ?? null },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const f = inspected.value
  if (!f) return []
  return [
    { verb: 'Fournit', items: f.apps.map((a) => ({ id: `app-${a}`, name: a, layer: 'applicatif' as const, icon: 'app' as const })) },
    {
      verb: 'Contrats',
      items: f.contrats.map((c) => {
        // Chaque contrat a son propre état, d'après sa date de fin.
        const e = etatFor(isoOf(c.fin))
        return {
          id: c.ref,
          name: c.ref,
          layer: 'applicatif' as const,
          icon: 'contract' as const,
          status: ETATS[e].status,
          statusLabel: e === 'expire' ? `Expiré le ${c.fin}` : e === 'bientot' ? `Expire le ${c.fin}` : `Jusqu’au ${c.fin}`,
        }
      }),
      emptyLabel: 'Aucun contrat saisi pour ce fournisseur',
      addLabel: 'Ajouter un contrat',
    },
  ]
})
function openRelation(item: RelationItem) {
  if (item.icon === 'contract') goPath('/contrats')
  else if (item.icon === 'app' && hasApplication(item.name)) goFiche(item.name)
  else if (inspected.value) showOnMap(inspected.value.id)
}
function openApp(f: Fournisseur, app: string) {
  if (hasApplication(app)) goFiche(app)
  else inspectedId.value = f.id
}

/* ---------- Carte des fournisseurs ---------- */
function showOnMap(id: number) {
  inspectedId.value = id
  view.value = 'carte'
  nextTick(() => document.getElementById(`mc-scr-four-c${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
}

/* ---------- Nouveau contrat (en mémoire) ---------- */
const contractOpen = ref(false)
const cForm = ref({ ref: '', objet: '', fin: '', app: null as McSelectValue | null })
const cTried = ref(false)
const cRefError = computed(() => (cTried.value && !cForm.value.ref.trim() ? 'Saisissez la référence du contrat, par exemple « 2026-014 ».' : undefined))
const cFinError = computed(() => (cTried.value && !cForm.value.fin ? 'Choisissez la date de fin du contrat.' : undefined))
const cAppOptions = computed(() => (inspected.value?.apps ?? []).map((a) => ({ value: a, label: a })))
function openContract() {
  if (!inspected.value) return
  const year = new Date().getFullYear()
  cForm.value = { ref: `${year}-${String(inspected.value.contrats.length + 1).padStart(3, '0')}`, objet: '', fin: `${year + 1}-12-31`, app: inspected.value.apps[0] ?? null }
  cTried.value = false
  contractOpen.value = true
}
/** « 2027-12-31 » → « 31/12/2027 ». */
const frDate = (iso: string) => iso.split('-').reverse().join('/')
function etatFor(iso: string): Etat {
  const end = new Date(`${iso}T23:59:59`).getTime()
  const now = Date.now()
  if (end < now) return 'expire'
  return end - now < 365 * 24 * 3600 * 1000 ? 'bientot' : 'ok'
}
const isoOf = (fr: string) => fr.split('/').reverse().join('-')
function saveContract() {
  cTried.value = true
  const f = inspected.value
  if (!f || cRefError.value || cFinError.value) return
  f.contrats.push({ ref: cForm.value.ref.trim(), fin: frDate(cForm.value.fin) })
  f.contrats.sort((a, b) => isoOf(a.fin).localeCompare(isoOf(b.fin)))
  // L'état suit le contrat qui court le plus loin.
  f.etat = etatFor(isoOf(f.contrats[f.contrats.length - 1].fin))
  contractOpen.value = false
  toast.success(`Contrat ${cForm.value.ref.trim()} ajouté aux contrats ${de(f.name)}`, { actionLabel: 'Voir les contrats', onAction: () => goPath('/contrats') })
}

/* ---------- Exporter : liste en CSV, ou carte en fichier ---------- */
const csvCell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`
function exportCsv(list: Fournisseur[], name: string) {
  const lines = [['Fournisseur', 'Applications', 'Nombre d’applications', 'Contrats', 'État du contrat', 'Échéance']]
  for (const f of list) lines.push([f.name, f.apps.join(', '), String(f.apps.length), f.contrats.map((c) => c.ref).join(', '), ETATS[f.etat].label, f.contrats[f.contrats.length - 1]?.fin ?? ''])
  const csv = '\uFEFF' + lines.map((l) => l.map(csvCell).join(';')).join('\r\n')
  const fileName = `${fileSlug(name)}.csv`
  download(new Blob([csv], { type: 'text/csv;charset=utf-8' }), fileName)
  toast.success(`Export prêt : ${fileName} (${plural(list.length, 'fournisseur', 'fournisseurs')})`)
}
const shareOpen = ref(false)
const shareItems = computed(() => sorted.value.flatMap((f) => [{ name: f.name, layer: 'applicatif' as const }, ...f.apps.map((a) => ({ name: a, layer: 'applicatif' as const }))]))
const exportMenu = ref({ open: false, x: 0, y: 0 })
const exportItems: ContextMenuItem[] = [
  { id: 'csv', label: 'Liste affichée (CSV, Excel)', icon: 'list' },
  { id: 'all', label: 'Tous les fournisseurs (CSV, Excel)', icon: 'list' },
  { id: 'map', label: 'Carte des fournisseurs (PDF, PNG, SVG)…', icon: 'map' },
]
const rootEl = ref<HTMLElement>()
function anchorMenu(e: MouseEvent, width = 260) {
  const r = rootEl.value!.getBoundingClientRect()
  const b = (e.currentTarget as HTMLElement).getBoundingClientRect()
  return { x: Math.max(8, Math.min(b.right - r.left - width, r.width - width - 8)), y: b.bottom - r.top + 6 }
}
function openExport(e: MouseEvent) {
  exportMenu.value = { open: true, ...anchorMenu(e) }
}
function onExport(item: ContextMenuItem) {
  if (item.id === 'csv') exportCsv(sorted.value, 'Fournisseurs')
  else if (item.id === 'all') exportCsv(fournisseurs, 'Fournisseurs (tous)')
  else if (item.id === 'map') {
    view.value = 'carte'
    shareOpen.value = true
  }
}

/* ---------- Menu « Plus d'actions » d'un fournisseur ---------- */
const menu = ref({ open: false, x: 0, y: 0 })
const menuItems = computed<(ContextMenuItem | 'separator')[]>(() => [
  { id: 'contract', label: 'Ajouter un contrat', icon: 'plus' },
  { id: 'contracts', label: 'Voir les contrats', icon: 'contract' },
  { id: 'map', label: 'Voir sur la carte des fournisseurs', icon: 'map' },
  'separator',
  { id: 'link', label: 'Copier le lien', icon: 'link' },
  { id: 'csv', label: 'Exporter ses applications (CSV)', icon: 'export' },
])
function openMenu(e: MouseEvent) {
  menu.value = { open: true, ...anchorMenu(e) }
}
async function onMenu(item: ContextMenuItem) {
  const f = inspected.value
  if (!f) return
  if (item.id === 'contract') openContract()
  else if (item.id === 'contracts') goPath('/contrats')
  else if (item.id === 'map') showOnMap(f.id)
  else if (item.id === 'link') {
    const ok = await copyLink(`/fournisseurs?nom=${encodeURIComponent(f.name)}`)
    if (ok) toast.success(`Lien vers la fiche fournisseur ${de(f.name)} copié`)
    else toast.info('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
  } else if (item.id === 'csv') exportCsv([f], `Fournisseur ${f.name}`)
}

/* ---------- Adresse : /fournisseurs?nom=AMUE ouvre ce fournisseur ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    const n = typeof q.nom === 'string' ? norm(q.nom) : ''
    if (!n) return
    const f = fournisseurs.find((x) => norm(x.name) === n) ?? fournisseurs.find((x) => x.apps.some((a) => norm(a) === n))
    if (f) inspectedId.value = f.id
  },
  { immediate: true },
)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche applicative', layer: 'applicatif' }, { label: 'Fournisseurs' }]
function onTrail(_s: TrailStep, i: number) {
  // L'accueil range les objets par couche : la couche applicative y est.
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
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))
</script>

<template>
  <div ref="rootEl" class="mc-scr-four">
    <McAppBar class="mc-scr-four-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McAvatarStack :people="people" label="3 personnes sur les fournisseurs" />
        <McButton variant="outline" icon="export" :aria-expanded="exportMenu.open" aria-haspopup="menu" @click="openExport">Exporter</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-four-wrap" :class="{ 'has-insp': inspected }">
      <main class="mc-scr-four-main">
        <header class="mc-scr-four-head">
          <div class="mc-scr-four-titles">
            <p class="mc-over">Couche applicative</p>
            <h1 class="title-lg">Fournisseurs <span class="mc-scr-four-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-four-search" placeholder="Rechercher un fournisseur" :count="searchCount" />
          <McSelect v-model="sortBy" class="mc-scr-four-sort" :options="sortOptions" aria-label="Trier les fournisseurs" />
          <McToggleGroup
            v-model="view"
            label="Affichage"
            :options="[
              { value: 'grille', label: 'Grille', icon: 'dashboard' },
              { value: 'liste', label: 'Liste', icon: 'list' },
              { value: 'carte', label: 'Carte', icon: 'map' },
            ]"
          />
        </header>

        <div class="mc-scr-four-filters">
          <div class="mc-row mc-scr-four-chips" role="group" aria-label="État du contrat">
            <McFilterChip v-if="etat === 'tous'" :label="`Tous · ${bySearch.length}`" :removable="false" />
            <button v-else type="button" class="mc-scr-four-chip" @click="setEtat('tous')">
              <McStatusChip>Tous · {{ bySearch.length }}</McStatusChip>
            </button>
            <template v-for="e in filterChips" :key="e">
              <McFilterChip v-if="etat === e" :label="`${ETATS[e].filter} · ${counts[e]}`" @remove="setEtat('tous')" />
              <button v-else type="button" class="mc-scr-four-chip" :disabled="!counts[e]" @click="setEtat(e)">
                <McStatusChip :status="ETATS[e].status">{{ ETATS[e].filter }} · {{ counts[e] }}</McStatusChip>
              </button>
            </template>
          </div>
          <span class="mc-scr-four-grow" />
          <nav class="mc-scr-four-alpha" aria-label="Aller à la lettre">
            <template v-for="l in alphabet" :key="l">
              <button
                v-if="available.has(l)"
                type="button"
                :class="{ 'is-on': letter === l }"
                :aria-pressed="letter === l"
                :aria-label="`Fournisseurs en ${l}`"
                @click="pickLetter(l)"
              >{{ l }}</button>
              <span v-else aria-hidden="true">{{ l }}</span>
            </template>
          </nav>
        </div>

        <div ref="results" class="mc-scr-four-results">
          <template v-if="view === 'grille'">
            <div v-if="sorted.length" class="mc-scr-four-grid">
              <div v-for="f in sorted" :key="f.id" class="mc-scr-four-cell">
                <McNode
                  layer="applicatif"
                  icon="building"
                  type="Fournisseur"
                  :name="f.name"
                  :subtitle="plural(f.apps.length, 'application', 'applications')"
                  :selected="inspectedId === f.id"
                  :title="f.name"
                  @select="inspect(f.id)"
                  @open="inspect(f.id)"
                />
                <McStatusChip class="mc-scr-four-st" :status="ETATS[f.etat].status" size="sm">{{ ETATS[f.etat].label }}</McStatusChip>
              </div>
            </div>
            <McEmptyState v-else icon="search" title="Aucun fournisseur ne correspond" text="Modifiez la recherche, choisissez un autre état ou une autre lettre.">
              <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
            </McEmptyState>
          </template>
          <template v-else-if="view === 'carte'">
            <div v-if="sorted.length" class="mc-scr-four-map" aria-label="Carte des fournisseurs et de leurs applications">
              <McContainer
                v-for="f in sorted"
                :id="`mc-scr-four-c${f.id}`"
                :key="f.id"
                class="mc-scr-four-mapc"
                :name="f.name"
                type="Fournisseur"
                layer="applicatif"
                icon="building"
                :count="f.apps.length"
                :count-label="plural(f.apps.length, 'application', 'applications')"
                :collapsible="false"
                :selected="inspectedId === f.id"
                :empty="!f.apps.length"
                empty-text="Aucune application"
                tabindex="0"
                @click.self="inspect(f.id)"
                @keydown.enter.self.prevent="inspect(f.id)"
              >
                <button type="button" class="mc-scr-four-mapst" :title="`Inspecter ${f.name}`" @click="inspect(f.id)">
                  <McStatusChip :status="ETATS[f.etat].status" size="sm">{{ ETATS[f.etat].label }}</McStatusChip>
                </button>
                <McNode
                  v-for="a in f.apps"
                  :key="a"
                  :name="a"
                  type="Application"
                  layer="applicatif"
                  icon="app"
                  density="compact"
                  :title="hasApplication(a) ? `Ouvrir la fiche ${de(a)}` : a"
                  @select="openApp(f, a)"
                  @open="openApp(f, a)"
                />
              </McContainer>
            </div>
            <McEmptyState v-else icon="search" title="Aucun fournisseur ne correspond" text="Modifiez la recherche, choisissez un autre état ou une autre lettre.">
              <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
            </McEmptyState>
          </template>
          <McDataTable
            v-else
            v-model:sort="sort"
            class="mc-scr-four-table"
            :columns="columns"
            :rows="rows"
            row-key="id"
            icon="building"
            layer="applicatif"
            caption="Fournisseurs"
            :local-sort="false"
            empty-title="Aucun fournisseur ne correspond"
            empty-text="Modifiez la recherche, choisissez un autre état ou une autre lettre."
            @open="(r) => inspect(r.id)"
          >
            <template #cell-etat="{ row }">
              <McStatusChip :status="ETATS[row.etat as Etat].status" size="sm">{{ ETATS[row.etat as Etat].label }}</McStatusChip>
            </template>
            <template #cell-echeance="{ row }">
              <span v-if="row.echeance">{{ row.echeance }}</span>
              <span v-else class="mc-dt-nil">—</span>
            </template>
            <template #empty-action>
              <McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
            </template>
          </McDataTable>
        </div>

        <p class="mc-cap mc-scr-four-note">Le même gabarit sert au glossaire des applications, aux sites et aux logiciels : grille de nœuds, filtres d’état, index alphabétique, et bascule vers une carte.</p>
      </main>

      <McInspector
        v-if="inspected"
        :key="inspected.id"
        class="mc-scr-four-insp"
        :object="{ name: inspected.name, type: 'Fournisseur', layer: 'applicatif', icon: 'building' }"
        @close="inspectedId = null"
      >
        <template #statuses>
          <McStatusChip :status="ETATS[inspected.etat].status" size="sm">{{ ETATS[inspected.etat].label }}</McStatusChip>
        </template>
        <template #actions>
          <McButton size="sm" icon="contract" @click="goPath('/contrats')">Voir les contrats</McButton>
          <McIconButton size="sm" icon="map" label="Voir sur la carte des fournisseurs" @click="showOnMap(inspected.id)" />
          <McIconButton size="sm" icon="more" label="Plus d’actions" :aria-expanded="menu.open" @click="openMenu" />
        </template>
        <McKeyValueList :items="kv" />
        <McRelationList :groups="groups" :visible="6" @open="openRelation" @add="openContract" />
      </McInspector>
    </div>

    <McContextMenu v-model:open="exportMenu.open" :items="exportItems" header="Exporter" :x="exportMenu.x" :y="exportMenu.y" @select="onExport" />
    <McContextMenu v-model:open="menu.open" :items="menuItems" :header="inspected?.name" :x="menu.x" :y="menu.y" @select="onMenu" />
    <SharePanel v-if="shareOpen" class="mc-scr-four-share" title="Fournisseurs et leurs applications" :items="shareItems" :notes="[]" @close="shareOpen = false" />
    <McModal
      v-if="inspected"
      v-model:open="contractOpen"
      :title="`Ajouter un contrat ${de(inspected.name)}`"
      :type="{ label: 'Contrat', icon: 'contract', layer: 'applicatif' }"
      confirm-label="Ajouter le contrat"
      confirm-icon="plus"
      @confirm="saveContract"
    >
      <div class="mc-scr-four-form">
        <McTextField v-model="cForm.ref" label="Référence" required :error="cRefError" placeholder="ex. 2026-014" />
        <McTextField v-model="cForm.objet" label="Objet" placeholder="ex. Maintenance et support" />
        <McTextField v-model="cForm.fin" type="date" label="Date de fin" required :error="cFinError" help="L’état du fournisseur suit le contrat qui court le plus loin." />
        <McSelect v-if="cAppOptions.length" v-model="cForm.app" label="Application couverte" :options="cAppOptions" clearable />
      </div>
    </McModal>
    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-four { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-four-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-four-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-four-wrap.has-insp { max-width: 1440px; }
.mc-scr-four-main { flex: 1; min-width: 0; display: grid; gap: 16px; }
.mc-scr-four-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-four-titles { flex: 1; min-width: 180px; }
.mc-scr-four-titles .mc-over { margin: 0 0 2px; }
.mc-scr-four-titles h1 { margin: 0; }
.mc-scr-four-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-four-search { width: 260px; }
.mc-scr-four-sort { width: 240px; }
.mc-scr-four-filters { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-four-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-four-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-four-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-four-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-four-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-four-grow { flex: 1; }
.mc-scr-four-alpha { display: flex; gap: 2px; flex-wrap: wrap; }
.mc-scr-four-alpha button, .mc-scr-four-alpha span { width: 24px; height: 26px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; font: 600 12px/1 var(--font-display); box-sizing: border-box; }
.mc-scr-four-alpha button { border: 0; padding: 0; background: transparent; color: var(--ink); cursor: pointer; }
.mc-scr-four-alpha button:hover { background: var(--surface-sunken); }
.mc-scr-four-alpha button.is-on { background: var(--navy); color: var(--on-navy); }
.mc-scr-four-alpha button:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-four-alpha span { color: var(--line-strong); }
.mc-scr-four-results { scroll-margin-top: 96px; }
/* Autant de colonnes que la largeur le permet : 4 à 1440, 3 à 1024, 5 ou 6 sur les grands écrans. */
.mc-scr-four-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 4px 14px; }
.mc-scr-four-cell { position: relative; min-width: 0; }
.mc-scr-four-cell > .mc-node { width: auto; padding-right: 128px; }
.mc-scr-four-st { position: absolute; right: 10px; top: calc(14px + 15px); pointer-events: none; }
.mc-scr-four-note { margin: 0; }
.mc-scr-four-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 18px 14px; align-items: start; padding-top: 16px; }
.mc-scr-four-mapc { cursor: pointer; scroll-margin: 120px; }
.mc-scr-four-mapc > .gb { display: grid; gap: 6px; }
.mc-scr-four-mapc .mc-node { width: auto; cursor: pointer; }
.mc-scr-four-mapst { justify-self: start; padding: 0; border: 0; background: transparent; cursor: pointer; border-radius: 999px; }
.mc-scr-four-mapst:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-four-share { position: fixed; top: 84px; right: 24px; z-index: 40; }
.mc-scr-four-form { display: grid; gap: 14px; }
.mc-scr-four-insp { position: sticky; top: 92px; flex: none; max-height: calc(100vh - 108px); }
/* Grands écrans : la page s'élargit jusqu'à 1760px, barre alignée. */
@media (min-width: 1800px) {
  .mc-scr-four-wrap, .mc-scr-four-wrap.has-insp { max-width: 1760px; padding-inline: 40px; }
  .mc-scr-four-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
}
/* Petits écrans : la barre d'outils passe sur deux lignes, recherche et tri se partagent la largeur. */
@media (max-width: 1180px) {
  .mc-scr-four-wrap { padding-inline: 24px; }
  .mc-scr-four-titles { flex-basis: 100%; }
  .mc-scr-four-search, .mc-scr-four-sort { flex: 1 1 200px; width: auto; }
}
</style>
