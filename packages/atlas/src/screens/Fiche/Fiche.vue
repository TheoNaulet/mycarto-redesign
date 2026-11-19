<script setup lang="ts">
// Fiche pleine page d'une application : identité, sécurité DICP, chiffres clés, cartes, informations, relations,
// points d'attention et activité. Tout vient de la source unique src/data/applications.ts.
// Dans l'application, l'application vient de l'adresse (/fiche/:id) ; dans Storybook, de la propriété `id`.
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import McContextMenu, { type ContextMenuItem } from '../../components/McContextMenu/McContextMenu.vue'
import McCountBadge from '../../components/McCountBadge/McCountBadge.vue'
import McDicpBadge from '../../components/McDicpBadge/McDicpBadge.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import McModal from '../../components/McModal/McModal.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McTabs, { type TabItem } from '../../components/McTabs/McTabs.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer, Status } from '../../utils/types'
import { attentionPoints, getApplication, slugOf, type AppMap, type Contract } from '../../data/applications'
import { deletedApps, moveToTrash, restoreFromTrash } from '../../data/session'
import { copyLink, goFiche, goPath, pathHref } from '../bridge'
import { de, goTo, openPaletteItem, paletteItems, screenHref, type ScreenKey } from '../Accueil/nav'
import SharePanel, { type ExportItem } from '../shared/SharePanel.vue'

const props = withDefaults(
  defineProps<{
    /** Identifiant de l'application (« apogee », « apogee-web ») ou son nom. Dans l'application, l'adresse /fiche/:id l'emporte. */
    id?: string
  }>(),
  { id: 'apogee' },
)

/* ---------- L'application affichée ---------- */
// Sans routeur (Storybook), `$route` n'existe pas : on garde la propriété.
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeId = computed(() => {
  const route = (globals as { $route?: { params?: Record<string, unknown> } } | undefined)?.$route
  const v = route?.params?.id
  return typeof v === 'string' && v ? v : undefined
})
const slug = computed(() => routeId.value ?? props.id)
const app = computed(() => getApplication(slug.value))
const name = computed(() => app.value?.name ?? '')

const toast = useToast()

const trail = computed<TrailStep[]>(() =>
  app.value
    ? [{ label: 'Accueil' }, { label: app.value.domaines[0] ?? 'Applications', layer: 'fonctionnel' }, { label: app.value.name, layer: 'applicatif' }]
    : [{ label: 'Accueil' }, { label: 'Applications', layer: 'applicatif' }, { label: 'Fiche introuvable' }],
)

const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

/* ---------- Cartes où figure l'application ---------- */
const mapOf = (kind: AppMap['kind']) => app.value?.maps.find((m) => m.kind === kind)
const fluxPath = computed(() => mapOf('flux')?.path)
const infraPath = computed(() => mapOf('infra')?.path)

const tabs: TabItem[] = [
  { value: 'fiche', label: 'Fiche', icon: 'info' },
  { value: 'flux', label: 'Flux', icon: 'flow' },
  { value: 'infra', label: 'Infrastructure', icon: 'server' },
  { value: 'pos', label: 'POS', icon: 'pos' },
  { value: 'historique', label: 'Historique', icon: 'history' },
]
const tab = ref('fiche')
watch(tab, (v, old) => {
  const path = v === 'flux' ? fluxPath.value : v === 'infra' ? infraPath.value : undefined
  if (path) {
    goPath(path)
    // Garde l'onglet précédent actif si la navigation est bloquée (story ouverte hors du gestionnaire).
    tab.value = old
  }
})
// Une autre fiche (lien d'une relation) : on revient sur l'onglet Fiche.
watch(slug, () => (tab.value = 'fiche'))

/* ---------- Chiffres clés ---------- */
const plural = (n: number, one: string, many: string) => (n > 1 ? many : one)
const facts = computed<{ n: string | number | null; label: string }[]>(() => {
  const a = app.value
  if (!a) return []
  return [
    { n: a.utilisateurs, label: 'utilisateurs' },
    { n: a.flux, label: a.fluxEntrants !== null ? `flux (${a.fluxEntrants} ${plural(a.fluxEntrants, 'entrant', 'entrants')})` : 'flux' },
    { n: a.domaines.length || null, label: plural(a.domaines.length, 'domaine', 'domaines') },
    { n: a.composants, label: 'composants' },
    a.hebergement === 'SaaS' ? { n: 'SaaS', label: 'hébergement' } : { n: a.hosts.length || null, label: plural(a.hosts.length, 'machine', 'machines') },
    { n: a.miseEnService, label: a.statut === 'Prévue' ? 'mise en service prévue' : 'mise en service' },
  ]
})

/* ---------- Cartes ---------- */
type Block = { layer: Layer; l: number; t: number; w: number; h: number }
const THUMBS: Record<AppMap['kind'], Block[]> = {
  flux: [
    { layer: 'applicatif', l: 8, t: 30, w: 20, h: 14 },
    { layer: 'applicatif', l: 50, t: 10, w: 30, h: 8 },
    { layer: 'applicatif', l: 50, t: 26, w: 30, h: 8 },
    { layer: 'applicatif', l: 50, t: 42, w: 30, h: 8 },
    { layer: 'applicatif', l: 50, t: 58, w: 30, h: 8 },
    { layer: 'applicatif', l: 96, t: 20, w: 24, h: 8 },
    { layer: 'applicatif', l: 96, t: 46, w: 24, h: 8 },
  ],
  infra: [
    { layer: 'applicatif', l: 8, t: 8, w: 64, h: 66 },
    { layer: 'technique', l: 90, t: 10, w: 30, h: 12 },
    { layer: 'technique', l: 90, t: 30, w: 30, h: 12 },
    { layer: 'technique', l: 90, t: 50, w: 30, h: 12 },
  ],
  pos: [
    { layer: 'fonctionnel', l: 8, t: 8, w: 50, h: 30 },
    { layer: 'fonctionnel', l: 64, t: 8, w: 56, h: 30 },
    { layer: 'fonctionnel', l: 8, t: 44, w: 112, h: 30 },
  ],
  impact: [
    { layer: 'technique', l: 8, t: 30, w: 22, h: 16 },
    { layer: 'applicatif', l: 50, t: 14, w: 24, h: 10 },
    { layer: 'applicatif', l: 50, t: 36, w: 24, h: 10 },
    { layer: 'applicatif', l: 90, t: 8, w: 30, h: 8 },
    { layer: 'applicatif', l: 90, t: 24, w: 30, h: 8 },
    { layer: 'applicatif', l: 90, t: 40, w: 30, h: 8 },
    { layer: 'applicatif', l: 90, t: 56, w: 30, h: 8 },
  ],
}
const maps = computed(() => (app.value?.maps ?? []).map((m) => ({ ...m, blocks: THUMBS[m.kind] })))
/** Carte la plus proche de chaque genre, quand la carte de l'application n'a pas d'adresse propre. */
const MAP_FALLBACK: Record<AppMap['kind'], string> = { flux: '/carte', infra: '/infrastructure', pos: '/pos', impact: '/impact' }
const mapPathOf = (m: AppMap) => m.path ?? MAP_FALLBACK[m.kind]
function openMap(e: MouseEvent, m: AppMap) {
  followPath(e, mapPathOf(m))
}

/* ---------- Informations ---------- */
const euros = (v: string) => `${Number(v).toLocaleString('fr-FR')} € par an`
const infoLeft = computed<KeyValueItem[]>(() => {
  const a = app.value
  if (!a) return []
  return [
    { key: 'Statut', value: a.statut },
    { key: 'Nature', value: a.nature },
    { key: 'Hébergement', value: a.hebergement },
    { key: 'Éditeur', value: a.editeur },
    { key: 'Utilisateurs', value: a.publics ?? (a.utilisateurs ? `${a.utilisateurs} utilisateurs` : null) },
  ]
})
const infoRight = computed<KeyValueItem[]>(() => {
  const a = app.value
  if (!a) return []
  return [
    { key: 'Mise en service', value: a.miseEnService },
    { key: 'Fin de service', value: a.finDeService },
    { key: 'Documentation', value: a.documentation },
    { key: 'Groupe propriétaire', value: a.groupe },
    ...(a.hebergement === 'SaaS' ? [{ key: 'Coût', value: a.cout ? euros(a.cout) : null }] : []),
  ]
})

/* ---------- Relations ---------- */
const CONTRACT_STATUS: Record<Contract['level'], Status> = { expire: 'critical', moins6: 'warn', de6a12: 'warn', plus1an: 'ok', inconnue: 'unknown' }
const contractLabel = (c: Contract) => (c.level === 'expire' ? `Expiré le ${c.end}` : c.level === 'plus1an' ? '> 1 an' : c.level === 'inconnue' ? 'Sans date' : `Expire le ${c.end}`)
const appRel = (n: string, meta?: string): RelationItem => {
  const o = getApplication(n)?.obsolescence
  return {
    id: `app-${n}`,
    name: n,
    meta,
    layer: 'applicatif',
    icon: 'app',
    ...(o && (o.status === 'critical' || o.status === 'warn') ? { status: o.status, statusLabel: o.label } : {}),
  }
}
const relLeft = computed<RelationGroup[]>(() => {
  const a = app.value
  if (!a) return []
  const groups: RelationGroup[] = [
    { verb: 'Appartient à', items: a.domaines.map((d) => ({ id: `dom-${d}`, name: d, layer: 'fonctionnel', icon: 'folder' })), emptyLabel: 'Aucun domaine renseigné' },
  ]
  if (a.parent) groups.push({ verb: 'Module de', items: [appRel(a.parent)] })
  if (a.modules.length) groups.push({ verb: 'Modules', items: a.modules.map((m) => appRel(m)) })
  const by: RelationItem[] = []
  if (a.fournisseur) by.push({ id: `four-${a.fournisseur}`, name: a.fournisseur, meta: 'Fournisseur', layer: 'applicatif', icon: 'building' })
  if (a.editeur && a.editeur !== a.fournisseur) by.push({ id: `edit-${a.editeur}`, name: a.editeur, meta: 'Éditeur', layer: 'applicatif', icon: 'building' })
  for (const c of a.contrats)
    by.push({ id: c.ref, name: c.ref, meta: c.supplier, layer: 'applicatif', icon: 'contract', status: CONTRACT_STATUS[c.level], statusLabel: contractLabel(c) })
  groups.push({ verb: 'Fournie par', items: by, emptyLabel: 'Ni fournisseur ni contrat renseigné' })
  return groups
})
const relRight = computed<RelationGroup[]>(() => {
  const a = app.value
  if (!a) return []
  const peers: RelationItem[] = a.flows.map((f, i) => {
    const out = f.from === a.name
    const peer = out ? f.to : f.from
    const meta = `${out ? 'Envoie' : 'Reçoit'} · ${f.label}`
    return getApplication(peer) ? { ...appRel(peer, meta), id: `flux-${i}` } : { id: `flux-${i}`, name: peer, meta, layer: 'applicatif', icon: 'building' }
  })
  const undetailed = a.flux - a.flows.length
  return [
    {
      verb: 'Hébergée sur',
      items: a.hosts.map((h) => ({ id: `host-${h.name}`, name: h.name, layer: 'technique', icon: h.kind === 'VM' ? 'cloud' : 'server', status: h.status, statusLabel: h.statusLabel })),
      emptyLabel: a.hebergement === 'SaaS' ? 'Hébergée en SaaS chez l’éditeur' : 'Aucune machine renseignée',
    },
    {
      verb: 'Échange avec',
      items: peers,
      emptyLabel: undetailed > 0 ? `${undetailed} flux déclarés, pas encore dessinés sur une carte` : 'Aucun flux déclaré',
    },
    {
      verb: 'Référents',
      items: a.referents.map((r) => ({
        id: `ref-${r.name}`,
        name: r.name,
        meta: r.role,
        layer: (r.role === 'Métier' ? 'metier' : r.role === 'Technique' ? 'technique' : 'fonctionnel') as Layer,
        icon: 'user' as IconName,
      })),
      emptyLabel: 'Aucun référent renseigné',
    },
  ]
})
const relCount = computed(() => [...relLeft.value, ...relRight.value].reduce((n, g) => n + g.items.length, 0))

function onRelation(item: RelationItem) {
  if (item.icon === 'app') return goFiche(item.name)
  if (item.icon === 'contract') return goPath('/contrats')
  if (item.icon === 'building' && (item.meta === 'Fournisseur' || item.meta === 'Éditeur')) return goPath('/fournisseurs')
  if (item.name === 'sophocle') return goPath('/impact')
  if ((item.icon === 'server' || item.icon === 'cloud') && infraPath.value) return goPath(infraPath.value)
  if (item.icon === 'folder' && item.name === 'Scolarité') return goTo('carte')
  if (item.icon === 'folder') return goPath(`/explorateur?domaine=${encodeURIComponent(item.name)}`)
  // Un partenaire (CNOUS) figure sur la carte des flux de Scolarité.
  if (item.icon === 'building') return goPath('/carte')
  // Un référent : sa fiche dans l'annuaire des référents, avec les applications qu'il suit.
  if (item.icon === 'user') {
    const type = item.layer === 'metier' ? 'metier' : item.layer === 'technique' ? 'technique' : 'fonctionnel'
    return goPath(`/referents?type=${type}&id=${slugOf(item.name)}`)
  }
  if (item.icon === 'server' || item.icon === 'cloud') return goPath(`/machines?id=${encodeURIComponent(item.name)}`)
  goPath(`/explorateur?q=${encodeURIComponent(item.name)}`)
}

/** Modifier : le formulaire de l'explorateur. Une application hors inventaire y est ajoutée à l'enregistrement. */
function edit() {
  const a = app.value
  if (!a) return
  goPath(`/explorateur?modifier=${a.slug}`)
}

/* ---------- Partager et exporter ---------- */
const shareOpen = ref(false)
const shareItems = computed<ExportItem[]>(() => {
  const a = app.value
  if (!a) return []
  const list: ExportItem[] = [
    { name: a.name, layer: 'applicatif' },
    ...a.domaines.map((d) => ({ name: d, layer: 'fonctionnel' as const })),
    ...a.flows.map((f) => ({ name: f.from === a.name ? f.to : f.from, layer: 'applicatif' as const })),
    ...a.hosts.map((h) => ({ name: h.name, layer: 'technique' as const })),
  ]
  return list.filter((x, i, arr) => arr.findIndex((y) => y.name === x.name) === i)
})
const shareNotes = computed(() => alerts.value.map((x) => `${x.title} ${x.text}`.trim()))
const shareBox = ref<HTMLElement | null>(null)
function onShareDoc(e: PointerEvent) {
  const t = e.target as HTMLElement
  if (shareOpen.value && shareBox.value && !shareBox.value.contains(t) && !t.closest?.('.mc-select-pop, .mc-pop-list, [role="listbox"]')) shareOpen.value = false
}
onMounted(() => document.addEventListener('pointerdown', onShareDoc, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onShareDoc, true))

/* ---------- Suppression : confirmation, puis la corbeille ---------- */
const delOpen = ref(false)
const inTrash = computed(() => !!app.value && deletedApps.has(app.value.slug))
function confirmDelete() {
  const a = app.value
  if (!a) return
  const undo = moveToTrash([a.name])
  delOpen.value = false
  goPath('/corbeille')
  toast.success(`${a.name} placée dans la corbeille`, { actionLabel: 'Annuler', onAction: () => { undo(); goFiche(a.slug) } })
}
function restore() {
  const a = app.value
  if (!a) return
  restoreFromTrash(a.name)
  toast.success(`${a.name} restaurée`)
}

/* ---------- Points d'attention et activité ---------- */
const ALERT_ICON: Record<'critical' | 'warn' | 'unknown', IconName> = { critical: 'alert-octagon', warn: 'alert-triangle', unknown: 'dashed-circle' }
const alerts = computed(() => (app.value ? attentionPoints(app.value).map((x) => ({ ...x, icon: ALERT_ICON[x.status] })) : []))
const events = computed(() => app.value?.events ?? [])
const recent = computed(() => events.value.slice(0, 3))

/* ---------- Plus d'actions ---------- */
const moreOpen = ref(false)
// Le menu se ferme au pointerdown hors de lui : un clic sur « … » juste après ne doit pas le rouvrir.
let moreClosedAt = 0
watch(moreOpen, (o) => {
  if (!o) moreClosedAt = Date.now()
})
function toggleMore() {
  if (Date.now() - moreClosedAt > 250) moreOpen.value = true
}
const impactMap = computed(() => mapOf('impact'))
const moreItems = computed<(ContextMenuItem | 'separator')[]>(() => [
  { id: 'impact', label: "Voir l'impact d'un arrêt", icon: 'impact', shortcut: '⌘I', disabled: !impactMap.value },
  { id: 'copy', label: 'Copier le lien de la fiche', icon: 'link' },
  { id: 'dup', label: 'Dupliquer', icon: 'copy' },
  'separator',
  { id: 'del', label: `Supprimer ${name.value}`, icon: 'trash', danger: true, disabled: inTrash.value },
])
function onMore(item: ContextMenuItem) {
  if (item.id === 'impact' && impactMap.value?.path) goPath(impactMap.value.path)
  else if (item.id === 'copy')
    copyLink().then((ok) => (ok ? toast.success('Lien de la fiche copié') : toast.error('Copie impossible : le navigateur refuse l’accès au presse-papiers.')))
  else if (item.id === 'dup') goPath(`/explorateur?modifier=${app.value?.slug}&dupliquer=1`)
  else if (item.id === 'del') delOpen.value = true
}
const delText = computed(() => {
  const n = maps.value.length
  return n ? ` Elle sera aussi retirée ${n > 1 ? `des ${n} cartes` : 'de la carte'} qui la montre${n > 1 ? 'nt' : ''}.` : ''
})

/* ---------- Recherche, fil d'Ariane, liens ---------- */
const paletteOpen = ref(false)
function onSelect(item: PaletteItem) {
  if (item.type === 'Application' && getApplication(item.id) === app.value) toast.info(`Vous êtes sur la fiche ${de(name.value)}.`)
  else openPaletteItem(item)
}

function onTrail(index: number) {
  if (index === 0) goTo('accueil')
  else if (index === 1) {
    const d = app.value?.domaines[0]
    if (d === 'Scolarité') goTo('carte')
    else goPath(d ? `/explorateur?domaine=${encodeURIComponent(d)}` : '/explorateur')
  }
}

function follow(e: MouseEvent, to: ScreenKey) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goTo(to)
}
function followPath(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}
</script>

<template>
  <div class="mc-scr-fiche">
    <McAppBar
      class="mc-scr-fiche-bar"
      :trail="trail"
      logo-src="/brand/logo-mycarto.svg"
      :home-href="screenHref('accueil')"
      @home="(e) => follow(e, 'accueil')"
      @navigate="(_s, i) => onTrail(i)"
      @search="paletteOpen = true"
    >
      <template #actions>
        <McAvatarStack :people="people" label="Personnes sur la fiche" />
        <McButton variant="outline" icon="export" :disabled="!app" :aria-expanded="shareOpen" @click="shareOpen = !shareOpen">Exporter</McButton>
        <McButton variant="primary" icon="pencil" :disabled="!app" @click="edit">Modifier</McButton>
      </template>
    </McAppBar>

    <main v-if="!app" class="mc-scr-fiche-main">
      <section class="mc-scr-card mc-scr-alt mc-scr-nf">
        <McEmptyState icon="app" layer="applicatif" :title="`Aucune application « ${slug} »`" text="Cette fiche n’existe pas ou a été supprimée. Retrouvez toutes les applications dans l’explorateur.">
          <template #action>
            <McButton variant="primary" icon="list" :href="pathHref('/explorateur')" @click="(e: MouseEvent) => followPath(e, '/explorateur')">Ouvrir l’explorateur</McButton>
          </template>
        </McEmptyState>
      </section>
    </main>

    <main v-else class="mc-scr-fiche-main">
      <div class="mc-scr-fhead">
        <span class="mc-scr-ftile" aria-hidden="true"><McIcon name="app" size="xl" /></span>
        <div class="mc-scr-fid">
          <div class="mc-row mc-scr-chips">
            <McTypeChip type="Application" layer="applicatif" icon="app" size="sm" />
            <McStatusChip v-if="app.statut" status="neutral" size="sm">{{ app.statut }}</McStatusChip>
            <McStatusChip v-if="app.obsolescence?.status === 'critical'" status="critical" size="sm">Infra obsolète</McStatusChip>
          </div>
          <h1 class="mc-scr-fname">{{ app.name }}</h1>
          <p class="mc-scr-fdesc" :class="{ nc: !app.description }">{{ app.description ? `${app.description}.` : 'Description non renseignée.' }}</p>
        </div>
        <div class="mc-scr-fact">
          <div class="mc-row mc-scr-fbtns">
            <McButton v-if="fluxPath" variant="primary" icon="map" :href="pathHref(fluxPath)" @click="(e: MouseEvent) => followPath(e, fluxPath!)">Ouvrir la carte des flux</McButton>
            <McButton v-else variant="primary" icon="list" :href="pathHref('/explorateur')" @click="(e: MouseEvent) => followPath(e, '/explorateur')">Voir dans l’explorateur</McButton>
            <McButton variant="outline" icon="pencil" @click="edit">Modifier</McButton>
            <McIconButton icon="more" label="Plus d'actions" :variant="moreOpen ? 'pressed' : 'default'" @click="toggleMore" />
            <McContextMenu v-model:open="moreOpen" :items="moreItems" :header="app.name" :x="0" :y="40" class="mc-scr-more" @select="onMore" />
          </div>
          <div class="mc-row mc-scr-sec">
            <span class="mc-cap">Sécurité</span>
            <McDicpBadge v-bind="app.dicp" />
          </div>
        </div>
      </div>

      <div v-if="inTrash" class="mc-scr-fiche-trash" role="status">
        <McIcon name="trash" />
        <span><b>{{ name }} est dans la corbeille.</b> Elle n’apparaît plus dans l’explorateur ni sur les cartes.</span>
        <McButton variant="outline" size="sm" icon="undo" @click="restore">Restaurer</McButton>
        <McButton variant="ghost" size="sm" :href="pathHref('/corbeille')" @click="(e: MouseEvent) => followPath(e, '/corbeille')">Ouvrir la corbeille</McButton>
      </div>

      <McTabs v-model="tab" :tabs="tabs" variant="pill" :aria-label="`Vues de ${app.name}`" class="mc-scr-tabs" />

      <template v-if="tab === 'fiche'">
        <div class="mc-scr-facts">
          <div v-for="f in facts" :key="f.label" class="mc-scr-factc">
            <b v-if="f.n !== null && f.n !== ''">{{ f.n }}</b>
            <b v-else class="nc">Non renseigné</b>
            <span>{{ f.label }}</span>
          </div>
        </div>

        <div class="mc-scr-cols">
          <div class="mc-scr-col">
            <section class="mc-scr-card">
              <h2><span class="grow">Cartes</span><span class="mc-cap">{{ maps.length }} carte{{ maps.length > 1 ? 's' : '' }}</span></h2>
              <div v-if="maps.length" class="mc-scr-maps">
                <a
                  v-for="m in maps"
                  :key="m.kind"
                  class="mc-scr-mapc"
                  :href="pathHref(mapPathOf(m))"
                  target="_top"
                  @click="openMap($event, m)"
                >
                  <span class="mc-scr-thumb" aria-hidden="true">
                    <i
                      v-for="(b, i) in m.blocks"
                      :key="i"
                      :class="`l-${b.layer}`"
                      :style="{ left: `${b.l}px`, top: `${b.t}px`, width: `${b.w}px`, height: `${b.h}px` }"
                    />
                  </span>
                  <b>{{ m.title }}</b>
                  <span class="s">{{ m.sub }}</span>
                </a>
              </div>
              <McEmptyState v-else size="compact" icon="map" layer="applicatif" :title="`Aucune carte ne montre ${app.name}`" text="Ajoutez-la à une carte des flux ou de l’infrastructure pour la situer dans le SI." />
            </section>

            <section class="mc-scr-card">
              <h2>Informations</h2>
              <div class="mc-scr-two">
                <McKeyValueList :items="infoLeft" empty-label="Non renseigné" />
                <McKeyValueList :items="infoRight" empty-label="Non renseigné" />
              </div>
            </section>

            <section class="mc-scr-card">
              <h2><span class="grow">Relations</span><span class="mc-cap">{{ relCount }} objet{{ relCount > 1 ? 's' : '' }} lié{{ relCount > 1 ? 's' : '' }}</span></h2>
              <div class="mc-scr-two mc-scr-rels">
                <McRelationList :groups="relLeft" @open="onRelation" />
                <McRelationList :groups="relRight" @open="onRelation" />
              </div>
            </section>
          </div>

          <div class="mc-scr-col">
            <section class="mc-scr-card">
              <h2>
                <span class="grow">Points d'attention</span>
                <McCountBadge v-if="alerts.length" :count="alerts.length" variant="alert" :label="`${alerts.length} point${alerts.length > 1 ? 's' : ''} d'attention`" />
              </h2>
              <div v-for="a in alerts" :key="a.title" class="mc-scr-alert" :class="a.status">
                <span class="ai"><McIcon :name="a.icon" /></span>
                <p><b>{{ a.title }}</b>{{ a.text }}</p>
              </div>
              <p v-if="!alerts.length" class="mc-cap">Aucun point d’attention : la fiche est complète et à jour.</p>
            </section>

            <section class="mc-scr-card">
              <h2>Activité</h2>
              <ol v-if="recent.length" class="mc-scr-tl">
                <li v-for="e in recent" :key="e.text + e.when" class="ev">
                  <McAvatar :name="e.who" :initials="e.initials" :color="e.color" />
                  <div>
                    <p>{{ e.text }}</p>
                    <span>{{ e.when }}</span>
                  </div>
                </li>
              </ol>
              <p v-else class="mc-cap">Aucune activité enregistrée sur cette fiche.</p>
              <McButton v-if="recent.length" variant="ghost" size="sm" icon="history" class="mc-scr-all" @click="tab = 'historique'">Tout l'historique</McButton>
            </section>
          </div>
        </div>
      </template>

      <section v-else-if="tab === 'pos'" class="mc-scr-card mc-scr-alt">
        <McEmptyState
          icon="pos"
          layer="fonctionnel"
          :title="app.pos ? `${app.name} est dans ${app.pos}` : `${app.name} n’est pas placée dans le POS`"
          :text="app.pos ? 'Le plan d’occupation des sols complet montre son quartier et ses voisines.' : 'Rattachez-la à un îlot du plan d’occupation des sols pour la situer.'"
        >
          <template #action>
            <McButton v-if="app.pos" variant="primary" icon="pos" :href="pathHref('/pos')" @click="(e: MouseEvent) => followPath(e, '/pos')">Ouvrir le POS</McButton>
            <McButton variant="outline" icon="info" @click="tab = 'fiche'">Revenir à la fiche</McButton>
          </template>
        </McEmptyState>
      </section>

      <section v-else-if="tab === 'flux' || tab === 'infra'" class="mc-scr-card mc-scr-alt">
        <McEmptyState
          :icon="tab === 'flux' ? 'flow' : 'server'"
          :layer="tab === 'flux' ? 'applicatif' : 'technique'"
          :title="tab === 'flux' ? `Aucune carte des flux pour ${app.name}` : `Aucune carte de l’infrastructure de ${app.name}`"
          :text="tab === 'flux' ? `${app.flux} flux déclarés dans la fiche. Dessinez-les sur une carte pour voir avec qui elle échange.` : 'Ses composants et ses machines ne sont pas encore dessinés.'"
        >
          <template #action><McButton variant="outline" icon="info" @click="tab = 'fiche'">Revenir à la fiche</McButton></template>
        </McEmptyState>
      </section>

      <section v-else class="mc-scr-card mc-scr-alt">
        <h2>Historique</h2>
        <ol v-if="events.length" class="mc-scr-tl">
          <li v-for="e in events" :key="e.text + e.when" class="ev">
            <McAvatar :name="e.who" :initials="e.initials" :color="e.color" />
            <div>
              <p>{{ e.text }}</p>
              <span>{{ e.when }}</span>
            </div>
          </li>
        </ol>
        <p v-else class="mc-cap">Aucune modification enregistrée : {{ app.name }} est citée par d’autres écrans mais pas encore dans l’inventaire.</p>
      </section>
    </main>

    <div v-if="shareOpen && app" ref="shareBox" class="mc-scr-fiche-share">
      <SharePanel :title="`Fiche ${de(app.name)}`" :items="shareItems" :notes="shareNotes" closable @close="shareOpen = false" />
    </div>

    <McModal
      v-model:open="delOpen"
      :title="`Supprimer ${name} ?`"
      :type="{ label: 'Application', icon: 'app', layer: 'applicatif' }"
      danger
      confirm-label="Placer dans la corbeille"
      confirm-icon="trash"
      @confirm="confirmDelete"
    >
      <p class="mc-scr-fiche-modal">
        {{ name }} ira dans la corbeille, avec ses relations.{{ delText }} Vous pourrez la restaurer pendant 30 jours.
      </p>
    </McModal>

    <McCommandPalette v-model:open="paletteOpen" :items="paletteItems" @select="onSelect" />
    <McToastHost />
  </div>
</template>

<style>
.mc-scr-fiche { position: relative; min-height: 100vh; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); box-sizing: border-box; }
.mc-scr-fiche-bar { position: sticky; top: 16px; z-index: 20; margin: 16px 16px 0; }
.mc-scr-fiche-main { max-width: 1280px; margin: 0 auto; padding: 24px 32px 40px; box-sizing: border-box; display: grid; gap: 20px; }

.mc-scr-fhead { display: flex; gap: 20px; align-items: flex-start; flex-wrap: wrap; }
.mc-scr-ftile { width: 64px; height: 64px; border-radius: 16px; background: var(--layer-applicatif); color: var(--surface); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-ftile .mc-ico { width: 32px; height: 32px; }
.mc-scr-fid { flex: 1 1 420px; min-width: 0; }
.mc-scr-chips { gap: 6px; }
.mc-scr-fname { margin: 2px 0 4px; font: 700 34px/40px var(--font-display); letter-spacing: -.01em; color: var(--ink); }
.mc-scr-fdesc { margin: 0; color: var(--ink-muted); font-size: 15px; line-height: 22px; }
.mc-scr-fdesc.nc { color: var(--ink-subtle); font-style: italic; }
.mc-scr-fact { display: grid; gap: 10px; justify-items: end; }
.mc-scr-fbtns { position: relative; flex-wrap: nowrap; }
.mc-scr-more.is-placed { left: auto !important; right: 0; }
.mc-scr-sec { gap: 10px; }
.mc-scr-tabs { justify-self: start; }

.mc-scr-facts { display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface); }
.mc-scr-factc { padding: 14px 16px; border-left: 1px solid var(--line); display: grid; gap: 2px; min-width: 0; }
.mc-scr-factc:first-child { border-left: 0; }
.mc-scr-factc b { font: 700 22px/28px var(--font-display); font-variant-numeric: tabular-nums; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-scr-factc b.nc { font: 500 13px/28px var(--font-sans); color: var(--ink-subtle); }
.mc-scr-factc span { font-size: 12px; line-height: 16px; color: var(--ink-muted); }

.mc-scr-cols { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); gap: 20px; align-items: start; }
.mc-scr-col { display: grid; gap: 20px; min-width: 0; }
.mc-scr-card { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 18px; display: grid; gap: 14px; align-content: start; min-width: 0; }
.mc-scr-card h2 { margin: 0; font: 600 15px/20px var(--font-display); display: flex; align-items: center; gap: 8px; color: var(--ink); }
.mc-scr-card h2 .grow { flex: 1; }
.mc-scr-two { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; }
.mc-scr-rels { gap: 20px; align-items: start; }
.mc-scr-rels .mc-rels { display: grid; grid-template-columns: minmax(0, 1fr); gap: 16px; min-width: 0; }
/* Les lignes de relation se tronquent dans leur colonne au lieu de déborder sur la colonne voisine. */
.mc-scr-rels .mc-rel, .mc-scr-rels .mc-rel-items, .mc-scr-rels .mc-rel-items > li { min-width: 0; }
.mc-scr-alt { min-height: 320px; }
.mc-scr-nf { align-content: center; }

.mc-scr-maps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.mc-scr-mapc { display: grid; gap: 8px; align-content: start; color: inherit; text-decoration: none; padding: 8px; border-radius: var(--radius-md); border: 1px solid var(--line); transition: border-color .12s, box-shadow .12s, transform .12s; }
.mc-scr-mapc:hover { color: inherit; border-color: var(--line-strong); box-shadow: var(--shadow-hover); transform: translateY(-1px); }
.mc-scr-mapc:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-mapc b { font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-mapc .s { font-size: 11px; line-height: 14px; color: var(--ink-subtle); }
.mc-scr-mapc .mc-scr-thumb { position: relative; display: block; width: 100%; height: 84px; border-radius: 8px; box-sizing: border-box; background-color: var(--canvas); background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 6px 6px; border: 1px solid var(--line); overflow: hidden; }
.mc-scr-mapc .mc-scr-thumb i { position: absolute; border-radius: 2px; background: var(--lc); opacity: .75; }

.mc-scr-alert { display: flex; gap: 12px; align-items: flex-start; padding: 12px; border-radius: var(--radius-sm); }
.mc-scr-alert.critical { background: var(--status-critical-soft); }
.mc-scr-alert.warn { background: var(--status-warn-soft); }
.mc-scr-alert.unknown { background: var(--status-unknown-soft); }
.mc-scr-alert .ai { display: inline-flex; margin-top: 1px; }
.mc-scr-alert.critical .ai { color: var(--status-critical); }
.mc-scr-alert.warn .ai { color: var(--status-warn); }
.mc-scr-alert.unknown .ai { color: var(--status-unknown); }
.mc-scr-alert p { margin: 0; font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-alert p b { display: block; }

.mc-scr-tl { display: grid; margin: 0; padding: 0; list-style: none; }
.mc-scr-tl .ev { display: grid; grid-template-columns: 24px 1fr; gap: 10px; padding-bottom: 14px; position: relative; }
.mc-scr-tl .ev::before { content: ""; position: absolute; left: 11.5px; top: 28px; bottom: 4px; width: 1px; background: var(--line); }
.mc-scr-tl .ev:last-child { padding-bottom: 0; }
.mc-scr-tl .ev:last-child::before { display: none; }
.mc-scr-tl .ev p { margin: 0; font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-tl .ev span { font-size: 11px; line-height: 14px; color: var(--ink-subtle); }
.mc-scr-all { justify-self: start; }

/* Grands écrans : la fiche s'élargit (1600px au plus) et la colonne latérale gagne un peu de place. */
@media (min-width: 1760px) {
  .mc-scr-fiche-main { max-width: 1600px; padding-inline: 40px; }
  .mc-scr-fiche-bar { width: 1728px; max-width: calc(100% - 32px); margin-inline: auto; box-sizing: border-box; }
  .mc-scr-cols { grid-template-columns: minmax(0, 2fr) minmax(360px, 1fr); }
}
@media (max-width: 1240px) {
  .mc-scr-maps { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .mc-scr-fiche-main { padding: 20px 24px 32px; }
  .mc-scr-facts { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .mc-scr-factc:nth-child(4) { border-left: 0; }
  .mc-scr-factc:nth-child(n + 4) { border-top: 1px solid var(--line); }
}
@media (max-width: 900px) {
  .mc-scr-cols { grid-template-columns: minmax(0, 1fr); }
  .mc-scr-fact { justify-items: start; }
}
.mc-scr-fiche-share { position: fixed; top: 76px; right: 16px; z-index: 40; }
.mc-scr-fiche-modal { margin: 0; }
.mc-scr-fiche-trash { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px; border-radius: var(--radius-md); background: var(--status-critical-soft); color: var(--ink); font-size: 13px; line-height: 18px; }
.mc-scr-fiche-trash > .mc-ico { color: var(--status-critical); }
.mc-scr-fiche-trash > span { flex: 1; min-width: 200px; }
</style>
