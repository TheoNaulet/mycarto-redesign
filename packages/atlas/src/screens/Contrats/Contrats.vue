<script setup lang="ts">
// Écran « Les contrats » : les 25 contrats du SI, groupés par échéance, lus par la lentille « Échéance des contrats ».
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import type { Status } from '../../utils/types'
import McPanelTransition from '../../components/McPanelTransition/McPanelTransition.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import type { TrailStep } from '../../components/McMapTrail/McMapTrail.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McNode from '../../components/McNode/McNode.vue'
import McContainer from '../../components/McContainer/McContainer.vue'
import McToolbar from '../../components/McToolbar/McToolbar.vue'
import McLensPicker from '../../components/McLensPicker/McLensPicker.vue'
import { MC_LENSES, NO_LENS } from '../../components/McLensPicker/lenses'
import McMinimap, { type McMinimapBlock } from '../../components/McMinimap/McMinimap.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McInspector, { type InspectedObject } from '../../components/McInspector/McInspector.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McKeyValueList from '../../components/McKeyValueList/McKeyValueList.vue'
import type { KeyValueItem } from '../../components/McKeyValueList/types'
import McRelationList from '../../components/McRelationList/McRelationList.vue'
import type { RelationGroup, RelationItem } from '../../components/McRelationList/types'
import McFilterChip from '../../components/McFilterChip/McFilterChip.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goFiche, goPath, pathHref } from '../bridge'
import SearchPalette from '../Accueil/SearchPalette.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import McFormField from '../../components/McFormField/McFormField.vue'
import MapAnnotations from '../Infrastructure/MapAnnotations.vue'
import MapShareDialog from '../Infrastructure/MapShareDialog.vue'
import type { ExportItem } from '../shared/SharePanel.vue'
import MapEditBar from '../shared/MapEditBar.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import { useMapEdit } from '../shared/mapEdit'
import { hasApplication, type Contract, type ContractLevel } from '../../data/applications'
import { addMonths, contratsSuivis, extraOf, formatFr, frToIso, isoToFr, levelOf, renewedEnd, type ContractExtra } from '../../data/contratsSuivi'
import { noteTexts } from '../../data/annotations'
import { isNarrowWindow, useCanvasView } from '../Infrastructure/canvasView'

/* ---------- Données ---------- */
// Les contrats viennent de la source unique src/data/applications.ts, rendus réactifs par src/data/contratsSuivi.ts.
type Level = ContractLevel
const LEVEL_STATUS: Record<Level, Status> = { expire: 'critical', moins6: 'warn', de6a12: 'warn', plus1an: 'ok', inconnue: 'unknown' }
const LEVEL_LABEL: Record<Level, string> = {
  expire: 'Expiré',
  moins6: 'Expire dans moins de 6 mois',
  de6a12: 'Expire dans 6 à 12 mois',
  plus1an: 'Expire dans plus d’un an',
  inconnue: 'Date non renseignée',
}
const CONTRACTS: Contract[] = contratsSuivis
/** Index par référence, recalculé quand un contrat est ajouté ou retiré. */
const byRef = computed(() => Object.fromEntries(CONTRACTS.map((x) => [x.ref, x])) as Record<string, Contract>)
/** Tous les contrats vus pendant la session, retirés compris : annuler un retrait remet le même objet. */
const pool = new Map<string, Contract>(CONTRACTS.map((x) => [x.ref, x]))

/** Groupes de la carte : regroupements sans objet (variante env), du plus urgent au plus sûr. */
interface Group {
  id: string
  name: string
  levels: Level[]
  width: number
}
const GROUPS: Group[] = [
  { id: 'expires', name: 'Expirés', levels: ['expire'], width: 940 },
  { id: 'moins1an', name: 'Expirent dans moins d’un an', levels: ['moins6', 'de6a12'], width: 686 },
  { id: 'plus1an', name: 'Plus d’un an', levels: ['plus1an', 'inconnue'], width: 236 },
]
const inGroup = (g: Group) => CONTRACTS.filter((x) => g.levels.includes(x.level))

/* ---------- Lentille et légende ---------- */
const LENSES = MC_LENSES.filter((l) => l.id === NO_LENS || l.id === 'contrats')
const lens = ref('contrats')
const lensOn = computed(() => lens.value !== NO_LENS)
// Écran étroit : la légende attend dans la barre d'outils, l'inspecteur garde la hauteur.
const legend = ref(!isNarrowWindow())
const isolated = ref<string | null>(null)
watch(lens, (l) => {
  isolated.value = null
  legend.value = l !== NO_LENS
})
const legendSections = computed<McLegendSection[]>(() => {
  const sections: McLegendSection[] = []
  if (lensOn.value) {
    sections.push({
      title: 'Échéance des contrats',
      items: (Object.keys(LEVEL_LABEL) as Level[]).map((l) => ({
        id: l,
        label: LEVEL_LABEL[l],
        count: CONTRACTS.filter((x) => x.level === l).length,
        ...(l === 'de6a12' ? { swatch: { tone: 'warn' as Status, icon: 'calendar' as const } } : { status: LEVEL_STATUS[l] }),
      })),
    })
  }
  sections.push({ title: 'Types', items: [{ id: 'type-contrat', label: 'Contrat', count: CONTRACTS.length, layer: 'applicatif' }] })
  return sections
})
const isoDim = (x: Contract) => !!isolated.value && isolated.value !== 'type-contrat' && isolated.value !== x.level
const groupDim = (g: Group) => inGroup(g).every(isoDim)

/* ---------- Sélection ---------- */
/** Contrat choisi par l'adresse (« /contrats?ref=CONT000024 », depuis une fiche ou la carte des flux), sinon CONT000035. */
function refFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  const r = new URLSearchParams(window.location.search).get('ref')
  return r && byRef.value[r] ? r : null
}
const selected = ref<string | null>(refFromUrl() ?? 'CONT000035')
const current = computed(() => (selected.value ? byRef.value[selected.value] : undefined))
const inspected = computed<InspectedObject | undefined>(() => {
  const x = current.value
  if (!x) return undefined
  return { name: x.ref, type: 'Contrat', layer: 'applicatif', icon: 'contract', description: `Contrat avec ${x.supplier}.` }
})
const deadline = (x: Contract) => (x.level === 'expire' ? `Expiré le ${x.end}` : `Expire le ${x.end}`)
const infos = computed<KeyValueItem[]>(() => {
  const x = current.value
  if (!x) return []
  const e = extraOf(x.ref)
  return [
    { key: 'Fournisseur', value: x.supplier, href: '#' },
    { key: 'Fin du contrat', value: x.end },
    { key: 'Échéance', value: LEVEL_LABEL[x.level] },
    { key: 'Reconduction', value: `${x.renewal} · ${dureeLabel(e.dureeMois)}` },
    { key: 'Montant annuel', value: e.montant ? `${e.montant} €` : null },
    { key: 'Notes', value: e.notes || null },
  ]
})
const dureeLabel = (m: number) => (m % 12 === 0 ? `${m / 12} an${m > 12 ? 's' : ''}` : `${m} mois`)
const relations = computed<RelationGroup[]>(() => {
  const x = current.value
  if (!x) return []
  return [
    { verb: 'Couvre', items: x.covers.map((a) => ({ name: a, layer: 'applicatif', icon: 'app' })), emptyLabel: 'Aucune application liée' },
    { verb: 'Fourni par', items: [{ name: x.supplier, layer: 'applicatif', icon: 'building', meta: 'Fournisseur' }] },
  ]
})
function openRelation(item: RelationItem) {
  if (item.icon === 'app' && hasApplication(item.name)) goFiche(item.name)
  else if (item.meta === 'Fournisseur') goPath('/fournisseurs')
}
const toast = useToast()
/** Renouveler : la fin recule de la durée de reconduction, l'échéance (et la couleur) suit. « Annuler » remet l'ancienne date. */
function renew() {
  const x = current.value
  if (!x) return
  edit.record()
  const before = { end: x.end, level: x.level }
  const d = extraOf(x.ref).dureeMois
  x.end = renewedEnd(x, d)
  x.level = levelOf(x.end)
  toast.success(`${x.ref} renouvelé pour ${dureeLabel(d)} : fin le ${x.end}`, {
    actionLabel: 'Annuler',
    onAction: () => {
      Object.assign(x, before)
      toast.info(`Renouvellement de ${x.ref} annulé : fin le ${x.end}.`)
    },
  })
}

/* ---------- Modifier un contrat ---------- */
const editOpen = ref(false)
const form = reactive({ ref: '', supplier: '', end: '', renewal: 'Expresse' as string | number | null, duree: 36 as string | number | null, montant: '', notes: '' })
/** La fenêtre crée un contrat (« Nouveau contrat » en mode modification) au lieu d'en modifier un. */
const creating = ref(false)
let original = ''
const renewalOptions: McSelectOption[] = [
  { value: 'Tacite', label: 'Tacite' },
  { value: 'Expresse', label: 'Expresse' },
]
const dureeOptions: McSelectOption[] = [12, 24, 36, 48, 60].map((m) => ({ value: m, label: dureeLabel(m) }))
function openEdit() {
  const x = current.value
  if (!x) return
  const e = extraOf(x.ref)
  creating.value = false
  Object.assign(form, { ref: x.ref, supplier: x.supplier, end: frToIso(x.end), renewal: x.renewal, duree: e.dureeMois, montant: e.montant, notes: e.notes })
  original = JSON.stringify(form)
  editOpen.value = true
}
/** Prochaine référence libre : CONT + 6 chiffres. */
function nextRef() {
  const max = Math.max(0, ...[...pool.keys()].map((r) => Number(r.replace(/\D/g, '')) || 0))
  return `CONT${String(max + 1).padStart(6, '0')}`
}
/** Nouveau contrat : 3 ans à partir d'aujourd'hui par défaut, il se range seul dans « Plus d'un an ». */
function openCreate() {
  creating.value = true
  Object.assign(form, { ref: nextRef(), supplier: '', end: frToIso(addMonths(formatFr(new Date()), 36)), renewal: 'Expresse', duree: 36, montant: '', notes: '' })
  original = JSON.stringify(form)
  editOpen.value = true
}
const dirty = computed(() => editOpen.value && JSON.stringify(form) !== original)
const formLevel = computed(() => (form.end ? levelOf(isoToFr(form.end)) : 'inconnue'))
function save() {
  if (creating.value) return create()
  const x = byRef.value[form.ref]
  if (!x || !form.end) return
  edit.record()
  const e = extraOf(x.ref)
  const before = { x: { end: x.end, level: x.level, renewal: x.renewal }, e: { ...e } }
  x.end = isoToFr(form.end)
  x.level = levelOf(x.end)
  x.renewal = form.renewal === 'Tacite' ? 'Tacite' : 'Expresse'
  Object.assign(e, { dureeMois: Number(form.duree) || 36, montant: form.montant.trim(), notes: form.notes.trim() })
  editOpen.value = false
  toast.success(`${x.ref} enregistré : ${LEVEL_LABEL[x.level].toLowerCase()}`, {
    actionLabel: 'Annuler',
    onAction: () => {
      Object.assign(x, before.x)
      Object.assign(e, before.e)
    },
  })
}

function create() {
  if (!form.end || !form.supplier.trim()) return
  edit.record()
  const end = isoToFr(form.end)
  const x: Contract = { ref: form.ref, supplier: form.supplier.trim(), end, level: levelOf(end), renewal: form.renewal === 'Tacite' ? 'Tacite' : 'Expresse', covers: [] }
  pool.set(x.ref, x)
  CONTRACTS.push(x)
  Object.assign(extraOf(x.ref), { dureeMois: Number(form.duree) || 36, montant: form.montant.trim(), notes: form.notes.trim() })
  editOpen.value = false
  creating.value = false
  selected.value = x.ref
  toast.success(`${x.ref} ajouté : ${LEVEL_LABEL[x.level].toLowerCase()}`)
}

/* ---------- Mode modification (sur place) ---------- */
// La carte reste celle des contrats : on ajoute, modifie et retire des contrats ; les groupes suivent l'échéance.
interface ContratsState {
  list: Contract[]
  extras: Record<string, ContractExtra>
}
const edit = useMapEdit<ContratsState>({
  name: 'Les contrats',
  get: () => ({ list: CONTRACTS.map((x) => ({ ...x, covers: [...x.covers] })), extras: Object.fromEntries(CONTRACTS.map((x) => [x.ref, { ...extraOf(x.ref) }])) }),
  set: (v) => {
    // Remet les mêmes objets (la fiche d'une application les partage), avec leurs anciennes valeurs.
    const list = v.list.map((c) => {
      const x = pool.get(c.ref) ?? c
      pool.set(c.ref, x)
      return Object.assign(x, c)
    })
    CONTRACTS.splice(0, CONTRACTS.length, ...list)
    for (const [r, e] of Object.entries(v.extras)) Object.assign(extraOf(r), e)
    if (selected.value && !byRef.value[selected.value]) selected.value = null
  },
})
const { on: editing, count: editCount, countLabel: editCountLabel } = edit
function remove(x: Contract) {
  edit.record()
  const k = CONTRACTS.indexOf(x)
  if (k >= 0) CONTRACTS.splice(k, 1)
  if (selected.value === x.ref) selected.value = null
  toast.success(`${x.ref} retiré de la carte`, { actionLabel: 'Annuler', onAction: edit.undo })
}
/** En mode modification, un clic sur un contrat ouvre directement sa fenêtre de modification. */
function onSelect(x: Contract) {
  selected.value = x.ref
  if (editing.value) openEdit()
}

/* ---------- Exporter, post-its, commentaires ---------- */
const shareOpen = ref(false)
const exportItems = computed<ExportItem[]>(() => {
  const all: ExportItem[] = CONTRACTS.map((x) => ({ name: `${x.ref} · ${x.supplier}`, layer: 'applicatif' }))
  const k = selected.value ? CONTRACTS.findIndex((x) => x.ref === selected.value) : -1
  return k > 0 ? [all[k], ...all.slice(0, k), ...all.slice(k + 1)] : all
})
const annotations = ref<InstanceType<typeof MapAnnotations>>()
function placeNote() {
  const c = viewCenter()
  annotations.value?.placeNote(c.x, c.y)
}
/** Le bouton Commentaire arme le mode placement : le prochain clic sur la carte pose l'épingle. */
function placeComment() {
  annotations.value?.armComment()
}

/* ---------- Barre du haut ---------- */
const trail: TrailStep[] = [{ label: 'Accueil', href: pathHref('/') }, { label: 'Contrats' }]
const paletteOpen = ref(false)
function onTrail(_s: TrailStep, i: number) {
  if (i === 0) goPath('/')
}
function onHome(e: MouseEvent) {
  e.preventDefault()
  goPath('/')
}
const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

/* ---------- Zoom et vue d'ensemble ---------- */
const GX = 24
const GY = 136
const GW = 940
const groupsEl = ref<HTMLElement>()
const contentH = ref(660)
const root = ref<HTMLElement>()
const { zoom, pan, tool, fit, viewport, pct, vars, viewCenter, handlers } = useCanvasView(root, {
  content: () => ({ x: GX - 8, y: GY - 8, w: GW + 16, h: contentH.value + 16 }),
  rightPanel: () => (inspected.value || legend.value ? 352 : 0),
  top: 124,
})
const mapCollapsed = ref(false)
const blocks = ref<McMinimapBlock[]>([])
let ro: ResizeObserver | undefined
function measure() {
  const el = groupsEl.value
  if (!el) return
  contentH.value = el.offsetHeight
  const base = el.getBoundingClientRect()
  const z = zoom.value
  const box = (n: HTMLElement) => {
    const r = n.getBoundingClientRect()
    return { x: GX + (r.left - base.left) / z, y: GY + (r.top - base.top) / z, w: r.width / z, h: r.height / z }
  }
  blocks.value = [
    ...[...el.querySelectorAll<HTMLElement>('.mc-group')].map((g) => ({ layer: 'applicatif' as const, ...pct(box(g)) })),
    ...[...el.querySelectorAll<HTMLElement>('.mc-node')].map((g) => ({ layer: 'applicatif' as const, ...pct(box(g)) })),
  ]
}
onMounted(async () => {
  await nextTick()
  measure()
  fit()
  ro = new ResizeObserver(() => measure())
  if (groupsEl.value) ro.observe(groupsEl.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div
    ref="root"
    class="mc-scr-contrats mc-scr-map"
    :style="vars"
    :class="{ 'is-hand': tool === 'hand', 'is-editing': editing }"
    @pointerdown="handlers.onPointerDown"
    @pointermove="handlers.onPointerMove"
    @pointerup="handlers.onPointerUp"
    @pointercancel="handlers.onPointerUp"
    @wheel="handlers.onWheel"
  >
    <McCanvas fill :zoom="zoom" :pan="pan" label="Carte des contrats, groupés par échéance" @deselect="selected = null" @fit="fit">
      <div ref="groupsEl" class="mc-scr-contrats-groups" :style="{ left: GX + 'px', top: GY + 'px', width: GW + 'px' }">
        <template v-for="(g, gi) in GROUPS" :key="g.id">
          <div v-if="gi === 1" class="mc-scr-contrats-row" />
          <McContainer
            :name="g.name"
            layer="applicatif"
            variant="env"
            :count="inGroup(g).length"
            :count-label="`${inGroup(g).length} contrats`"
            :collapsible="false"
            :dimmed="groupDim(g)"
            class="mc-scr-contrats-group"
            :class="`is-${g.id}`"
            :style="{ width: g.width + 'px' }"
          >
            <span v-for="x in inGroup(g)" :key="x.ref" class="mc-scr-contrats-cell">
            <McNode
              layer="applicatif"
              icon="contract"
              type="Contrat"
              :name="x.ref"
              :subtitle="x.supplier"
              :status="lensOn ? LEVEL_STATUS[x.level] : undefined"
              :lens="lensOn"
              :selected="selected === x.ref"
              :dimmed="isoDim(x)"
              :title="`${x.ref} · ${x.supplier} · ${deadline(x)}`"
              @select="onSelect(x)"
              @open="selected = x.ref; openEdit()"
            />
            <McIconButton
              v-if="editing"
              size="sm"
              icon="x"
              :label="`Retirer ${x.ref}`"
              class="mc-scr-contrats-rm"
              @pointerdown.stop
              @click.stop="remove(x)"
            />
            </span>
          </McContainer>
        </template>
      </div>
      <MapAnnotations ref="annotations" screen="contrats" :zoom="zoom" />

      <template #top>
        <div class="mc-scr-contrats-top">
          <McAppBar :trail="trail" :home-href="pathHref('/')" @navigate="onTrail" @home="onHome" @search="paletteOpen = true">
            <template #actions>
              <McAvatarStack :people="people" label="3 personnes sur la carte" />
              <McButton variant="outline" icon="export" class="mc-scr-map-ico" title="Exporter" @click="shareOpen = true"><span class="mc-scr-map-lbl">Exporter</span></McButton>
              <McButton v-if="!editing" variant="primary" icon="pencil" @click="edit.begin()">Modifier</McButton>
              <McButton v-else variant="primary" icon="check" @click="edit.finish()">Terminer</McButton>
            </template>
          </McAppBar>
          <div class="mc-scr-contrats-bar">
            <McFilterChip v-if="lensOn" label="Lentille : Échéance des contrats" @remove="lens = NO_LENS" />
            <span class="mc-scr-contrats-cap">
              {{ CONTRACTS.length }} contrats · groupés par échéance ·
              <a :href="pathHref('/reglages')" @click.prevent="goPath('/reglages')">Règles de couleur</a>
            </span>
          </div>
        </div>
      </template>

      <template #right>
        <McPanelTransition>
          <McLegend v-if="legend" v-model:isolated="isolated" :sections="legendSections" @close="legend = false" />
        </McPanelTransition>
        <McPanelTransition>
          <McInspector v-if="inspected && current" :object="inspected" @close="selected = null">
            <template #statuses>
              <McStatusChip :status="LEVEL_STATUS[current.level]" size="sm">{{ current.level === 'expire' ? 'Expiré' : deadline(current) }}</McStatusChip>
            </template>
            <template #actions>
              <McButton size="sm" variant="secondary" icon="history" @click="renew">Renouveler</McButton>
              <McButton size="sm" variant="outline" icon="pencil" @click="openEdit">Modifier</McButton>
            </template>
            <template #default>
              <McKeyValueList :items="infos">
                <template #value="{ item }">
                  <a v-if="item.href" :href="pathHref('/fournisseurs')" class="mc-scr-contrats-link" @click.prevent="goPath('/fournisseurs')">{{ item.value }}</a>
                  <span v-else>{{ item.value }}</span>
                </template>
              </McKeyValueList>
              <McRelationList :groups="relations" @open="openRelation" />
            </template>
          </McInspector>
        </McPanelTransition>
      </template>

      <template #bottom-left>
        <McMinimap v-model:viewport="viewport" v-model:collapsed="mapCollapsed" :blocks="blocks" :count="CONTRACTS.length" :zoom="zoom" />
      </template>

      <template #bottom>
        <MapEditBar
          v-if="editing"
          :count="editCount"
          :count-label="editCountLabel"
          hint="Les contrats se rangent seuls par échéance"
          @undo="edit.undo()"
          @discard="edit.discard()"
          @finish="edit.finish()"
        >
          <McButton variant="ghost" icon="plus" @click="openCreate">Nouveau contrat</McButton>
        </MapEditBar>
        <McToolbar
          v-else v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit" @filter="legend = true" @sticky="placeNote" @comment="placeComment" :commenting="annotations?.placing ?? false">
          <template #lens><McLensPicker v-model:lens="lens" :lenses="LENSES" /></template>
        </McToolbar>
      </template>
    </McCanvas>
    <MapShareDialog v-model:open="shareOpen" title="Les contrats" :items="exportItems" :selection-count="selected ? 1 : 0" :notes="noteTexts('contrats')" />
    <McModal
      v-model:open="editOpen"
      :title="creating ? `Nouveau contrat ${form.ref}` : `Modifier ${form.ref}`"
      :type="{ label: 'Contrat', icon: 'contract', layer: 'applicatif' }"
      :subtitle="!creating && byRef[form.ref] ? `Contrat avec ${byRef[form.ref].supplier}` : undefined"
      :confirm-label="creating ? 'Ajouter' : undefined"
      :dirty="dirty"
      :confirm-disabled="!form.end || (creating && !form.supplier.trim())"
      @confirm="save"
    >
      <div class="mc-scr-contrats-form">
        <McTextField v-if="creating" v-model="form.supplier" label="Fournisseur" required placeholder="ex. AMUE" />
        <div class="mc-grid2">
          <McTextField v-model="form.end" type="date" label="Fin du contrat" required :help="form.end ? LEVEL_LABEL[formLevel] : undefined" />
          <McTextField v-model="form.montant" label="Montant annuel" suffix="€ / an" placeholder="ex. 12 400" />
        </div>
        <div class="mc-grid2">
          <McSelect v-model="form.renewal" label="Reconduction" :options="renewalOptions" />
          <McSelect v-model="form.duree" label="Durée de reconduction" :options="dureeOptions" help="Ajoutée à la fin par « Renouveler »." />
        </div>
        <McFormField v-slot="{ id, describedBy }" label="Notes">
          <div class="mc-input mc-textarea">
            <textarea :id="id" v-model="form.notes" rows="3" :aria-describedby="describedBy" placeholder="ex. Relancer AMUE avant le comité de juin" />
          </div>
        </McFormField>
      </div>
    </McModal>
    <SearchPalette v-model:open="paletteOpen" />
    <McToastHost contained :offset="96" />
  </div>
</template>

<style>
.mc-scr-contrats { position: relative; width: 100%; height: 100vh; min-height: 560px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-contrats.is-hand .mc-canvas-layer { cursor: grab; }
.mc-scr-contrats-top { display: flex; flex-direction: column; gap: 12px; pointer-events: none; }
.mc-scr-contrats-top > * { pointer-events: auto; }
.mc-scr-contrats-bar { align-self: flex-start; max-width: calc(100% - 336px); display: flex; align-items: center; gap: 8px 12px; flex-wrap: wrap; }
.mc-scr-contrats-cap { font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-contrats-cap a, .mc-scr-contrats-link { color: var(--accent); }

/* Groupes : « Expirés » sur toute la largeur, puis les deux autres côte à côte. */
.mc-scr-contrats-groups { position: absolute; display: flex; flex-wrap: wrap; align-items: flex-start; gap: 18px; }
.mc-scr-contrats-row { flex-basis: 100%; height: 0; margin-top: -18px; }
.mc-scr-contrats-group > .gb { gap: 12px; }
.mc-scr-contrats-group .mc-node { width: 212px; }
/* Une référence de contrat : chasse fixe. */
.mc-scr-contrats-group .mc-node .tx b { font-family: var(--font-mono); font-size: 12px; font-weight: 500; }

.mc-scr-contrats .mc-canvas-right { align-items: stretch; }
.mc-scr-contrats .mc-canvas-right > .mc-legend { flex: none; }
.mc-scr-contrats .mc-canvas-right > .mc-insp { flex: 0 1 auto; min-height: 0; overflow: hidden auto; }
.mc-scr-contrats .mc-insp .body { grid-template-columns: minmax(0, 1fr); }
.mc-scr-contrats-form { display: grid; gap: 16px; }

/* Mode modification : contour pointillé au survol, bouton Retirer en haut à droite du contrat. */
.mc-scr-contrats-cell { position: relative; display: inline-flex; }
.mc-scr-contrats-rm { position: absolute; top: 6px; right: -8px; z-index: 2; background: var(--surface); border-radius: 999px; box-shadow: var(--shadow-node); }
.mc-scr-contrats.is-editing .mc-scr-contrats-group .mc-node:hover { outline: 1.5px dashed var(--accent); outline-offset: 3px; }
</style>
