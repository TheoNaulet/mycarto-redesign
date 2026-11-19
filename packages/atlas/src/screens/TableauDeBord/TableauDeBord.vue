<script setup lang="ts">
// Écran Tableau de bord « Santé du SI » : contrôles de qualité, cycle de vie, applications les plus connectées, DICP.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McSelect from '../../components/McSelect/McSelect.vue'
import McKpiTile from '../../components/McKpiTile/McKpiTile.vue'
import McKpiOk from '../../components/McKpiTile/McKpiOk.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import SharePanel, { type ExportItem } from '../shared/SharePanel.vue'
import WidgetPicker from '../shared/WidgetPicker.vue'
import { widgetKinds, type WidgetType } from '../shared/widgets'
import WidgetView from './WidgetView.vue'
import { addedWidgets, addWidget, parseFr, removeWidget, TODAY, widgetTitles } from './board'
import { ficheHref, goFiche, goPath, pathHref } from '../bridge'
import { catalogue, invalidApplications, inventory } from '../../data/applications'
import { tableauxDeBord } from '../../data/tableaux'

const toast = useToast()

/** Les autres tableaux de bord s'ouvrent depuis la liste des tableaux de bord. */
const board = ref<string | number | null>('sante')
const boards = [
  ...tableauxDeBord.map((t) => ({ value: t.id, label: t.name })),
  { value: '__tous', label: 'Tous les tableaux de bord…' },
]
function onBoard(v: string | number | null) {
  if (v !== 'sante') {
    board.value = 'sante'
    goPath('/tableaux-de-bord')
  }
}

const YEAR = TODAY.getFullYear()
const period = ref(String(YEAR))
const periods = [
  { value: '30j', label: '30 jours' },
  { value: String(YEAR), label: String(YEAR) },
  { value: 'tout', label: 'Tout' },
]

/* ---------- Contrôles ---------- */
const loading = ref(true)
let timer: ReturnType<typeof setTimeout> | undefined
onMounted(() => (timer = setTimeout(() => (loading.value = false), 600)))
onBeforeUnmount(() => clearTimeout(timer))

const kpis = [
  { tone: 'critical' as const, value: invalidApplications.length, label: 'Applications non valides', foot: `sur ${inventory.length} · les compléter →`, path: '/explorateur?filtre=non-valides' },
  { tone: 'warn' as const, value: catalogue.composantsSansLogiciel, label: 'Composants sans logiciel', foot: `sur ${catalogue.composants} · voir →`, path: '/logiciels?filtre=sans-composant' },
  { tone: 'warn' as const, value: catalogue.applicationsSansComposant, label: 'Applications sans composant', foot: `sur ${inventory.length} · voir →`, path: '/requetes?requete=applications-sans-composant' },
  { tone: 'warn' as const, value: catalogue.machinesSansComposant, label: 'Machines sans composant', foot: `sur ${catalogue.machines} · voir →`, path: '/machines?filtre=sans-composant' },
]
function openKpi(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}
/* ---------- Partager ---------- */
const shareOpen = ref(false)
const shareBox = ref<HTMLElement | null>(null)
const shareItems = computed<ExportItem[]>(() => [
  ...kpis.map((k) => ({ name: `${k.label} : ${k.value}`, layer: 'applicatif' as const })),
  ...ranking.slice(0, 5).map((r) => ({ name: `${r.name} · ${r.n} flux`, layer: 'applicatif' as const })),
])
function onShareDoc(e: PointerEvent) {
  const t = e.target as HTMLElement
  if (shareOpen.value && shareBox.value && !shareBox.value.contains(t) && !t.closest?.('[role="listbox"]')) shareOpen.value = false
}
onMounted(() => document.addEventListener('pointerdown', onShareDoc, true))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onShareDoc, true))

/* ---------- Widgets ajoutés ---------- */
const pickerOpen = ref(false)
const kindOf = (t: WidgetType) => widgetKinds.find((k) => k.type === t)!
async function onAddWidget(t: WidgetType) {
  const w = addWidget(t)
  toast.success(`Widget « ${kindOf(t).label} » ajouté`, { actionLabel: 'Annuler', onAction: () => void removeWidget(w.id) })
  await nextTick()
  document.getElementById(`mc-scr-wg-${w.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}
function onRemoveWidget(id: number, t: WidgetType) {
  const undo = removeWidget(id)
  toast.success(`Widget « ${kindOf(t).label} » retiré`, { actionLabel: 'Annuler', onAction: undo })
}

/* ---------- Plein écran ---------- */
type Big = { kind: 'cycle' } | { kind: 'widget'; type: WidgetType }
const big = ref<Big | null>(null)
const bigTitle = computed(() => (!big.value ? '' : big.value.kind === 'cycle' ? series.value.title : widgetTitles[big.value.type]))
const bigClose = ref<HTMLElement | null>(null)
async function openBig(b: Big) {
  big.value = b
  await nextTick()
  bigClose.value?.querySelector('button')?.focus()
}
function onBigKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && big.value) big.value = null
}
onMounted(() => document.addEventListener('keydown', onBigKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onBigKey))

/* ---------- Cycle de vie ---------- */
interface Series {
  title: string
  labels: string[]
  start: number[]
  end: number[]
}
// Calculé sur les dates de mise en service et de fin de service des fiches de l'inventaire (les dates à venir sont prévues).
const starts = inventory.map((a) => parseFr(a.miseEnService)).filter((d): d is Date => !!d)
const ends = inventory.map((a) => parseFr(a.finDeService)).filter((d): d is Date => !!d)
const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const series = computed<Series>(() => {
  if (period.value === '30j') {
    // Cinq semaines, la dernière finit aujourd'hui.
    const DAY = 86_400_000
    const weeks = Array.from({ length: 5 }, (_, i) => new Date(TODAY.getTime() - (4 - i) * 7 * DAY - 6 * DAY))
    const inWeek = (d: Date, w: Date) => d.getTime() >= w.getTime() && d.getTime() < w.getTime() + 7 * DAY
    return {
      title: 'Cycle de vie des applications sur 30 jours',
      labels: weeks.map((w) => `${w.getDate()} ${MONTHS[w.getMonth()]}`),
      start: weeks.map((w) => starts.filter((d) => inWeek(d, w)).length),
      end: weeks.map((w) => ends.filter((d) => inWeek(d, w)).length),
    }
  }
  if (period.value === 'tout') {
    const ys = [...starts, ...ends].map((d) => d.getFullYear())
    const min = Math.min(...ys)
    const max = Math.max(...ys)
    const labels = Array.from({ length: max - min + 1 }, (_, i) => min + i)
    return {
      title: `Cycle de vie des applications depuis ${min}`,
      labels: labels.map(String),
      start: labels.map((y) => starts.filter((d) => d.getFullYear() === y).length),
      end: labels.map((y) => ends.filter((d) => d.getFullYear() === y).length),
    }
  }
  return {
    title: `Cycle de vie des applications en ${YEAR}`,
    labels: MONTHS,
    start: MONTHS.map((_, m) => starts.filter((d) => d.getFullYear() === YEAR && d.getMonth() === m).length),
    end: MONTHS.map((_, m) => ends.filter((d) => d.getFullYear() === YEAR && d.getMonth() === m).length),
  }
})
const sum = (a: number[]) => a.reduce((s, n) => s + n, 0)

const W = 560
const H = 210
const X0 = 30
const Y0 = 180
const TOP = 30
const chart = computed(() => {
  const s = series.value
  const max = Math.max(1, ...s.start, ...s.end)
  const step = max <= 4 ? 1 : Math.ceil(max / 4)
  const top = Math.ceil(max / step) * step
  const y = (v: number) => Y0 - (v / top) * (Y0 - TOP)
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)
  const slot = (W - X0) / s.labels.length
  const bw = Math.min(13, slot / 3)
  const bars: { cls: string; x: number; y: number; h: number; v: number; tip: string }[] = []
  s.labels.forEach((label, i) => {
    const cx = X0 + slot * i + slot / 2
    const pair = [
      { v: s.start[i], cls: 'mc-scr-b1', name: 'mise en service', plural: 'mises en service' },
      { v: s.end[i], cls: 'mc-scr-b2', name: 'fin de service', plural: 'fins de service' },
    ].filter((p) => p.v > 0)
    pair.forEach((p, k) => {
      const x = pair.length === 2 ? cx - bw - 1 + k * (bw + 2) : cx - bw / 2
      bars.push({ cls: p.cls, x, y: y(p.v), h: Y0 - y(p.v), v: p.v, tip: `${label} : ${p.v} ${p.v > 1 ? p.plural : p.name}` })
    })
  })
  return {
    bars,
    bw,
    ticks: ticks.map((t) => ({ v: t, y: y(t) })),
    labels: s.labels.map((l, i) => ({ l, x: X0 + slot * i + slot / 2 })),
  }
})

/* ---------- Classement ---------- */
// Le nombre de flux est celui de la fiche de chaque application.
const ranking = [...inventory]
  .sort((a, b) => b.flux - a.flux || a.name.localeCompare(b.name, 'fr'))
  .slice(0, 8)
  .map((a) => ({ name: a.name, n: a.flux }))
const rankMax = Math.max(...ranking.map((r) => r.n))
function openApp(e: MouseEvent, name: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goFiche(name)
}

/* ---------- DICP ---------- */
const levels = [
  { cls: 'mc-scr-s1', label: 'Faible' },
  { cls: 'mc-scr-s2', label: 'Modérée' },
  { cls: 'mc-scr-s3', label: 'Forte' },
  { cls: 'mc-scr-s4', label: 'Très forte' },
  { cls: 'mc-scr-s0', label: 'Non renseigné' },
]
// Répartition calculée sur les fiches de l'inventaire : faible, modérée, forte, très forte, puis non renseigné.
const share100 = (n: number) => Math.round((n / inventory.length) * 100)
const dicpParts = (k: 'd' | 'i' | 'c' | 'p') => [1, 2, 3, 4, 0].map((lvl) => share100(inventory.filter((a) => a.dicp[k] === lvl).length))
const dicp = [
  { label: 'Disponibilité', parts: dicpParts('d') },
  { label: 'Intégrité', parts: dicpParts('i') },
  { label: 'Confidentialité', parts: dicpParts('c') },
  { label: 'Preuve', parts: dicpParts('p') },
]
const proofMissing = dicp[3].parts[4]
const dicpAria = (d: (typeof dicp)[number]) =>
  `${d.label} : ` + d.parts.map((p, i) => `${levels[i].label.toLowerCase()} ${p} %`).filter((_, i) => d.parts[i] > 0).join(', ')
</script>

<template>
  <div class="mc-scr-dash">
    <AdminNav active="Tableaux de bord" />

    <main class="mc-scr-dmain">
      <header class="mc-scr-dhead">
        <div class="mc-scr-dtitles">
          <p class="mc-over">Tableaux de bord</p>
          <h1 class="title-lg">Santé du SI <span class="mc-scr-star" title="Tableau de bord favori"><McIcon name="star" /></span></h1>
        </div>
        <McSelect v-model="board" class="mc-scr-board" aria-label="Tableau de bord affiché" :options="boards" @change="onBoard" />
        <McToggleGroup v-model="period" label="Période" :options="periods" />
        <McButton variant="outline" icon="link" :aria-expanded="shareOpen" @click="shareOpen = !shareOpen">Partager</McButton>
        <McButton icon="plus" @click="pickerOpen = true">Ajouter un widget</McButton>
      </header>

      <div class="mc-scr-grid">
        <section class="mc-scr-checks" aria-label="Contrôles de qualité">
          <div class="mc-scr-kpis">
            <McKpiTile
              v-for="k in kpis"
              :key="k.label"
              :tone="k.tone"
              :value="k.value"
              :label="k.label"
              :foot="k.foot"
              :loading="loading"
              :href="pathHref(k.path)"
              @click="(e: MouseEvent) => openKpi(e, k.path)"
            />
          </div>
          <McKpiOk label="Tous les flux ont une source et une cible." :count="2" />
        </section>

        <section class="mc-scr-w mc-scr-span7">
          <h2><span class="mc-scr-grow">{{ series.title }}</span><McIconButton size="sm" icon="fit" label="Agrandir" @click="openBig({ kind: 'cycle' })" /></h2>
          <div class="mc-scr-legend">
            <span><i class="mc-scr-b1" />Mise en service · {{ sum(series.start) }}</span>
            <span><i class="mc-scr-b2" />Fin de service · {{ sum(series.end) }}</span>
          </div>
          <svg class="mc-scr-chart" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`Mises en service et fins de service par période : ${sum(series.start)} mises en service, ${sum(series.end)} fins de service`">
            <g v-for="t in chart.ticks" :key="t.v">
              <line class="gl" :x1="X0" :x2="W" :y1="t.y" :y2="t.y" />
              <text :x="20" :y="t.y + 4" text-anchor="end">{{ t.v }}</text>
            </g>
            <g v-for="(b, i) in chart.bars" :key="i" class="bar">
              <title>{{ b.tip }}</title>
              <rect :class="b.cls" :x="b.x" :y="b.y" :width="chart.bw" :height="b.h" rx="3" />
              <text class="v" :x="b.x + chart.bw / 2" :y="b.y - 4" text-anchor="middle">{{ b.v }}</text>
            </g>
            <text v-for="l in chart.labels" :key="l.l" :x="l.x" :y="198" text-anchor="middle">{{ l.l }}</text>
          </svg>
        </section>

        <section class="mc-scr-w mc-scr-span5">
          <h2><span class="mc-scr-grow">Applications les plus connectées</span><span class="mc-cap">nombre de flux</span></h2>
          <ol class="mc-scr-rank">
            <li v-for="(r, i) in ranking" :key="r.name">
              <span class="n">{{ i + 1 }}</span>
              <a class="name" :href="ficheHref(r.name)" :title="`Ouvrir la fiche de ${r.name}`" @click="openApp($event, r.name)">{{ r.name }}</a>
              <span class="tr" aria-hidden="true"><i :style="{ width: `${(r.n / rankMax) * 100}%` }" /></span>
              <span class="c">{{ r.n }}</span>
            </li>
          </ol>
        </section>

        <section class="mc-scr-w mc-scr-span12">
          <h2><span class="mc-scr-grow">Sécurité des applications (DICP)</span><span class="mc-cap">{{ inventory.length }} applications</span></h2>
          <div class="mc-scr-legend">
            <span v-for="l in levels" :key="l.cls"><i :class="l.cls" />{{ l.label }}</span>
          </div>
          <div class="mc-scr-stk">
            <template v-for="d in dicp" :key="d.label">
              <span>{{ d.label }}</span>
              <div class="bar" role="img" :aria-label="dicpAria(d)">
                <template v-for="(p, i) in d.parts" :key="i">
                  <span v-if="p > 0" :class="levels[i].cls" :style="{ flex: p }" :title="`${levels[i].label} : ${p} %`">{{ p >= 8 ? `${p} %` : '' }}</span>
                </template>
              </div>
            </template>
          </div>
          <p class="mc-cap mc-scr-note">
            Preuve : {{ proofMissing }} % des applications ne sont pas évaluées.
            <a :href="pathHref('/explorateur')" @click.prevent="goPath('/explorateur')">Les compléter dans l'explorateur</a>
          </p>
        </section>

        <section
          v-for="w in addedWidgets"
          :id="`mc-scr-wg-${w.id}`"
          :key="w.id"
          class="mc-scr-w"
          :class="kindOf(w.type).span === 2 ? 'mc-scr-span6' : 'mc-scr-span3'"
        >
          <h2>
            <span class="mc-scr-grow">{{ widgetTitles[w.type] }}</span>
            <McIconButton size="sm" icon="fit" label="Agrandir" @click="openBig({ kind: 'widget', type: w.type })" />
            <McIconButton size="sm" icon="x" :label="`Retirer le widget ${kindOf(w.type).label}`" @click="onRemoveWidget(w.id, w.type)" />
          </h2>
          <WidgetView :type="w.type" />
        </section>
      </div>
    </main>

    <div v-if="shareOpen" ref="shareBox" class="mc-scr-dshare">
      <SharePanel title="Tableau de bord Santé du SI" :items="shareItems" :notes="[]" closable @close="shareOpen = false" />
    </div>

    <WidgetPicker v-model:open="pickerOpen" :added="addedWidgets.map((w) => w.type)" dashboard="Santé du SI" @add="onAddWidget" />

    <div v-if="big" class="mc-scr-big" role="dialog" aria-modal="true" :aria-label="bigTitle" @click.self="big = null">
      <section class="mc-scr-w mc-scr-bigw">
        <h2>
          <span class="mc-scr-grow">{{ bigTitle }}</span>
          <span ref="bigClose"><McIconButton size="sm" icon="x" label="Fermer le plein écran" @click="big = null" /></span>
        </h2>
        <template v-if="big.kind === 'cycle'">
          <McToggleGroup v-model="period" label="Période" :options="periods" />
          <div class="mc-scr-legend">
            <span><i class="mc-scr-b1" />Mise en service · {{ sum(series.start) }}</span>
            <span><i class="mc-scr-b2" />Fin de service · {{ sum(series.end) }}</span>
          </div>
          <svg class="mc-scr-chart" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`${sum(series.start)} mises en service, ${sum(series.end)} fins de service`">
            <g v-for="t in chart.ticks" :key="t.v">
              <line class="gl" :x1="X0" :x2="W" :y1="t.y" :y2="t.y" />
              <text :x="20" :y="t.y + 4" text-anchor="end">{{ t.v }}</text>
            </g>
            <g v-for="(b, i) in chart.bars" :key="i" class="bar">
              <title>{{ b.tip }}</title>
              <rect :class="b.cls" :x="b.x" :y="b.y" :width="chart.bw" :height="b.h" rx="3" />
              <text class="v" :x="b.x + chart.bw / 2" :y="b.y - 4" text-anchor="middle">{{ b.v }}</text>
            </g>
            <text v-for="l in chart.labels" :key="l.l" :x="l.x" :y="198" text-anchor="middle">{{ l.l }}</text>
          </svg>
        </template>
        <WidgetView v-else :type="big.type" big />
      </section>
    </div>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-dash { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-dash .mc-scr-grow { flex: 1; }
.mc-scr-dmain { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px; display: grid; gap: 18px; align-content: start; }

.mc-scr-dhead { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-dtitles { flex: 1; min-width: 180px; }
.mc-scr-dtitles .mc-over { margin: 0 0 2px; }
.mc-scr-dtitles h1 { margin: 0; display: flex; align-items: center; gap: 8px; }
.mc-scr-star { display: inline-flex; color: var(--data-2); }
.mc-scr-board { width: 220px; }

.mc-scr-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: 16px; }
.mc-scr-checks { grid-column: span 12; display: grid; gap: 12px; }
.mc-scr-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
.mc-scr-kpis .mc-kpi:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-checks .mc-kpi-ok > .mc-ico { margin-left: 0; color: inherit; }
.mc-scr-span7 { grid-column: span 7; }
.mc-scr-span5 { grid-column: span 5; }
.mc-scr-span12 { grid-column: span 12; }
.mc-scr-span6 { grid-column: span 6; }
.mc-scr-span3 { grid-column: span 3; }
@media (max-width: 1360px) { .mc-scr-span3 { grid-column: span 6; } }
.mc-scr-dshare { position: fixed; top: 76px; right: 24px; z-index: 40; }
.mc-scr-big { position: fixed; inset: 0; z-index: 70; display: grid; place-items: center; padding: 32px; background: color-mix(in srgb, var(--ink) 40%, transparent); box-sizing: border-box; }
.mc-scr-bigw { width: min(1200px, 100%); max-height: 100%; overflow: auto; box-shadow: var(--shadow-lg, 0 20px 50px rgba(0,0,0,.25)); }
.mc-scr-bigw .mc-scr-chart { max-height: calc(100vh - 220px); }

.mc-scr-w { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px 18px; display: grid; gap: 14px; align-content: start; min-width: 0; }
.mc-scr-w h2 { margin: 0; display: flex; align-items: center; gap: 8px; font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-scr-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }

.mc-scr-chart { width: 100%; height: auto; display: block; }
.mc-scr-chart text { font: 11px var(--font-sans); fill: var(--ink-muted); }
.mc-scr-chart .gl { stroke: var(--line); stroke-width: 1; }
.mc-scr-chart .v { font: 600 10px var(--font-sans); fill: var(--ink); }
.mc-scr-chart .bar rect { transition: opacity .12s; }
.mc-scr-chart:hover .bar rect { opacity: .55; }
.mc-scr-chart:hover .bar:hover rect { opacity: 1; }
.mc-scr-b1 { background: var(--data-3); fill: var(--data-3); }
.mc-scr-b2 { background: var(--data-5); fill: var(--data-5); }

.mc-scr-rank { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mc-scr-rank li { display: grid; grid-template-columns: 24px 130px 1fr 32px; align-items: center; gap: 10px; font-size: 13px; line-height: 18px; }
.mc-scr-rank .n { color: var(--ink-subtle); font-variant-numeric: tabular-nums; }
.mc-scr-rank .name { justify-self: start; max-width: 100%; padding: 0; border: 0; background: none; font: inherit; color: var(--ink); text-align: left; text-decoration: none; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; border-radius: 2px; }
.mc-scr-rank .name:hover { color: var(--accent); text-decoration: underline; }
.mc-scr-rank .name:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-rank .tr { height: 10px; border-radius: 5px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-rank .tr i { display: block; height: 100%; border-radius: 5px; background: var(--layer-applicatif); }
.mc-scr-rank .c { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }

.mc-scr-stk { display: grid; grid-template-columns: 110px 1fr; gap: 10px 12px; align-items: center; font-size: 13px; line-height: 18px; }
.mc-scr-stk .bar { display: flex; height: 22px; border-radius: 6px; overflow: hidden; gap: 2px; }
.mc-scr-stk .bar span { display: flex; align-items: center; justify-content: center; min-width: 0; font: 600 10px/1 var(--font-sans); }
.mc-scr-s1 { background: var(--crit-1); color: var(--ink); }
.mc-scr-s2 { background: var(--crit-2); color: var(--ink); }
.mc-scr-s3 { background: var(--crit-3); color: var(--on-navy); }
.mc-scr-s4 { background: var(--crit-4); color: var(--on-navy); }
.mc-scr-s0 { background: repeating-linear-gradient(135deg, var(--surface-sunken) 0 4px, var(--line) 4px 6px); color: var(--ink-muted); }
[data-theme='dark'] .mc-scr-s2 { color: var(--on-navy); }
[data-theme='dark'] .mc-scr-s3, [data-theme='dark'] .mc-scr-s4 { color: var(--navy-deep); }
.mc-scr-legend i.mc-scr-s0 { box-shadow: inset 0 0 0 1px var(--line); }
.mc-scr-note { margin: 0; }
.mc-scr-note a { color: var(--accent); }

/* Grands écrans : le tableau de bord reste centré (1680px au plus) et le graphique partage la ligne à parts égales,
   pour que ses libellés ne grossissent pas démesurément. */
@media (min-width: 1800px) {
  .mc-scr-dmain > * { width: 100%; max-width: 1680px; justify-self: center; }
  .mc-scr-span7, .mc-scr-span5 { grid-column: span 6; }
  .mc-scr-rank li { grid-template-columns: 24px 160px 1fr 32px; }
}
@media (max-width: 1360px) {
  .mc-scr-rank li { grid-template-columns: 20px 112px 1fr 28px; gap: 8px; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-scr-chart .bar rect { transition: none; }
}
</style>
