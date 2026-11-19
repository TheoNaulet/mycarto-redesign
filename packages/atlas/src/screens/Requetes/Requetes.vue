<script setup lang="ts">
// Écran Modèles de requête : les requêtes enregistrées, un constructeur visuel (type d'objet + conditions)
// et le résultat calculé sur les données de la cartographie, à ouvrir ou à exporter en CSV.
import { computed, getCurrentInstance, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { copyLink, goFiche, goPath } from '../bridge'
import {
  cond,
  conditionError,
  datasets,
  needsValue,
  operatorLabels,
  operatorsByKind,
  queryType,
  queryTypes,
  runQuery,
  savedQueries,
  type Condition,
  type Operator,
  type QueryModel,
  type QueryRow,
  type QueryType,
  type Value,
} from '../../data/requetes'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const clone = (q: QueryModel): QueryModel => JSON.parse(JSON.stringify(q)) as QueryModel

/* ---------- Modèles ---------- */
interface Entry {
  id: string
  draft: QueryModel
  saved: string
}
const entries = ref<Entry[]>(savedQueries.map((q) => ({ id: q.id, draft: clone(q), saved: JSON.stringify(q) })))
/** Anciens identifiants encore cités par des liens : ils mènent à la même requête. */
const ALIASES: Record<string, string> = {
  'apps-sans-composant': 'applications-sans-composant',
  'apps-non-valides': 'applications-non-valides',
  'sans-composant': 'applications-sans-composant',
  'non-valides': 'applications-non-valides',
}
const currentId = ref(entries.value[0].id)
const entry = computed(() => entries.value.find((e) => e.id === currentId.value) ?? entries.value[0])
const d = computed(() => entry.value.draft)
const isDirty = (e: Entry) => JSON.stringify(e.draft) !== e.saved
const dirty = computed(() => isDirty(entry.value))
const isNew = (e: Entry) => (JSON.parse(e.saved) as QueryModel).name === ''
const tinfo = computed(() => queryType(d.value.type))

const TYPE_LOOK: Record<QueryType, { icon: IconName; layer: Layer }> = {
  application: { icon: 'app', layer: 'applicatif' },
  flux: { icon: 'flow', layer: 'applicatif' },
  machine: { icon: 'server', layer: 'technique' },
  composant: { icon: 'chip', layer: 'technique' },
}
const entrySub = (e: Entry) => `${queryType(e.draft.type).label} · ${plural(e.draft.conditions.length, 'condition', 'conditions')}`

function newQuery() {
  let n = 1
  while (entries.value.some((e) => e.id === `nouvelle-${n}`)) n++
  const draft: QueryModel = {
    id: `nouvelle-${n}`,
    name: n === 1 ? 'Nouvelle requête' : `Nouvelle requête ${n}`,
    type: 'application',
    match: 'all',
    conditions: [cond('statut', 'eq', 'Active')],
  }
  entries.value.push({ id: draft.id, draft, saved: JSON.stringify({ ...draft, name: '' }) })
  currentId.value = draft.id
}

/* ---------- Constructeur ---------- */
const typeOptions: McSelectOption[] = queryTypes.map((t) => ({ value: t.id, label: t.label.toLowerCase() }))
const matchOptions = [
  { value: 'all', label: 'toutes les conditions' },
  { value: 'any', label: 'au moins une condition' },
]
const fieldOptions = computed<McSelectOption[]>(() => tinfo.value.fields.map((f) => ({ value: f.key, label: f.label })))
const fieldOf = (c: Condition) => tinfo.value.fields.find((f) => f.key === c.field)
const opOptions = (c: Condition): McSelectOption[] => (operatorsByKind[fieldOf(c)?.kind ?? 'texte'] ?? []).map((o) => ({ value: o, label: operatorLabels[o] }))
const valueOptions = (c: Condition): McSelectOption[] => (fieldOf(c)?.options ?? []).map((v) => ({ value: v, label: v }))

/** Changer de type remet une condition sur le premier champ de liste du nouveau type. */
function setType(v: McSelectValue | null) {
  if (!v || v === d.value.type) return
  const t = queryType(v as QueryType)
  d.value.type = t.id
  const f = t.fields.find((x) => x.kind === 'liste') ?? t.fields[0]
  d.value.conditions = [cond(f.key, operatorsByKind[f.kind][0], '')]
}
function setField(c: Condition, v: McSelectValue | null) {
  if (!v) return
  c.field = String(v)
  const kind = fieldOf(c)?.kind ?? 'texte'
  c.op = operatorsByKind[kind][0]
  c.value = ''
}
function setOp(c: Condition, v: McSelectValue | null) {
  if (v) c.op = v as Operator
  if (!needsValue(c.op)) c.value = ''
}
function addCondition() {
  const f = tinfo.value.fields[0]
  d.value.conditions.push(cond(f.key, operatorsByKind[f.kind][0], ''))
}
function removeCondition(i: number) {
  d.value.conditions.splice(i, 1)
}
const errors = computed(() => d.value.conditions.map((c) => conditionError(c, d.value.type)))
const errorCount = computed(() => errors.value.filter(Boolean).length)
const nameError = computed(() => (d.value.name.trim() ? undefined : 'Donnez un nom à la requête.'))

function cancel() {
  if (isNew(entry.value)) {
    const id = entry.value.id
    entries.value = entries.value.filter((e) => e.id !== id)
    currentId.value = entries.value[0].id
    delete results.value[id]
    return
  }
  entry.value.draft = JSON.parse(entry.value.saved) as QueryModel
}
function save() {
  if (nameError.value || errorCount.value) return
  const e = entry.value
  const wasNew = isNew(e)
  e.saved = JSON.stringify(e.draft)
  toast.success(wasNew ? `Requête « ${e.draft.name.trim()} » créée` : 'Requête enregistrée', { duration: 3000 })
}

/* ---------- Lancement ---------- */
interface Result {
  rows: QueryRow[]
  key: string
  type: QueryType
}
const results = ref<Record<string, Result>>({})
const result = computed(() => results.value[entry.value.id])
const stale = computed(() => !!result.value && result.value.key !== JSON.stringify({ ...d.value, name: '' }))
const running = ref(false)

function run() {
  if (errorCount.value || running.value) return
  running.value = true
  const id = entry.value.id
  const q = clone(d.value)
  setTimeout(() => {
    running.value = false
    results.value = { ...results.value, [id]: { rows: runQuery(q), key: JSON.stringify({ ...q, name: '' }), type: q.type } }
    sort.value = null
  }, 350)
}

/* ---------- Adresse : /requetes?requete=applications-sans-composant présélectionne la requête et la lance ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => {
  const q = (globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query
  if (q) return q as Record<string, unknown>
  return typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {}
})
watch(
  () => routeQuery.value.requete,
  (raw) => {
    if (typeof raw !== 'string' || !raw) return
    const id = ALIASES[raw] ?? raw
    if (!entries.value.some((e) => e.id === id)) return
    currentId.value = id
    if (!results.value[id]) run()
  },
  { immediate: true },
)

/** Lien direct vers la requête enregistrée (les brouillons n'ont pas encore d'adresse). */
const linkable = computed(() => savedQueries.some((q) => q.id === entry.value.id))
async function copyQueryLink() {
  const ok = await copyLink(`/requetes?requete=${entry.value.id}`)
  if (ok) toast.success(`Lien de la requête « ${d.value.name} » copié`)
  else toast.error('Le lien n’a pas pu être copié : le navigateur refuse l’accès au presse-papiers.')
}

const resultInfo = computed(() => (result.value ? queryType(result.value.type) : tinfo.value))
const countLabel = computed(() => {
  const n = result.value?.rows.length ?? 0
  return n ? plural(n, 'résultat', 'résultats') : 'Aucun résultat'
})
const totalLabel = computed(() => {
  const t = resultInfo.value
  const total = datasets[t.id].length
  return `sur ${plural(total, t.one, t.many)}`
})

const sort = ref<DataTableSort | null>(null)
const columns = computed<DataTableColumn<QueryRow>[]>(() => {
  const t = resultInfo.value
  return t.columns.map((key) => {
    const f = t.fields.find((x) => x.key === key)!
    return {
      key,
      label: f.key === 'nom' ? t.one.charAt(0).toUpperCase() + t.one.slice(1) : f.label,
      sortable: true,
      ...(f.kind === 'nombre' ? { align: 'right' as const, width: '120px' } : {}),
      ...(f.kind === 'booleen' ? { format: (v: unknown) => (v ? 'Oui' : 'Non') } : {}),
    }
  })
})

function openRow(r: QueryRow) {
  if ('fiche' in r.open) goFiche(r.open.fiche)
  else goPath(r.open.path)
}
/** « de APOGEE » → « d’APOGEE » : élision devant une voyelle ou un h muet. */
const de = (name: string) => (/^[aeiouyhàâéèêëîïôöûüœ]/i.test(name.normalize('NFC')) ? `d’${name}` : `de ${name}`)
const openLabel = (r: QueryRow) =>
  'fiche' in r.open
    ? `Ouvrir la fiche ${de(r.open.fiche)}`
    : r.open.path === '/carte'
      ? `Voir ${r.name} sur la carte des flux`
      : r.open.path === '/machines'
        ? `Voir la machine ${de(r.name)}`
        : `Voir ${r.name} dans l’infrastructure`

/* ---------- Export CSV ---------- */
const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'requete'
function exportCsv() {
  const res = result.value
  if (!res) return
  const t = resultInfo.value
  const keys = t.columns
  const cell = (v: Value | undefined) => {
    const s = v === true ? 'Oui' : v === false ? 'Non' : v === null || v === undefined ? '' : String(v)
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [keys.map((k) => cell(t.fields.find((f) => f.key === k)?.label ?? k)).join(';'), ...res.rows.map((r) => keys.map((k) => cell(r[k] as Value)).join(';'))]
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${slug(d.value.name)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toast.success(`Export prêt : ${plural(res.rows.length, 'ligne', 'lignes')} au format CSV`)
}
</script>

<template>
  <div class="mc-scr-rq">
    <AdminNav active="Explorateur" />

    <!-- Modèles enregistrés -->
    <nav class="mc-scr-rq-list" aria-label="Modèles de requête">
      <span class="mc-over mc-scr-rq-listhd">Modèles de requête · {{ entries.length }}</span>
      <button
        v-for="e in entries"
        :key="e.id"
        type="button"
        class="mc-scr-rq-it"
        :class="{ 'is-on': e.id === currentId }"
        :aria-current="e.id === currentId ? 'true' : undefined"
        @click="currentId = e.id"
      >
        <span class="mc-scr-rq-th" :class="`l-${TYPE_LOOK[e.draft.type].layer}`"><McIcon :name="TYPE_LOOK[e.draft.type].icon" size="sm" /></span>
        <span class="mc-scr-rq-itx">
          <span class="mc-scr-rq-itn">{{ e.draft.name || 'Sans nom' }}</span>
          <span class="mc-cap">{{ entrySub(e) }}</span>
        </span>
        <span v-if="results[e.id]" class="mc-count" :title="plural(results[e.id].rows.length, 'résultat au dernier lancement', 'résultats au dernier lancement')">{{ results[e.id].rows.length }}</span>
        <span v-if="isDirty(e)" class="mc-scr-rq-dot" title="Modifications non enregistrées" />
      </button>
      <McButton variant="outline" size="sm" icon="plus" class="mc-scr-rq-new" @click="newQuery">Nouvelle requête</McButton>
    </nav>

    <main class="mc-scr-rq-main">
      <header class="mc-scr-rq-head">
        <div class="mc-scr-rq-titles">
          <p class="mc-over">Modèles de requête</p>
          <h1 class="title-lg">{{ d.name || 'Sans nom' }}</h1>
        </div>
        <span class="mc-cap">{{ dirty ? 'Modifications non enregistrées' : 'Enregistrée' }}</span>
        <McIconButton icon="link" :disabled="!linkable" :label="linkable ? 'Copier le lien de la requête' : 'Seules les requêtes du référentiel ont un lien'" @click="copyQueryLink" />
        <McButton variant="outline" :disabled="!dirty" @click="cancel">{{ isNew(entry) ? 'Abandonner' : 'Annuler' }}</McButton>
        <McButton variant="secondary" :disabled="!dirty || !!nameError || errorCount > 0" @click="save">Enregistrer</McButton>
      </header>

      <!-- Constructeur -->
      <section class="mc-scr-rq-builder" aria-label="Constructeur de requête">
        <div class="mc-scr-rq-name">
          <McTextField v-model="d.name" label="Nom de la requête" required placeholder="ex. Applications sans composant" :error="nameError" />
        </div>

        <div class="mc-scr-rq-sentence">
          <span>Chercher les</span>
          <McSelect :model-value="d.type" size="sm" class="mc-scr-rq-type" :options="typeOptions" aria-label="Type d’objet" @update:model-value="setType" />
          <span>qui remplissent</span>
          <McToggleGroup v-model="d.match" label="Combinaison des conditions" :options="matchOptions" />
        </div>

        <ol class="mc-scr-rq-conds">
          <li v-for="(c, i) in d.conditions" :key="c.id" class="mc-scr-rq-cond">
            <span class="mc-scr-rq-join">{{ i === 0 ? 'où' : d.match === 'all' ? 'et' : 'ou' }}</span>
            <McSelect :model-value="c.field" size="sm" class="mc-scr-rq-field" :options="fieldOptions" :aria-label="`Champ de la condition ${i + 1}`" @update:model-value="setField(c, $event)" />
            <McSelect :model-value="c.op" size="sm" class="mc-scr-rq-op" :options="opOptions(c)" :aria-label="`Opérateur de la condition ${i + 1}`" @update:model-value="setOp(c, $event)" />
            <template v-if="needsValue(c.op)">
              <McSelect
                v-if="fieldOf(c)?.kind === 'liste'"
                :model-value="c.value || null"
                size="sm"
                class="mc-scr-rq-val"
                placeholder="Choisir une valeur"
                :options="valueOptions(c)"
                :error="errors[i]"
                :aria-label="`Valeur de la condition ${i + 1}`"
                @update:model-value="c.value = $event === null ? '' : String($event)"
              />
              <McTextField
                v-else
                v-model="c.value"
                size="sm"
                class="mc-scr-rq-val"
                :type="fieldOf(c)?.kind === 'nombre' ? 'number' : 'text'"
                :placeholder="fieldOf(c)?.kind === 'nombre' ? 'ex. 0' : 'ex. Tomcat'"
                :error="errors[i]"
                :aria-label="`Valeur de la condition ${i + 1}`"
              />
            </template>
            <span v-else class="mc-scr-rq-val" />
            <McIconButton icon="trash" size="sm" variant="danger" :label="`Retirer la condition ${i + 1}`" @click="removeCondition(i)" />
          </li>
          <li v-if="!d.conditions.length" class="mc-scr-rq-cond mc-scr-rq-nocond">Sans condition, la requête renvoie {{ tinfo.feminine ? 'toutes les' : 'tous les' }} {{ tinfo.many }}.</li>
        </ol>

        <div class="mc-scr-rq-run">
          <McButton variant="ghost" size="sm" icon="plus" @click="addCondition">Ajouter une condition</McButton>
          <span class="mc-scr-rq-grow" />
          <span v-if="errorCount" class="mc-cap mc-scr-rq-err">{{ plural(errorCount, 'condition à compléter', 'conditions à compléter') }}</span>
          <McButton icon="play" :loading="running" :disabled="errorCount > 0" @click="run">Lancer</McButton>
        </div>
      </section>

      <!-- Résultat -->
      <section class="mc-scr-rq-results" aria-live="polite" aria-label="Résultat">
        <template v-if="result">
          <div class="mc-scr-rq-reshead">
            <div class="mc-scr-rq-count">
              <strong class="mc-scr-rq-n">{{ countLabel }}</strong>
              <span class="mc-cap">{{ totalLabel }}</span>
            </div>
            <span v-if="stale" class="mc-cap mc-scr-rq-stale"><McIcon name="info" size="sm" />La requête a changé depuis le dernier lancement : relancez-la.</span>
            <span class="mc-scr-rq-grow" />
            <McButton variant="outline" size="sm" icon="export" :disabled="!result.rows.length" @click="exportCsv">Exporter en CSV</McButton>
          </div>
          <McDataTable
            v-model:sort="sort"
            class="mc-scr-rq-table"
            :columns="columns"
            :rows="result.rows"
            row-key="id"
            :icon="TYPE_LOOK[result.type].icon"
            :layer="TYPE_LOOK[result.type].layer"
            :caption="`Résultat : ${d.name}`"
            :empty-title="`Aucun${resultInfo.feminine ? 'e' : ''} ${resultInfo.one} ne répond à ces conditions`"
            empty-text="Retirez une condition ou passez à « au moins une condition »."
            @open="openRow"
          >
            <template #actions="{ row }">
              <McIconButton size="sm" icon="external" :label="openLabel(row)" @click="openRow(row)" />
            </template>
          </McDataTable>
        </template>
        <McEmptyState
          v-else
          icon="play"
          :layer="TYPE_LOOK[d.type].layer"
          title="Lancez la requête pour voir son résultat"
          :text="`Le résultat est calculé sur les ${datasets[d.type].length} ${tinfo.many} de la cartographie, telles qu’elles sont aujourd’hui.`"
        >
          <template #action>
            <McButton variant="outline" size="sm" icon="play" :loading="running" :disabled="errorCount > 0" @click="run">Lancer la requête</McButton>
          </template>
        </McEmptyState>
      </section>
    </main>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-rq { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-rq-grow { flex: 1; }

.mc-scr-rq-list { width: 260px; flex: none; display: flex; flex-direction: column; gap: 4px; padding: 16px 12px; border-right: 1px solid var(--line); background: var(--surface); box-sizing: border-box; overflow-y: auto; }
.mc-scr-rq-listhd { padding: 0 10px 6px; }
.mc-scr-rq-it { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: inherit; font-size: 13px; line-height: 18px; text-align: left; cursor: pointer; }
.mc-scr-rq-it:hover { background: var(--surface-sunken); }
.mc-scr-rq-it.is-on { background: var(--accent-soft); }
.mc-scr-rq-it.is-on .mc-scr-rq-itn { font-weight: 600; }
.mc-scr-rq-it:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-rq-th { width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-rq-th.l-applicatif { background: var(--layer-applicatif-soft); color: var(--layer-applicatif); }
.mc-scr-rq-th.l-technique { background: var(--layer-technique-soft); color: var(--layer-technique); }
.mc-scr-rq-itx { flex: 1; min-width: 0; display: grid; }
.mc-scr-rq-itn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-rq-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); flex: none; }
.mc-scr-rq-new { margin-top: 8px; align-self: flex-start; }

.mc-scr-rq-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; container-type: inline-size; }
.mc-scr-rq-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-rq-titles { flex: 1; min-width: 200px; }
.mc-scr-rq-titles .mc-over { margin: 0 0 2px; }
.mc-scr-rq-titles h1 { margin: 0; }

.mc-scr-rq-builder { display: grid; gap: 14px; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-rq-name { max-width: 420px; }
.mc-scr-rq-sentence { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 14px; color: var(--ink-muted); }
.mc-scr-rq-type { width: 160px; }
.mc-scr-rq-conds { list-style: none; margin: 0; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-sm); }
.mc-scr-rq-cond { display: grid; grid-template-columns: 28px minmax(160px, 220px) minmax(140px, 170px) minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 10px 12px; border-bottom: 1px solid var(--line); }
.mc-scr-rq-cond:last-child { border-bottom: 0; }
.mc-scr-rq-cond .mc-field { gap: 0; }
.mc-scr-rq-join { font-size: 13px; line-height: 28px; color: var(--ink-muted); text-align: right; }
.mc-scr-rq-val { min-width: 0; max-width: 320px; }
.mc-scr-rq-nocond { display: block; font-size: 13px; color: var(--ink-muted); }
.mc-scr-rq-run { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-rq-err { color: var(--status-critical); }

.mc-scr-rq-results { display: flex; flex-direction: column; gap: 12px; min-height: 240px; }
.mc-scr-rq-reshead { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-rq-count { display: flex; align-items: baseline; gap: 8px; }
.mc-scr-rq-n { font: 600 18px/24px var(--font-display); }
.mc-scr-rq-stale { display: inline-flex; align-items: center; gap: 6px; color: var(--status-warn); }
.mc-scr-rq-results .mc-empty { background: var(--surface); border: 1px dashed var(--line-strong); border-radius: var(--radius-md); }

@media (min-width: 1800px) {
  .mc-scr-rq-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
  .mc-scr-rq-list { width: 280px; }
}
@media (max-width: 1360px) {
  .mc-scr-rq-list { width: 220px; }
  .mc-scr-rq-main { padding: 20px 22px; }
}
@container (max-width: 760px) {
  .mc-scr-rq-cond { grid-template-columns: 24px minmax(0, 1fr) minmax(0, 1fr) auto; }
  .mc-scr-rq-cond .mc-scr-rq-val { grid-column: 2 / 4; grid-row: 2; max-width: none; }
}
</style>
