<script setup lang="ts">
// Écran « Traitements » (couche métier) : le registre des traitements RGPD.
// Tableau triable, recherche, filtres (base légale, données sensibles, analyse d'impact, transferts hors UE), inspecteur.
// L'adresse /traitements?traitement=<id> ouvre directement un traitement.
import { computed, ref } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McInspector from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { copyLink, goFiche, goPath, inApp, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { hasApplication } from '../../data/applications'
import { getObjetDonnee, SENSIBILITES, type Sensibilite } from '../../data/donnees'
import { basesLegales, sensibiliteOf, traitements, type Traitement } from '../../data/rgpd'
import { downloadCsv } from '../../data/b-export'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
/** Adresse avec paramètres dans l'application ; dans Storybook, l'écran seul. */
const target = (p: string) => (inApp() ? p : p.split('?')[0])

/* ---------- Filtres ---------- */
type Focus = 'tous' | 'sensibles' | 'aipd' | 'horsue'
const FOCUS: Record<Exclude<Focus, 'tous'>, { label: string; status: 'critical' | 'warn' | 'neutral'; test: (t: Traitement) => boolean }> = {
  sensibles: { label: 'Données sensibles', status: 'critical', test: (t) => sensibiliteOf(t) === 'sensible' },
  aipd: { label: 'Analyse d’impact', status: 'neutral', test: (t) => t.aipd },
  horsue: { label: 'Transfert hors UE', status: 'warn', test: (t) => t.horsUE },
}
const focusKeys = Object.keys(FOCUS) as Exclude<Focus, 'tous'>[]
const query = ref('')
const focus = ref<Focus>('tous')
const base = ref<McSelectValue | null>(null)
const baseOptions = basesLegales.map((b) => ({ value: b, label: b }))

const bySearch = computed(() => {
  const q = norm(query.value.trim())
  let list = traitements
  if (base.value) list = list.filter((t) => t.baseLegale === base.value)
  if (!q) return list
  return list.filter((t) => norm(`${t.ref} ${t.name} ${t.finalite} ${t.categories.join(' ')} ${t.applications.join(' ')} ${t.responsable} ${t.service}`).includes(q))
})
const filtered = computed(() => (focus.value === 'tous' ? bySearch.value : bySearch.value.filter(FOCUS[focus.value].test)))
const counts = computed(() => Object.fromEntries(focusKeys.map((k) => [k, bySearch.value.filter(FOCUS[k].test).length])) as Record<Exclude<Focus, 'tous'>, number>)
function clearAll() {
  query.value = ''
  focus.value = 'tous'
  base.value = null
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))

/* ---------- Tableau ---------- */
const RANK: Record<Sensibilite, number> = { sensible: 0, personnelle: 1, interne: 2 }
interface Row {
  id: string
  name: string
  ref: string
  baseLegale: string
  sensibilite: Sensibilite
  donnees: number
  duree: string
  applications: number
  responsable: string
}
const rows = computed<Row[]>(() =>
  filtered.value.map((t) => ({
    id: t.id,
    name: t.name,
    ref: t.ref,
    baseLegale: t.baseLegale,
    sensibilite: sensibiliteOf(t),
    donnees: t.categories.length,
    duree: t.duree,
    applications: t.applications.length,
    responsable: t.responsable,
  })),
)
const sort = ref<DataTableSort | null>({ key: 'ref', dir: 'asc' })
const columns: DataTableColumn<Row>[] = [
  { key: 'ref', label: 'N°', sortable: true, width: '84px' },
  { key: 'name', label: 'Traitement', sortable: true },
  { key: 'baseLegale', label: 'Base légale', sortable: true, width: '200px' },
  { key: 'sensibilite', label: 'Données', sortable: true, width: '190px', sortValue: (r) => RANK[r.sensibilite] * 100 - r.donnees },
  { key: 'duree', label: 'Conservation', muted: true, width: '200px' },
  { key: 'applications', label: 'Applications', sortable: true, align: 'right', width: '120px' },
  { key: 'responsable', label: 'Responsable', sortable: true, width: '150px' },
]

/* ---------- Inspecteur ---------- */
const initial = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('traitement') : null
const inspectedId = ref<string | null>(traitements.some((t) => t.id === initial) ? initial : null)
const inspected = computed(() => traitements.find((t) => t.id === inspectedId.value))
function inspect(id: string) {
  inspectedId.value = inspectedId.value === id ? null : id
}
const kv = computed<KeyValueItem[]>(() => {
  const t = inspected.value
  if (!t) return []
  return [
    { key: 'N° au registre', value: t.ref, code: true },
    { key: 'Base légale', value: t.baseLegale },
    { key: 'Personnes concernées', value: t.personnes },
    { key: 'Durée de conservation', value: t.duree },
    { key: 'Responsable', value: `${t.responsable}, ${t.service}` },
    { key: 'Analyse d’impact', value: t.aipd ? 'Réalisée' : 'Non requise' },
    { key: 'Transfert hors UE', value: t.horsUE ? 'Oui' : 'Non' },
    { key: 'Mis à jour le', value: t.miseAJour },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const t = inspected.value
  if (!t) return []
  return [
    {
      verb: 'Données traitées',
      items: t.categories.map((c) => {
        const d = getObjetDonnee(c)
        const s = d?.sensibilite ?? 'personnelle'
        return { id: `d-${c}`, name: c, layer: 'fonctionnel' as const, icon: 'database' as const, ...(s === 'sensible' ? { status: 'critical' as const, statusLabel: 'Sensible' } : {}) }
      }),
      emptyLabel: 'Aucune donnée renseignée',
    },
    {
      verb: 'Applications concernées',
      items: t.applications.map((a) => ({ id: `a-${a}`, name: a, layer: 'applicatif' as const, icon: 'app' as const })),
      emptyLabel: 'Aucune application : traitement hors du SI cartographié',
    },
  ]
})
function openRelation(item: RelationItem) {
  if (item.icon === 'database') {
    const d = getObjetDonnee(item.name)
    goPath(target(d ? `/donnees?donnee=${d.id}` : '/donnees'))
  } else if (hasApplication(item.name)) goFiche(item.name)
  // Hors de la cartographie (partenaire externe…) : la liste se filtre sur ce nom.
  else query.value = item.name
}
async function shareInspected() {
  const t = inspected.value
  if (!t) return
  if (await copyLink(target(`/traitements?traitement=${t.id}`))) toast.success(`Lien du traitement « ${t.name} » copié`)
  else toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Traitements' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
/** Exporte le registre affiché (recherche et filtres appliqués) en CSV. */
function exportRegistre() {
  const list = filtered.value
  const file = downloadCsv(
    'Registre des traitements',
    ['N°', 'Traitement', 'Finalité', 'Base légale', 'Données', 'Catégories', 'Personnes concernées', 'Conservation', 'Applications', 'Responsable', 'Service', 'Analyse d’impact', 'Transfert hors UE', 'Mis à jour le'],
    list.map((t) => [t.ref, t.name, t.finalite, t.baseLegale, SENSIBILITES[sensibiliteOf(t)].label, t.categories.join(', '), t.personnes, t.duree, t.applications.join(', '), t.responsable, t.service, t.aipd ? 'Réalisée' : 'Non requise', t.horsUE ? 'Oui' : 'Non', t.miseAJour]),
  )
  toast.success(`${plural(list.length, 'traitement exporté', 'traitements exportés')} : ${file}`)
}
/** Les données du traitement ouvert, filtrées dans l'écran Données. */
function voirDonnees() {
  const t = inspected.value
  goPath(target(t ? `/donnees?traitement=${t.id}` : '/donnees'))
}
const sensibleCount = traitements.filter((t) => sensibiliteOf(t) === 'sensible').length
const aipdMissing = traitements.filter((t) => sensibiliteOf(t) === 'sensible' && !t.aipd)
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Traitements', value: bySearch.value.length }, ...focusKeys.map((k) => ({ key: FOCUS[k].label, value: counts.value[k] }))])
</script>

<template>
  <div class="mc-scr-trt">
    <McAppBar class="mc-scr-trt-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="database" :href="pathHref('/donnees')" @click.prevent="goPath('/donnees')">Données</McButton>
        <McButton variant="outline" icon="export" @click="exportRegistre">Exporter le registre</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-trt-wrap">
      <main class="mc-scr-trt-main">
        <header class="mc-scr-trt-head">
          <div class="mc-scr-trt-titles">
            <p class="mc-over">Couche métier · Registre RGPD</p>
            <h1 class="title-lg">Traitements <span class="mc-scr-trt-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-trt-search" placeholder="Rechercher un traitement" :count="searchCount" />
          <McSelect v-model="base" class="mc-scr-trt-base" :options="baseOptions" placeholder="Toutes les bases légales" clearable aria-label="Base légale" />
        </header>

        <div class="mc-row mc-scr-trt-chips" role="group" aria-label="Filtrer les traitements">
          <McFilterChip v-if="focus === 'tous'" :label="`Tous · ${bySearch.length}`" :removable="false" />
          <button v-else type="button" class="mc-scr-trt-chip" @click="focus = 'tous'"><McStatusChip>Tous · {{ bySearch.length }}</McStatusChip></button>
          <template v-for="k in focusKeys" :key="k">
            <McFilterChip v-if="focus === k" :label="`${FOCUS[k].label} · ${counts[k]}`" @remove="focus = 'tous'" />
            <button v-else type="button" class="mc-scr-trt-chip" :disabled="!counts[k]" @click="focus = k">
              <McStatusChip :status="FOCUS[k].status">{{ FOCUS[k].label }} · {{ counts[k] }}</McStatusChip>
            </button>
          </template>
        </div>

        <McDataTable
          v-model:sort="sort"
          class="mc-scr-trt-table"
          :columns="columns"
          :rows="rows"
          row-key="id"
          icon="shield"
          layer="metier"
          caption="Registre des traitements"
          empty-title="Aucun traitement ne correspond"
          empty-text="Modifiez la recherche ou retirez un filtre."
          @open="(r) => inspect(r.id)"
        >
          <template #cell-ref="{ row }"><span class="mc-scr-trt-ref">{{ row.ref }}</span></template>
          <template #cell-name="{ row }"><span class="mc-scr-trt-name" :class="{ 'is-on': inspectedId === row.id }">{{ row.name }}</span></template>
          <template #cell-sensibilite="{ row }">
            <span class="mc-scr-trt-data">
              <McStatusChip :status="SENSIBILITES[row.sensibilite].status" size="sm">{{ SENSIBILITES[row.sensibilite].label }}</McStatusChip>
              <span class="mc-cap">{{ plural(row.donnees, 'catégorie', 'catégories') }}</span>
            </span>
          </template>
          <template #cell-applications="{ row }">
            <span v-if="row.applications">{{ row.applications }}</span>
            <span v-else class="mc-dt-nil">—</span>
          </template>
          <template #empty-action>
            <McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
          </template>
        </McDataTable>

        <p class="mc-cap mc-scr-trt-note">
          {{ plural(sensibleCount, 'traitement porte', 'traitements portent') }} sur des données sensibles (santé).
          <template v-if="aipdMissing.length">{{ plural(aipdMissing.length, 'n’a', 'n’ont') }} pas encore d’analyse d’impact.</template>
          <template v-else>Tous ont une analyse d’impact.</template>
        </p>
      </main>

      <McInspector
        :key="inspected?.id ?? 'resume'"
        class="mc-insp-dock mc-scr-trt-insp"
        :object="inspected ? { name: inspected.name, type: 'Traitement', layer: 'metier', icon: 'shield', description: inspected.finalite } : undefined"
        empty-title="Sélectionnez un traitement"
        empty-text="Sa finalité, ses données et ses applications s’affichent ici."
        @close="inspectedId = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McStatusChip :status="SENSIBILITES[sensibiliteOf(inspected)].status" size="sm">Données {{ SENSIBILITES[sensibiliteOf(inspected)].label.toLowerCase() }}s</McStatusChip>
          <McStatusChip v-if="inspected.horsUE" status="warn" size="sm">Transfert hors UE</McStatusChip>
        </template>
        <template v-if="inspected" #actions>
          <McButton size="sm" icon="database" :disabled="!inspected.categories.length" @click="voirDonnees">Voir les données</McButton>
          <McIconButton size="sm" icon="link" label="Copier le lien du traitement" @click="shareInspected" />
        </template>
        <template v-if="inspected">
          <McKeyValueList :items="kv" />
          <McRelationList :groups="groups" :visible="6" @open="openRelation" />
        </template>
      </McInspector>
    </div>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-trt { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-trt-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-trt-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-trt-main { flex: 1; min-width: 0; display: grid; gap: 16px; }
.mc-scr-trt-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-trt-titles { flex: 1; min-width: 200px; }
.mc-scr-trt-titles .mc-over { margin: 0 0 2px; }
.mc-scr-trt-titles h1 { margin: 0; }
.mc-scr-trt-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-trt-search { width: 340px; }
.mc-scr-trt-base { width: 240px; }
.mc-scr-trt-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-trt-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-trt-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-trt-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-trt-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-trt-table { overflow-x: auto; }
.mc-scr-trt-ref { font: 500 12px/16px var(--font-mono); color: var(--ink-muted); }
.mc-scr-trt-name { font-weight: 600; }
.mc-scr-trt-name.is-on { color: var(--accent); }
.mc-scr-trt-data { display: inline-flex; align-items: center; gap: 8px; }
.mc-scr-trt-note { margin: 0; }
.mc-scr-trt-insp .body { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 1800px) {
}
@media (max-width: 1180px) {
  .mc-scr-trt-titles { flex-basis: 100%; }
  .mc-scr-trt-search, .mc-scr-trt-base { flex: 1 1 220px; width: auto; }
}
</style>
