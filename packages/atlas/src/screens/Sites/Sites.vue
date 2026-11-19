<script setup lang="ts">
// Écran « Sites » : les trois sites et leurs machines. Une carte par site (machines, baies, obsolescence) ;
// le site choisi montre ses baies avec leurs machines physiques, puis ses machines virtuelles par hôte.
// Clic sur une machine : l'écran Machines, cette machine ouverte.
import { computed, getCurrentInstance, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McNode from '../../components/McNode/McNode.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath, pathHref } from '../bridge'
import { openPaletteItem, paletteItems } from '../Accueil/nav'
import { appsOf, ETAT_MACHINE, machineObsolescence, machinesOfSite, osOf, sites, type Machine, type SiteName } from '../../data/infrastructure'
import { exportCsv } from '../../data/a-texte'

const props = withDefaults(
  defineProps<{
    /** Site ouvert à l'arrivée. Dans l'application, l'adresse /sites?site= l'emporte. */
    site?: SiteName
  }>(),
  { site: 'Paris' },
)

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Sites ---------- */
const current = ref<SiteName>(props.site)
const stats = (name: SiteName) => {
  const ms = machinesOfSite(name)
  const obs = ms.map((m) => machineObsolescence(m).status)
  return {
    machines: ms.length,
    physiques: ms.filter((m) => m.kind === 'Machine').length,
    vms: ms.filter((m) => m.kind === 'VM').length,
    critical: obs.filter((s) => s === 'critical').length,
    warn: obs.filter((s) => s === 'warn').length,
    apps: new Set(ms.flatMap((m) => appsOf(m.name).map((a) => a.name))).size,
  }
}
const cards = sites.map((s) => ({ ...s, ...stats(s.name) }))
const site = computed(() => cards.find((c) => c.name === current.value)!)

/* ---------- Machines du site ---------- */
const query = ref('')
const matches = (m: Machine) => {
  const q = norm(query.value.trim())
  return !q || norm(`${m.name} ${osOf(m).name} ${appsOf(m.name).map((a) => a.name).join(' ')}`).includes(q)
}
const racks = computed(() =>
  site.value.racks
    .map((r) => ({ name: r, machines: machinesOfSite(current.value).filter((m) => m.kind === 'Machine' && m.rack === r && matches(m)) }))
    .filter((r) => r.machines.length || !query.value.trim()),
)
const hotes = computed(() => {
  const vms = machinesOfSite(current.value).filter((m) => m.kind === 'VM' && matches(m))
  const names = [...new Set(vms.map((v) => v.hote ?? ''))]
  return names.map((h) => ({ name: h, cluster: h.startsWith('Cluster '), machines: vms.filter((v) => (v.hote ?? '') === h) }))
})
const shown = computed(() => racks.value.reduce((n, r) => n + r.machines.length, 0) + hotes.value.reduce((n, h) => n + h.machines.length, 0))
const subOf = (m: Machine) => osOf(m).name
const titleOf = (m: Machine) => `${m.name} · ${plural(appsOf(m.name).length, 'application hébergée', 'applications hébergées')} : ouvrir dans les machines`
const statusOf = (m: Machine) => {
  const s = machineObsolescence(m).status
  return s === 'critical' || s === 'warn' ? s : undefined
}
/** Exporter : toutes les machines des trois sites, une ligne par machine (CSV pour Excel). */
function exportAll() {
  const rows = sites.flatMap((st) =>
    machinesOfSite(st.name).map((m) => [
      st.name,
      m.kind === 'Machine' ? 'Physique' : 'Virtuelle',
      m.kind === 'Machine' ? (m.rack ?? '') : (m.hote ?? ''),
      m.name,
      osOf(m).name,
      ETAT_MACHINE[m.etat].label,
      machineObsolescence(m).reason,
      appsOf(m.name).map((a) => a.name).join(', '),
    ]),
  )
  const file = exportCsv('Sites et machines', ['Site', 'Type', 'Baie ou hôte', 'Machine', 'Système', 'État', 'Obsolescence', 'Applications'], rows)
  toast.success(`${file} téléchargé : ${plural(rows.length, 'machine', 'machines')} sur ${plural(sites.length, 'site', 'sites')}`)
}
function openMachine(m: Machine) {
  goPath(`/machines?id=${m.name}`)
}

/* ---------- Adresse : /sites?site=Lyon ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    if (typeof q.site === 'string' && sites.some((s) => s.name === q.site)) current.value = q.site as SiteName
  },
  { immediate: true },
)
watch(
  () => props.site,
  (s) => (current.value = s),
)

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil' }, { label: 'Couche technique', layer: 'technique' }, { label: 'Sites' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0 || i === 1) goPath('/')
}
function onHome(e: MouseEvent) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [{ name: 'Lionel Fabian', initials: 'LF', color: 2 }]
const paletteOpen = ref(false)
function onPalette(item: PaletteItem) {
  openPaletteItem(item)
}
const searchCount = computed(() => (query.value.trim() ? (shown.value ? plural(shown.value, 'machine', 'machines') : 'Aucun résultat') : undefined))
</script>

<template>
  <div class="mc-scr-site">
    <McAppBar class="mc-scr-site-bar" :trail="trail" :home-href="pathHref('/')" @home="onHome" @navigate="onTrail" @search="paletteOpen = true">
      <template #actions>
        <McAvatarStack :people="people" label="1 personne sur les sites" />
        <McButton variant="outline" icon="export" @click="exportAll">Exporter</McButton>
      </template>
    </McAppBar>

    <main class="mc-scr-site-wrap">
      <header class="mc-scr-site-head">
        <div class="mc-scr-site-titles">
          <p class="mc-over">Couche technique</p>
          <h1 class="title-lg">Sites <span class="mc-scr-site-n">{{ cards.length }}</span></h1>
        </div>
        <McButton variant="outline" icon="server" :href="pathHref('/machines')" @click.prevent="goPath('/machines')">Toutes les machines</McButton>
      </header>

      <div class="mc-scr-site-cards" role="tablist" aria-label="Sites">
        <button
          v-for="c in cards"
          :key="c.name"
          type="button"
          role="tab"
          class="mc-scr-site-card"
          :class="{ 'is-on': current === c.name }"
          :aria-selected="current === c.name"
          @click="current = c.name"
        >
          <span class="mc-scr-site-card-top">
            <span class="mc-scr-site-tile"><McIcon name="pin" /></span>
            <span class="mc-scr-site-card-name">{{ c.name }}</span>
            <span class="mc-scr-site-card-type">Site</span>
          </span>
          <span class="mc-scr-site-card-desc">{{ c.description }}</span>
          <span class="mc-scr-site-figs">
            <span><b>{{ c.machines }}</b> {{ c.machines > 1 ? 'machines' : 'machine' }}</span>
            <span><b>{{ c.racks.length }}</b> {{ c.racks.length > 1 ? 'racks' : 'rack' }}</span>
            <span><b>{{ c.apps }}</b> {{ c.apps > 1 ? 'applications' : 'application' }}</span>
          </span>
          <span class="mc-scr-site-card-split">{{ plural(c.physiques, 'machine physique', 'machines physiques') }} · {{ plural(c.vms, 'machine virtuelle', 'machines virtuelles') }}</span>
          <span class="mc-scr-site-card-chips">
            <McStatusChip v-if="c.critical" status="critical" size="sm">{{ c.critical > 1 ? `${c.critical} plus supportées` : '1 plus supportée' }}</McStatusChip>
            <McStatusChip v-if="c.warn" status="warn" size="sm">{{ c.warn > 1 ? `${c.warn} en fin de support` : '1 en fin de support' }}</McStatusChip>
            <McStatusChip v-if="!c.critical && !c.warn" status="ok" size="sm">Toutes à jour</McStatusChip>
          </span>
        </button>
      </div>

      <section class="mc-scr-site-detail" :aria-label="`Machines de ${site.name}`">
        <div class="mc-scr-site-dhead">
          <h2 class="title">{{ site.name }} <span class="mc-scr-site-n">{{ plural(site.machines, 'machine', 'machines') }}</span></h2>
          <span class="mc-scr-site-grow" />
          <McSearchField v-model="query" class="mc-scr-site-search" size="sm" :placeholder="`Rechercher dans ${site.name}`" :count="searchCount" />
          <McButton
            v-if="site.critical"
            variant="ghost"
            size="sm"
            icon="alert-octagon"
            :href="pathHref(`/machines?site=${site.name}&obso=critical`)"
            @click.prevent="goPath(`/machines?site=${site.name}&obso=critical`)"
          >{{ site.critical > 1 ? `${site.critical} plus supportées` : '1 plus supportée' }}</McButton>
          <McButton variant="ghost" size="sm" icon="list" :href="pathHref(`/machines?site=${site.name}`)" @click.prevent="goPath(`/machines?site=${site.name}`)">Voir en liste</McButton>
        </div>

        <template v-if="shown">
          <p v-if="racks.length" class="mc-over mc-scr-site-over">Machines physiques, par baie</p>
          <div v-if="racks.length" class="mc-scr-site-racks">
            <McContainer
              v-for="r in racks"
              :key="r.name"
              :name="r.name"
              type="Rack"
              layer="technique"
              icon="rack"
              :count="r.machines.length"
              :count-label="plural(r.machines.length, 'machine', 'machines')"
              :collapsible="false"
              empty-text="Aucune machine ne correspond dans cette baie"
              class="mc-scr-site-rack"
            >
              <McNode
                v-for="m in r.machines"
                :key="m.name"
                layer="technique"
                icon="server"
                type="Machine"
                :name="m.name"
                :subtitle="m.etat === 'maintenance' ? `${osOf(m).name} · en maintenance` : subOf(m)"
                :status="statusOf(m)"
                :member="m.cluster ? `Cluster ${m.cluster}` : undefined"
                :title="titleOf(m)"
                @select="openMachine(m)"
                @open="openMachine(m)"
              />
            </McContainer>
          </div>

          <p v-if="hotes.length" class="mc-over mc-scr-site-over">Machines virtuelles, par hôte</p>
          <div v-if="hotes.length" class="mc-scr-site-racks">
            <McContainer
              v-for="h in hotes"
              :key="h.name"
              :name="h.cluster ? h.name.replace(/^Cluster /, '') : h.name"
              :type="h.cluster ? 'Cluster' : 'Hyperviseur'"
              layer="technique"
              :icon="h.cluster ? 'layers' : 'server'"
              :count="h.machines.length"
              :count-label="plural(h.machines.length, 'machine virtuelle', 'machines virtuelles')"
              :collapsible="false"
              class="mc-scr-site-rack"
            >
              <McNode
                v-for="m in h.machines"
                :key="m.name"
                layer="technique"
                icon="cloud"
                type="VM"
                :name="m.name"
                :subtitle="m.etat === 'arret' ? `${osOf(m).name} · arrêtée` : m.etat === 'maintenance' ? `${osOf(m).name} · en maintenance` : subOf(m)"
                :status="statusOf(m)"
                :dimmed="m.etat === 'arret'"
                :title="titleOf(m)"
                @select="openMachine(m)"
                @open="openMachine(m)"
              />
            </McContainer>
          </div>
          <p class="mc-cap mc-scr-site-legend">
            <McStatusChip status="critical" size="sm">Plus supporté</McStatusChip>
            <McStatusChip status="warn" size="sm">Fin de support proche</McStatusChip>
            Une icône sur une machine signale son système ou un logiciel de ses composants.
            <a class="mc-scr-site-a" :href="pathHref('/logiciels?etat=obsolete')" @click.prevent="goPath('/logiciels?etat=obsolete')">Logiciels obsolètes</a>
            ·
            <a class="mc-scr-site-a" :href="pathHref('/applications-obsoletes')" @click.prevent="goPath('/applications-obsoletes')">Applications exposées</a>
          </p>
        </template>
        <McEmptyState v-else icon="server" layer="technique" :title="`Aucune machine de ${site.name} ne correspond`" text="Modifiez la recherche ou choisissez un autre site.">
          <template #action><McButton variant="outline" size="sm" icon="x" @click="query = ''">Effacer la recherche</McButton></template>
        </McEmptyState>
      </section>
    </main>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onPalette" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-site { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-site-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-site-wrap { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: grid; gap: 20px; }
.mc-scr-site-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-site-titles { flex: 1; min-width: 180px; }
.mc-scr-site-titles .mc-over { margin: 0 0 2px; }
.mc-scr-site-titles h1 { margin: 0; }
.mc-scr-site-n { color: var(--ink-subtle); font-weight: 600; }
.mc-scr-site-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.mc-scr-site-card { display: grid; gap: 10px; align-content: start; text-align: left; padding: 16px; border-radius: var(--radius-lg); border: 1px solid var(--line); background: var(--surface); box-shadow: var(--shadow-node); color: var(--ink); font: inherit; cursor: pointer; transition: border-color .12s, box-shadow .12s; }
.mc-scr-site-card:hover { box-shadow: var(--shadow-hover); border-color: var(--line-strong); }
.mc-scr-site-card:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-site-card.is-on { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), var(--shadow-node); }
.mc-scr-site-card-top { display: flex; align-items: center; gap: 10px; }
.mc-scr-site-tile { width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--layer-technique-soft); color: var(--layer-technique); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-site-tile .mc-ico { width: 18px; height: 18px; }
.mc-scr-site-card-name { flex: 1; font: 700 17px/22px var(--font-display); }
.mc-scr-site-card-type { font: 700 9px/14px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--layer-technique); }
.mc-scr-site-card-desc { font-size: 13px; line-height: 18px; color: var(--ink-muted); min-height: 36px; }
.mc-scr-site-figs { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; color: var(--ink-muted); }
.mc-scr-site-figs b { font: 700 20px/24px var(--font-display); color: var(--ink); margin-right: 2px; }
.mc-scr-site-card-split { font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
.mc-scr-site-card-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.mc-scr-site-detail { display: grid; gap: 12px; padding: 20px; border-radius: var(--radius-lg); background: var(--surface); border: 1px solid var(--line); }
.mc-scr-site-dhead { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-site-dhead h2 { margin: 0; }
.mc-scr-site-grow { flex: 1; }
.mc-scr-site-search { width: 260px; }
.mc-scr-site-over { margin: 8px 0 0; }
.mc-scr-site-racks { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 16px; align-items: start; --behind: var(--surface); }
.mc-scr-site-rack > .gb { gap: 10px 10px; }
.mc-scr-site-rack .mc-node { width: 228px; }
.mc-scr-site-a { color: var(--accent); font-weight: 600; text-decoration: none; }
.mc-scr-site-a:hover { text-decoration: underline; }
.mc-scr-site-legend { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin: 4px 0 0; }
@media (min-width: 1800px) {
  .mc-scr-site-wrap { max-width: 1760px; padding-inline: 40px; }
  .mc-scr-site-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1280px) {
  .mc-scr-site-wrap { padding-inline: 24px; }
  .mc-scr-site-card-desc { min-height: 0; }
}
</style>
