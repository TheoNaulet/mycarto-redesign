<script setup lang="ts">
// Écran « Applications obsolètes » : les applications exposées à un logiciel plus supporté ou en fin de support,
// calculées depuis leurs composants (logiciels employés, système de la machine) et l'inventaire.
// Chaque raison se lit en chaîne : application → composant (machine) → logiciel → fin de support.
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McButton from '../../components/McButton/McButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McLifecycleDate from '../../components/McLifecycleDate/McLifecycleDate.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { applications, type Application } from '../../data/applications'
import { composants, getMachine, osOf } from '../../data/infrastructure'
import { echeanceOf, frDate, getLogiciel, type Logiciel } from '../../data/logiciels'
import { exportCsv } from '../../data/a-texte'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Calcul des raisons ---------- */
type Sev = 'critical' | 'warn'
interface Raison {
  status: Sev
  /** Où : un composant de l'application, le système d'une machine, ou rien (relevé dans l'inventaire). */
  kind: 'composant' | 'systeme' | 'inventaire'
  composant: string | null
  machine: string | null
  logiciel: Logiciel | null
  /** Nom du logiciel (référencé ou non). */
  label: string
  fin: string | null
}
interface Exposee {
  app: Application
  status: Sev
  raisons: Raison[]
}
const SEV_RANK: Record<Sev, number> = { critical: 0, warn: 1 }
const sevOf = (l: Logiciel): Sev | null => (l.obsolescence === 'obsolete' ? 'critical' : l.obsolescence === 'bientot' ? 'warn' : null)

function raisonsOf(a: Application): Raison[] {
  const out: Raison[] = []
  const own = composants.filter((c) => c.app === a.name)
  for (const c of own)
    for (const n of c.logiciels) {
      const l = getLogiciel(n)
      const s = l && sevOf(l)
      if (l && s) out.push({ status: s, kind: 'composant', composant: c.name, machine: c.machine, logiciel: l, label: l.name, fin: echeanceOf(l) })
    }
  // Système des machines qui portent ses composants ou que l'inventaire lui donne.
  const machines = new Set([...own.map((c) => c.machine), ...a.hosts.map((h) => h.name)].filter((m): m is string => !!m))
  for (const name of machines) {
    const m = getMachine(name)
    if (!m) continue
    const os = osOf(m)
    if (os.status !== 'critical' && os.status !== 'warn') continue
    out.push({ status: os.status, kind: 'systeme', composant: own.find((c) => c.machine === name)?.name ?? null, machine: name, logiciel: os.logiciel ?? null, label: os.name, fin: os.fin })
  }
  // Ce que l'inventaire signale sans composant détaillé.
  const ob = a.obsolescence
  if (ob && (ob.status === 'critical' || ob.status === 'warn') && !out.some((r) => norm(r.label) === norm(ob.label))) {
    const l = getLogiciel(ob.label)
    out.push({ status: (l && sevOf(l)) || ob.status, kind: 'inventaire', composant: null, machine: null, logiciel: l ?? null, label: l?.name ?? ob.label, fin: l ? echeanceOf(l) : null })
  }
  return out.sort((x, y) => SEV_RANK[x.status] - SEV_RANK[y.status] || (x.fin ?? '9999').localeCompare(y.fin ?? '9999'))
}
const all: Exposee[] = applications
  .map((app) => ({ app, raisons: raisonsOf(app) }))
  .filter((x) => x.raisons.length)
  .map((x) => ({ ...x, status: x.raisons.some((r) => r.status === 'critical') ? ('critical' as const) : ('warn' as const) }))
const oldest = (x: Exposee) => x.raisons.map((r) => r.fin ?? '9999').sort()[0]
const crit = (x: Exposee) => x.raisons.filter((r) => r.status === 'critical').length
all.sort((a, b) => SEV_RANK[a.status] - SEV_RANK[b.status] || crit(b) - crit(a) || b.raisons.length - a.raisons.length || oldest(a).localeCompare(oldest(b)) || a.app.name.localeCompare(b.app.name, 'fr'))

/* ---------- Filtres ---------- */
const query = ref('')
const sev = ref<Sev | 'tous'>('tous')
const source = ref<McSelectValue | null>('tout')
const sourceOptions = [
  { value: 'tout', label: 'Composants et systèmes' },
  { value: 'composant', label: 'Logiciels des composants' },
  { value: 'systeme', label: 'Systèmes des machines' },
]
const keep = (r: Raison) => source.value === 'tout' || !source.value || r.kind === source.value || (source.value === 'composant' && r.kind === 'inventaire')
const scoped = computed(() =>
  all
    .map((x) => {
      const raisons = x.raisons.filter(keep)
      return { ...x, raisons, status: (raisons.some((r) => r.status === 'critical') ? 'critical' : 'warn') as Sev }
    })
    .filter((x) => x.raisons.length),
)
const bySearch = computed(() => {
  const q = norm(query.value.trim())
  return q ? scoped.value.filter((x) => norm(`${x.app.name} ${x.raisons.map((r) => `${r.label} ${r.composant ?? ''} ${r.machine ?? ''}`).join(' ')}`).includes(q)) : scoped.value
})
const shown = computed(() => (sev.value === 'tous' ? bySearch.value : bySearch.value.filter((x) => x.status === sev.value)))
const counts = computed(() => ({ critical: bySearch.value.filter((x) => x.status === 'critical').length, warn: bySearch.value.filter((x) => x.status === 'warn').length }))
const SEV: Record<Sev, { label: string; chip: string }> = {
  critical: { label: 'Plus supporté', chip: 'Logiciel plus supporté' },
  warn: { label: 'Fin de support proche', chip: 'Fin de support proche' },
}
const softwareCount = computed(() => new Set(shown.value.flatMap((x) => x.raisons.map((r) => r.label))).size)
function clearAll() {
  query.value = ''
  sev.value = 'tous'
  source.value = 'tout'
}

/* ---------- Exporter : une ligne par raison (application → composant → logiciel → fin de support) ---------- */
const KIND: Record<Raison['kind'], string> = { composant: 'Logiciel d’un composant', systeme: 'Système de la machine', inventaire: 'Relevé dans l’inventaire' }
function exportList() {
  const rows = shown.value.flatMap((x) => x.raisons.map((r) => [x.app.name, SEV[x.status].chip, KIND[r.kind], r.composant ?? '', r.machine ?? '', r.label, frDate(r.fin), SEV[r.status].label]))
  const file = exportCsv('Applications obsolètes', ['Application', 'Gravité', 'Raison', 'Composant', 'Machine', 'Logiciel', 'Fin de support', 'Gravité de la raison'], rows)
  toast.success(`${file} téléchargé : ${plural(shown.value.length, 'application', 'applications')}, ${plural(rows.length, 'raison', 'raisons')}`)
}

/* ---------- Navigation ---------- */
function open(a: Application, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey) return
  e.preventDefault()
  goFiche(a.slug)
}
const logicielPath = (l: Logiciel) => `/logiciels?id=${l.id}`
const machinePath = (m: string) => `/machines?id=${m}`
function go(path: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey) return
  e.preventDefault()
  goPath(path)
}
const lifeLabel = (r: Raison) => (r.logiciel?.finEtendue ? 'Support étendu jusqu’au' : 'Fin de support le')

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche applicative', layer: 'applicatif' }, { label: 'Applications obsolètes' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0 || i === 1) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (bySearch.value.length ? plural(bySearch.value.length, 'application', 'applications') : 'Aucun résultat') : undefined))
</script>

<template>
  <div class="mc-scr-obso">
    <McAppBar class="mc-scr-obso-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McButton variant="outline" icon="export" @click="exportList">Exporter</McButton>
      </template>
    </McAppBar>

    <main class="mc-scr-obso-wrap">
      <header class="mc-scr-obso-head">
        <div class="mc-scr-obso-titles">
          <p class="mc-over">Couche applicative · Obsolescence</p>
          <h1 class="title-lg">Applications obsolètes <span class="mc-scr-obso-n">{{ shown.length }}</span></h1>
          <p class="mc-scr-obso-lede">
            {{ shown.length > 1 ? `${shown.length} applications reposent` : shown.length ? '1 application repose' : 'Aucune application ne repose' }} sur
            {{ plural(softwareCount, 'logiciel plus supporté ou en fin de support', 'logiciels plus supportés ou en fin de support') }}, de la plus exposée à la moins exposée.
          </p>
        </div>
        <McButton variant="ghost" icon="software" :href="pathHref('/logiciels?etat=obsolete')" @click="go('/logiciels?etat=obsolete', $event)">Logiciels obsolètes</McButton>
        <McButton variant="ghost" icon="server" :href="pathHref('/machines?obso=critical')" @click="go('/machines?obso=critical', $event)">Machines concernées</McButton>
        <McSearchField v-model="query" class="mc-scr-obso-search" placeholder="Rechercher une application, un logiciel, une machine" :count="searchCount" />
      </header>

      <div class="mc-scr-obso-filters">
        <div class="mc-row mc-scr-obso-chips" role="group" aria-label="Gravité">
          <McFilterChip v-if="sev === 'tous'" :label="`Toutes · ${bySearch.length}`" :removable="false" />
          <button v-else type="button" class="mc-scr-obso-chip" @click="sev = 'tous'">
            <McStatusChip>Toutes · {{ bySearch.length }}</McStatusChip>
          </button>
          <template v-for="s in (['critical', 'warn'] as Sev[])" :key="s">
            <McFilterChip v-if="sev === s" :label="`${SEV[s].label} · ${counts[s]}`" @remove="sev = 'tous'" />
            <button v-else type="button" class="mc-scr-obso-chip" :disabled="!counts[s]" @click="sev = s">
              <McStatusChip :status="s">{{ SEV[s].label }} · {{ counts[s] }}</McStatusChip>
            </button>
          </template>
        </div>
        <McSelect v-model="source" class="mc-scr-obso-sel" :options="sourceOptions" aria-label="Raisons comptées" size="sm" />
        <span class="mc-scr-obso-grow" />
        <McButton v-if="query || sev !== 'tous' || source !== 'tout'" variant="ghost" size="sm" icon="x" @click="clearAll">Tout effacer</McButton>
      </div>

      <ol v-if="shown.length" class="mc-scr-obso-list">
        <li v-for="x in shown" :key="x.app.slug" class="mc-scr-obso-card" :class="`is-${x.status}`">
          <div class="mc-scr-obso-top">
            <span class="mc-scr-obso-tile"><McIcon name="app" /></span>
            <a class="mc-scr-obso-app" :href="ficheHref(x.app.slug)" @click="open(x.app, $event)">{{ x.app.name }}</a>
            <span class="mc-scr-obso-dom">{{ x.app.domaines[0] ?? x.app.description ?? '' }}</span>
            <span class="mc-scr-obso-grow" />
            <McButton
              v-if="x.app.slug === 'apogee'"
              size="sm"
              variant="outline"
              icon="map"
              :href="pathHref('/infrastructure')"
              @click="go('/infrastructure', $event)"
            >Voir sur la carte</McButton>
            <McStatusChip :status="x.status" size="sm">{{ SEV[x.status].chip }}</McStatusChip>
          </div>
          <ul class="mc-scr-obso-chains">
            <li v-for="(r, k) in x.raisons" :key="k" class="mc-scr-obso-chain">
              <span class="mc-scr-obso-step">
                <template v-if="r.kind === 'inventaire'">
                  <McIcon name="dashed-circle" size="sm" />
                  <span class="mc-scr-obso-muted">Composant non détaillé</span>
                </template>
                <template v-else-if="r.kind === 'systeme'">
                  <McIcon :name="getMachine(r.machine)?.kind === 'VM' ? 'cloud' : 'server'" size="sm" />
                  <span>Système de</span>
                  <a :href="pathHref(machinePath(r.machine!))" @click="go(machinePath(r.machine!), $event)">{{ r.machine }}</a>
                </template>
                <template v-else>
                  <McIcon name="chip" size="sm" />
                  <span class="mc-scr-obso-cmp">{{ r.composant }}</span>
                  <template v-if="r.machine">
                    <span class="mc-scr-obso-muted">sur</span>
                    <a :href="pathHref(machinePath(r.machine))" @click="go(machinePath(r.machine), $event)">{{ r.machine }}</a>
                  </template>
                </template>
              </span>
              <McIcon class="mc-scr-obso-arrow" name="arrow-right" size="sm" />
              <span class="mc-scr-obso-step">
                <McIcon name="software" size="sm" />
                <a v-if="r.logiciel" class="mc-scr-obso-soft" :href="pathHref(logicielPath(r.logiciel))" @click="go(logicielPath(r.logiciel), $event)">{{ r.label }}</a>
                <span v-else class="mc-scr-obso-soft">{{ r.label }}</span>
              </span>
              <McIcon class="mc-scr-obso-arrow" name="arrow-right" size="sm" />
              <span class="mc-scr-obso-step">
                <McLifecycleDate v-if="r.fin" :date="r.fin" :label="lifeLabel(r)" />
                <McStatusChip v-else :status="r.status" size="sm">{{ r.status === 'critical' ? 'Signalé plus supporté' : 'Signalé en fin de support' }}</McStatusChip>
              </span>
            </li>
          </ul>
        </li>
      </ol>
      <McEmptyState v-else icon="software" layer="technique" title="Aucune application ne correspond" text="Modifiez la recherche ou retirez un filtre.">
        <template #action><McButton variant="outline" size="sm" icon="x" @click="clearAll">Tout effacer</McButton></template>
      </McEmptyState>
    </main>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-obso { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-obso-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-obso-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: grid; gap: 16px; }
.mc-scr-obso-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-obso-titles { flex: 1; min-width: 280px; }
.mc-scr-obso-titles .mc-over { margin: 0 0 2px; }
.mc-scr-obso-titles h1 { margin: 0; }
.mc-scr-obso-lede { margin: 4px 0 0; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-obso-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-obso-search { width: 340px; }
.mc-scr-obso-filters { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-obso-chips { gap: 6px; flex-wrap: wrap; }
.mc-scr-obso-chip { padding: 0; border: 0; background: transparent; border-radius: 999px; cursor: pointer; font: inherit; }
.mc-scr-obso-chip:hover:not([disabled]) .mc-chip { box-shadow: inset 0 0 0 1px var(--line-strong); }
.mc-scr-obso-chip:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-obso-chip[disabled] { opacity: .45; cursor: not-allowed; }
.mc-scr-obso-sel { width: 240px; }
.mc-scr-obso-grow { flex: 1; }
/* Une colonne jusqu'à 1800 px, deux au-delà. */
.mc-scr-obso-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.mc-scr-obso-card { display: grid; gap: 8px; padding: 12px 14px; border-radius: var(--radius-md); background: var(--surface); border: 1px solid var(--line); border-left: 3px solid var(--status-warn); box-shadow: var(--shadow-node); }
.mc-scr-obso-card.is-critical { border-left-color: var(--status-critical); }
.mc-scr-obso-top { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-obso-tile { width: 26px; height: 26px; border-radius: var(--radius-xs); background: var(--layer-applicatif-soft); color: var(--layer-applicatif); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-obso-app { font: 700 15px/20px var(--font-display); color: var(--ink); text-decoration: none; }
.mc-scr-obso-app:hover { color: var(--accent); text-decoration: underline; }
.mc-scr-obso-dom { font-size: 12px; color: var(--ink-subtle); }
.mc-scr-obso-chains { list-style: none; margin: 0; padding: 0 0 0 36px; display: grid; gap: 4px; }
.mc-scr-obso-chain { display: grid; grid-template-columns: minmax(0, 1.3fr) 16px minmax(0, 1fr) 16px minmax(0, 1.2fr); align-items: center; gap: 8px; padding: 6px 10px; border-radius: var(--radius-sm); background: var(--surface-sunken); font-size: 13px; line-height: 18px; }
.mc-scr-obso-step { display: inline-flex; align-items: center; gap: 6px; min-width: 0; flex-wrap: wrap; }
.mc-scr-obso-step > .mc-ico { color: var(--layer-technique); flex: none; }
.mc-scr-obso-step a { color: var(--accent); font-weight: 600; text-decoration: none; }
.mc-scr-obso-step a:hover { text-decoration: underline; }
.mc-scr-obso-cmp { font-weight: 600; overflow-wrap: anywhere; }
.mc-scr-obso-soft { font-weight: 600; }
.mc-scr-obso-muted { color: var(--ink-subtle); }
.mc-scr-obso-arrow { color: var(--ink-subtle); }
.mc-scr-obso-step .mc-life { font-size: 12px; }
@media (min-width: 1800px) {
  .mc-scr-obso-wrap { max-width: 1760px; padding-inline: 40px; }
  .mc-scr-obso-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
  .mc-scr-obso-list { grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
}
@media (max-width: 1280px) {
  .mc-scr-obso-wrap { padding-inline: 24px; }
  .mc-scr-obso-search { flex: 1 1 260px; width: auto; }
  .mc-scr-obso-chains { padding-left: 0; }
}
</style>
