<script setup lang="ts">
// Écran « Données » (couche fonctionnelle) : les objets de données, leur sensibilité, les flux qui les transportent,
// les applications qui les gèrent et les traitements RGPD qui les utilisent.
// L'adresse /donnees?donnee=<id> ouvre directement une donnée ; /donnees?traitement=<id> ne garde que les données
// d'un traitement du registre (lien « Voir les données » de l'écran Traitements).
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
import { copyLink, ficheHref, goFiche, goPath, inApp, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { hasApplication } from '../../data/applications'
import { objetsDonnees, SENSIBILITES, type ObjetDonnee, type Sensibilite } from '../../data/donnees'
import { traitements, traitementsOfDonnee } from '../../data/rgpd'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const target = (p: string) => (inApp() ? p : p.split('?')[0])

/* ---------- Filtres ---------- */
const SENS_KEYS: Sensibilite[] = ['sensible', 'personnelle', 'interne']
const query = ref('')
const sens = ref<Sensibilite | 'tous'>('tous')
const famille = ref<McSelectValue | null>(null)
const familles = [...new Set(objetsDonnees.map((d) => d.famille))].sort((a, b) => a.localeCompare(b, 'fr'))
const familleOptions = familles.map((f) => ({ value: f, label: f }))
/** Traitement dont on ne garde que les données (adresse ?traitement=). */
const initialTraitement = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('traitement') : null
const traitementId = ref<string | null>(traitements.some((t) => t.id === initialTraitement) ? initialTraitement : null)
const traitement = computed(() => traitements.find((t) => t.id === traitementId.value))
const bySearch = computed(() => {
  const q = norm(query.value.trim())
  let list = objetsDonnees
  const t = traitement.value
  if (t) list = list.filter((d) => t.categories.includes(d.name) || t.categories.includes(d.id))
  if (famille.value) list = list.filter((d) => d.famille === famille.value)
  if (!q) return list
  return list.filter((d) => norm(`${d.name} ${d.description} ${d.famille} ${d.applications.join(' ')}`).includes(q))
})
const filtered = computed(() => (sens.value === 'tous' ? bySearch.value : bySearch.value.filter((d) => d.sensibilite === sens.value)))
const counts = computed(() => Object.fromEntries(SENS_KEYS.map((k) => [k, bySearch.value.filter((d) => d.sensibilite === k).length])) as Record<Sensibilite, number>)
function clearAll() {
  query.value = ''
  sens.value = 'tous'
  famille.value = null
  traitementId.value = null
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined))

/* ---------- Tableau ---------- */
const RANK: Record<Sensibilite, number> = { sensible: 0, personnelle: 1, interne: 2 }
interface Row {
  id: string
  name: string
  sensibilite: Sensibilite
  famille: string
  source: string
  flux: number
  applications: number
  traitements: number
}
const rows = computed<Row[]>(() =>
  filtered.value.map((d) => ({
    id: d.id,
    name: d.name,
    sensibilite: d.sensibilite,
    famille: d.famille,
    source: d.source ?? '',
    flux: d.flux.length,
    applications: d.applications.length,
    traitements: traitementsOfDonnee(d.name).length,
  })),
)
const sort = ref<DataTableSort | null>({ key: 'sensibilite', dir: 'asc' })
const columns: DataTableColumn<Row>[] = [
  { key: 'name', label: 'Donnée', sortable: true },
  { key: 'sensibilite', label: 'Sensibilité', sortable: true, width: '160px', sortValue: (r) => RANK[r.sensibilite] },
  { key: 'famille', label: 'Famille', sortable: true, width: '170px' },
  { key: 'source', label: 'Application de référence', sortable: true, width: '200px' },
  { key: 'flux', label: 'Flux', sortable: true, align: 'right', width: '80px' },
  { key: 'applications', label: 'Applications', sortable: true, align: 'right', width: '120px' },
  { key: 'traitements', label: 'Traitements', sortable: true, align: 'right', width: '116px' },
]
function openApp(e: MouseEvent, name: string) {
  e.stopPropagation()
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goFiche(name)
}

/* ---------- Inspecteur ---------- */
const initial = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('donnee') : null
const inspectedId = ref<string | null>(objetsDonnees.some((d) => d.id === initial) ? initial : null)
const inspected = computed<ObjetDonnee | undefined>(() => objetsDonnees.find((d) => d.id === inspectedId.value))
function inspect(id: string) {
  inspectedId.value = inspectedId.value === id ? null : id
}
const kv = computed<KeyValueItem[]>(() => {
  const d = inspected.value
  if (!d) return []
  return [
    { key: 'Sensibilité', value: SENSIBILITES[d.sensibilite].label },
    { key: 'Famille', value: d.famille },
    { key: 'Application de référence', value: d.source, href: d.source && hasApplication(d.source) ? ficheHref(d.source) : undefined },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const d = inspected.value
  if (!d) return []
  return [
    {
      verb: 'Transportée par',
      items: d.flux.map((f) => ({ id: `f-${f.from}-${f.to}`, name: `${f.from} → ${f.to}`, layer: 'applicatif' as const, icon: 'flow' as const })),
      emptyLabel: 'Aucun flux cartographié ne transporte cette donnée',
    },
    {
      verb: 'Gérée par',
      items: d.applications.map((a) => ({ id: `a-${a}`, name: a, layer: 'applicatif' as const, icon: 'app' as const, ...(a === d.source ? { status: 'neutral' as const, statusLabel: 'Référence' } : {}) })),
      emptyLabel: 'Aucune application cartographiée',
    },
    {
      verb: 'Utilisée par les traitements',
      items: traitementsOfDonnee(d.name).map((t) => ({ id: `t-${t.id}`, name: t.name, layer: 'metier' as const, icon: 'shield' as const, meta: t.ref })),
      emptyLabel: 'Aucun traitement du registre',
    },
  ]
})
function openRelation(item: RelationItem) {
  // Un flux : la fiche de l'application qui l'émet liste ses flux ; à défaut, la carte des flux.
  if (item.icon === 'flow') {
    const from = item.name.split(' → ')[0]
    if (hasApplication(from)) goFiche(from)
    else goPath('/carte')
  }
  else if (item.icon === 'shield') {
    const t = traitements.find((x) => `t-${x.id}` === item.id)
    goPath(target(t ? `/traitements?traitement=${t.id}` : '/traitements'))
  } else if (hasApplication(item.name)) goFiche(item.name)
  // Hors de la cartographie (partenaire externe…) : la liste se filtre sur ce nom.
  else query.value = item.name
}
async function shareInspected() {
  const d = inspected.value
  if (!d) return
  if (await copyLink(target(`/donnees?donnee=${d.id}`))) toast.success(`Lien de la donnée « ${d.name} » copié`)
  else toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche fonctionnelle', layer: 'fonctionnel' }, { label: 'Données' }]
function onTrail(_s: TrailStep, i: number) {
  if (i <= 1) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
const sansFlux = objetsDonnees.filter((d) => !d.flux.length).length
</script>

<template>
  <div class="mc-scr-don">
    <McAppBar class="mc-scr-don-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="shield" @click="goPath('/traitements')">Registre des traitements</McButton>
        <McButton variant="outline" icon="map" @click="goPath('/carte')">Carte des flux</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-don-wrap" :class="{ 'has-insp': inspected }">
      <main class="mc-scr-don-main">
        <header class="mc-scr-don-head">
          <div class="mc-scr-don-titles">
            <p class="mc-over">Couche fonctionnelle</p>
            <h1 class="title-lg">Données <span class="mc-scr-don-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-don-search" placeholder="Rechercher une donnée" :count="searchCount" />
          <McSelect v-model="famille" class="mc-scr-don-fam" :options="familleOptions" placeholder="Toutes les familles" clearable aria-label="Famille de données" />
        </header>

        <div class="mc-row mc-scr-don-chips" role="group" aria-label="Sensibilité">
          <McFilterChip v-if="traitement" :label="`Traitement ${traitement.ref} : ${traitement.name}`" @remove="traitementId = null" />
          <McFilterChip v-if="sens === 'tous'" :label="`Toutes · ${bySearch.length}`" :removable="false" />
          <button v-else type="button" class="mc-scr-don-chip" @click="sens = 'tous'"><McStatusChip>Toutes · {{ bySearch.length }}</McStatusChip></button>
          <template v-for="k in SENS_KEYS" :key="k">
            <McFilterChip v-if="sens === k" :label="`${SENSIBILITES[k].label} · ${counts[k]}`" @remove="sens = 'tous'" />
            <button v-else type="button" class="mc-scr-don-chip" :disabled="!counts[k]" :title="SENSIBILITES[k].help" @click="sens = k">
              <McStatusChip :status="SENSIBILITES[k].status">{{ SENSIBILITES[k].label }} · {{ counts[k] }}</McStatusChip>
            </button>
          </template>
        </div>

        <McDataTable
          v-model:sort="sort"
          class="mc-scr-don-table"
          :columns="columns"
          :rows="rows"
          row-key="id"
          icon="database"
          layer="fonctionnel"
          caption="Objets de données"
          empty-title="Aucune donnée ne correspond"
          empty-text="Modifiez la recherche ou retirez un filtre."
          @open="(r) => inspect(r.id)"
        >
          <template #cell-name="{ row }"><span class="mc-scr-don-name" :class="{ 'is-on': inspectedId === row.id }">{{ row.name }}</span></template>
          <template #cell-sensibilite="{ row }">
            <McStatusChip :status="SENSIBILITES[row.sensibilite].status" size="sm">{{ SENSIBILITES[row.sensibilite].label }}</McStatusChip>
          </template>
          <template #cell-source="{ row }">
            <a v-if="row.source && hasApplication(row.source)" class="mc-scr-don-app" :href="ficheHref(row.source)" @click="openApp($event, row.source)">{{ row.source }}</a>
            <span v-else class="mc-dt-nil">—</span>
          </template>
          <template #cell-flux="{ row }">
            <span v-if="row.flux">{{ row.flux }}</span>
            <span v-else class="mc-dt-nil">—</span>
          </template>
          <template #cell-traitements="{ row }">
            <span v-if="row.traitements">{{ row.traitements }}</span>
            <span v-else class="mc-dt-nil">—</span>
          </template>
          <template #empty-action>
            <McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
          </template>
        </McDataTable>

        <p class="mc-cap mc-scr-don-note">
          {{ plural(sansFlux, 'donnée n’est transportée', 'données ne sont transportées') }} par aucun flux cartographié : elles restent dans leurs applications ou circulent hors de la carte.
        </p>
      </main>

      <McInspector
        v-if="inspected"
        :key="inspected.id"
        class="mc-scr-don-insp"
        :object="{ name: inspected.name, type: 'Donnée', layer: 'fonctionnel', icon: 'database', description: inspected.description }"
        @close="inspectedId = null"
      >
        <template #statuses>
          <McStatusChip :status="SENSIBILITES[inspected.sensibilite].status" size="sm">{{ SENSIBILITES[inspected.sensibilite].label }}</McStatusChip>
        </template>
        <template #actions>
          <McButton size="sm" icon="map" :disabled="!inspected.flux.length" @click="goPath('/carte')">Voir les flux</McButton>
          <McIconButton size="sm" icon="link" label="Copier le lien de la donnée" @click="shareInspected" />
        </template>
        <McKeyValueList :items="kv" @open="(item, e) => openApp(e, String(item.value))" />
        <p v-if="inspected.sensibilite === 'sensible'" class="mc-scr-don-warn">{{ SENSIBILITES.sensible.help }}</p>
        <McRelationList :groups="groups" :visible="6" @open="openRelation" />
      </McInspector>
    </div>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-don { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-don-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-don-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-don-wrap.has-insp { max-width: 1520px; }
.mc-scr-don-main { flex: 1; min-width: 0; display: grid; gap: 16px; }
.mc-scr-don-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-don-titles { flex: 1; min-width: 200px; }
.mc-scr-don-titles .mc-over { margin: 0 0 2px; }
.mc-scr-don-titles h1 { margin: 0; }
.mc-scr-don-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-don-search { width: 300px; }
.mc-scr-don-fam { width: 220px; }
.mc-scr-don-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-don-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-don-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-don-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-don-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-don-table { overflow-x: auto; }
.mc-scr-don-name { font-weight: 600; }
.mc-scr-don-name.is-on { color: var(--accent); }
.mc-scr-don-app { color: var(--accent); text-decoration: none; }
.mc-scr-don-app:hover { text-decoration: underline; }
.mc-scr-don-note { margin: 0; }
.mc-scr-don-warn { margin: 0; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--status-critical-soft); font-size: 12px; line-height: 16px; color: var(--ink); }
.mc-scr-don-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-don-insp { position: sticky; top: 92px; flex: none; max-height: calc(100vh - 108px); }
@media (min-width: 1800px) {
  .mc-scr-don-wrap, .mc-scr-don-wrap.has-insp { max-width: 1760px; padding-inline: 40px; }
  .mc-scr-don-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1180px) {
  .mc-scr-don-wrap { padding-inline: 24px; }
  .mc-scr-don-titles { flex-basis: 100%; }
  .mc-scr-don-search, .mc-scr-don-fam { flex: 1 1 220px; width: auto; }
}
</style>
