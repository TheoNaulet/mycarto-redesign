<script setup lang="ts">
// Écran « Référents » : les personnes à contacter pour chaque application, par type (métier, fonctionnel, technique).
// /referents?type=metier (ou fonctionnel, technique) ouvre l'onglet voulu ; changer d'onglet met l'adresse à jour.
// /referents?id=<personne> ouvre la personne dans l'inspecteur : « antoine-ramo », « antoine.ramo » (adresse de messagerie)
// ou le nom lui-même. Un identifiant inconnu est ignoré.
import { computed, getCurrentInstance, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McTabs from '../../components/McTabs/McTabs.vue'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McInspector from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { ficheHref, goFiche, goPath, inApp, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { hasApplication } from '../../data/applications'
import { de, downloadCsv } from '../../data/b-export'
import { affectations, emailOf, personnes, sansReferent, TYPES_REFERENT, type TypeReferent } from '../../data/referents'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const TYPES: TypeReferent[] = ['metier', 'fonctionnel', 'technique']
/** Au-delà, la charge est signalée. */
const CHARGE_ELEVEE = 12

/* ---------- Onglet (adresse ?type=) ---------- */
type Onglet = TypeReferent | 'tous'
function readType(): Onglet {
  if (typeof window === 'undefined') return 'tous'
  const t = new URLSearchParams(window.location.search).get('type')
  return t && (TYPES as string[]).includes(t) ? (t as TypeReferent) : 'tous'
}
const tab = ref<string>(readType())
/** Adresse courante : la route de l'application (réactive), sinon l'adresse de la page (Storybook). */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed<Record<string, unknown>>(() => {
  const q = (globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query
  if (q) return q
  return typeof window === 'undefined' ? {} : Object.fromEntries(new URLSearchParams(window.location.search))
})
const onglet = computed(() => tab.value as Onglet)
/** Dans l'application, l'adresse suit l'onglet et la personne ouverte, pour pouvoir la partager. */
function syncUrl(key: string, value: string | null) {
  if (!inApp()) return
  const url = new URL(window.location.href)
  if (value) url.searchParams.set(key, value)
  else url.searchParams.delete(key)
  window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash)
}
watch(tab, (t) => syncUrl('type', t === 'tous' ? null : t))

/* ---------- Personnes et charge ---------- */
interface Ligne {
  name: string
  fonction: string
  service: string
  email: string
  types: TypeReferent[]
  /** Applications par type. */
  apps: Record<TypeReferent, string[]>
}
const lignes: Ligne[] = (() => {
  const names = [...new Set([...personnes.map((p) => p.name), ...affectations.map((a) => a.personne)])]
  return names
    .map((name) => {
      const p = personnes.find((x) => x.name === name)
      const apps: Record<TypeReferent, string[]> = { metier: [], fonctionnel: [], technique: [] }
      for (const a of affectations) if (a.personne === name && !apps[a.type].includes(a.application)) apps[a.type].push(a.application)
      return { name, fonction: p?.fonction ?? 'Référent', service: p?.service ?? 'Non renseigné', email: emailOf(name), types: TYPES.filter((t) => apps[t].length), apps }
    })
    .filter((l) => l.types.length)
})()
const charge = (l: Ligne, o: Onglet = onglet.value) => (o === 'tous' ? TYPES.reduce((n, t) => n + l.apps[t].length, 0) : l.apps[o].length)

const tabs = computed(() => [
  { value: 'tous', label: 'Tous', count: lignes.length },
  ...TYPES.map((t) => ({ value: t, label: t === 'metier' ? 'Métier' : t === 'fonctionnel' ? 'Fonctionnels' : 'Techniques', count: lignes.filter((l) => l.types.includes(t)).length })),
])

/* ---------- Recherche et tri ---------- */
const query = ref('')
const sortBy = ref<McSelectValue | null>('charge')
const sortOptions = [
  { value: 'charge', label: 'Trier : nombre d’applications' },
  { value: 'name', label: 'Trier : nom' },
]
const filtered = computed(() => {
  const q = norm(query.value.trim())
  const o = onglet.value
  const list = lignes.filter((l) => (o === 'tous' || l.types.includes(o)) && (!q || norm(`${l.name} ${l.service} ${l.fonction} ${TYPES.flatMap((t) => l.apps[t]).join(' ')}`).includes(q)))
  return list.sort((a, b) => (sortBy.value === 'name' ? 0 : charge(b) - charge(a)) || a.name.localeCompare(b.name, 'fr'))
})
const maxCharge = computed(() => Math.max(1, ...filtered.value.map((l) => charge(l))))
const searchCount = computed(() => (query.value.trim() ? (filtered.value.length ? plural(filtered.value.length, 'personne', 'personnes') : 'Aucune personne') : undefined))
/** Applications du résultat qui correspondent à la recherche, pour montrer pourquoi une personne remonte. */
function matchingApps(l: Ligne): string[] {
  const q = norm(query.value.trim())
  if (!q) return []
  const types = onglet.value === 'tous' ? TYPES : [onglet.value]
  return types.flatMap((t) => l.apps[t]).filter((a) => norm(a).includes(q))
}

/* ---------- Applications sans référent ---------- */
const missing = computed(() => (onglet.value === 'tous' ? [] : sansReferent(onglet.value)))

/* ---------- Inspecteur ---------- */
const inspectedName = ref<string | null>(null)
const inspected = computed(() => lignes.find((l) => l.name === inspectedName.value))
function inspect(name: string) {
  inspectedName.value = inspectedName.value === name ? null : name
}
const idOf = (name: string) => norm(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
/** Retrouve une personne par son identifiant d'adresse, sa messagerie ou son nom. */
function findPerson(id: string): Ligne | undefined {
  const k = norm(decodeURIComponent(id).trim())
  const slug = k.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return lignes.find((l) => idOf(l.name) === slug || norm(l.name) === k || norm(l.email) === k || norm(l.email.split('@')[0]) === k)
}
watch(
  () => routeQuery.value.id,
  (id) => {
    if (typeof id !== 'string' || !id) return
    const l = findPerson(id)
    if (!l) return
    inspectedName.value = l.name
    // La personne doit être visible dans l'onglet ouvert.
    if (onglet.value !== 'tous' && !l.types.includes(onglet.value)) tab.value = 'tous'
    requestAnimationFrame(() => document.querySelector('.mc-scr-ref-card.is-on')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }))
  },
  { immediate: true },
)
watch(inspectedName, (n) => syncUrl('id', n ? idOf(n) : null))
const kv = computed<KeyValueItem[]>(() => {
  const l = inspected.value
  if (!l) return []
  return [
    { key: 'Fonction', value: l.fonction },
    { key: 'Service', value: l.service },
    { key: 'Messagerie', value: l.email },
    { key: 'Applications suivies', value: charge(l, 'tous') },
  ]
})
const groups = computed<RelationGroup[]>(() => {
  const l = inspected.value
  if (!l) return []
  return l.types.map((t) => ({
    verb: `${TYPES_REFERENT[t].label} de`,
    items: l.apps[t].map((a) => ({ id: `${t}-${a}`, name: a, layer: 'applicatif' as const, icon: 'app' as const })),
  }))
})
function openRelation(item: RelationItem) {
  if (hasApplication(item.name)) goFiche(item.name)
  // Hors de la cartographie (partenaire externe…) : la liste se filtre sur ce nom.
  else query.value = item.name
}
/** Exporte la liste affichée (onglet, recherche et tri appliqués) en CSV. */
function exportList() {
  const list = filtered.value
  const file = downloadCsv(
    trailLabel.value,
    ['Nom', 'Fonction', 'Service', 'Messagerie', 'Référent métier de', 'Référent fonctionnel de', 'Référent technique de', 'Applications suivies'],
    list.map((l) => [l.name, l.fonction, l.service, l.email, l.apps.metier.join(', '), l.apps.fonctionnel.join(', '), l.apps.technique.join(', '), charge(l, 'tous')]),
  )
  toast.success(`${plural(list.length, 'personne exportée', 'personnes exportées')} : ${file}`)
}
function write(email: string) {
  window.location.href = `mailto:${email}`
}
async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email)
    toast.success(`Adresse copiée : ${email}`)
  } catch {
    toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')
  }
}
function openApp(e: MouseEvent, name: string) {
  e.stopPropagation()
  goFiche(name)
}

/* ---------- Barre du haut ---------- */
const trailLabel = computed(() => (onglet.value === 'tous' ? 'Référents' : TYPES_REFERENT[onglet.value].plural))
const trail = computed<TrailStep[]>(() => [{ label: 'Accueil' }, { label: trailLabel.value }])
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
// Sans sélection, l'inspecteur résume ce que montre la liste.
const summary = computed<KeyValueItem[]>(() => [{ key: 'Personnes', value: filtered.value.length }, ...(onglet.value === 'tous' ? [] : [{ key: 'Applications sans référent', value: missing.value.length }])])
</script>

<template>
  <div class="mc-scr-ref">
    <McAppBar class="mc-scr-ref-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <div class="mc-scr-ref-wrap">
      <main class="mc-scr-ref-main">
        <header class="mc-scr-ref-head">
          <div class="mc-scr-ref-titles">
            <p class="mc-over">Contacts des applications</p>
            <h1 class="title-lg">{{ trailLabel }} <span class="mc-scr-ref-n">{{ filtered.length }}</span></h1>
          </div>
          <McSearchField v-model="query" class="mc-scr-ref-search" placeholder="Personne ou application" :count="searchCount" />
          <McSelect v-model="sortBy" class="mc-scr-ref-sort" :options="sortOptions" aria-label="Trier les référents" />
        </header>

        <McTabs v-model="tab" :tabs="tabs" aria-label="Type de référent" />

        <div v-if="missing.length" class="mc-scr-ref-missing" role="note">
          <McIcon name="alert-triangle" size="sm" />
          <span>
            {{ plural(missing.length, 'application n’a', 'applications n’ont') }} pas de {{ TYPES_REFERENT[onglet as TypeReferent].label.toLowerCase() }} :
            <template v-for="(a, i) in missing.slice(0, 6)" :key="a">
              <a :href="ficheHref(a)" @click.prevent="goFiche(a)">{{ a }}</a><template v-if="i < Math.min(missing.length, 6) - 1">, </template>
            </template>
            <template v-if="missing.length > 6"> et {{ missing.length - 6 }} autres</template>.
          </span>
        </div>

        <div v-if="filtered.length" class="mc-scr-ref-grid">
          <article v-for="l in filtered" :key="l.name" class="mc-scr-ref-card" :class="{ 'is-on': inspectedName === l.name }">
            <button type="button" class="mc-scr-ref-open" :aria-pressed="inspectedName === l.name" @click="inspect(l.name)">
              <McAvatar :name="l.name" size="lg" />
              <span class="mc-scr-ref-id">
                <span class="mc-scr-ref-name">{{ l.name }}</span>
                <span class="mc-scr-ref-fn">{{ l.fonction }}</span>
                <span class="mc-scr-ref-svc">{{ l.service }}</span>
              </span>
            </button>
            <div class="mc-scr-ref-types">
              <McTypeChip v-for="t in l.types" :key="t" :type="TYPES_REFERENT[t].label" :layer="TYPES_REFERENT[t].layer" icon="user" size="sm" />
            </div>
            <div class="mc-scr-ref-load">
              <span class="tr" aria-hidden="true"><i :style="{ width: `${(charge(l) / maxCharge) * 100}%` }" /></span>
              <span class="v">{{ plural(charge(l), 'application', 'applications') }}</span>
              <McStatusChip v-if="charge(l) >= CHARGE_ELEVEE" status="warn" size="sm">Charge élevée</McStatusChip>
            </div>
            <p v-if="matchingApps(l).length" class="mc-scr-ref-match">
              <template v-for="(a, i) in matchingApps(l)" :key="a">
                <a :href="ficheHref(a)" @click.prevent="openApp($event, a)">{{ a }}</a><template v-if="i < matchingApps(l).length - 1">, </template>
              </template>
            </p>
            <footer class="mc-scr-ref-foot">
              <a class="mc-scr-ref-mail" :href="`mailto:${l.email}`" :title="`Écrire à ${l.name}`"><McIcon name="comment" size="sm" />{{ l.email }}</a>
              <McIconButton size="sm" icon="copy" :label="`Copier l’adresse ${de(l.name)}`" @click="copyEmail(l.email)" />
            </footer>
          </article>
        </div>
        <McEmptyState v-else icon="search" layer="metier" title="Aucun référent ne correspond" text="Cherchez un autre nom ou une autre application, ou changez d’onglet.">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton></template>
        </McEmptyState>

        <p class="mc-cap mc-scr-ref-note">Les référents se saisissent sur la fiche de chaque application. La charge compte les applications suivies dans l’onglet affiché.</p>
      </main>

      <McInspector
        :key="inspected?.name ?? 'resume'"
        class="mc-insp-dock mc-scr-ref-insp"
        :object="inspected ? { name: inspected.name, type: 'Référent', layer: TYPES_REFERENT[inspected.types[0]].layer, icon: 'user', description: inspected.fonction } : undefined"
        empty-title="Sélectionnez une personne"
        empty-text="Ses rôles et les applications dont elle est référente s’affichent ici."
        @close="inspectedName = null"
      >
        <template #empty><McKeyValueList :items="summary" /></template>
        <template v-if="inspected" #statuses>
          <McTypeChip v-for="t in inspected.types" :key="t" :type="TYPES_REFERENT[t].label" :layer="TYPES_REFERENT[t].layer" icon="user" size="sm" />
        </template>
        <template v-if="inspected" #actions>
          <McButton size="sm" icon="comment" @click="write(inspected.email)">Écrire</McButton>
          <McIconButton size="sm" icon="copy" label="Copier l’adresse" @click="copyEmail(inspected.email)" />
        </template>
        <template v-if="inspected">
          <McKeyValueList :items="kv" />
          <McRelationList :groups="groups" :visible="8" @open="openRelation" />
        </template>
      </McInspector>
    </div>

    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-ref { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-ref-bar { position: sticky; top: 16px; z-index: 20; margin: 16px var(--page-inset) 0; }
.mc-scr-ref-wrap { max-width: var(--page-w); margin: 0 auto; padding: 24px var(--page-pad) 40px; box-sizing: border-box; display: flex; gap: 20px; align-items: flex-start; }
.mc-scr-ref-main { flex: 1; min-width: 0; display: grid; gap: 16px; }
.mc-scr-ref-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-ref-titles { flex: 1; min-width: 200px; }
.mc-scr-ref-titles .mc-over { margin: 0 0 2px; }
.mc-scr-ref-titles h1 { margin: 0; }
.mc-scr-ref-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-ref-search { width: 300px; }
.mc-scr-ref-sort { width: 260px; }
.mc-scr-ref-missing { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; border-radius: var(--radius-md); background: var(--status-warn-soft); font-size: 13px; line-height: 18px; }
.mc-scr-ref-missing > .mc-ico { color: var(--status-warn); flex: none; margin-top: 1px; }
.mc-scr-ref-missing a, .mc-scr-ref-match a { color: var(--accent); }
.mc-scr-ref-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 12px; }
.mc-scr-ref-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); box-shadow: var(--shadow-node); padding: 14px; display: grid; gap: 10px; align-content: start; min-width: 0; }
.mc-scr-ref-card.is-on { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.mc-scr-ref-open { display: flex; align-items: flex-start; gap: 10px; padding: 0; border: 0; background: transparent; text-align: left; color: inherit; font: inherit; cursor: pointer; border-radius: var(--radius-xs); min-width: 0; }
.mc-scr-ref-open:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px; }
.mc-scr-ref-id { display: grid; min-width: 0; }
.mc-scr-ref-name { font: 600 14px/20px var(--font-display); }
.mc-scr-ref-open:hover .mc-scr-ref-name { color: var(--accent); }
.mc-scr-ref-fn { font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-ref-svc { font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
.mc-scr-ref-types { display: flex; gap: 4px; flex-wrap: wrap; }
.mc-scr-ref-load { display: flex; align-items: center; gap: 8px; }
.mc-scr-ref-load .tr { flex: 1; height: 6px; border-radius: 999px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-ref-load .tr i { display: block; height: 100%; border-radius: inherit; background: var(--navy); }
.mc-scr-ref-load .v { font: 600 12px/16px var(--font-sans); color: var(--ink-muted); white-space: nowrap; font-variant-numeric: tabular-nums; }
.mc-scr-ref-match { margin: 0; font-size: 12px; line-height: 16px; }
.mc-scr-ref-foot { display: flex; align-items: center; gap: 6px; padding-top: 8px; border-top: 1px solid var(--line); }
.mc-scr-ref-mail { flex: 1; min-width: 0; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; line-height: 16px; color: var(--accent); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-ref-mail:hover { text-decoration: underline; }
.mc-scr-ref-note { margin: 0; }
.mc-scr-ref-insp .body { grid-template-columns: minmax(0, 1fr); }
@media (min-width: 1800px) {
}
@media (max-width: 1180px) {
  .mc-scr-ref-titles { flex-basis: 100%; }
  .mc-scr-ref-search, .mc-scr-ref-sort { flex: 1 1 220px; width: auto; }
}
</style>
