<script setup lang="ts">
// Écran « Logiciels » : la vue Obsolescence de myCarto. Les 40 logiciels rangés en trois groupes
// (obsolète, en voie d'obsolescence, non obsolète), avec leur fin de support et leurs déploiements.
// Clic sur un logiciel : l'inspecteur montre où il tourne (applications vers leur fiche, machines vers l'écran Machines).
import { logoFor } from '../../logos/logoFor'
import { computed, getCurrentInstance, reactive, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
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
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { de, exportCsv } from '../../data/a-texte'
import { echeanceOf, frDate, getLogiciel, logiciels, OBSOLESCENCE, type Logiciel, type Obsolescence } from '../../data/logiciels'
import { composants, deploiementsOf, getMachine } from '../../data/infrastructure'
import { getApplication } from '../../data/applications'

const props = withDefaults(
  defineProps<{
    /** Logiciel sélectionné à l'ouverture (« tomcat-5 »). Dans l'application, l'adresse /logiciels?id= l'emporte. */
    id?: string
  }>(),
  { id: undefined },
)

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const deployLabel = (n: number) => (n ? plural(n, 'déploiement', 'déploiements') : 'Aucun déploiement')

/* ---------- Données ---------- */
interface Item {
  l: Logiciel
  deps: ReturnType<typeof deploiementsOf>
  apps: string[]
}
// Réactif : un logiciel se modifie (famille, éditeur, obsolescence, dates) depuis l'inspecteur.
const items: Item[] = reactive(
  logiciels.map((l) => {
    const deps = deploiementsOf(l)
    return { l, deps, apps: [...new Set(deps.map((d) => d.app).filter((a): a is string => !!a))] }
  }),
)
const ORDER: Obsolescence[] = ['obsolete', 'bientot', 'ok']

/* ---------- Recherche et filtres ---------- */
const query = ref('')
const etat = ref<Obsolescence | 'tous'>('tous')
const famille = ref<McSelectValue | null>('toutes')
const bySearch = computed(() => {
  const q = norm(query.value.trim())
  return q ? items.filter((i) => norm(`${i.l.name} ${i.l.famille} ${i.l.editeur ?? ''} ${i.apps.join(' ')}`).includes(q)) : items
})
const byFamille = computed(() => (famille.value === 'toutes' || !famille.value ? bySearch.value : bySearch.value.filter((i) => i.l.famille === famille.value)))
const filtered = computed(() => (etat.value === 'tous' ? byFamille.value : byFamille.value.filter((i) => i.l.obsolescence === etat.value)))
const counts = computed(() => {
  const c: Record<Obsolescence, number> = { obsolete: 0, bientot: 0, ok: 0 }
  for (const i of byFamille.value) c[i.l.obsolescence]++
  return c
})
const familleOptions = computed(() => [
  { value: 'toutes', label: 'Toutes les familles' },
  ...[...new Set(logiciels.map((l) => l.famille))].sort((a, b) => a.localeCompare(b, 'fr')).map((f) => ({ value: f, label: `${f} · ${bySearch.value.filter((i) => i.l.famille === f).length}` })),
])
function clearAll() {
  query.value = ''
  etat.value = 'tous'
  famille.value = 'toutes'
}
const hasFilters = computed(() => !!query.value.trim() || etat.value !== 'tous' || famille.value !== 'toutes')

/* ---------- Tri ---------- */
const sortBy = ref<McSelectValue | null>('deps')
const sortOptions = [
  { value: 'deps', label: 'Trier : nombre de déploiements' },
  { value: 'name', label: 'Trier : nom' },
  { value: 'fin', label: 'Trier : fin de support' },
]
const DIR: Record<string, 'asc' | 'desc'> = { deps: 'desc', name: 'asc', fin: 'asc' }
const sort = ref<DataTableSort | null>({ key: 'deps', dir: 'desc' })
watch(sortBy, (v) => {
  if (typeof v === 'string' && v !== sort.value?.key) sort.value = { key: v, dir: DIR[v] }
})
watch(sort, (s) => {
  if (s && DIR[s.key]) sortBy.value = s.key
})
const byName = (a: Item, b: Item) => a.l.name.localeCompare(b.l.name, 'fr', { sensitivity: 'base' })
const sorted = computed(() => {
  const s = sort.value ?? { key: 'name', dir: 'asc' }
  const dir = s.dir === 'asc' ? 1 : -1
  return [...filtered.value].sort((a, b) => {
    let c = 0
    if (s.key === 'deps') c = a.deps.length - b.deps.length
    else if (s.key === 'fin') c = (echeanceOf(a.l) ?? '9999').localeCompare(echeanceOf(b.l) ?? '9999')
    else if (s.key === 'etat') c = OBSOLESCENCE[a.l.obsolescence].rank - OBSOLESCENCE[b.l.obsolescence].rank
    else if (s.key === 'famille') c = a.l.famille.localeCompare(b.l.famille, 'fr')
    else if (s.key === 'apps') c = a.apps.length - b.apps.length
    else c = byName(a, b)
    return c * dir || byName(a, b)
  })
})
const sections = computed(() => ORDER.map((o) => ({ o, items: sorted.value.filter((i) => i.l.obsolescence === o) })).filter((s) => s.items.length))

/* ---------- Affichage ---------- */
const view = ref('grille')
interface Row {
  id: string
  name: string
  famille: string
  etat: Obsolescence
  fin: string
  deps: number
  apps: number
}
const rows = computed<Row[]>(() => sorted.value.map((i) => ({ id: i.l.id, name: i.l.name, famille: i.l.famille, etat: i.l.obsolescence, fin: echeanceOf(i.l) ?? '', deps: i.deps.length, apps: i.apps.length })))
const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Logiciel', sortable: true },
  { key: 'famille', label: 'Famille', sortable: true, width: '200px' },
  { key: 'etat', label: 'Obsolescence', sortable: true, width: '210px' },
  { key: 'fin', label: 'Fin de support', sortable: true, width: '260px' },
  { key: 'deps', label: 'Déploiements', sortable: true, align: 'right', width: '130px' },
  { key: 'apps', label: 'Applications', sortable: true, align: 'right', width: '120px' },
]
const lifeProps = (l: Logiciel) =>
  l.finEtendue ? { date: l.finEtendue, label: 'Support étendu jusqu’au', pastLabel: 'Plus supporté depuis le' } : { date: l.fin, label: l.obsolescence === 'ok' ? 'Supporté jusqu’au' : 'Fin de support le' }

/* ---------- Inspecteur ---------- */
const inspectedId = ref<string | null>(null)
const inspected = computed(() => items.find((i) => i.l.id === inspectedId.value))
function inspect(id: string) {
  inspectedId.value = inspectedId.value === id ? null : id
}
const kv = computed<KeyValueItem[]>(() => {
  const i = inspected.value
  if (!i) return []
  return [
    { key: 'Famille', value: i.l.famille },
    { key: 'Éditeur', value: i.l.editeur },
    { key: 'Fin du support standard', value: frDate(i.l.fin) || null },
    ...(i.l.finEtendue ? [{ key: 'Fin du support étendu', value: frDate(i.l.finEtendue) }] : []),
    { key: 'Déploiements', value: i.deps.length },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const i = inspected.value
  if (!i) return []
  const apps = i.apps.map((a) => {
    const comps = i.deps.filter((d) => d.app === a)
    return {
      id: `app-${a}`,
      name: getApplication(a)?.name ?? a,
      layer: 'applicatif' as const,
      icon: 'app' as const,
      meta: comps.length === 1 ? comps[0].name : plural(comps.length, 'composant', 'composants'),
    }
  })
  const machineNames = [...new Set(i.deps.map((d) => d.machine).filter((m): m is string => !!m))]
  const machines = machineNames.map((n) => {
    const m = getMachine(n)
    const sys = i.deps.some((d) => d.kind === 'systeme' && d.machine === n)
    return {
      id: `mach-${n}`,
      name: n,
      layer: 'technique' as const,
      icon: (m?.kind === 'VM' ? 'cloud' : 'server') as 'cloud' | 'server',
      ...(sys ? { meta: 'Système de la machine' } : { meta: m ? `${m.site} · ${m.kind === 'VM' ? 'VM' : 'machine physique'}` : '' }),
    }
  })
  return [
    { verb: 'Employé par', items: apps, emptyLabel: 'Aucune application ne l’emploie' },
    { verb: 'Installé sur', items: machines, emptyLabel: 'Installé sur aucune machine' },
  ]
})
function openRelation(item: RelationItem) {
  const id = String(item.id ?? '')
  if (id.startsWith('app-')) {
    if (getApplication(item.name)) goFiche(item.name)
    else {
      // Application hors inventaire (pas de fiche) : on ouvre la machine qui porte son composant.
      const machine = inspected.value?.deps.find((d) => d.app === id.slice(4))?.machine
      if (machine) goPath(`/machines?id=${machine}`)
    }
  } else if (id.startsWith('mach-')) goPath(`/machines?id=${item.name}`)
}

/* ---------- Composants sans logiciel (adresse /logiciels?filtre=sans-composant) ---------- */
const sansLogiciel = ref(false)
const composantsSansLogiciel = composants.filter((c) => !c.logiciels.length)

/* ---------- Modifier un logiciel ---------- */
const editOpen = ref(false)
const form = reactive({ famille: '', editeur: '', obsolescence: 'ok' as Obsolescence, fin: '', finEtendue: '' })
function openEdit() {
  const l = inspected.value?.l
  if (!l) return
  Object.assign(form, { famille: l.famille, editeur: l.editeur ?? '', obsolescence: l.obsolescence, fin: l.fin ?? '', finEtendue: l.finEtendue ?? '' })
  editOpen.value = true
}
const obsoOptions = ORDER.map((o) => ({ value: o, label: OBSOLESCENCE[o].label, status: OBSOLESCENCE[o].status }))
const formError = computed(() => (form.fin && form.finEtendue && form.finEtendue < form.fin ? 'Le support étendu se termine après le support standard : corrigez l’une des deux dates.' : undefined))
const formDirty = computed(() => {
  const l = inspected.value?.l
  return !!l && (form.famille !== l.famille || form.editeur !== (l.editeur ?? '') || form.obsolescence !== l.obsolescence || form.fin !== (l.fin ?? '') || form.finEtendue !== (l.finEtendue ?? ''))
})
function saveEdit() {
  const l = inspected.value?.l
  if (!l || formError.value || !form.famille.trim()) return
  l.famille = form.famille.trim()
  l.editeur = form.editeur.trim() || null
  l.obsolescence = form.obsolescence
  l.fin = form.fin || null
  if (form.finEtendue) l.finEtendue = form.finEtendue
  else delete l.finEtendue
  editOpen.value = false
  toast.success(`${l.name} enregistré`)
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
  return [
    { id: 'edit', label: 'Modifier', icon: 'pencil' },
    { id: 'copy', label: 'Copier le lien du logiciel', icon: 'link' },
    { id: 'csv', label: 'Exporter ses déploiements (CSV)', icon: 'export', disabled: !i.deps.length },
    ...(i.l.obsolescence !== 'ok' && i.apps.length ? [{ id: 'expo', label: 'Voir les applications exposées', icon: 'alert-triangle' as const }] : []),
    'separator',
    ...ORDER.filter((o) => o !== i.l.obsolescence).map((o) => ({ id: `obso-${o}`, label: `Classer : ${OBSOLESCENCE[o].label.toLowerCase()}`, icon: (o === 'ok' ? 'check' : 'alert-triangle') as 'check' | 'alert-triangle' })),
  ]
})
function onMore(item: ContextMenuItem) {
  const i = inspected.value
  if (!i) return
  if (item.id === 'edit') openEdit()
  else if (item.id === 'copy')
    copyLink(`/logiciels?id=${i.l.id}`).then((ok) => (ok ? toast.success(`Lien ${de(i.l.name)} copié`) : toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')))
  else if (item.id === 'csv') {
    const file = exportCsv(`Déploiements ${i.l.name}`, ['Logiciel', 'Où', 'Application', 'Machine'], i.deps.map((d) => [i.l.name, d.kind === 'systeme' ? 'Système de la machine' : d.name, d.app ?? '', d.machine ?? '']))
    toast.success(`${file} téléchargé : ${plural(i.deps.length, 'déploiement', 'déploiements')}`)
  } else if (item.id === 'expo') goPath('/applications-obsoletes')
  else if (item.id?.startsWith('obso-')) {
    const before = i.l.obsolescence
    i.l.obsolescence = item.id.slice(5) as Obsolescence
    toast.success(`${i.l.name} classé : ${OBSOLESCENCE[i.l.obsolescence].label.toLowerCase()}`, { actionLabel: 'Annuler', onAction: () => (i.l.obsolescence = before) })
  }
}

/* ---------- Exporter la liste ---------- */
function exportList() {
  const rows = sorted.value.map((i) => [i.l.name, i.l.famille, i.l.editeur ?? '', OBSOLESCENCE[i.l.obsolescence].label, frDate(i.l.fin), frDate(i.l.finEtendue), i.deps.length, i.apps.join(', ')])
  const file = exportCsv(hasFilters.value ? 'Logiciels filtrés' : 'Logiciels', ['Logiciel', 'Famille', 'Éditeur', 'Obsolescence', 'Fin du support standard', 'Fin du support étendu', 'Déploiements', 'Applications'], rows)
  toast.success(`${file} téléchargé : ${plural(rows.length, 'logiciel', 'logiciels')}`)
}

/* ---------- Adresse : /logiciels?id=tomcat-5 ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  [routeQuery, () => props.id],
  ([q, id]) => {
    const want = typeof q.id === 'string' ? q.id : id
    const l = getLogiciel(want)
    if (l) inspectedId.value = l.id
    if (q.filtre === 'sans-composant' || q.filtre === 'sans-logiciel') sansLogiciel.value = true
    if (typeof q.etat === 'string' && (ORDER as string[]).includes(q.etat)) etat.value = q.etat as Obsolescence
  },
  { immediate: true },
)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Logiciels' }]
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
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))
const exposedApps = computed(() => new Set(items.filter((i) => i.l.obsolescence !== 'ok').flatMap((i) => i.apps)).size)
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Logiciels', value: byFamille.value.length }, ...(Object.keys(counts.value) as Obsolescence[]).map((o) => ({ key: OBSOLESCENCE[o].label, value: counts.value[o] }))])
</script>

<template>
  <div class="mc-scr-logi">
    <McAppBar class="mc-scr-logi-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McAvatarStack :people="people" label="2 personnes sur les logiciels" />
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-logi-wrap">
      <main class="mc-scr-logi-main">
        <header class="mc-scr-logi-head">
          <div class="mc-scr-logi-titles">
            <p class="mc-over">Couche technique · Obsolescence</p>
            <h1 class="title-lg">Logiciels <span class="mc-scr-logi-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-logi-search" placeholder="Rechercher un logiciel ou une application" :count="searchCount" />
          <McSelect v-model="sortBy" class="mc-scr-logi-sort" :options="sortOptions" aria-label="Trier les logiciels" />
          <McToggleGroup
            v-model="view"
            label="Affichage"
            :options="[
              { value: 'grille', label: 'Grille', icon: 'dashboard' },
              { value: 'liste', label: 'Liste', icon: 'list' },
            ]"
          />
        </header>

        <div class="mc-scr-logi-filters">
          <div class="mc-row mc-scr-logi-chips" role="group" aria-label="Obsolescence">
            <McFilterChip v-if="etat === 'tous'" :label="`Tous · ${byFamille.length}`" :removable="false" />
            <button v-else type="button" class="mc-scr-logi-chip" @click="etat = 'tous'">
              <McStatusChip>Tous · {{ byFamille.length }}</McStatusChip>
            </button>
            <template v-for="o in ORDER" :key="o">
              <McFilterChip v-if="etat === o" :label="`${OBSOLESCENCE[o].label} · ${counts[o]}`" @remove="etat = 'tous'" />
              <button v-else type="button" class="mc-scr-logi-chip" :disabled="!counts[o]" @click="etat = o">
                <McStatusChip :status="OBSOLESCENCE[o].status">{{ OBSOLESCENCE[o].label }} · {{ counts[o] }}</McStatusChip>
              </button>
            </template>
          </div>
          <McSelect v-model="famille" class="mc-scr-logi-sel" :options="familleOptions" aria-label="Famille de logiciel" size="sm" />
          <span class="mc-scr-logi-grow" />
          <McButton v-if="hasFilters" variant="ghost" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
          <a v-else class="mc-scr-logi-link" :href="pathHref('/applications-obsoletes')" @click.prevent="goPath('/applications-obsoletes')">
            {{ plural(exposedApps, 'application exposée', 'applications exposées') }} à l’obsolescence →
          </a>
        </div>

        <section v-if="sansLogiciel" class="mc-scr-logi-nosoft" aria-label="Composants sans logiciel">
          <div class="mc-scr-logi-nosoft-hd">
            <h2 class="mc-scr-logi-h2">
              <McStatusChip status="unknown">Composants sans logiciel</McStatusChip>
              <span class="mc-scr-logi-count">{{ plural(composantsSansLogiciel.length, 'composant', 'composants') }} : version à renseigner</span>
            </h2>
            <McButton variant="ghost" size="sm" icon="x" @click="sansLogiciel = false">Masquer</McButton>
          </div>
          <ul v-if="composantsSansLogiciel.length" class="mc-scr-logi-nosoft-list">
            <li v-for="c in composantsSansLogiciel" :key="`${c.app}-${c.name}`">
              <span class="mc-scr-logi-nosoft-name">{{ c.name }}</span>
              <a v-if="getApplication(c.app)" :href="pathHref(`/fiche/${getApplication(c.app)!.slug}`)" @click.prevent="goFiche(c.app)">{{ c.app }}</a>
              <span v-else>{{ c.app }}</span>
              <a v-if="c.machine" :href="pathHref(`/machines?id=${c.machine}`)" @click.prevent="goPath(`/machines?id=${c.machine}`)">{{ c.machine }}</a>
              <span class="mc-scr-logi-count">{{ c.env }}</span>
            </li>
          </ul>
          <p v-else class="mc-cap">Tous les composants déclarent au moins un logiciel.</p>
        </section>
        <McButton v-else-if="composantsSansLogiciel.length" class="mc-scr-logi-nosoft-btn" variant="ghost" size="sm" icon="chip" @click="sansLogiciel = true">
          {{ plural(composantsSansLogiciel.length, 'composant sans logiciel', 'composants sans logiciel') }}
        </McButton>

        <template v-if="view === 'grille'">
          <template v-if="sections.length">
            <section v-for="s in sections" :key="s.o" class="mc-scr-logi-sec" :aria-label="OBSOLESCENCE[s.o].label">
              <h2 class="mc-scr-logi-h2">
                <McStatusChip :status="OBSOLESCENCE[s.o].status">{{ OBSOLESCENCE[s.o].label }}</McStatusChip>
                <span class="mc-scr-logi-count">{{ plural(s.items.length, 'logiciel', 'logiciels') }}</span>
              </h2>
              <div class="mc-scr-logi-grid">
                <div v-for="i in s.items" :key="i.l.id" class="mc-scr-logi-cell" :class="`is-${s.o}`">
                  <McNode
                    layer="technique"
                    icon="software"
                    :logo="logoFor(i.l.name, i.l.editeur)"
                    monogram
                    type="Logiciel"
                    :name="i.l.name"
                    :subtitle="deployLabel(i.deps.length)"
                    :status="s.o === 'ok' ? undefined : OBSOLESCENCE[s.o].status"
                    :selected="inspectedId === i.l.id"
                    :title="i.l.name"
                    @select="inspect(i.l.id)"
                    @open="inspect(i.l.id)"
                  />
                  <McLifecycleDate class="mc-scr-logi-life" v-bind="lifeProps(i.l)" />
                </div>
              </div>
            </section>
          </template>
          <McEmptyState v-else icon="software" layer="technique" title="Aucun logiciel ne correspond" text="Modifiez la recherche ou retirez un filtre.">
            <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
          </McEmptyState>
        </template>
        <McDataTable
          v-else
          v-model:sort="sort"
          :columns="columns"
          :rows="rows"
          row-key="id"
          icon="software"
          :logo="(r: Row) => logoFor(r.name, getLogiciel(r.id)?.editeur)"
          :monogram="(r: Row) => r.name"
          layer="technique"
          caption="Logiciels"
          :local-sort="false"
          empty-title="Aucun logiciel ne correspond"
          empty-text="Modifiez la recherche ou retirez un filtre."
          empty-icon="software"
          @open="(r: Row) => inspect(r.id)"
        >
          <template #cell-etat="{ row }">
            <McStatusChip :status="OBSOLESCENCE[row.etat].status" size="sm">{{ OBSOLESCENCE[row.etat].label }}</McStatusChip>
          </template>
          <template #cell-fin="{ row }">
            <McLifecycleDate v-bind="lifeProps(getLogiciel(row.id)!)" />
          </template>
          <template #empty-action>
            <McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
          </template>
        </McDataTable>
      </main>

      <McInspector
        :key="inspected?.l.id ?? 'resume'"
        class="mc-insp-dock mc-scr-logi-insp"
        :object="inspected ? { name: inspected.l.name, type: 'Logiciel', layer: 'technique', icon: 'software', logo: logoFor(inspected.l.name, inspected.l.editeur), monogram: true } : undefined"
        empty-title="Sélectionnez un logiciel"
        empty-text="Son cycle de vie, les machines où il tourne et les applications exposées s’affichent ici."
        @close="inspectedId = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McStatusChip :status="OBSOLESCENCE[inspected.l.obsolescence].status" size="sm">{{ OBSOLESCENCE[inspected.l.obsolescence].label }}</McStatusChip>
        </template>
        <template v-if="inspected" #actions>
          <McButton
            v-if="inspected.l.obsolescence !== 'ok' && inspected.apps.length"
            size="sm"
            variant="secondary"
            icon="alert-triangle"
            @click="goPath('/applications-obsoletes')"
          >Applications exposées</McButton>
          <McButton v-else size="sm" variant="outline" icon="pencil" @click="openEdit">Modifier</McButton>
          <span class="mc-scr-logi-more">
            <McIconButton size="sm" icon="more" label="Plus d’actions" :variant="moreOpen ? 'pressed' : 'default'" @click="toggleMore" />
            <McContextMenu v-model:open="moreOpen" :items="moreItems" :header="inspected.l.name" :x="0" :y="34" class="mc-scr-logi-menu" @select="onMore" />
          </span>
        </template>
        <template v-if="inspected">
          <McLifecycleDate v-bind="lifeProps(inspected.l)" />
          <McKeyValueList :items="kv" />
          <McRelationList :groups="groups" :visible="6" @open="openRelation" />
        </template>
      </McInspector>
    </div>

    <McModal
      v-if="inspected"
      v-model:open="editOpen"
      :title="`Modifier ${inspected.l.name}`"
      :type="{ label: 'Logiciel', icon: 'software', layer: 'technique' }"
      :dirty="formDirty"
      :confirm-disabled="!formDirty || !!formError || !form.famille.trim()"
      @confirm="saveEdit"
    >
      <div class="mc-grid2">
        <McTextField v-model="form.famille" label="Famille" required placeholder="ex. Serveur web" :error="form.famille.trim() ? undefined : 'Indiquez la famille : Serveur web, Base de données…'" />
        <McTextField v-model="form.editeur" label="Éditeur" placeholder="ex. Apache Software Foundation" />
      </div>
      <McSelect v-model="form.obsolescence" label="Obsolescence" :options="obsoOptions" />
      <div class="mc-grid2">
        <McTextField v-model="form.fin" type="date" label="Fin du support standard" />
        <McTextField v-model="form.finEtendue" type="date" label="Fin du support étendu" :error="formError" help="Laisser vide si l’éditeur n’en propose pas." />
      </div>
    </McModal>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-logi { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-logi-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-logi-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-logi-main { flex: 1; min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; }
.mc-scr-logi-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-logi-titles { flex: 1; min-width: 180px; }
.mc-scr-logi-titles .mc-over { margin: 0 0 2px; }
.mc-scr-logi-titles h1 { margin: 0; }
.mc-scr-logi-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-logi-search { width: 280px; }
.mc-scr-logi-sort { width: 260px; }
.mc-scr-logi-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-logi-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-logi-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-logi-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-logi-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-logi-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-logi-sel { width: 240px; }
.mc-scr-logi-grow { flex: 1; }
.mc-scr-logi-link { font-size: 13px; font-weight: 600; color: var(--accent); text-decoration: none; }
.mc-scr-logi-link:hover { text-decoration: underline; }
.mc-scr-logi-more { position: relative; display: inline-flex; }
.mc-scr-logi-menu.is-placed { left: auto !important; right: 0; }
.mc-scr-logi-nosoft { display: grid; gap: 8px; padding: 14px 16px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
.mc-scr-logi-nosoft-hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.mc-scr-logi-nosoft-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.mc-scr-logi-nosoft-list li { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr) 48px; gap: 12px; align-items: center; padding: 6px 8px; border-radius: var(--radius-sm); background: var(--surface-sunken); font-size: 13px; }
.mc-scr-logi-nosoft-list a { color: var(--accent); text-decoration: none; font-weight: 600; }
.mc-scr-logi-nosoft-list a:hover { text-decoration: underline; }
.mc-scr-logi-nosoft-name { font-weight: 600; }
.mc-scr-logi-nosoft-btn { justify-self: start; }
.mc-scr-logi-sec { display: grid; gap: 4px; }
.mc-scr-logi-sec + .mc-scr-logi-sec { margin-top: 8px; padding-top: 16px; border-top: 1px solid var(--line); }
.mc-scr-logi-h2 { display: flex; align-items: center; gap: 10px; margin: 0; font: inherit; }
.mc-scr-logi-count { font-size: 12px; color: var(--ink-subtle); }
.mc-scr-logi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px 14px; }
.mc-scr-logi-cell { min-width: 0; display: grid; gap: 6px; }
.mc-scr-logi-cell > .mc-node { width: auto; }
.mc-scr-logi-life { font-size: 12px; padding-left: 2px; }
.mc-scr-logi-insp .body { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 1800px) {
}
@media (max-width: 1280px) {
  .mc-scr-logi-titles { flex-basis: 100%; }
  .mc-scr-logi-search, .mc-scr-logi-sort { flex: 1 1 200px; width: auto; }
}
</style>
