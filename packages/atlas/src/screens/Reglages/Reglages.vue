<script setup lang="ts">
// Écran Règles de couleur : les lentilles de l'administration, et l'éditeur de leurs niveaux,
// avec un aperçu calculé en direct sur les contrats actuels.
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Status } from '../../utils/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McLegend, { type McLegendSection } from '../../components/McLegend/McLegend.vue'
import McNode from '../../components/McNode/McNode.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'

const toast = useToast()

/* ---------- Contrats actuels : échéance en mois à partir d'aujourd'hui (null : non renseignée) ---------- */
interface Contract {
  code: string
  supplier: string
  months: number | null
}
const contracts: Contract[] = [
  ['CONT000035', 'AMUE', -14],
  ['CONT000012', 'Dokeos', -3],
  ['CONT000041', 'Cocktail', -26],
  ['CONT000007', 'Oracle', -8],
  ['CONT000018', 'Microsoft', -1.5],
  ['CONT000022', 'Kosmos', -11],
  ['CONT000029', 'Jalios', -19],
  ['CONT000031', 'Sogeti', -5],
  ['CONT000044', 'Esup-Portail', -30],
  ['CONT000048', 'Inetum', -2],
  ['CONT000052', 'Berger-Levrault', -7],
  ['CONT000057', 'VMware', -16],
  ['CONT000060', 'Cisco', -9],
  ['CONT000063', 'Adobe', -4],
  ['CONT000066', 'Zimbra', -22],
  ['CONT000020', 'IUT Lille', 6.5],
  ['CONT000070', 'Talend', 7.5],
  ['CONT000072', 'Ex Libris', 8],
  ['CONT000074', 'Atos', 9.5],
  ['CONT000076', 'Synology', 10],
  ['CONT000078', 'Veeam', 11],
  ['CONT000079', 'AB+ SOFTWARE', 13],
  ['CONT000081', 'Red Hat', 15.5],
  ['CONT000083', 'Wooclap', 24],
  ['CONT000085', 'Moodle', 31],
].map(([code, supplier, months]) => ({ code: code as string, supplier: supplier as string, months: months as number | null }))

/* ---------- Niveaux et règles ---------- */
interface Level {
  value: string
  label: string
  status: Status
}
const levels: Level[] = [
  { value: 'expire', label: 'Expiré', status: 'critical' },
  { value: 'm6', label: 'Moins de 6 mois', status: 'warn' },
  { value: 'm12', label: '6 à 12 mois', status: 'warn' },
  { value: 'an', label: 'Plus d’un an', status: 'ok' },
  { value: 'nr', label: 'Non renseigné', status: 'unknown' },
]
const levelOptions: McSelectOption[] = levels.map((l) => ({ value: l.value, label: l.label, status: l.status }))
const levelOf = (v: string) => levels.find((l) => l.value === v) ?? levels[0]

type Op = 'before' | 'after' | 'empty' | 'other'
type Unit = 'today' | 'jours' | 'mois' | 'ans'
interface Rule {
  id: number
  level: string
  op: Op
  n: number | string
  unit: Unit
}
const opOptions: McSelectOption[] = [
  { value: 'before', label: 'est avant' },
  { value: 'after', label: 'est après' },
  { value: 'empty', label: 'est vide' },
  { value: 'other', label: 'toutes les autres' },
]
const unitOptions: McSelectOption[] = [
  { value: 'today', label: 'aujourd’hui' },
  { value: 'jours', label: 'jours' },
  { value: 'mois', label: 'mois' },
  { value: 'ans', label: 'ans' },
]

/** Seuil d'une règle, en mois à partir d'aujourd'hui ; null si le nombre est invalide. */
function threshold(r: Rule): number | null {
  if (r.unit === 'today') return 0
  const n = typeof r.n === 'number' ? r.n : Number(String(r.n).replace(',', '.'))
  if (r.n === '' || !Number.isFinite(n) || n < 0) return null
  return r.unit === 'jours' ? n / 30.44 : r.unit === 'ans' ? n * 12 : n
}
function matches(r: Rule, c: Contract): boolean {
  if (r.op === 'empty') return c.months === null
  if (r.op === 'other') return c.months !== null
  if (c.months === null) return false
  const t = threshold(r)
  if (t === null) return false
  return r.op === 'before' ? c.months < t : c.months >= t
}
const ruleError = (r: Rule) => (r.op !== 'empty' && r.op !== 'other' && threshold(r) === null ? 'Saisissez un nombre positif.' : undefined)

/* ---------- Lentilles ---------- */
interface Draft {
  name: string
  applies: string
  field: string
  dim: boolean
  toolbar: boolean
  rules: Rule[]
}
interface Lens {
  id: string
  icon: IconName
  tone: { bg: string; fg: string }
  scope: string
  /** Niveaux affichés en lecture pour les lentilles sans éditeur détaillé. */
  staticLevels?: { label: string; status: Status }[]
  maps: number
  draft: Draft
  saved: string
}
let ruleSeq = 0
const r = (level: string, op: Op, n: number | string = '', unit: Unit = 'mois'): Rule => ({ id: ++ruleSeq, level, op, n, unit })
const make = (l: Omit<Lens, 'saved'>): Lens => ({ ...l, saved: JSON.stringify(l.draft) })
const base = (name: string, applies: string, field: string, rules: Rule[] = []): Draft => ({ name, applies, field, dim: true, toolbar: true, rules })

const lenses = ref<Lens[]>([
  make({
    id: 'obsolescence', icon: 'hourglass', tone: { bg: 'var(--status-critical-soft)', fg: 'var(--status-critical)' }, scope: 'Logiciels, machines', maps: 5,
    draft: base('Obsolescence', 'Logiciels', 'Fin de support'),
    staticLevels: [
      { label: 'Obsolète', status: 'critical' },
      { label: 'Fin de support sous 12 mois', status: 'warn' },
      { label: 'Supporté', status: 'ok' },
      { label: 'Non renseigné', status: 'unknown' },
    ],
  }),
  make({
    id: 'contrats', icon: 'calendar', tone: { bg: 'var(--status-warn-soft)', fg: 'var(--status-warn)' }, scope: 'Contrats', maps: 3,
    draft: base('Échéance des contrats', 'Contrats', 'Date d’expiration', [
      r('expire', 'before', '', 'today'),
      r('m6', 'before', 6),
      r('m12', 'before', 12),
      r('an', 'other'),
      r('nr', 'empty'),
    ]),
  }),
  make({
    id: 'dicp', icon: 'shield', tone: { bg: 'var(--crit-1)', fg: 'var(--ink)' }, scope: 'Applications', maps: 4,
    draft: base('Criticité DICP', 'Applications', 'Sécurité (DICP)'),
    staticLevels: [
      { label: 'Très forte', status: 'critical' },
      { label: 'Forte', status: 'warn' },
      { label: 'Modérée ou faible', status: 'ok' },
      { label: 'Non renseignée', status: 'unknown' },
    ],
  }),
  make({
    id: 'statut', icon: 'dashed-circle', tone: { bg: 'var(--surface-sunken)', fg: 'var(--ink-muted)' }, scope: 'Applications', maps: 6,
    draft: base('Statut', 'Applications', 'Statut'),
    staticLevels: [
      { label: 'Arrêtée', status: 'critical' },
      { label: 'En projet ou en retrait', status: 'warn' },
      { label: 'Active', status: 'ok' },
      { label: 'Non renseigné', status: 'unknown' },
    ],
  }),
  make({
    id: 'qualite', icon: 'check-circle', tone: { bg: 'var(--status-ok-soft)', fg: 'var(--status-ok)' }, scope: 'Tous les objets', maps: 2,
    draft: base('Qualité des données', 'Tous les objets', 'Champs renseignés'),
    staticLevels: [
      { label: 'Moins de 50 %', status: 'critical' },
      { label: '50 à 90 %', status: 'warn' },
      { label: 'Complète', status: 'ok' },
      { label: 'Non évaluée', status: 'unknown' },
    ],
  }),
  make({
    id: 'couverture', icon: 'pos', tone: { bg: 'var(--layer-fonctionnel-soft)', fg: 'var(--layer-fonctionnel)' }, scope: 'Îlots du POS', maps: 1,
    draft: base('Couverture applicative', 'Îlots du POS', 'Applications liées'),
    staticLevels: [
      { label: 'Aucune application', status: 'critical' },
      { label: 'Couverture partielle', status: 'warn' },
      { label: 'Couvert', status: 'ok' },
      { label: 'Non évaluée', status: 'unknown' },
    ],
  }),
])

const currentId = ref('contrats')
const lens = computed(() => lenses.value.find((l) => l.id === currentId.value) ?? lenses.value[0])
const d = computed(() => lens.value.draft)
const isRules = computed(() => lens.value.draft.rules.length > 0 || lens.value.id === 'contrats')
const dirty = computed(() => JSON.stringify(lens.value.draft) !== lens.value.saved)
const isDirty = (l: Lens) => JSON.stringify(l.draft) !== l.saved
const hasErrors = computed(() => !d.value.name.trim() || d.value.rules.some((x) => ruleError(x)))

function cancel() {
  lens.value.draft = JSON.parse(lens.value.saved) as Draft
}
function save() {
  if (hasErrors.value) return
  lens.value.saved = JSON.stringify(lens.value.draft)
  toast.success('Lentille enregistrée', { duration: 3000 })
}
function newLens() {
  let n = 1
  while (lenses.value.some((l) => l.id === `nouvelle-${n}`)) n++
  const draft = base(n === 1 ? 'Nouvelle lentille' : `Nouvelle lentille ${n}`, 'Contrats', 'Date d’expiration', [r('expire', 'before', '', 'today'), r('an', 'other'), r('nr', 'empty')])
  lenses.value.push({
    id: `nouvelle-${n}`, icon: 'lens', tone: { bg: 'var(--accent-soft)', fg: 'var(--accent)' }, scope: 'Contrats', maps: 0,
    draft, saved: JSON.stringify({ ...draft, name: '' }),
  })
  currentId.value = `nouvelle-${n}`
}

/* ---------- Édition des règles ---------- */
function move(i: number, delta: number) {
  const list = d.value.rules
  const j = i + delta
  if (j < 0 || j >= list.length) return
  ;[list[i], list[j]] = [list[j], list[i]]
}
function remove(i: number) {
  d.value.rules.splice(i, 1)
}
function addRule() {
  const list = d.value.rules
  // Le nouveau niveau se place avant « toutes les autres » et « est vide », qui ferment la liste.
  let at = list.length
  while (at > 0 && (list[at - 1].op === 'other' || list[at - 1].op === 'empty')) at--
  list.splice(at, 0, r('an', 'before', 24))
}

/* ---------- Aperçu ---------- */
const results = computed(() => {
  const counts = new Map<number, Contract[]>()
  d.value.rules.forEach((x) => counts.set(x.id, []))
  const none: Contract[] = []
  for (const c of contracts) {
    const hit = d.value.rules.find((x) => matches(x, c))
    if (hit) counts.get(hit.id)!.push(c)
    else none.push(c)
  }
  return { counts, none }
})
const isolated = ref<string | null>(null)
const previewSections = computed<McLegendSection[]>(() => {
  const items = d.value.rules.map((x) => {
    const lv = levelOf(x.level)
    return { id: String(x.id), label: lv.label, status: lv.status, count: results.value.counts.get(x.id)?.length ?? 0 }
  })
  if (results.value.none.length) items.push({ id: 'none', label: 'Sans couleur (aucune règle)', status: 'unknown', count: results.value.none.length })
  return [{ title: `${contracts.length} contrats`, items }]
})
/** Exemples : un contrat par niveau représenté, ou ceux du niveau isolé. */
const samples = computed(() => {
  const out: { c: Contract; status: Status }[] = []
  const iso = isolated.value
  for (const x of d.value.rules) {
    if (iso && String(x.id) !== iso) continue
    const list = results.value.counts.get(x.id) ?? []
    const st = levelOf(x.level).status
    for (const c of iso ? list.slice(0, 6) : list.slice(0, 1)) out.push({ c, status: st })
    if (!iso && out.length >= 3) break
  }
  if (iso === 'none') for (const c of results.value.none.slice(0, 6)) out.push({ c, status: 'unknown' })
  return out
})
const dueLabel = (m: number | null) => {
  if (m === null) return 'Échéance non renseignée'
  if (m < 0) return `Expiré depuis ${Math.max(1, Math.round(-m))} mois`
  return `Expire dans ${Math.max(1, Math.round(m))} mois`
}

const appliesOptions: McSelectOption[] = ['Contrats', 'Applications', 'Logiciels', 'Machines', 'Îlots du POS', 'Tous les objets'].map((v) => ({ value: v, label: v }))
const fieldOptions = computed<McSelectOption[]>(() => {
  const set = ['Date d’expiration', 'Date de début', 'Date de renouvellement', d.value.field]
  return [...new Set(set)].map((v) => ({ value: v, label: v }))
})
const mapsLabel = computed(() => (lens.value.maps ? `Utilisée par ${lens.value.maps} carte${lens.value.maps > 1 ? 's' : ''}` : 'Utilisée par aucune carte'))
</script>

<template>
  <div class="mc-scr-rg">
    <AdminNav active="Règles de couleur" />

    <!-- Lentilles -->
    <nav class="mc-scr-rg-list" aria-label="Lentilles">
      <span class="mc-over mc-scr-rg-listhd">Lentilles · {{ lenses.length }}</span>
      <button
        v-for="l in lenses"
        :key="l.id"
        type="button"
        class="mc-scr-rg-it"
        :class="{ 'is-on': l.id === currentId }"
        :aria-current="l.id === currentId ? 'true' : undefined"
        @click="currentId = l.id"
      >
        <span class="mc-scr-rg-th" :style="{ background: l.tone.bg, color: l.tone.fg }"><McIcon :name="l.icon" size="sm" /></span>
        <span class="mc-scr-rg-itx">
          <span class="mc-scr-rg-itn">{{ l.draft.name || 'Sans nom' }}</span>
          <span class="mc-cap">{{ l.draft.applies }}</span>
        </span>
        <span v-if="isDirty(l)" class="mc-scr-rg-dot" title="Modifications non enregistrées" />
      </button>
      <McButton variant="outline" size="sm" icon="plus" class="mc-scr-rg-new" @click="newLens">Nouvelle lentille</McButton>
    </nav>

    <!-- Éditeur -->
    <main class="mc-scr-rg-main">
      <header class="mc-scr-rg-head">
        <div class="mc-scr-rg-titles">
          <p class="mc-over">Règles de couleur</p>
          <h1 class="title-lg">{{ d.name || 'Sans nom' }}</h1>
        </div>
        <span class="mc-cap">{{ dirty ? 'Modifications non enregistrées' : mapsLabel }}</span>
        <McButton variant="outline" :disabled="!dirty" @click="cancel">Annuler</McButton>
        <McButton :disabled="!dirty || hasErrors" @click="save">Enregistrer la lentille</McButton>
      </header>

      <div class="mc-scr-rg-fields">
        <McTextField v-model="d.name" label="Nom affiché" required :error="d.name.trim() ? undefined : 'Donnez un nom à la lentille.'" />
        <McSelect v-model="d.applies" label="S’applique aux" :options="appliesOptions" />
        <McSelect v-model="d.field" label="Champ lu" :options="fieldOptions" />
      </div>

      <div class="mc-scr-rg-body">
        <section class="mc-scr-rg-rulescol">
          <div class="mc-scr-rg-rhd">
            <span class="mc-over">Niveaux, du plus critique au plus sûr</span>
            <span class="mc-cap">{{ isRules ? 'La première règle vraie l’emporte' : 'Calculés par myCarto' }}</span>
          </div>

          <template v-if="isRules">
            <ol class="mc-scr-rg-rules">
              <li v-for="(x, i) in d.rules" :key="x.id" class="mc-scr-rg-rule">
                <McSelect v-model="x.level" size="sm" :options="levelOptions" :aria-label="`Niveau ${i + 1}`" />
                <div class="mc-scr-rg-cond">
                  <span class="mc-scr-rg-date">Date</span>
                  <McSelect v-model="x.op" size="sm" class="mc-scr-rg-op" :options="opOptions" :aria-label="`Condition du niveau ${i + 1}`" />
                  <template v-if="x.op === 'before' || x.op === 'after'">
                    <McTextField
                      v-if="x.unit !== 'today'"
                      v-model="x.n"
                      size="sm"
                      type="number"
                      class="mc-scr-rg-num"
                      :error="ruleError(x) ? ' ' : undefined"
                      :aria-label="`Durée du niveau ${i + 1}`"
                    />
                    <McSelect v-model="x.unit" size="sm" class="mc-scr-rg-unit" :options="unitOptions" :aria-label="`Unité du niveau ${i + 1}`" />
                    <span v-if="x.unit !== 'today'">après aujourd’hui</span>
                  </template>
                  <span v-else-if="x.op === 'other'" class="mc-scr-rg-muted mc-scr-rg-other">dates renseignées non prises plus haut</span>
                </div>
                <div class="mc-scr-rg-acts">
                  <McIconButton icon="chevron-down" size="sm" class="mc-scr-rg-up" :label="`Monter le niveau ${levelOf(x.level).label}`" :disabled="i === 0" @click="move(i, -1)" />
                  <McIconButton icon="chevron-down" size="sm" :label="`Descendre le niveau ${levelOf(x.level).label}`" :disabled="i === d.rules.length - 1" @click="move(i, 1)" />
                  <McIconButton icon="trash" size="sm" variant="danger" :label="`Supprimer le niveau ${levelOf(x.level).label}`" :disabled="d.rules.length <= 1" @click="remove(i)" />
                </div>
              </li>
            </ol>
            <McButton variant="ghost" size="sm" icon="plus" class="mc-scr-rg-add" @click="addRule">Ajouter un niveau</McButton>
          </template>

          <template v-else>
            <ul class="mc-scr-rg-rules">
              <li v-for="lv in lens.staticLevels" :key="lv.label" class="mc-scr-rg-static">
                <McStatusChip :status="lv.status" size="sm">{{ lv.label }}</McStatusChip>
              </li>
            </ul>
            <p class="mc-scr-rg-note">
              Les niveaux de cette lentille se règlent comme ceux de « Échéance des contrats » : un état par niveau, une condition sur le champ lu, la première
              règle vraie l’emporte.
            </p>
          </template>

          <div class="mc-scr-rg-switches">
            <McSwitch v-model="d.dim" label="Estomper les objets hors lentille" block />
            <McSwitch v-model="d.toolbar" label="Proposer cette lentille dans la barre d’outils" block />
          </div>
        </section>

        <aside v-if="isRules" class="mc-scr-rg-prev" aria-label="Aperçu sur les données actuelles">
          <McLegend v-model:isolated="isolated" title="Aperçu sur les données actuelles" :sections="previewSections" :closable="false" :sort="false" />
          <hr class="mc-hr" />
          <span class="mc-cap">{{ isolated ? 'Contrats du niveau isolé' : 'Exemples · cliquez un niveau pour voir ses contrats' }}</span>
          <div class="mc-scr-rg-samples">
            <McNode
              v-for="s in samples"
              :key="s.c.code"
              layer="applicatif"
              icon="contract"
              type="Contrat"
              :name="s.c.code"
              :subtitle="`${s.c.supplier} · ${dueLabel(s.c.months)}`"
              :status="s.status"
              lens
            />
            <p v-if="!samples.length" class="mc-scr-rg-muted">Aucun contrat dans ce niveau.</p>
          </div>
        </aside>
        <aside v-else class="mc-scr-rg-prev" aria-label="Aperçu">
          <span class="mc-over">Aperçu</span>
          <p class="mc-scr-rg-muted">L’aperçu sur les données actuelles s’affiche pour les lentilles à règles de dates.</p>
        </aside>
      </div>
    </main>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-rg { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }

.mc-scr-rg-list { width: 260px; flex: none; display: flex; flex-direction: column; gap: 4px; padding: 16px 12px; border-right: 1px solid var(--line); background: var(--surface); box-sizing: border-box; overflow-y: auto; }
.mc-scr-rg-listhd { padding: 0 10px 6px; }
.mc-scr-rg-it { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: inherit; font-size: 13px; line-height: 18px; text-align: left; cursor: pointer; }
.mc-scr-rg-it:hover { background: var(--surface-sunken); }
.mc-scr-rg-it.is-on { background: var(--accent-soft); }
.mc-scr-rg-it.is-on .mc-scr-rg-itn { font-weight: 600; }
.mc-scr-rg-it:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-rg-th { width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-rg-itx { flex: 1; min-width: 0; display: grid; }
.mc-scr-rg-itn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-rg-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex: none; }
.mc-scr-rg-new { margin-top: 8px; align-self: flex-start; }

.mc-scr-rg-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; container-type: inline-size; }
.mc-scr-rg-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-rg-titles { flex: 1; min-width: 200px; }
.mc-scr-rg-titles .mc-over { margin: 0 0 2px; }
.mc-scr-rg-titles h1 { margin: 0; }
.mc-scr-rg-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; align-items: start; }

.mc-scr-rg-body { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 18px; align-items: start; }
.mc-scr-rg-rulescol { display: grid; gap: 10px; min-width: 0; }
.mc-scr-rg-rhd { display: flex; align-items: center; gap: 8px; }
.mc-scr-rg-rhd .mc-over { flex: 1; }
.mc-scr-rg-rules { list-style: none; margin: 0; padding: 0; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-rg-rule { display: grid; grid-template-columns: minmax(150px, 180px) minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 10px 12px; border-bottom: 1px solid var(--line); }
.mc-scr-rg-rule:last-child, .mc-scr-rg-static:last-child { border-bottom: 0; }
.mc-scr-rg-rule .mc-field { gap: 0; }
.mc-scr-rg-cond { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 13px; color: var(--ink-muted); min-width: 0; }
.mc-scr-rg-op { width: 156px; }
.mc-scr-rg-unit { width: 132px; }
.mc-scr-rg-num { width: 84px; }
.mc-scr-rg-num .mc-field-error { display: none; }
.mc-scr-rg-acts { display: flex; gap: 2px; }
.mc-scr-rg-up .mc-ico { transform: rotate(180deg); }
.mc-scr-rg-static { padding: 10px 12px; border-bottom: 1px solid var(--line); }
.mc-scr-rg-add { justify-self: start; }
.mc-scr-rg-note, .mc-scr-rg-muted { margin: 0; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-scr-rg-switches { display: grid; gap: 8px; max-width: 460px; margin-top: 4px; }

.mc-scr-rg-prev { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; display: grid; gap: 12px; align-content: start; position: sticky; top: 0; }
.mc-scr-rg-prev .mc-legend { width: auto; padding: 0; background: transparent; border: 0; box-shadow: none; }
.mc-scr-rg-samples { display: grid; gap: 18px; padding-top: 14px; }
.mc-scr-rg-samples .mc-node { width: 100%; box-sizing: border-box; }

/* Grands écrans : l'éditeur garde une largeur de formulaire lisible (1400px au plus), centré, avec un aperçu plus large. */
@media (min-width: 1800px) {
  .mc-scr-rg-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
  .mc-scr-rg-body { grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; }
  .mc-scr-rg-list { width: 280px; }
}
/* Éditeur étroit (1280 px et moins) : liste des lentilles resserrée, aperçu plus étroit, puis empilé. */
@media (max-width: 1360px) {
  .mc-scr-rg-list { width: 220px; }
  .mc-scr-rg-main { padding: 20px 22px; }
}
@container (max-width: 860px) {
  .mc-scr-rg-body { grid-template-columns: minmax(0, 1fr) 240px; gap: 14px; }
  .mc-scr-rg-rule { grid-template-columns: minmax(0, 1fr) auto; row-gap: 8px; }
  .mc-scr-rg-rule .mc-scr-rg-cond { grid-column: 1 / -1; grid-row: 2; gap: 6px; }
  .mc-scr-rg-cond .mc-scr-rg-date { display: none; }
  .mc-scr-rg-op { width: 150px; }
  .mc-scr-rg-other { display: none; }
  .mc-scr-rg-unit { width: 104px; }
  .mc-scr-rg-num { width: 64px; }
}
@container (max-width: 640px) {
  .mc-scr-rg-body { grid-template-columns: minmax(0, 1fr); }
  .mc-scr-rg-prev { position: static; }
  .mc-scr-rg-fields { grid-template-columns: minmax(0, 1fr); }
}
</style>
