<script setup lang="ts">
// Écran « Liens entre domaines » : les 10 domaines fonctionnels et les flux qui passent de l'un à l'autre.
// Référentiel, le plus relié, au centre ; les autres autour. L'épaisseur et le chiffre d'un lien disent son nombre de flux.
// Clic sur un lien : la liste de ses flux. Clic sur un domaine : ses liens ; Scolarité ouvre sa carte des flux.
import { computed, reactive, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McToastHost from '../../components/McToast/McToastHost.vue'
import McModal from '../../components/McModal/McModal.vue'
import McSelect from '../../components/McSelect/McSelect.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McCheckbox from '../../components/McCheckbox/McCheckbox.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import SharePanel from '../shared/SharePanel.vue'
import { useToast } from '../../components/McToast/useToast'
import SearchPalette from '../Accueil/SearchPalette.vue'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { useCanvasView } from '../Infrastructure/canvasView'
import { domaineOf, domaines, liensDomaines, type FluxDomaine, type LienDomaines } from '../../data/domaines'
import { applications, getApplication } from '../../data/applications'
import { de } from '../../data/a-texte'

const toast = useToast()
const paletteOpen = ref(false)
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* ---------- Géométrie ----------
 * Référentiel au centre (600, 380). Les 9 autres sur une ellipse, dans l'ordre qui garde les liens courts :
 * voisins sur le pourtour quand ils échangent. Nœud de 210 × 48, posé par son centre. */
const NODE_W = 210
const NODE_H = 48
const C = { x: 600, y: 380 }
const R = { x: 480, y: 280 }
const RING = ['Documentation', 'Ressources et support', 'Pédagogie', 'Scolarité', 'SI et communication', 'Patrimoine', 'Finances et compta', 'Recherche', 'Ressources humaines']
const centers: Record<string, { x: number; y: number }> = { Référentiel: { ...C } }
RING.forEach((name, i) => {
  const a = -Math.PI / 2 - Math.PI / 9 + (i * 2 * Math.PI) / RING.length
  centers[name] = { x: Math.round(C.x + R.x * Math.cos(a)), y: Math.round(C.y + R.y * Math.sin(a)) }
})
const boxOf = (name: string) => ({ left: `${centers[name].x - NODE_W / 2}px`, top: `${centers[name].y - NODE_H / 2}px`, width: `${NODE_W}px` })

interface EdgeGeo {
  l: LienDomaines
  d: string
  mid: { x: number; y: number }
  width: number
}
/** Les liens, copiés : on peut y ajouter des flux pendant la session. */
const liens = ref<LienDomaines[]>(liensDomaines.map((l) => ({ ...l, flux: [...l.flux] })))

/* ---------- Filtres ---------- */
const filterOpen = ref(false)
const minFlux = ref<string>('1')
const documentedOnly = ref(false)
const hidden = reactive(new Set<string>())
const filterActive = computed(() => minFlux.value !== '1' || documentedOnly.value || hidden.size > 0)
function resetFilters() {
  minFlux.value = '1'
  documentedOnly.value = false
  hidden.clear()
}
function toggleDomain(name: string, on: boolean) {
  if (on) hidden.delete(name)
  else hidden.add(name)
}
/** Liens affichés : flux documentés seulement si demandé, au moins N flux, deux domaines visibles. */
const visibleLinks = computed<LienDomaines[]>(() =>
  liens.value
    .map((l) => (documentedOnly.value ? { ...l, flux: l.flux.filter((f) => !f.invente) } : l))
    .filter((l) => l.flux.length >= Number(minFlux.value) && !hidden.has(l.a) && !hidden.has(l.b)),
)
const visibleDomains = computed(() => domaines.filter((d) => !hidden.has(d.name)))

const edges = computed<EdgeGeo[]>(() =>
  visibleLinks.value.map((l) => {
    const p = centers[l.a]
    const q = centers[l.b]
    const m = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }
    const hub = l.a === 'Référentiel' || l.b === 'Référentiel'
    // Les liens du pourtour se courbent vers l'extérieur : ils ne passent pas sous Référentiel.
    // Voisins sur le pourtour : à peine courbés ; plus ils sont loin, plus le lien s'écarte du centre.
    const gap = Math.abs(RING.indexOf(l.a) - RING.indexOf(l.b))
    const steps = Math.min(gap, RING.length - gap)
    const k = hub ? 0 : steps <= 1 ? 0.06 : steps === 2 ? 0.16 : 0.34
    const ctrl = { x: m.x + (m.x - C.x) * k, y: m.y + (m.y - C.y) * k }
    const mid = { x: 0.25 * p.x + 0.5 * ctrl.x + 0.25 * q.x, y: 0.25 * p.y + 0.5 * ctrl.y + 0.25 * q.y }
    return { l, d: `M${p.x} ${p.y} Q${ctrl.x} ${ctrl.y} ${q.x} ${q.y}`, mid, width: 1.5 + (Math.min(l.flux.length, 8) - 1) * 1.75 }
  }),
)
const totalFlux = computed(() => visibleLinks.value.reduce((n, l) => n + l.flux.length, 0))

/* ---------- Sélection ---------- */
type Sel = { kind: 'domaine' | 'lien'; id: string } | null
const selected = ref<Sel>(null)
const linksOf = (d: string) => visibleLinks.value.filter((l) => l.a === d || l.b === d)
const other = (l: LienDomaines, d: string) => (l.a === d ? l.b : l.a)
function onDomain(name: string) {
  if (name === 'Scolarité') return goPath('/carte')
  selected.value = selected.value?.kind === 'domaine' && selected.value.id === name ? null : { kind: 'domaine', id: name }
}
function onLink(id: string) {
  selected.value = selected.value?.kind === 'lien' && selected.value.id === id ? null : { kind: 'lien', id }
}
const selLink = computed(() => (selected.value?.kind === 'lien' ? visibleLinks.value.find((l) => l.id === selected.value!.id) : undefined))
const selDomain = computed(() => (selected.value?.kind === 'domaine' ? visibleDomains.value.find((d) => d.name === selected.value!.id) : undefined))
// Un filtre qui masque la sélection la retire de l'inspecteur.
watch([selLink, selDomain], ([l, d]) => {
  if (selected.value && !l && !d) selected.value = null
})
const edgeOn = (l: LienDomaines) => (selLink.value ? selLink.value.id === l.id : selDomain.value ? l.a === selDomain.value.name || l.b === selDomain.value.name : false)
const edgeDim = (l: LienDomaines) => !!selected.value && !edgeOn(l)
const nodeDim = (name: string) => {
  if (selLink.value) return name !== selLink.value.a && name !== selLink.value.b
  if (selDomain.value) return name !== selDomain.value.name && !linksOf(selDomain.value.name).some((l) => other(l, selDomain.value!.name) === name)
  return false
}
const hovered = ref<string | null>(null)

/* ---------- Inspecteur ---------- */
const inspected = computed<InspectedObject | undefined>(() => {
  if (selLink.value) return { name: `${selLink.value.a} et ${selLink.value.b}`, type: 'Lien entre domaines', layer: 'fonctionnel', icon: 'flow', description: `${plural(selLink.value.flux.length, 'flux passe', 'flux passent')} d’un domaine à l’autre.` }
  if (selDomain.value) return { name: selDomain.value.name, type: 'Domaine', layer: 'fonctionnel', icon: 'folder' }
  return undefined
})
const domainGroups = computed<RelationGroup[]>(() => {
  const d = selDomain.value
  if (!d) return []
  return [
    {
      verb: 'Échange avec',
      items: linksOf(d.name)
        .sort((a, b) => b.flux.length - a.flux.length)
        .map((l) => ({ id: l.id, name: other(l, d.name), layer: 'fonctionnel' as const, icon: 'folder' as const, meta: plural(l.flux.length, 'flux', 'flux') })),
      emptyLabel: 'Aucun flux vers un autre domaine',
    },
  ]
})
function openRelation(item: RelationItem) {
  if (item.id) onLink(String(item.id))
}
const appLink = (name: string) => (getApplication(name) ? ficheHref(name) : undefined)
function openApp(name: string, e: MouseEvent) {
  if (e.metaKey || e.ctrlKey) return
  e.preventDefault()
  goFiche(name)
}

/* ---------- Flux d'un domaine vers les autres (domaines sans carte propre) ---------- */
const showDomainFlux = ref(false)
watch(selected, () => (showDomainFlux.value = false))
const domainFlux = computed(() => {
  const d = selDomain.value
  if (!d) return []
  return linksOf(d.name)
    .sort((a, b) => b.flux.length - a.flux.length)
    .map((l) => ({ id: l.id, other: other(l, d.name), flux: fluxSorted(l) }))
})
function openDomainMap(name: string) {
  if (name === 'Scolarité') goPath('/carte')
  else showDomainFlux.value = !showDomainFlux.value
}

/* ---------- Ajouter un flux entre deux domaines ---------- */
const addOpen = ref(false)
const draft = reactive({ fromDomain: '' as string | number | null, toDomain: '' as string | number | null, from: null as string | number | null, to: null as string | number | null, label: '', liaison: 'Web service' as string | number | null, frequence: 'quotidienne' as string | number | null })
const tried = ref(false)
const domainOptions = domaines.map((d) => ({ value: d.name, label: d.name }))
const appsOfDomain = (d: string) =>
  applications
    .filter((a) => domaineOf(a.name) === d)
    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    .map((a) => ({ value: a.name, label: a.name }))
const fromOptions = computed(() => (draft.fromDomain ? appsOfDomain(String(draft.fromDomain)) : []))
const toOptions = computed(() => (draft.toDomain ? appsOfDomain(String(draft.toDomain)) : []))
const liaisonOptions = ['Web service', 'Fichier plat', 'Base partagée', 'LDAP', 'CAS', 'API REST'].map((v) => ({ value: v, label: v }))
const frequenceOptions = ['temps réel', 'quotidienne', 'hebdomadaire', 'mensuelle', 'semestrielle', 'annuelle'].map((v) => ({ value: v, label: v }))
// Une application choisie qui n'est plus dans le domaine est retirée.
watch(fromOptions, (o) => {
  if (draft.from && !o.some((x) => x.value === draft.from)) draft.from = null
})
watch(toOptions, (o) => {
  if (draft.to && !o.some((x) => x.value === draft.to)) draft.to = null
})
function openAdd() {
  const l = selLink.value
  const d = selDomain.value
  Object.assign(draft, { fromDomain: l?.a ?? d?.name ?? null, toDomain: l?.b ?? null, from: null, to: null, label: '', liaison: 'Web service', frequence: 'quotidienne' })
  tried.value = false
  addOpen.value = true
}
function swapDraft() {
  const { fromDomain, toDomain, from, to } = draft
  Object.assign(draft, { fromDomain: toDomain, toDomain: fromDomain, from: to, to: from })
}
const draftErrors = computed(() => ({
  fromDomain: !draft.fromDomain ? 'Choisissez le domaine de départ.' : undefined,
  toDomain: !draft.toDomain ? 'Choisissez le domaine d’arrivée.' : draft.toDomain === draft.fromDomain ? 'Choisissez un autre domaine : un flux entre domaines relie deux domaines différents.' : undefined,
  from: !draft.from ? 'Choisissez l’application qui envoie les données.' : undefined,
  to: !draft.to ? 'Choisissez l’application qui les reçoit.' : undefined,
  label: !draft.label.trim() ? 'Décrivez les données échangées : « Comptes des personnels »…' : undefined,
}))
const draftValid = computed(() => Object.values(draftErrors.value).every((e) => !e))
function saveFlux() {
  tried.value = true
  if (!draftValid.value) return
  const f: FluxDomaine = { from: String(draft.from), to: String(draft.to), label: draft.label.trim(), meta: `${draft.liaison} · ${draft.frequence}` }
  const [a, b] = [String(draft.fromDomain), String(draft.toDomain)].sort((x, y) => x.localeCompare(y, 'fr'))
  const id = `${a}|${b}`
  let l = liens.value.find((x) => x.id === id)
  const created = !l
  if (!l) {
    l = { id, a, b, flux: [] }
    liens.value.push(l)
  }
  l.flux.push(f)
  hidden.delete(a)
  hidden.delete(b)
  if (Number(minFlux.value) > l.flux.length) minFlux.value = '1'
  addOpen.value = false
  selected.value = { kind: 'lien', id }
  toast.success(created ? `Lien créé entre ${a} et ${b} : flux « ${f.label} » ajouté` : `Flux « ${f.label} » ajouté entre ${a} et ${b}`)
}

/* ---------- Exporter ---------- */
const shareOpen = ref(false)
const exportItems = computed(() => visibleDomains.value.map((d) => ({ name: d.name, layer: 'fonctionnel' as const })))
// Le panneau d'export et l'inspecteur occupent le même côté : l'un ferme l'autre.
watch(shareOpen, (o) => {
  if (o) selected.value = null
})
watch(selected, (sel) => {
  if (sel) shareOpen.value = false
})
const fluxSorted = (l: LienDomaines): FluxDomaine[] => [...l.flux].sort((a, b) => a.from.localeCompare(b.from, 'fr'))

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil', href: pathHref('/') }, { label: 'Couche fonctionnelle', layer: 'fonctionnel' }, { label: 'Liens entre domaines' }]
function onTrail(_s: TrailStep, i: number) {
  if (i === 0 || i === 1) goPath('/')
}
function onHome(e: MouseEvent) {
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'Antoine Ramo', initials: 'AR', color: 3 },
]

/* ---------- Zoom ---------- */
const CONTENT = { x: 0, y: 70, w: 1200, h: 620 }
const root = ref<HTMLElement>()
const legend = ref(true)
const { zoom, pan, tool, fit, vars, handlers } = useCanvasView(root, {
  content: () => CONTENT,
  rightPanel: () => (inspected.value ? 352 : 0),
  top: 132,
  bottomCompact: 84,
})
</script>

<template>
  <div
    ref="root"
    class="mc-scr-ldom mc-scr-map"
    :class="{ 'is-hand': tool === 'hand' }"
    :style="vars"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Carte des liens entre domaines" @deselect="selected = null" @fit="fit">
      <svg class="mc-scr-ldom-svg" width="1200" height="760" aria-hidden="true">
        <path
          v-for="e in edges"
          :key="e.l.id"
          class="mc-scr-ldom-edge"
          :class="{ 'is-on': edgeOn(e.l) || hovered === e.l.id, 'is-dim': edgeDim(e.l) && hovered !== e.l.id }"
          :d="e.d"
          :style="{ strokeWidth: `${e.width}px` }"
        />
        <path v-for="e in edges" :key="`hit-${e.l.id}`" class="mc-scr-ldom-hit" :d="e.d" @click="onLink(e.l.id)" @pointerenter="hovered = e.l.id" @pointerleave="hovered = null" />
      </svg>
      <button
        v-for="e in edges"
        :key="`lbl-${e.l.id}`"
        type="button"
        class="mc-scr-ldom-pill"
        :class="{ 'is-on': edgeOn(e.l) || hovered === e.l.id, 'is-dim': edgeDim(e.l) && hovered !== e.l.id }"
        :style="{ left: `${e.mid.x}px`, top: `${e.mid.y}px` }"
        :aria-label="`${e.l.a} et ${e.l.b} : ${plural(e.l.flux.length, 'flux', 'flux')}`"
        :aria-pressed="selLink?.id === e.l.id"
        @click="onLink(e.l.id)"
        @pointerenter="hovered = e.l.id"
        @pointerleave="hovered = null"
      >{{ e.l.flux.length }}</button>
      <McNode
        v-for="d in visibleDomains"
        :key="d.name"
        :style="boxOf(d.name)"
        layer="fonctionnel"
        icon="folder"
        type="Domaine"
        :name="d.name"
        :subtitle="`${plural(d.apps, 'application', 'applications')} · ${plural(linksOf(d.name).length, 'lien', 'liens')}`"
        :main="d.name === 'Scolarité'"
        :selected="selDomain?.name === d.name || selLink?.a === d.name || selLink?.b === d.name"
        :dimmed="nodeDim(d.name)"
        :title="d.name === 'Scolarité' ? 'Ouvrir la carte des applications et flux de Scolarité' : d.name"
        @select="onDomain(d.name)"
        @open="onDomain(d.name)"
      />

      <template #top>
        <div class="mc-scr-ldom-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home="onHome" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="2 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" :aria-expanded="shareOpen" @click="shareOpen = !shareOpen"><span class="mc-scr-map-lbl">Exporter</span></McButton>
            </template>
          </McAppBar>
          <p class="mc-float mc-scr-ldom-sum">
            <b>{{ visibleDomains.length }}</b> domaines · <b>{{ visibleLinks.length }}</b> liens · <b>{{ totalFlux }}</b> flux entre domaines
            <template v-if="filterActive"> · <button type="button" class="mc-scr-ldom-reset" @click="resetFilters">filtres appliqués, tout afficher</button></template>
          </p>
          <SharePanel
            v-if="shareOpen"
            class="mc-scr-ldom-share"
            title="Liens entre domaines"
            :items="exportItems"
            :notes="[]"
            @close="shareOpen = false"
          />
        </div>
      </template>

      <template #right>
        <McInspector v-if="inspected" :key="selected?.id" :object="inspected" @close="selected = null">
          <template #actions>
            <template v-if="selDomain">
              <McButton
                v-if="selDomain.inventaire"
                size="sm"
                variant="secondary"
                icon="list"
                :href="pathHref(`/explorateur?domaine=${selDomain.inventaire}`)"
                @click.prevent="goPath(`/explorateur?domaine=${encodeURIComponent(selDomain.inventaire)}`)"
              >Voir ses applications</McButton>
              <McButton v-if="selDomain.name === 'Scolarité'" size="sm" variant="outline" icon="map" :href="pathHref('/carte')" @click.prevent="openDomainMap(selDomain.name)">Ouvrir sa carte</McButton>
              <McButton v-else size="sm" variant="outline" icon="flow" :aria-expanded="showDomainFlux" @click="openDomainMap(selDomain.name)">{{ showDomainFlux ? 'Masquer ses flux' : 'Lister ses flux' }}</McButton>
              <McIconButton size="sm" icon="plus" :label="`Ajouter un flux depuis ${selDomain.name}`" @click="openAdd" />
            </template>
            <McButton v-else size="sm" variant="outline" icon="plus" @click="openAdd">Ajouter un flux</McButton>
          </template>
          <template v-if="selDomain">
            <McKeyValueList
              :items="[
                { key: 'Applications', value: selDomain.apps },
                { key: 'Domaines reliés', value: linksOf(selDomain.name).length },
                { key: 'Flux vers les autres domaines', value: linksOf(selDomain.name).reduce((n, l) => n + l.flux.length, 0) },
              ]"
            />
            <McRelationList v-if="!showDomainFlux" :groups="domainGroups" :visible="8" @open="openRelation" />
            <div v-else class="mc-scr-ldom-dflux">
              <section v-for="g in domainFlux" :key="g.id">
                <button type="button" class="mc-scr-ldom-dhead" @click="onLink(g.id)">Avec {{ g.other }} <span>{{ plural(g.flux.length, 'flux', 'flux') }}</span></button>
                <ul class="mc-scr-ldom-flows">
                  <li v-for="(f, i) in g.flux" :key="i" class="mc-scr-ldom-flow">
                    <span class="mc-scr-ldom-ends">
                      <a v-if="appLink(f.from)" :href="appLink(f.from)" @click="openApp(f.from, $event)">{{ f.from }}</a><span v-else>{{ f.from }}</span>
                      <McIcon name="arrow-right" size="sm" />
                      <a v-if="appLink(f.to)" :href="appLink(f.to)" @click="openApp(f.to, $event)">{{ f.to }}</a><span v-else>{{ f.to }}</span>
                    </span>
                    <span class="mc-scr-ldom-label">{{ f.label }}</span>
                  </li>
                </ul>
              </section>
              <p v-if="!domainFlux.length" class="mc-cap">Aucun flux vers un autre domaine.</p>
            </div>
          </template>
          <ul v-else-if="selLink" class="mc-scr-ldom-flows" aria-label="Flux">
            <li v-for="(f, i) in fluxSorted(selLink)" :key="i" class="mc-scr-ldom-flow">
              <span class="mc-scr-ldom-ends">
                <a v-if="appLink(f.from)" :href="appLink(f.from)" @click="openApp(f.from, $event)">{{ f.from }}</a><span v-else :title="`${f.from} n’a pas de fiche dans l’inventaire`">{{ f.from }}</span>
                <McIcon name="arrow-right" size="sm" />
                <a v-if="appLink(f.to)" :href="appLink(f.to)" @click="openApp(f.to, $event)">{{ f.to }}</a><span v-else :title="`${f.to} n’a pas de fiche dans l’inventaire`">{{ f.to }}</span>
              </span>
              <span class="mc-scr-ldom-label">{{ f.label }}</span>
              <span v-if="f.meta" class="mc-scr-ldom-meta">{{ f.meta }}</span>
            </li>
          </ul>
        </McInspector>
      </template>

      <template #bottom-left>
        <div v-if="legend" class="mc-float mc-scr-ldom-legend">
          <p class="mc-over">Épaisseur des liens</p>
          <span v-for="n in [1, 2, 4]" :key="n" class="mc-scr-ldom-lrow">
            <svg width="44" height="12" aria-hidden="true"><path d="M2 6H42" class="mc-scr-ldom-edge" :style="{ strokeWidth: `${1.5 + (n - 1) * 1.75}px` }" /></svg>
            {{ plural(n, 'flux', 'flux') }}
          </span>
          <p class="mc-cap">Scolarité ouvre sa carte des flux.</p>
        </div>
      </template>

      <template #bottom>
        <div class="mc-scr-ldom-bot">
          <div v-if="filterOpen" class="mc-pop mc-scr-ldom-filter" role="dialog" aria-label="Filtrer la carte" @keydown.esc.stop="filterOpen = false">
            <div class="mc-scr-ldom-fhd">
              <p class="mc-over">Filtrer la carte</p>
              <McIconButton size="sm" icon="x" label="Fermer les filtres" @click="filterOpen = false" />
            </div>
            <div class="mc-scr-ldom-fsec">
              <span class="mc-scr-ldom-fk">Liens d’au moins</span>
              <McToggleGroup
                v-model="minFlux"
                label="Nombre minimal de flux"
                :options="[
                  { value: '1', label: '1 flux' },
                  { value: '2', label: '2 flux' },
                  { value: '3', label: '3 flux' },
                ]"
              />
            </div>
            <McCheckbox v-model="documentedOnly" label="Flux documentés seulement (cartes, fiches)" />
            <div class="mc-scr-ldom-fsec">
              <span class="mc-scr-ldom-fk">Domaines affichés</span>
              <div class="mc-scr-ldom-fdoms">
                <McCheckbox v-for="d in domaines" :key="d.name" :model-value="!hidden.has(d.name)" :label="d.name" @update:model-value="(v: boolean) => toggleDomain(d.name, v)" />
              </div>
            </div>
            <div class="mc-scr-ldom-fft">
              <span class="mc-cap">{{ plural(visibleLinks.length, 'lien affiché', 'liens affichés') }} sur {{ liens.length }}</span>
              <McButton variant="ghost" size="sm" icon="x" :disabled="!filterActive" @click="resetFilters">Tout afficher</McButton>
            </div>
          </div>
          <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" :collaboration="false" :filter-active="filterActive" @fit="fit" @filter="filterOpen = !filterOpen" />
        </div>
      </template>
    </McCanvas>
    <McModal
      v-model:open="addOpen"
      title="Ajouter un flux entre deux domaines"
      :type="{ label: 'Flux', icon: 'flow', layer: 'fonctionnel' }"
      confirm-label="Ajouter le flux"
      confirm-icon="plus"
      :dirty="!!draft.label.trim() || !!draft.from || !!draft.to"
      @confirm="saveFlux"
    >
      <div class="mc-scr-ldom-form">
        <div class="mc-scr-ldom-pair">
          <McSelect v-model="draft.fromDomain" label="Domaine de départ" required :options="domainOptions" :error="tried ? draftErrors.fromDomain : undefined" />
          <McIconButton class="mc-scr-ldom-swap" size="sm" icon="arrow-right" label="Inverser le sens" @click="swapDraft" />
          <McSelect v-model="draft.toDomain" label="Domaine d’arrivée" required :options="domainOptions" :error="tried ? draftErrors.toDomain : undefined" />
        </div>
        <div class="mc-grid2">
          <McSelect
            v-model="draft.from"
            label="Application source"
            required
            :disabled="!draft.fromDomain"
            :placeholder="draft.fromDomain ? `Une application ${de(String(draft.fromDomain))}` : 'Choisir d’abord le domaine'"
            :options="fromOptions"
            :error="tried ? draftErrors.from : undefined"
          />
          <McSelect
            v-model="draft.to"
            label="Application cible"
            required
            :disabled="!draft.toDomain"
            :placeholder="draft.toDomain ? `Une application ${de(String(draft.toDomain))}` : 'Choisir d’abord le domaine'"
            :options="toOptions"
            :error="tried ? draftErrors.to : undefined"
          />
        </div>
        <McTextField v-model="draft.label" label="Données échangées" required placeholder="ex. Comptes des personnels" :error="tried ? draftErrors.label : undefined" />
        <div class="mc-grid2">
          <McSelect v-model="draft.liaison" label="Liaison" :options="liaisonOptions" />
          <McSelect v-model="draft.frequence" label="Fréquence" :options="frequenceOptions" />
        </div>
      </div>
    </McModal>
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost contained :offset="96" />
  </div>
</template>

<style>
.mc-scr-ldom { position: relative; width: 100%; height: 100vh; min-height: 560px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-ldom.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-ldom .mc-canvas-layer > .mc-node { z-index: 2; }
.mc-scr-ldom .mc-canvas-right { align-items: stretch; }
.mc-scr-ldom .mc-canvas-right > .mc-insp { flex: 0 1 auto; min-height: 0; overflow: auto; }
.mc-scr-ldom .mc-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-ldom-top { display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.mc-scr-ldom-top > * { pointer-events: auto; }
.mc-scr-ldom-sum { align-self: flex-start; margin: 0; padding: 6px 12px; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-ldom-sum b { color: var(--ink); }
.mc-scr-ldom-svg { position: absolute; left: 0; top: 0; overflow: visible; z-index: 0; pointer-events: none; }
.mc-scr-ldom-edge { fill: none; stroke: var(--edge); stroke-linecap: round; transition: stroke .12s, opacity .2s; }
.mc-scr-ldom-edge.is-on { stroke: var(--accent); }
.mc-scr-ldom-edge.is-dim { opacity: .2; }
.mc-scr-ldom-hit { fill: none; stroke: transparent; stroke-width: 16px; cursor: pointer; pointer-events: stroke; }
.mc-scr-ldom-pill { position: absolute; z-index: 1; transform: translate(-50%, -50%); min-width: 24px; height: 22px; padding: 0 7px; border-radius: 999px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); font: 700 12px/20px var(--font-sans); cursor: pointer; box-shadow: var(--shadow-node); transition: opacity .2s; }
.mc-scr-ldom-pill:hover, .mc-scr-ldom-pill.is-on { border-color: var(--accent); color: var(--accent); }
.mc-scr-ldom-pill.is-on { background: var(--accent); color: var(--on-accent); }
.mc-scr-ldom-pill.is-dim { opacity: .3; }
.mc-scr-ldom-pill:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-ldom-legend { display: grid; gap: 6px; padding: 10px 12px; font-size: 12px; color: var(--ink-muted); }
.mc-scr-ldom-legend .mc-over, .mc-scr-ldom-legend .mc-cap { margin: 0; }
.mc-scr-ldom-lrow { display: flex; align-items: center; gap: 8px; }
.mc-scr-ldom-reset { padding: 0; border: 0; background: none; color: var(--accent); font: inherit; font-weight: 600; cursor: pointer; }
.mc-scr-ldom-reset:hover { text-decoration: underline; }
.mc-scr-ldom-share { align-self: flex-end; margin-top: -4px; max-height: calc(100vh - 150px); }
.mc-scr-ldom-bot { position: relative; display: flex; justify-content: center; }
.mc-scr-ldom-filter { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); width: 340px; box-sizing: border-box; padding: 12px 14px; display: grid; gap: 12px; }
.mc-scr-ldom-fhd { display: flex; align-items: center; justify-content: space-between; }
.mc-scr-ldom-fhd .mc-over { margin: 0; }
.mc-scr-ldom-fsec { display: grid; gap: 6px; }
.mc-scr-ldom-fk { font-size: 12px; font-weight: 600; color: var(--ink-muted); }
.mc-scr-ldom-fdoms { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; }
.mc-scr-ldom-fft { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 8px; border-top: 1px solid var(--line); }
.mc-scr-ldom-dflux { display: grid; gap: 12px; }
.mc-scr-ldom-dflux section { display: grid; gap: 6px; }
.mc-scr-ldom-dhead { display: flex; justify-content: space-between; align-items: baseline; padding: 0; border: 0; background: none; font: 600 13px/18px var(--font-sans); color: var(--ink); cursor: pointer; text-align: left; }
.mc-scr-ldom-dhead span { font-weight: 400; font-size: 12px; color: var(--ink-subtle); }
.mc-scr-ldom-dhead:hover { color: var(--accent); }
.mc-scr-ldom-form { display: grid; gap: 14px; }
.mc-scr-ldom-pair { display: grid; grid-template-columns: 1fr auto 1fr; gap: 8px; align-items: end; }
.mc-scr-ldom-swap { margin-bottom: 4px; }
.mc-scr-ldom-flows { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.mc-scr-ldom-flow { display: grid; gap: 2px; padding: 8px 10px; border-radius: var(--radius-sm); background: var(--surface-sunken); }
.mc-scr-ldom-ends { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-size: 13px; font-weight: 600; }
.mc-scr-ldom-ends a { color: var(--accent); text-decoration: none; }
.mc-scr-ldom-ends a:hover { text-decoration: underline; }
.mc-scr-ldom-ends .mc-ico { color: var(--ink-subtle); }
.mc-scr-ldom-label { font-size: 13px; line-height: 18px; color: var(--ink); }
.mc-scr-ldom-meta { font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
</style>
