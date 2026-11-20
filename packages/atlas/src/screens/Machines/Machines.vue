<script setup lang="ts">
// Écran « Machines » : les machines physiques et virtuelles des trois sites.
// Tableau (ou grille), recherche, tri, filtres de type, de site et d'obsolescence, inspecteur avec les applications
// hébergées et l'impact d'un arrêt (l'écran Impact pour sophocle, un résumé calculé pour les autres).
import { logoFor } from '../../logos/logoFor'
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McNode from '../../components/McNode/McNode.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McLifecycleDate from '../../components/McLifecycleDate/McLifecycleDate.vue'
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
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { getApplication } from '../../data/applications'
import { de, exportCsv } from '../../data/a-texte'
import {
  appsOf,
  composantsOf,
  ETAT_MACHINE,
  getMachine,
  impactOf,
  machineObsolescence,
  machines,
  osOf,
  sites,
  vmsOf,
  type Machine,
  type SiteName,
} from '../../data/infrastructure'
import { getLogiciel, OBSOLESCENCE } from '../../data/logiciels'

const props = withDefaults(
  defineProps<{
    /** Machine sélectionnée à l'ouverture (« einstein »). Dans l'application, l'adresse /machines?id= l'emporte. */
    id?: string
  }>(),
  { id: undefined },
)

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Données ---------- */
type Obso = Status
const OBSO: Record<Obso, { label: string; filter: string; rank: number }> = {
  critical: { label: 'Plus supporté', filter: 'Plus supportées', rank: 0 },
  warn: { label: 'Fin de support proche', filter: 'Fin de support proche', rank: 1 },
  unknown: { label: 'Non renseigné', filter: 'Non renseignées', rank: 2 },
  ok: { label: 'À jour', filter: 'À jour', rank: 3 },
}
interface Item {
  m: Machine
  obso: { status: Status; reason: string }
  os: ReturnType<typeof osOf>
  apps: number
  composants: number
  /** Baie (machine physique) ou ce qui la fait tourner (VM). */
  emplacement: string
}
// Réactif : l'état d'une machine (en service, en maintenance, arrêtée) se change depuis « Plus d'actions ».
const items: Item[] = reactive(machines.map((m) => ({
  m,
  obso: machineObsolescence(m),
  os: osOf(m),
  apps: appsOf(m.name).length,
  composants: composantsOf(m.name).length,
  emplacement: m.kind === 'Machine' ? (m.rack ?? '') : (m.hote ?? ''),
})))
const typeLabel = (m: Machine) => (m.kind === 'Machine' ? 'Machine physique' : 'Machine virtuelle')
const iconOf = (m: Machine) => (m.kind === 'Machine' ? 'server' : 'cloud') as 'server' | 'cloud'

/* ---------- Recherche et filtres ---------- */
const query = ref('')
const type = ref<McSelectValue | null>('tous')
const site = ref<McSelectValue | null>('tous')
const obso = ref<Obso | 'tous'>('tous')
/** Machines sans aucun composant (adresse /machines?filtre=sans-composant, requête « Machines sans composant »). */
const sansComposant = ref(false)
const sansComposantCount = computed(() => items.filter((i) => !i.composants).length)
const bySearch = computed(() => {
  const q = norm(query.value.trim())
  const base = sansComposant.value ? items.filter((i) => !i.composants) : items
  return q ? base.filter((i) => norm(`${i.m.name} ${i.os.name} ${i.m.site} ${i.emplacement} ${appsOf(i.m.name).map((a) => a.name).join(' ')}`).includes(q)) : base
})
const byType = computed(() => (type.value === 'tous' || !type.value ? bySearch.value : bySearch.value.filter((i) => i.m.kind === type.value)))
const bySite = computed(() => (site.value === 'tous' || !site.value ? byType.value : byType.value.filter((i) => i.m.site === site.value)))
const filtered = computed(() => (obso.value === 'tous' ? bySite.value : bySite.value.filter((i) => i.obso.status === obso.value)))
const obsoCounts = computed(() => {
  const c: Record<Obso, number> = { critical: 0, warn: 0, unknown: 0, ok: 0 }
  for (const i of bySite.value) c[i.obso.status]++
  return c
})
const obsoChips: Obso[] = ['critical', 'warn', 'unknown']
const typeOptions = computed(() => [
  { value: 'tous', label: 'Tous les types' },
  { value: 'Machine', label: `Machines physiques · ${bySearch.value.filter((i) => i.m.kind === 'Machine').length}` },
  { value: 'VM', label: `Machines virtuelles · ${bySearch.value.filter((i) => i.m.kind === 'VM').length}` },
])
const siteOptions = computed(() => [
  { value: 'tous', label: 'Tous les sites' },
  ...sites.map((s) => ({ value: s.name, label: `${s.name} · ${byType.value.filter((i) => i.m.site === s.name).length}` })),
])
function clearAll() {
  query.value = ''
  type.value = 'tous'
  site.value = 'tous'
  obso.value = 'tous'
  sansComposant.value = false
}
const hasFilters = computed(() => !!query.value.trim() || type.value !== 'tous' || site.value !== 'tous' || obso.value !== 'tous' || sansComposant.value)

/* ---------- Tri ---------- */
const sortBy = ref<McSelectValue | null>('obso')
const sortOptions = [
  { value: 'obso', label: 'Trier : obsolescence' },
  { value: 'name', label: 'Trier : nom' },
  { value: 'apps', label: 'Trier : nombre d’applications' },
  { value: 'fin', label: 'Trier : fin de support' },
]
const sort = ref<DataTableSort | null>({ key: 'obso', dir: 'asc' })
const DEFAULT_DIR: Record<string, 'asc' | 'desc'> = { obso: 'asc', name: 'asc', apps: 'desc', fin: 'asc' }
watch(sortBy, (v) => {
  if (typeof v === 'string' && v !== sort.value?.key) sort.value = { key: v, dir: DEFAULT_DIR[v] ?? 'asc' }
})
watch(sort, (s) => {
  if (s && DEFAULT_DIR[s.key]) sortBy.value = s.key
})
const byName = (a: Item, b: Item) => a.m.name.localeCompare(b.m.name, 'fr', { sensitivity: 'base' })
const sorted = computed(() => {
  const s = sort.value ?? { key: 'name', dir: 'asc' }
  const dir = s.dir === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    let c = 0
    if (s.key === 'apps') c = a.apps - b.apps
    else if (s.key === 'composants') c = a.composants - b.composants
    else if (s.key === 'obso') c = OBSO[a.obso.status].rank - OBSO[b.obso.status].rank
    else if (s.key === 'fin') c = (a.os.fin ?? '9999').localeCompare(b.os.fin ?? '9999')
    else if (s.key === 'os') c = a.os.name.localeCompare(b.os.name, 'fr')
    else if (s.key === 'type') c = a.m.kind.localeCompare(b.m.kind)
    else if (s.key === 'site') c = a.m.site.localeCompare(b.m.site, 'fr')
    else if (s.key === 'etat') c = a.m.etat.localeCompare(b.m.etat)
    else c = byName(a, b)
    return c * dir || byName(a, b)
  })
})

/* ---------- Affichage ---------- */
const view = ref('liste')
interface Row {
  id: string
  name: string
  type: string
  site: string
  fin: string
  apps: number
  composants: number
  etat: string
  obso: string
}
const rows = computed<Row[]>(() =>
  sorted.value.map((i) => ({
    id: i.m.name,
    name: i.m.name,
    type: i.m.kind,
    site: i.m.site,
    fin: i.os.fin ?? '',
    apps: i.apps,
    composants: i.composants,
    etat: i.m.etat,
    obso: i.obso.status,
  })),
)
const itemOf = (name: string) => items.find((i) => i.m.name === name)!
// Une ligne par machine, une information par colonne : le type et la baie passent sous le nom,
// la fin de support est une simple date, et seul l'état (puce) porte la couleur.
const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Machine', sortable: true },
  { key: 'site', label: 'Site', sortable: true, width: '120px' },
  { key: 'os', label: 'Système', sortable: true },
  { key: 'fin', label: 'Fin de support', sortable: true, width: '128px' },
  { key: 'apps', label: 'Applis', sortable: true, align: 'right', width: '80px' },
  { key: 'obso', label: 'État', sortable: true, width: '200px' },
]
/** Quand ce n'est pas le système qui est en cause, c'est un logiciel installé : la puce le dit. */
const obsoLabel = (r: Row) => {
  const i = itemOf(r.id)
  if (i.os.status === i.obso.status || r.obso === 'unknown') return OBSO[r.obso as Status].label
  return r.obso === 'critical' ? 'Logiciel plus supporté' : 'Logiciel en fin de support'
}
const shortDate = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '')
/** Sous le nom : physique ou virtuelle, où elle est, et son état si elle n'est pas en service. */
const subOf = (r: Row) => {
  const i = itemOf(r.id)
  return [r.type === 'Machine' ? 'Physique' : 'Virtuelle', i.emplacement, r.etat !== 'service' ? ETAT_MACHINE[r.etat as Machine['etat']].label : '']
    .filter(Boolean)
    .join(' · ')
}

/* ---------- Inspecteur ---------- */
const inspectedName = ref<string | null>(null)
const inspected = computed(() => (inspectedName.value ? items.find((i) => i.m.name === inspectedName.value) : undefined))
const showImpact = ref(false)
function inspect(name: string) {
  inspectedName.value = inspectedName.value === name ? null : name
  showImpact.value = false
}
function select(name: string) {
  if (!getMachine(name)) return
  inspectedName.value = getMachine(name)!.name
  showImpact.value = false
}
const kv = computed<KeyValueItem[]>(() => {
  const i = inspected.value
  if (!i) return []
  const m = i.m
  return [
    { key: 'Site', value: m.site, href: pathHref(`/sites?site=${m.site}`) },
    m.kind === 'Machine' ? { key: 'Baie', value: m.rack ?? null } : { key: 'Hébergée sur', value: m.hote ?? null },
    ...(m.cluster ? [{ key: 'Cluster', value: m.cluster }] : []),
    { key: 'Système', value: i.os.name, ...(i.os.logiciel ? { href: pathHref(`/logiciels?id=${i.os.logiciel.id}`) } : {}) },
    { key: 'État', value: ETAT_MACHINE[m.etat].label },
  ]
})
function openKv(item: KeyValueItem, e: MouseEvent) {
  e.preventDefault()
  const i = inspected.value
  if (!i) return
  if (item.key === 'Site') goPath(`/sites?site=${i.m.site}`)
  else if (item.key === 'Système' && i.os.logiciel) goPath(`/logiciels?id=${i.os.logiciel.id}`)
}
const groups = computed<RelationGroup[]>(() => {
  const i = inspected.value
  if (!i) return []
  const m = i.m
  const out: RelationGroup[] = []
  out.push({
    verb: 'Héberge',
    items: appsOf(m.name).map((a) => ({
      id: `app-${a.slug}`,
      name: a.name,
      layer: 'applicatif' as const,
      icon: 'app' as const,
      meta: plural(composantsOf(m.name).filter((c) => c.app === a.name).length || 1, 'composant', 'composants'),
    })),
    emptyLabel: m.kind === 'Machine' && vmsOf(m).length ? 'Aucune application en propre : elle fait tourner des machines virtuelles' : 'Aucune application hébergée',
  })
  out.push({
    verb: 'Composants',
    items: composantsOf(m.name).map((c) => {
      const logs = c.logiciels.map((n) => getLogiciel(n)).filter((l) => !!l)
      const bad = logs.find((l) => l.obsolescence === 'obsolete') ?? logs.find((l) => l.obsolescence === 'bientot')
      return {
        id: `cmp-${c.name}`,
        name: c.name,
        layer: 'technique' as const,
        icon: 'chip' as const,
        ...(bad ? { status: OBSOLESCENCE[bad.obsolescence].status, statusLabel: bad.name } : { meta: logs.map((l) => l.name).join(', ') || 'Version non renseignée' }),
      }
    }),
    emptyLabel: 'Aucun composant sur cette machine',
  })
  const vms = vmsOf(m)
  if (vms.length)
    out.push({
      verb: m.cluster ? `Fait tourner, avec le cluster ${m.cluster}` : 'Fait tourner',
      items: vms.map((v) => ({ id: `vm-${v.name}`, name: v.name, layer: 'technique' as const, icon: 'cloud' as const, meta: plural(appsOf(v.name).length, 'application', 'applications') })),
    })
  return out
})
function openRelation(item: RelationItem) {
  const id = String(item.id ?? '')
  if (id.startsWith('app-')) goFiche(item.name)
  else if (id.startsWith('vm-')) select(item.name)
  else if (id.startsWith('cmp-')) openComposant(item.name)
}

/* ---------- Composant ouvert dans l'inspecteur ----------
   Un composant n'a pas de fiche à lui : on le détaille au-dessus des relations (application, environnement, logiciels). */
const composantName = ref<string | null>(null)
const composant = computed(() => (inspected.value && composantName.value ? composantsOf(inspected.value.m.name).find((c) => c.name === composantName.value) : undefined))
function openComposant(name: string) {
  composantName.value = composantName.value === name ? null : name
}
watch(inspectedName, () => (composantName.value = null))
const composantGroups = computed<RelationGroup[]>(() => {
  const c = composant.value
  if (!c) return []
  return [
    { verb: 'Composant de', items: [{ id: `app-${c.app}`, name: getApplication(c.app)?.name ?? c.app, layer: 'applicatif' as const, icon: 'app' as const, meta: `Environnement ${c.env}` }] },
    {
      verb: 'Emploie',
      items: c.logiciels.map((n) => {
        const l = getLogiciel(n)
        return { id: `log-${l?.id ?? n}`, name: l?.name ?? n, layer: 'technique' as const, icon: 'software' as const, logo: logoFor(l?.name ?? n, l?.editeur), ...(l && l.obsolescence !== 'ok' ? { status: OBSOLESCENCE[l.obsolescence].status, statusLabel: OBSOLESCENCE[l.obsolescence].label } : {}) }
      }),
      emptyLabel: 'Aucun logiciel renseigné',
    },
  ]
})
function openComposantRelation(item: RelationItem) {
  const id = String(item.id ?? '')
  if (id.startsWith('app-')) goFiche(item.name)
  else if (id.startsWith('log-')) {
    const l = getLogiciel(item.name)
    goPath(l ? `/logiciels?id=${l.id}` : '/logiciels?filtre=sans-composant')
  }
}

/* ---------- Plus d'actions ---------- */
const moreOpen = ref(false)
let moreClosedAt = 0
watch(moreOpen, (o) => {
  if (!o) moreClosedAt = Date.now()
})
function toggleMore() {
  if (Date.now() - moreClosedAt > 250) moreOpen.value = true
}
const moreItems = computed<(ContextMenuItem | 'separator')[]>(() => {
  const i = inspected.value
  if (!i) return []
  const etat = i.m.etat
  return [
    { id: 'copy', label: 'Copier le lien de la machine', icon: 'link' },
    { id: 'site', label: `Voir le site de ${i.m.site}`, icon: 'pin' },
    ...(i.os.logiciel ? [{ id: 'os', label: `Voir ${i.os.logiciel.name} dans les logiciels`, icon: 'software' as const }] : []),
    { id: 'csv', label: 'Exporter la machine (CSV)', icon: 'export' },
    'separator',
    ...(etat !== 'service' ? [{ id: 'service', label: 'Remettre en service', icon: 'check' as const }] : []),
    ...(etat !== 'maintenance' ? [{ id: 'maintenance', label: 'Passer en maintenance', icon: 'alert-triangle' as const }] : []),
    ...(etat !== 'arret' ? [{ id: 'arret', label: 'Déclarer arrêtée', icon: 'x' as const, danger: true }] : []),
  ]
})
function onMore(item: ContextMenuItem) {
  const i = inspected.value
  if (!i) return
  const name = i.m.name
  if (item.id === 'copy')
    copyLink(`/machines?id=${name}`).then((ok) => (ok ? toast.success(`Lien ${de(name)} copié`) : toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')))
  else if (item.id === 'site') goPath(`/sites?site=${i.m.site}`)
  else if (item.id === 'os' && i.os.logiciel) goPath(`/logiciels?id=${i.os.logiciel.id}`)
  else if (item.id === 'csv') {
    const file = exportCsv(`Machine ${name}`, ['Machine', 'Type', 'Site', 'Emplacement', 'Système', 'Fin de support', 'État', 'Obsolescence', 'Applications', 'Composants'], [
      [name, typeLabel(i.m), i.m.site, i.emplacement, i.os.name, i.os.fin ?? '', ETAT_MACHINE[i.m.etat].label, i.obso.reason, appsOf(name).map((a) => a.name).join(', '), composantsOf(name).map((c) => c.name).join(', ')],
    ])
    toast.success(`${file} téléchargé`)
  } else if (item.id === 'service' || item.id === 'maintenance' || item.id === 'arret') {
    const before = i.m.etat
    i.m.etat = item.id
    toast.success(`${name} : ${ETAT_MACHINE[item.id].label.toLowerCase()}`, { actionLabel: 'Annuler', onAction: () => (i.m.etat = before) })
  }
}

/* ---------- Exporter la liste ---------- */
function exportList() {
  const rows = sorted.value.map((i) => [i.m.name, typeLabel(i.m), i.m.site, i.emplacement, i.os.name, i.os.fin ?? '', ETAT_MACHINE[i.m.etat].label, OBSO[i.obso.status].label, i.apps, i.composants])
  const file = exportCsv(hasFilters.value ? 'Machines filtrées' : 'Machines', ['Machine', 'Type', 'Site', 'Baie ou hôte', 'Système', 'Fin de support', 'État', 'Obsolescence', 'Applications', 'Composants'], rows)
  toast.success(`${file} téléchargé : ${plural(rows.length, 'machine', 'machines')}${hasFilters.value ? ', filtres appliqués' : ''}`)
}

/* ---------- Impact d'un arrêt ---------- */
function onImpact() {
  const i = inspected.value
  if (!i) return
  if (i.m.name === 'sophocle') goPath('/impact')
  else showImpact.value = !showImpact.value
}
const impact = computed(() => (inspected.value ? impactOf(inspected.value.m) : null))
const impactText = computed(() => {
  const i = inspected.value
  const im = impact.value
  if (!i || !im) return ''
  const name = i.m.name
  if (im.relais.length) {
    const vms = vmsOf(i.m).length
    return `Les ${vms} machines virtuelles du cluster ${i.m.cluster} redémarrent sur ${im.relais.map((r) => r.name).join(' et ')} : aucune application ne s’arrête, mais le cluster perd un tiers de sa capacité.`
  }
  if (!im.hosted.length) return `L’arrêt de ${name} n’arrête aucune application : elle n’en héberge pas.`
  const parts = [`${plural(im.hosted.length, 'application s’arrête', 'applications s’arrêtent')} avec ${name}`]
  if (im.vms.length) parts[0] += `, dont celles de ${plural(im.vms.length, 'machine virtuelle', 'machines virtuelles')} (${im.vms.map((v) => v.name).join(', ')})`
  parts.push(im.touched.length ? `${plural(im.touched.length, 'autre application est touchée', 'autres applications sont touchées')} par les flux.` : 'aucun flux connu n’en touche d’autres.')
  return `${parts[0]} ; ${parts[1]}`.replace(/^./, (s) => s.toUpperCase())
})
const impactGroups = computed<RelationGroup[]>(() => {
  const im = impact.value
  if (!im) return []
  const out: RelationGroup[] = []
  if (im.hosted.length) out.push({ verb: 'S’arrêtent', items: im.hosted.map((a) => ({ id: `app-${a.slug}`, name: a.name, layer: 'applicatif' as const, icon: 'app' as const, status: 'critical' as const, statusLabel: 'Arrêtée' })) })
  if (im.touched.length)
    out.push({ verb: 'Touchées par les flux', items: im.touched.map((n) => ({ id: `app-${n}`, name: n, layer: 'applicatif' as const, icon: 'app' as const, status: 'warn' as const, statusLabel: 'Flux coupé' })) })
  return out
})

/* ---------- Adresse : /machines?id=sophocle, ?site=Paris ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  [routeQuery, () => props.id],
  ([q, id]) => {
    const s = typeof q.site === 'string' ? q.site : undefined
    if (s && sites.some((x) => x.name === s)) site.value = s as SiteName
    if (q.filtre === 'sans-composant') sansComposant.value = true
    if (typeof q.obso === 'string' && q.obso in OBSO) obso.value = q.obso as Obso
    if (q.type === 'VM' || q.type === 'Machine') type.value = q.type
    const want = typeof q.id === 'string' ? q.id : id
    if (want && getMachine(want)) select(want)
  },
  { immediate: true },
)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Machines' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [
  { name: 'Lionel Fabian', initials: 'LF', color: 2 },
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
]
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Machines', value: bySite.value.length }, ...(Object.keys(OBSO) as Obso[]).map((o) => ({ key: OBSO[o].filter, value: obsoCounts.value[o] })), { key: 'Sans composant', value: sansComposantCount.value }])
</script>

<template>
  <div class="mc-scr-mach">
    <McAppBar class="mc-scr-mach-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McAvatarStack :people="people" label="2 personnes sur les machines" />
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-mach-wrap">
      <main class="mc-scr-mach-main">
        <header class="mc-scr-mach-head">
          <div class="mc-scr-mach-titles">
            <p class="mc-over">Couche technique</p>
            <h1 class="title-lg">Machines <span class="mc-scr-mach-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-mach-search" placeholder="Rechercher une machine, un système, une application" :count="searchCount" />
          <McSelect v-model="sortBy" class="mc-scr-mach-sort" :options="sortOptions" aria-label="Trier les machines" />
          <McToggleGroup
            v-model="view"
            label="Affichage"
            :options="[
              { value: 'liste', label: 'Liste', icon: 'list' },
              { value: 'grille', label: 'Grille', icon: 'dashboard' },
            ]"
          />
        </header>

        <div class="mc-scr-mach-filters">
          <McSelect v-model="type" class="mc-scr-mach-sel" :options="typeOptions" aria-label="Type de machine" size="sm" />
          <McSelect v-model="site" class="mc-scr-mach-sel" :options="siteOptions" aria-label="Site" size="sm" />
          <span class="mc-scr-mach-sep" aria-hidden="true" />
          <div class="mc-row mc-scr-mach-chips" role="group" aria-label="Obsolescence">
            <McFilterChip v-if="obso === 'tous'" :label="`Toutes · ${bySite.length}`" :removable="false" />
            <button v-else type="button" class="mc-scr-mach-chip" @click="obso = 'tous'">
              <McStatusChip>Toutes · {{ bySite.length }}</McStatusChip>
            </button>
            <template v-for="o in obsoChips" :key="o">
              <McFilterChip v-if="obso === o" :label="`${OBSO[o].filter} · ${obsoCounts[o]}`" @remove="obso = 'tous'" />
              <button v-else type="button" class="mc-scr-mach-chip" :disabled="!obsoCounts[o]" @click="obso = o">
                <McStatusChip :status="o">{{ OBSO[o].filter }} · {{ obsoCounts[o] }}</McStatusChip>
              </button>
            </template>
          </div>
          <McFilterChip v-if="sansComposant" :label="`Sans composant · ${sansComposantCount}`" @remove="sansComposant = false" />
          <button v-else type="button" class="mc-scr-mach-chip" :disabled="!sansComposantCount" title="Machines sur lesquelles aucun composant n’est déclaré" @click="sansComposant = true">
            <McStatusChip>Sans composant · {{ sansComposantCount }}</McStatusChip>
          </button>
          <span class="mc-scr-mach-grow" />
          <McButton v-if="hasFilters" variant="ghost" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
        </div>

        <div class="mc-scr-mach-results">
          <template v-if="view === 'grille'">
            <div v-if="sorted.length" class="mc-scr-mach-grid">
              <div v-for="i in sorted" :key="i.m.name" class="mc-scr-mach-cell">
                <McNode
                  layer="technique"
                  :icon="iconOf(i.m)"
                  :type="i.m.kind"
                  :name="i.m.name"
                  :subtitle="`${i.m.site} · ${plural(i.apps, 'application', 'applications')}`"
                  :member="i.m.cluster ? `Cluster ${i.m.cluster}` : undefined"
                  :selected="inspectedName === i.m.name"
                  :title="i.m.name"
                  @select="inspect(i.m.name)"
                  @open="inspect(i.m.name)"
                />
                <McStatusChip v-if="i.obso.status !== 'ok'" class="mc-scr-mach-st" :status="i.obso.status" size="sm">{{ OBSO[i.obso.status].label }}</McStatusChip>
              </div>
            </div>
            <McEmptyState v-else icon="server" layer="technique" title="Aucune machine ne correspond" text="Modifiez la recherche ou retirez un filtre.">
              <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
            </McEmptyState>
          </template>
          <McDataTable
            v-else
            v-model:sort="sort"
            class="mc-scr-mach-table"
            :columns="columns"
            :rows="rows"
            row-key="id"
            :icon="(r: Row) => (r.type === 'Machine' ? 'server' : 'cloud')"
            layer="technique"
            caption="Machines"
            :local-sort="false"
            empty-title="Aucune machine ne correspond"
            empty-text="Modifiez la recherche ou retirez un filtre."
            empty-icon="server"
            @open="(r: Row) => inspect(r.id)"
          >
            <template #cell-name="{ row }">
              <span class="mc-scr-mach-two">
                <span class="mc-scr-mach-name" :class="{ 'is-on': inspectedName === row.id }">{{ row.name }}</span>
                <span class="mc-scr-mach-sub">{{ subOf(row) }}</span>
              </span>
            </template>
            <template #cell-os="{ row }">{{ itemOf(row.id).os.name }}</template>
            <template #cell-fin="{ row }">
              <span class="mc-scr-mach-fin" :class="`is-${itemOf(row.id).os.status}`">{{ shortDate(row.fin) || '—' }}</span>
            </template>
            <template #cell-obso="{ row }">
              <McStatusChip v-if="row.obso !== 'ok'" :status="row.obso as Status" size="sm" :title="itemOf(row.id).obso.reason">{{ obsoLabel(row) }}</McStatusChip>
              <span v-else class="mc-scr-mach-ok">À jour</span>
            </template>
            <template #empty-action>
              <McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
            </template>
          </McDataTable>
        </div>
      </main>

      <McInspector
        :key="inspected?.m.name ?? 'resume'"
        class="mc-insp-dock mc-scr-mach-insp"
        :object="inspected ? { name: inspected.m.name, type: typeLabel(inspected.m), layer: 'technique', icon: iconOf(inspected.m), description: inspected.m.description } : undefined"
        empty-title="Sélectionnez une machine"
        empty-text="Son support, ses composants et les applications qu’elle héberge s’affichent ici."
        @close="inspectedName = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McStatusChip :status="inspected.obso.status" size="sm">{{ inspected.obso.status === 'ok' ? 'À jour' : inspected.obso.reason }}</McStatusChip>
          <McStatusChip v-if="inspected.m.etat !== 'service'" :status="ETAT_MACHINE[inspected.m.etat].status" size="sm">{{ ETAT_MACHINE[inspected.m.etat].label }}</McStatusChip>
        </template>
        <template v-if="inspected" #actions>
          <McButton size="sm" variant="secondary" icon="impact" :aria-expanded="inspected.m.name === 'sophocle' ? undefined : showImpact" @click="onImpact">
            {{ showImpact ? 'Masquer l’impact' : 'Voir l’impact d’un arrêt' }}
          </McButton>
          <McIconButton size="sm" icon="map" label="Voir son site" @click="goPath(`/sites?site=${inspected.m.site}`)" />
          <span class="mc-scr-mach-more">
            <McIconButton size="sm" icon="more" label="Plus d’actions" :variant="moreOpen ? 'pressed' : 'default'" @click="toggleMore" />
            <McContextMenu v-model:open="moreOpen" :items="moreItems" :header="inspected.m.name" :x="0" :y="34" class="mc-scr-mach-menu" @select="onMore" />
          </span>
        </template>
        <template v-if="inspected">
          <section v-if="showImpact && impact" class="mc-scr-mach-impact" aria-label="Impact d’un arrêt">
            <p class="mc-over">Si {{ inspected.m.name }} s’arrête</p>
            <p class="mc-scr-mach-impact-text">{{ impactText }}</p>
            <McRelationList v-if="impactGroups.length" :groups="impactGroups" :visible="4" @open="openRelation" />
          </section>
          <section v-if="composant" class="mc-scr-mach-cmp" :aria-label="`Composant ${composant.name}`">
            <div class="mc-scr-mach-cmp-hd">
              <p class="mc-over">Composant</p>
              <McIconButton size="sm" icon="x" label="Fermer le composant" @click="composantName = null" />
            </div>
            <p class="mc-scr-mach-cmp-name">{{ composant.name }}</p>
            <McRelationList :groups="composantGroups" :visible="4" @open="openComposantRelation" />
          </section>
          <McKeyValueList :items="kv" @open="openKv" />
          <div class="mc-scr-mach-life">
            <span class="mc-scr-mach-life-k">Fin de support du système</span>
            <McLifecycleDate :date="inspected.os.fin" />
          </div>
          <McRelationList :groups="groups" :visible="5" @open="openRelation" />
        </template>
      </McInspector>
    </div>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-mach { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-mach-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-mach-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-mach-main { flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.mc-scr-mach-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-mach-titles { flex: 1; min-width: 180px; }
.mc-scr-mach-titles .mc-over { margin: 0 0 2px; }
.mc-scr-mach-titles h1 { margin: 0; }
.mc-scr-mach-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-mach-search { width: 320px; }
.mc-scr-mach-sort { width: 230px; }
.mc-scr-mach-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-mach-sel { width: 210px; }
.mc-scr-mach-sep { width: 1px; height: 20px; background: var(--line); margin: 0 4px; }
.mc-scr-mach-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-mach-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-mach-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-mach-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-mach-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-mach-grow { flex: 1; }
.mc-scr-mach-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px 14px; }
.mc-scr-mach-cell { position: relative; min-width: 0; }
.mc-scr-mach-cell > .mc-node { width: auto; padding-right: 150px; }
.mc-scr-mach-st { position: absolute; right: 10px; top: calc(14px + 15px); pointer-events: none; }
.mc-scr-mach-two { display: inline-flex; flex-direction: column; align-items: flex-start; gap: 2px; min-width: 0; }
.mc-scr-mach-sub { font-size: 12px; line-height: 16px; font-weight: 400; color: var(--ink-subtle); }
.mc-scr-mach-name { font-weight: 600; }
.mc-scr-mach-name.is-on { color: var(--accent); }
.mc-scr-mach-fin { font-variant-numeric: tabular-nums; color: var(--ink-muted); }
.mc-scr-mach-fin.is-warn { color: var(--status-warn); }
.mc-scr-mach-fin.is-critical { color: var(--status-critical); }
.mc-scr-mach-ok { font-size: 13px; color: var(--ink-subtle); }
.mc-scr-mach-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-mach-more { position: relative; display: inline-flex; }
.mc-scr-mach-menu.is-placed { left: auto !important; right: 0; }
.mc-scr-mach-cmp { display: grid; gap: 6px; padding: 12px; border-radius: var(--radius-md); background: var(--surface-sunken); border: 1px solid var(--line); }
.mc-scr-mach-cmp-hd { display: flex; align-items: center; justify-content: space-between; }
.mc-scr-mach-cmp-hd .mc-over { margin: 0; }
.mc-scr-mach-cmp-name { margin: 0; font: 600 14px/20px var(--font-display); color: var(--ink); }
.mc-scr-mach-life { display: flex; flex-direction: column; gap: 4px; }
.mc-scr-mach-life-k { font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-mach-impact { display: grid; gap: 8px; padding: 12px; border-radius: var(--radius-md); background: var(--status-critical-soft); border: 1px solid color-mix(in srgb, var(--status-critical) 30%, transparent); }
.mc-scr-mach-impact .mc-over { margin: 0; color: var(--status-critical); }
.mc-scr-mach-impact-text { margin: 0; font-size: 13px; line-height: 18px; color: var(--ink); }
@media (min-width: 1800px) {
}
@media (max-width: 1280px) {
  .mc-scr-mach-titles { flex-basis: 100%; }
  .mc-scr-mach-search, .mc-scr-mach-sort { flex: 1 1 200px; width: auto; }
  .mc-scr-mach-sel { width: 190px; }
}
</style>
