<script setup lang="ts">
// Écran « Historique » : la carte Applications et flux de Scolarité en mode comparaison.
// Les objets ajoutés, modifiés ou supprimés depuis la version publiée du 18/05 portent un badge ;
// la frise du bas choisit la version comparée, le panneau de droite liste les changements par jour.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McEdgeLayer from '../../components/McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeSpec } from '../../components/McEdge/edge'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McTag from '../../components/McTag/McTag.vue'
import McModal from '../../components/McModal/McModal.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath, pathHref, queryParam } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { domainCount } from '../../data/applications'
import { addMapVersion, mapVersions, removeMapVersion } from '../../data/publication'
import { downloadCsv } from '../Explorateur/csv'

const scolariteCount = domainCount('Scolarité')
const paletteOpen = ref(false)
import { maxFitFor } from '../Infrastructure/canvasView'

const toast = useToast()

/* ---------- Versions ---------- */
interface Version {
  short: string
  long: string
  at: number
  /** Version ajoutée pendant la session (publication depuis l'éditeur, restauration). */
  session?: { id: number; kind: 'publication' | 'restauration' }
}
const BASE: Version[] = [
  { short: '18/05', long: 'Version publiée du 18/05/2026', at: 0 },
  { short: '02/06', long: '02/06/2026', at: 22 },
  { short: '12/06', long: '12/06/2026', at: 38 },
  { short: '07/07', long: '07/07/2026', at: 70 },
]
/** Les versions de la frise : celles d'avant, celles de la session (entre le 07/07 et aujourd'hui), puis aujourd'hui. */
const versions = computed<Version[]>(() => {
  const n = mapVersions.length
  return [
    ...BASE,
    ...mapVersions.map((v, k) => ({ short: v.short, long: v.long, at: Math.round(70 + ((k + 1) * 30) / (n + 1)), session: { id: v.id, kind: v.kind } })),
    { short: 'Aujourd’hui', long: 'Aujourd’hui', at: 100 },
  ]
})
const last = computed(() => versions.value.length - 1)
/** Version comparée à celle du 18/05 (indice dans `versions`). */
const target = ref(last.value)
// Une version ajoutée : on garde « Aujourd'hui » si c'était lui qu'on regardait.
watch(last, (l, old) => {
  if (target.value === old) target.value = l
})
/** Indice de la dernière restauration du 18/05 sur la frise, ou rien : à partir de là, tous les changements sont annulés. */
const restoredAt = computed(() => {
  let at: number | null = null
  versions.value.forEach((v, i) => {
    if (v.session?.kind === 'restauration') at = i
  })
  return at
})
/** La version regardée est postérieure à une restauration : la carte est revenue au 18/05. */
const reverted = computed(() => restoredAt.value !== null && target.value >= restoredAt.value)

/* ---------- Objets de la carte ---------- */
type ChangeKind = 'add' | 'mod' | 'del'
interface MapNode {
  id: string
  type: string
  layer: Layer
  icon: IconName
  sub?: string
  box: McBox
  main?: boolean
  /** Le changement qui touche ce nœud, et la version où il a lieu. */
  change?: { kind: ChangeKind; at: number; sub: string }
}
const W = 190
const H = 48
const nodes: MapNode[] = [
  { id: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app', sub: '32 utilisateurs', box: { x: 320, y: 246, w: W, h: H }, main: true },
  { id: 'ASTRE RH', type: 'Application', layer: 'applicatif', icon: 'app', box: { x: 320, y: 340, w: W, h: H }, change: { kind: 'add', at: 1, sub: 'Prévue · SaaS' } },
  { id: 'NOTES', type: 'Application', layer: 'applicatif', icon: 'app', box: { x: 320, y: 446, w: W, h: H } },
  { id: 'SANGRIA', type: 'Application', layer: 'applicatif', icon: 'app', sub: 'Inscriptions sportives', box: { x: 320, y: 540, w: W, h: H }, change: { kind: 'del', at: 2, sub: 'Retirée de la carte' } },
  { id: 'CALCIUM', type: 'Application', layer: 'applicatif', icon: 'app', sub: 'Agenda partagé', box: { x: 560, y: 246, w: W, h: H }, change: { kind: 'mod', at: 3, sub: 'Liaison : asynchrone → synchrone' } },
  { id: 'DIEGO', type: 'Application', layer: 'applicatif', icon: 'app', box: { x: 560, y: 446, w: W, h: H } },
  { id: 'Talend ESB', type: 'Application', layer: 'applicatif', icon: 'app', box: { x: 840, y: 356, w: W, h: H }, change: { kind: 'add', at: 2, sub: 'Bus d’intégration' } },
  { id: 'sophocle', type: 'Machine', layer: 'technique', icon: 'server', sub: 'VM · Tomcat 5', box: { x: 840, y: 470, w: W, h: H }, change: { kind: 'mod', at: 3, sub: 'Tomcat 5 → à migrer' } },
]
const byId = Object.fromEntries(nodes.map((n) => [n.id, n])) as Record<string, MapNode>

/** Changement visible pour la version comparée, ou rien (aucun après une restauration). */
const changeOf = (n: MapNode) => (!reverted.value && n.change && n.change.at <= target.value ? n.change : undefined)
/** Un objet ajouté après la version comparée n'existe pas encore ; après une restauration, les ajouts sont retirés. */
const visibleNodes = computed(() => nodes.filter((n) => !(n.change?.kind === 'add' && (reverted.value || n.change.at > target.value))))
const subOf = (n: MapNode) => changeOf(n)?.sub ?? n.sub

const badge: Record<ChangeKind, { label: string; icon: IconName }> = {
  add: { label: 'Ajoutée', icon: 'plus' },
  mod: { label: 'Modifiée', icon: 'pencil' },
  del: { label: 'Supprimée', icon: 'trash' },
}
const badgeLabel = (n: MapNode, k: ChangeKind) => (n.type === 'Machine' ? badge[k].label.replace(/e$/, '') : badge[k].label)

/* ---------- Liens ---------- */
interface Link {
  id: string
  from: string
  to: string
  label: string
  /** Lien ajouté à cette version. */
  addedAt?: number
}
const links: Link[] = [
  { id: 'l-calcium', from: 'APOGEE', to: 'CALCIUM', label: 'Synchrone · semestrielle' },
  { id: 'l-diego', from: 'NOTES', to: 'DIEGO', label: 'Web service · quotidienne' },
  { id: 'l-talend', from: 'CALCIUM', to: 'Talend ESB', label: 'Nouveau flux · Synchro des comptes', addedAt: 2 },
  { id: 'l-sophocle', from: 'DIEGO', to: 'sophocle', label: 'Hébergée sur' },
]
const edges = computed<McEdgeSpec[]>(() => {
  const shown = new Set(visibleNodes.value.map((n) => n.id))
  return links
    .filter((l) => shown.has(l.from) && shown.has(l.to) && !(l.addedAt !== undefined && (reverted.value || l.addedAt > target.value)))
    .map((l) => {
      const isNew = l.addedAt !== undefined
      const dim = onlyChanges.value && !isNew
      return {
        id: l.id,
        ...edgeBetween(byId[l.from].box, byId[l.to].box),
        label: l.label,
        kind: l.id === 'l-sophocle' ? (dim ? 'dim' : 'host') : dim ? 'dim' : isNew ? 'hover' : 'flow',
        showLabel: isNew,
        arrow: l.id !== 'l-sophocle',
      } satisfies McEdgeSpec
    })
})

/* ---------- Panneau des changements ---------- */
const panelOpen = ref(true)
const onlyChanges = ref(false)
const selected = ref<string | null>(null)

interface ChangeEvent {
  at: number
  kind: ChangeKind
  text: string
  who: string
  node: string
}
const events: ChangeEvent[] = [
  { at: 3, kind: 'mod', text: 'Flux « Maj des données étudiantes » passé en synchrone', who: 'ABP · 11:28', node: 'CALCIUM' },
  { at: 3, kind: 'mod', text: 'sophocle : composant Tomcat 5 marqué « à migrer »', who: 'William · 10:02', node: 'sophocle' },
  { at: 2, kind: 'add', text: 'Talend ESB ajouté, relié à APOGEE par « Synchro des comptes »', who: 'Samuel · 16:40', node: 'Talend ESB' },
  { at: 2, kind: 'del', text: 'SANGRIA retirée du domaine Scolarité', who: 'Samuel · 16:12', node: 'SANGRIA' },
  { at: 1, kind: 'add', text: 'ASTRE RH ajoutée (statut Prévue)', who: 'Théo · 09:15', node: 'ASTRE RH' },
]
/** Les changements de la session : une publication, ou une restauration qui annule tout ce qui précède. */
const sessionEvents = computed<ChangeEvent[]>(() =>
  versions.value
    .map((v, i) => ({ v, i }))
    .filter(({ v }) => v.session)
    .map(({ v, i }) => {
      const sv = mapVersions.find((x) => x.id === v.session!.id)!
      return { at: i, kind: (sv.kind === 'restauration' ? 'del' : 'mod') as ChangeKind, text: sv.text, who: sv.who, node: '' }
    })
    .reverse(),
)
const shownEvents = computed(() => [...sessionEvents.value, ...events].filter((e) => e.at <= target.value))
/** Les changements faits depuis le 18/05 et pas encore annulés : ce qu'une restauration annulerait. */
const pendingChanges = computed(() => (restoredAt.value === null ? events.length : 0))
const days = computed(() => {
  const out: { day: string; items: ChangeEvent[] }[] = []
  for (const e of shownEvents.value) {
    const day = versions.value[e.at].long
    const g = out.find((d) => d.day === day)
    if (g) g.items.push(e)
    else out.push({ day, items: [e] })
  }
  return out
})
const counts = computed(() => {
  const c = { add: 0, mod: 0, del: 0 }
  for (const n of nodes) {
    const ch = changeOf(n)
    if (ch) c[ch.kind]++
  }
  return c
})
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

function dimmed(n: MapNode) {
  if (selected.value) return selected.value !== n.id
  return onlyChanges.value && !changeOf(n)
}
function focusEvent(e: ChangeEvent) {
  if (!e.node) {
    // Une version de la session : on la montre sur la frise.
    pick(e.at)
    return
  }
  // Le changement n'est plus visible (après une restauration) : on revient à la version où il a eu lieu.
  if (!visibleNodes.value.some((n) => n.id === e.node) || (reverted.value && target.value >= (restoredAt.value ?? 0))) pick(e.at)
  selected.value = selected.value === e.node ? null : e.node
}

/* ---------- Rejouer ---------- */
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
function stop() {
  clearInterval(timer)
  timer = undefined
  playing.value = false
}
function replay() {
  if (playing.value) return stop()
  playing.value = true
  selected.value = null
  target.value = 0
  timer = setInterval(() => {
    target.value = Math.min(target.value + 1, last.value)
    if (target.value === last.value) stop()
  }, 900)
}
function pick(i: number) {
  stop()
  target.value = i
}
function onTimelineKey(e: KeyboardEvent) {
  if (e.key === 'ArrowRight' && target.value < last.value) pick(target.value + 1)
  else if (e.key === 'ArrowLeft' && target.value > 0) pick(target.value - 1)
  else return
  e.preventDefault()
}
watch(target, () => {
  if (selected.value && !visibleNodes.value.some((n) => n.id === selected.value)) selected.value = null
})

/* ---------- Restaurer, exporter ---------- */
const confirmOpen = ref(false)
const restoring = ref(false)
function restore() {
  restoring.value = true
  const n = pendingChanges.value
  setTimeout(() => {
    restoring.value = false
    confirmOpen.value = false
    stop()
    selected.value = null
    const id = addMapVersion('restauration', `Restauration de la version du 18/05 : ${plural(n, 'changement annulé', 'changements annulés')}`, 'Restauration du 18/05')
    target.value = last.value
    toast.success('Carte restaurée à la version du 18/05', {
      actionLabel: 'Annuler',
      onAction: () => {
        removeMapVersion(id)
        target.value = last.value
      },
    })
  }, 700)
}
/** Le rapport : un fichier CSV des changements de la période affichée, lisible dans Excel. */
/** Annule la dernière restauration : les changements reviennent. */
function undoRestore() {
  const v = [...mapVersions].reverse().find((x) => x.kind === 'restauration')
  if (!v) return
  removeMapVersion(v.id)
  target.value = last.value
  toast.success('Changements rétablis : la carte est revenue à son état d’avant la restauration')
}
function exportReport() {
  const typeLabel: Record<ChangeKind, string> = { add: 'Ajout', mod: 'Modification', del: 'Suppression' }
  const rowsOut = days.value.flatMap((d) => d.items.map((e) => [d.day, e.node ? typeLabel[e.kind] : e.kind === 'del' ? 'Restauration' : 'Publication', e.node || 'Carte', e.text, e.who]))
  const to = target.value === last.value ? 'aujourd-hui' : versions.value[target.value].short.replace(/\//g, '-')
  downloadCsv([['Date', 'Type', 'Objet', 'Changement', 'Par'], ...rowsOut], `changements-scolarite-du-18-05-au-${to}.csv`)
  toast.success(`Rapport exporté : ${plural(rowsOut.length, 'changement', 'changements')} en CSV`)
}

/* ---------- Barre du haut ---------- */
/** Ouvert depuis le journal des modifications (?depuis=journal) : le fil d'Ariane et « Quitter » y ramènent. */
const fromJournal = queryParam('depuis') === 'journal'
const trail: TrailStep[] = fromJournal
  ? [{ label: 'Historique', icon: 'history' }, { label: 'Scolarité', layer: 'fonctionnel' }, { label: 'Applications et flux' }, { label: 'Comparaison' }]
  : [{ label: 'Accueil' }, { label: 'Scolarité', layer: 'fonctionnel' }, { label: 'Applications et flux' }, { label: 'Historique' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath(fromJournal ? '/journal' : '/')
  else if (i < 3) goPath('/carte')
}
const quit = () => goPath(fromJournal ? '/journal' : '/carte')
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

/* ---------- Zoom, déplacement, recadrage ---------- */
const CONTENT = { x: 300, y: 136, w: 730, h: 534 }
const root = ref<HTMLElement>()
const zoom = ref(1)
const pan = ref({ x: 0, y: 0 })
const size = ref({ w: 1440, h: 900 })
let ro: ResizeObserver | undefined
function fit() {
  const { w, h } = size.value
  const left = 16
  const right = panelOpen.value ? 320 + 32 : 16
  const top = 84
  const bottom = 118
  const availW = w - left - right - 32
  const availH = h - top - bottom - 16
  const z = Math.round(Math.max(0.5, Math.min(maxFitFor(w, h), availW / CONTENT.w, availH / CONTENT.h)) * 100) / 100
  zoom.value = z
  pan.value = {
    x: Math.round(left + 16 + (availW - CONTENT.w * z) / 2 - CONTENT.x * z),
    y: Math.round(top + 8 + (availH - CONTENT.h * z) / 2 - CONTENT.y * z),
  }
}
onMounted(() => {
  const el = root.value!
  size.value = { w: el.clientWidth, h: el.clientHeight }
  fit()
  ro = new ResizeObserver(() => {
    size.value = { w: el.clientWidth, h: el.clientHeight }
    fit()
  })
  ro.observe(el)
})
watch(panelOpen, fit)
onBeforeUnmount(() => {
  ro?.disconnect()
  stop()
})
function onWheel(e: WheelEvent) {
  if ((e.target as HTMLElement).closest('.mc-float')) return
  e.preventDefault()
  if (e.ctrlKey || e.metaKey) {
    const old = zoom.value
    const z = Math.round(Math.min(2, Math.max(0.3, old * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100
    const r = root.value!.getBoundingClientRect()
    const cx = e.clientX - r.left
    const cy = e.clientY - r.top
    pan.value = { x: cx - ((cx - pan.value.x) * z) / old, y: cy - ((cy - pan.value.y) * z) / old }
    zoom.value = z
  } else {
    pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
  }
}
const pos = (b: McBox) => ({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px' })
const markClass: Record<ChangeKind, string> = { add: 'is-add', mod: 'is-mod', del: 'is-del' }
</script>

<template>
  <div ref="root" class="mc-scr-hi" @wheel="onWheel">
    <McCanvas fill :zoom="zoom" :pan="pan" label="Historique de la carte Applications et flux de Scolarité" @deselect="selected = null" @fit="fit">
      <McContainer
        name="Scolarité"
        type="Domaine"
        layer="fonctionnel"
        icon="folder"
        :count="scolariteCount"
        :count-label="`${scolariteCount} applications`"
        :collapsible="false"
        :dimmed="onlyChanges"
        style="left: 300px; top: 150px; width: 470px"
      >
        <div class="mc-scr-hi-spacer" @click.self="selected = null" />
      </McContainer>

      <McEdgeLayer :edges="edges" :interactive="false" />

      <template v-for="n in visibleNodes" :key="n.id">
        <div v-if="changeOf(n)" class="mc-scr-hi-diff" :class="markClass[changeOf(n)!.kind]" :style="pos(n.box)">
          <span class="mc-scr-hi-badge"><McIcon :name="badge[changeOf(n)!.kind].icon" />{{ badgeLabel(n, changeOf(n)!.kind) }}</span>
          <McNode
            :layer="n.layer"
            :icon="n.icon"
            :type="n.type"
            :name="n.id"
            :subtitle="subOf(n)"
            :selected="selected === n.id"
            :dimmed="!!selected && selected !== n.id"
            :style="{ width: n.box.w + 'px' }"
            @select="selected = n.id"
          />
        </div>
        <McNode
          v-else
          :style="pos(n.box)"
          :layer="n.layer"
          :icon="n.icon"
          :type="n.type"
          :name="n.id"
          :subtitle="subOf(n)"
          :main="n.main"
          :selected="selected === n.id"
          :dimmed="dimmed(n)"
          @select="selected = n.id"
        />
      </template>

      <template #top>
        <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home.prevent="goPath('/')" @search="paletteOpen = true">
          <template #actions>
            <McAvatarStack :people="people" label="3 personnes sur la carte" />
            <McButton variant="outline" icon="x" @click="quit">Quitter la comparaison</McButton>
          </template>
        </McAppBar>
      </template>
    </McCanvas>

    <!-- Ce qui a changé -->
    <aside v-if="panelOpen" class="mc-float mc-scr-hi-panel" aria-label="Ce qui a changé">
      <div class="mc-scr-hi-head">
        <b class="title">Ce qui a changé</b>
        <McIconButton icon="x" label="Fermer le panneau" size="sm" @click="panelOpen = false" />
      </div>
      <p class="mc-cap mc-scr-hi-range">Du 18/05/2026 au {{ target === versions.length - 1 ? 'aujourd’hui' : versions[target].long }}</p>
      <div v-if="reverted" class="mc-scr-hi-reverted" role="status">
        <McIcon name="history" size="sm" />
        <span>Carte revenue à la version du 18/05 : les changements ci-dessous sont annulés.</span>
      </div>
      <div v-else-if="target > 0" class="mc-scr-hi-chips">
        <McStatusChip v-if="counts.add" status="ok" size="sm">{{ plural(counts.add, 'ajout', 'ajouts') }}</McStatusChip>
        <span v-if="counts.mod" class="mc-chip sm filter"><McIcon name="pencil" />{{ plural(counts.mod, 'modification', 'modifications') }}</span>
        <McStatusChip v-if="counts.del" status="critical" size="sm">{{ plural(counts.del, 'suppression', 'suppressions') }}</McStatusChip>
      </div>
      <McSwitch v-model="onlyChanges" label="Montrer seulement les changements" block />
      <hr class="mc-hr" />
      <p v-if="!days.length" class="mc-scr-hi-none">Aucun changement : c’est la version publiée du 18/05/2026. Choisissez une date plus récente sur la frise.</p>
      <div v-for="d in days" :key="d.day" class="mc-scr-hi-day">
        <span class="mc-over">{{ d.day }}</span>
        <button
          v-for="e in d.items"
          :key="e.text + e.at"
          type="button"
          class="mc-scr-hi-ev"
          :class="{ 'is-on': !!e.node && selected === e.node, 'is-reverted': reverted && !!e.node }"
          :aria-pressed="!!e.node && selected === e.node"
          @click="focusEvent(e)"
        >
          <span class="mc-scr-hi-mk" :class="markClass[e.kind]"><McIcon :name="badge[e.kind].icon" /></span>
          <span>{{ e.text }}<span class="mc-scr-hi-who">{{ e.who }}</span></span>
        </button>
      </div>
      <hr class="mc-hr" />
      <div class="mc-scr-hi-actions">
        <McButton v-if="restoredAt === null" variant="outline" icon="history" @click="confirmOpen = true">Restaurer la version du 18/05</McButton>
        <McButton v-else variant="outline" icon="undo" @click="undoRestore">Rétablir les changements</McButton>
        <McButton variant="ghost" size="sm" icon="export" @click="exportReport">Exporter le rapport de changements</McButton>
      </div>
    </aside>
    <McButton v-else class="mc-scr-hi-reopen" variant="outline" icon="history" @click="panelOpen = true">Ce qui a changé</McButton>

    <!-- Frise des versions -->
    <div class="mc-float mc-scr-hi-timeline" :class="{ 'is-wide': !panelOpen }">
      <div class="mc-scr-hi-tlhead">
        <span class="mc-over">Comparer</span>
        <McTag size="md">{{ versions[0].long }}</McTag>
        <McIcon name="arrow-right" size="sm" class="mc-scr-hi-arrow" />
        <McTag size="md" class="mc-scr-hi-target">{{ versions[target].short === 'Aujourd’hui' ? 'Aujourd’hui' : versions[target].long }}</McTag>
        <McButton variant="ghost" size="sm" :icon="playing ? 'x' : 'play'" @click="replay">{{ playing ? 'Arrêter' : 'Rejouer' }}</McButton>
      </div>
      <div class="mc-scr-hi-track" role="radiogroup" aria-label="Version comparée à celle du 18/05" @keydown="onTimelineKey">
        <span class="mc-scr-hi-rail" />
        <span class="mc-scr-hi-rng" :style="{ width: versions[target].at + '%' }" />
        <button
          v-for="(v, i) in versions"
          :key="v.short + i"
          type="button"
          role="radio"
          class="mc-scr-hi-pt"
          :class="{ 'is-on': i <= target, 'is-target': i === target, 'is-base': i === 0 }"
          :style="{ left: v.at + '%' }"
          :aria-checked="i === target"
          :aria-label="i === 0 ? `${v.long}, version de référence` : `Comparer avec ${v.long}`"
          :tabindex="i === target ? 0 : -1"
          :disabled="i === 0"
          @click="pick(i)"
        >
          <span class="mc-scr-hi-dot" />
          <span class="mc-scr-hi-lb">{{ v.short }}</span>
        </button>
      </div>
    </div>

    <McModal
      v-model:open="confirmOpen"
      title="Restaurer la version du 18/05 ?"
      confirm-label="Restaurer"
      confirm-icon="history"
      :loading="restoring"
      @confirm="restore"
    >
      <p class="mc-scr-hi-modal">
        La carte reviendra à la version publiée du 18/05/2026. Les {{ pendingChanges }} changements faits depuis ne seront pas perdus : ils restent dans l’historique et
        pourront être rétablis.
      </p>
    </McModal>
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost :offset="124" />
  </div>
</template>

<style>
.mc-scr-hi { position: relative; width: 100%; height: 100vh; min-height: 640px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-hi-spacer { width: 100%; height: 426px; }
.mc-scr-hi .mc-canvas-layer > .mc-node { z-index: 1; }

.mc-scr-hi-reverted { display: flex; gap: 8px; align-items: flex-start; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--accent-soft, var(--surface-sunken)); font-size: 12px; line-height: 16px; }
.mc-scr-hi-ev.is-reverted > span:last-child { text-decoration: line-through; text-decoration-color: var(--ink-subtle); color: var(--ink-muted); }

/* Nœuds touchés par un changement : contour et badge à la couleur du changement. */
.mc-scr-hi-diff { position: absolute; z-index: 1; transition: opacity .2s ease-out; }
.mc-scr-hi-diff > .mc-node { margin: 0; }
.mc-scr-hi-badge { position: absolute; top: -10px; right: 8px; z-index: 2; height: 18px; display: inline-flex; align-items: center; gap: 3px; padding: 0 7px; border-radius: var(--radius-pill); font: 700 10px/18px var(--font-sans); }
.mc-scr-hi-badge .mc-ico { width: 11px; height: 11px; }
.mc-scr-hi-diff.is-add > .mc-node { border-color: var(--status-ok); box-shadow: 0 0 0 1px var(--status-ok); }
.mc-scr-hi-diff.is-add .mc-scr-hi-badge { background: var(--status-ok); color: var(--surface); }
.mc-scr-hi-diff.is-mod > .mc-node { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
.mc-scr-hi-diff.is-mod .mc-scr-hi-badge { background: var(--accent); color: var(--on-accent); }
.mc-scr-hi-diff.is-del > .mc-node { background: transparent; border-style: dashed; border-color: var(--status-critical); box-shadow: none; opacity: .85; }
.mc-scr-hi-diff.is-del > .mc-node .tx b { text-decoration: line-through; color: var(--ink-muted); }
.mc-scr-hi-diff.is-del .mc-scr-hi-badge { background: var(--status-critical); color: var(--surface); }
.mc-scr-hi-diff > .mc-node.is-selected { box-shadow: 0 0 0 2px var(--accent); }

/* Panneau de droite. */
.mc-scr-hi-panel { position: absolute; right: 16px; top: 84px; bottom: 16px; width: var(--panel-w); z-index: 6; overflow: auto; box-sizing: border-box; padding: 14px 16px; display: flex; flex-direction: column; gap: 12px; }
.mc-scr-hi-panel > * { flex: none; }
.mc-scr-hi-head { display: flex; align-items: center; gap: 8px; }
.mc-scr-hi-head .title { flex: 1; }
.mc-scr-hi-range { margin: -8px 0 0; }
.mc-scr-hi-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.mc-scr-hi-panel .mc-hr { margin: 0; }
.mc-scr-hi-none { margin: 0; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-hi-day { display: grid; gap: 4px; }
.mc-scr-hi-day .mc-over { margin-bottom: 2px; }
.mc-scr-hi-ev { display: grid; grid-template-columns: 22px 1fr; gap: 10px; padding: 6px; margin: 0 -6px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: 400 13px/18px var(--font-sans); text-align: left; cursor: pointer; }
.mc-scr-hi-ev:hover { background: var(--surface-sunken); }
.mc-scr-hi-ev.is-on { background: var(--accent-soft); }
.mc-scr-hi-ev:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-hi-who { display: block; font-size: 11px; color: var(--ink-subtle); }
.mc-scr-hi-mk { width: 22px; height: 22px; border-radius: 6px; display: inline-flex; align-items: center; justify-content: center; }
.mc-scr-hi-mk .mc-ico { width: 12px; height: 12px; }
.mc-scr-hi-mk.is-add { background: var(--status-ok-soft); color: var(--status-ok); }
.mc-scr-hi-mk.is-mod { background: var(--accent-soft); color: var(--accent); }
.mc-scr-hi-mk.is-del { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-scr-hi-actions { display: grid; gap: 8px; }
.mc-scr-hi-reopen { position: absolute; right: 16px; top: 84px; z-index: 6; }

/* Frise des versions. */
.mc-scr-hi-timeline { position: absolute; left: 16px; right: 352px; bottom: 16px; z-index: 6; padding: 12px 22px 10px; display: grid; gap: 4px; box-sizing: border-box; }
.mc-scr-hi-timeline.is-wide { right: 16px; }
.mc-scr-hi-tlhead { display: flex; align-items: center; gap: 10px; margin: 0 -8px; }
.mc-scr-hi-tlhead > .mc-over { flex: 1; }
.mc-scr-hi-arrow { color: var(--ink-subtle); }
.mc-chip.mc-scr-hi-target { border-color: var(--accent); color: var(--accent); }
.mc-scr-hi-track { position: relative; height: 44px; margin: 0 28px 0 12px; }
.mc-scr-hi-rail, .mc-scr-hi-rng { position: absolute; top: 20px; height: 4px; border-radius: 2px; }
.mc-scr-hi-rail { left: 0; right: 0; background: var(--surface-sunken); }
.mc-scr-hi-rng { left: 0; background: var(--accent); transition: width .3s ease-out; }
.mc-scr-hi-pt { position: absolute; top: 0; width: 56px; height: 44px; margin-left: -28px; padding: 0; border: 0; background: transparent; cursor: pointer; color: var(--ink-subtle); font: 400 11px/14px var(--font-sans); }
.mc-scr-hi-pt:disabled { cursor: default; }
.mc-scr-hi-pt:focus-visible { outline: none; }
.mc-scr-hi-pt:focus-visible .mc-scr-hi-dot { box-shadow: 0 0 0 3px var(--accent-soft); }
.mc-scr-hi-dot { position: absolute; left: 50%; top: 15px; width: 14px; height: 14px; margin-left: -7px; border-radius: 50%; background: var(--surface); border: 2px solid var(--line-strong); box-sizing: border-box; transition: all .2s ease-out; }
.mc-scr-hi-pt:not(:disabled):hover .mc-scr-hi-dot { border-color: var(--accent); }
.mc-scr-hi-pt.is-on .mc-scr-hi-dot { border-color: var(--accent); background: var(--accent); }
.mc-scr-hi-pt.is-target .mc-scr-hi-dot { width: 20px; height: 20px; top: 12px; margin-left: -10px; border: 3px solid var(--accent); background: var(--surface); box-shadow: var(--shadow-node); }
.mc-scr-hi-lb { position: absolute; left: 50%; bottom: -2px; transform: translateX(-50%); white-space: nowrap; }
.mc-scr-hi-pt.is-target .mc-scr-hi-lb { color: var(--accent); font-weight: 600; }
.mc-scr-hi-modal { margin: 0; font-size: 14px; line-height: 20px; color: var(--ink-muted); }

@media (prefers-reduced-motion: reduce) {
  .mc-scr-hi-rng, .mc-scr-hi-dot, .mc-scr-hi-diff { transition: none; }
}
</style>
