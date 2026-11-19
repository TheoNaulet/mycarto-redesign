<script setup lang="ts">
// Import d'objets depuis un tableur, dans une modale : choisir le fichier, associer ses colonnes aux champs myCarto,
// importer avec une barre de progression. Les fichiers CSV sont vraiment lus (colonnes, lignes, aperçu) ;
// un classeur Excel est lu de façon simplifiée (colonnes du modèle).
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import McButton from '../../components/McButton/McButton.vue'
import McModal from '../../components/McModal/McModal.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath } from '../bridge'
import { appRows } from '../../data/applications'
import { download } from './exportFile'

/** Un champ myCarto qui peut recevoir une colonne. */
export interface ImportField {
  value: string
  label: string
  required?: boolean
  /** Noms de colonne reconnus automatiquement (sans accents, en minuscules). */
  aliases?: string[]
}
/** Le type d'objet importé. */
export interface ImportType {
  /** « Application » : la puce de la modale. */
  label: string
  one: string
  many: string
  feminine: boolean
  icon: IconName
  layer: Layer
}
/** Ce que l'import a produit. */
export interface ImportResult {
  fileName: string
  count: number
  /** Colonne du fichier → champ myCarto (les colonnes ignorées sont absentes). */
  mapping: Record<string, string>
}

const props = withDefaults(
  defineProps<{
    /** Type d'objet importé. */
    type?: ImportType
    /** Champs proposés pour l'association des colonnes. */
    fields?: ImportField[]
    /** Adresse ouverte par « Voir dans l'explorateur » après l'import. */
    resultPath?: string
  }>(),
  {
    type: () => ({ label: 'Application', one: 'application', many: 'applications', feminine: true, icon: 'app', layer: 'applicatif' }),
    fields: () => defaultFields,
    resultPath: '/explorateur',
  },
)

/** Modale ouverte. */
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{
  /** L'import est terminé. */
  imported: [result: ImportResult]
}>()

const toast = useToast()
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const sizeLabel = (n: number) => (n < 1024 ? `${n} o` : n < 1024 * 1024 ? `${Math.round(n / 1024)} Ko` : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`)

/* ---------- Fichier ---------- */
type Phase = 'choose' | 'mapping' | 'importing' | 'done'
const phase = ref<Phase>('choose')
interface Sheet {
  name: string
  size: number | null
  columns: string[]
  rows: string[][]
  /** Nombre de lignes de données (hors en-tête). */
  total: number
  /** Lu de façon simplifiée (classeur Excel). */
  approx: boolean
}
const sheet = ref<Sheet | null>(null)
const fileError = ref('')
const dragging = ref(false)
let dragDepth = 0
const input = ref<HTMLInputElement | null>(null)

/** Découpe un CSV (séparateur deviné : point-virgule, virgule ou tabulation ; guillemets gérés). */
function parseCsv(text: string): string[][] {
  const first = text.split(/\r?\n/, 1)[0] ?? ''
  const sep = [';', '\t', ','].map((s) => [s, first.split(s).length] as const).sort((a, b) => b[1] - a[1])[0][0]
  const out: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      if (row.some((x) => x.trim())) out.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim())) out.push(row)
  return out
}

async function load(file: File) {
  fileError.value = ''
  if (/\.csv$/i.test(file.name)) {
    const text = (await file.text()).replace(/^﻿/, '')
    const table = parseCsv(text)
    if (table.length < 2) {
      fileError.value = `« ${file.name} » ne contient pas de lignes à importer. Vérifiez que la première ligne porte les noms de colonnes.`
      return
    }
    const [head, ...rows] = table
    setSheet({ name: file.name, size: file.size, columns: head.map((h, i) => h.trim() || `Colonne ${i + 1}`), rows, total: rows.length, approx: false })
  } else if (/\.(xlsx|xls)$/i.test(file.name)) {
    const ex = exampleTable()
    setSheet({ name: file.name, size: file.size, columns: ex[0], rows: ex.slice(1), total: ex.length - 1, approx: true })
  } else {
    fileError.value = `« ${file.name} » n’est pas un tableur. Choisissez un fichier .csv ou .xlsx.`
  }
}
function setSheet(s: Sheet) {
  sheet.value = s
  autoMap()
  phase.value = 'mapping'
}
function onPick(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) load(f)
  ;(e.target as HTMLInputElement).value = ''
}
function onDragEnter(e: DragEvent) {
  e.preventDefault()
  dragDepth++
  dragging.value = true
}
function onDragLeave() {
  dragDepth = Math.max(0, dragDepth - 1)
  if (!dragDepth) dragging.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  dragDepth = 0
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) load(f)
}

/** Le fichier d'exemple : les applications de l'inventaire, en cinq colonnes. */
function exampleTable(): string[][] {
  return [['Nom', 'Statut', 'Hébergement', 'Editeur', 'Domaine fonctionnel'], ...appRows.map((a) => [a.name, a.statut, a.hebergement, a.editeur ?? '', a.domaine])]
}
const toCsv = (table: string[][]) => table.map((r) => r.map((c) => (/[;"\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(';')).join('\r\n')
function useExample() {
  const t = exampleTable()
  setSheet({ name: `${props.type.many}-exemple.csv`, size: new Blob([toCsv(t)]).size, columns: t[0], rows: t.slice(1), total: t.length - 1, approx: false })
}
/** Télécharge un modèle vide : les colonnes attendues, une ligne d'exemple. */
function downloadTemplate() {
  const head = props.fields.map((f) => f.label)
  const sample = props.fields.map((_f, i) => (i === 0 ? 'ex. APOGEE' : ''))
  download(new Blob(['﻿' + toCsv([head, sample])], { type: 'text/csv;charset=utf-8' }), `modele-import-${props.type.many}.csv`)
  toast.success('Modèle téléchargé : remplissez-le puis déposez-le ici')
}
function changeFile() {
  sheet.value = null
  phase.value = 'choose'
  fileError.value = ''
}

/* ---------- Association des colonnes ---------- */
const IGNORE = '__ignore'
const mapping = ref<Record<string, McSelectValue | null>>({})
const fieldOptions = computed<McSelectOption[]>(() => [
  ...props.fields.map((f) => ({ value: f.value, label: f.required ? `${f.label} (obligatoire)` : f.label })),
  { value: IGNORE, label: 'Ne pas importer' },
])
function autoMap() {
  const m: Record<string, McSelectValue | null> = {}
  const taken = new Set<string>()
  for (const col of sheet.value?.columns ?? []) {
    const c = norm(col)
    const hit = props.fields.find((f) => !taken.has(f.value) && (norm(f.label) === c || f.value === c || f.aliases?.some((a) => c === a || c.includes(a))))
    m[col] = hit ? hit.value : null
    if (hit) taken.add(hit.value)
  }
  mapping.value = m
}
const mapped = computed(() => Object.entries(mapping.value).filter(([, v]) => v && v !== IGNORE) as [string, string][])
const unmapped = computed(() => (sheet.value?.columns ?? []).filter((c) => !mapping.value[c]))
const duplicates = computed(() => {
  const seen = new Map<string, number>()
  mapped.value.forEach(([, v]) => seen.set(v, (seen.get(v) ?? 0) + 1))
  return [...seen.entries()].filter(([, n]) => n > 1).map(([v]) => v)
})
const missingRequired = computed(() => props.fields.filter((f) => f.required && !mapped.value.some(([, v]) => v === f.value)))
const fieldLabel = (v: string) => props.fields.find((f) => f.value === v)?.label ?? v
const colError = (col: string) => {
  const v = mapping.value[col]
  return v && v !== IGNORE && duplicates.value.includes(String(v)) ? `« ${fieldLabel(String(v))} » reçoit déjà une autre colonne.` : undefined
}
const blocking = computed(() => {
  if (missingRequired.value.length) return `Associez une colonne au champ ${missingRequired.value.map((f) => `« ${f.label} »`).join(', ')} pour importer.`
  if (duplicates.value.length) return 'Deux colonnes vont dans le même champ : choisissez-en une.'
  return ''
})
const sample = (col: string) => {
  const i = sheet.value?.columns.indexOf(col) ?? -1
  return sheet.value?.rows.find((r) => r[i]?.trim())?.[i]?.trim() ?? ''
}

/* ---------- Import ---------- */
const progress = ref(0)
const skipped = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(timer))

function startImport() {
  const s = sheet.value
  if (!s || blocking.value) return
  phase.value = 'importing'
  progress.value = 0
  const nameCol = mapped.value.find(([, v]) => v === props.fields.find((f) => f.required)?.value)?.[0]
  const idx = nameCol ? s.columns.indexOf(nameCol) : -1
  // Les lignes sans valeur dans le champ obligatoire sont écartées.
  skipped.value = idx >= 0 ? s.rows.filter((r) => !r[idx]?.trim()).length : 0
  const step = Math.max(1, Math.ceil(s.total / 60))
  clearInterval(timer)
  timer = setInterval(() => {
    progress.value = Math.min(s.total, progress.value + step)
    if (progress.value >= s.total) {
      clearInterval(timer)
      phase.value = 'done'
      toast.success(importedText.value)
      emit('imported', { fileName: s.name, count: importedCount.value, mapping: Object.fromEntries(mapped.value) })
    }
  }, 25)
}
const pct = computed(() => (sheet.value?.total ? Math.round((progress.value / sheet.value.total) * 100) : 0))
const importedCount = computed(() => (sheet.value?.total ?? 0) - skipped.value)
const importedText = computed(() => {
  const n = importedCount.value
  const verb = props.type.feminine ? (n > 1 ? 'importées' : 'importée') : n > 1 ? 'importés' : 'importé'
  return `${plural(n, props.type.one, props.type.many)} ${verb}`
})

/* ---------- Modale ---------- */
const confirmLabel = computed(() => {
  if (phase.value === 'choose') return 'Choisir un fichier'
  if (phase.value === 'done') return 'Terminer'
  const n = sheet.value?.total ?? 0
  return `Importer ${plural(n, 'ligne', 'lignes')}`
})
const footerNote = computed(() => {
  if (phase.value !== 'mapping' || !sheet.value) return undefined
  const n = mapped.value.length
  const ign = Object.values(mapping.value).filter((v) => v === IGNORE).length
  const parts = [`${plural(n, 'colonne associée', 'colonnes associées')}`]
  if (ign) parts.push(`${ign} ignorée${ign > 1 ? 's' : ''}`)
  if (unmapped.value.length) parts.push(`${unmapped.value.length} à choisir`)
  return parts.join(' · ')
})
function onConfirm() {
  if (phase.value === 'choose') input.value?.click()
  else if (phase.value === 'mapping') startImport()
  else if (phase.value === 'done') open.value = false
}
function seeResult() {
  open.value = false
  goPath(props.resultPath)
}
// À la réouverture après un import terminé, on repart d'un fichier neuf.
watch(open, (o) => {
  if (o && phase.value === 'done') changeFile()
  if (!o && phase.value === 'importing') {
    clearInterval(timer)
    phase.value = 'mapping'
    toast.info('Import interrompu : aucun objet n’a été créé.')
  }
})
</script>

<script lang="ts">
const defaultFields: ImportField[] = [
  { value: 'nom', label: 'Nom', required: true, aliases: ['nom', 'name', 'application', 'libelle'] },
  { value: 'statut', label: 'Statut', aliases: ['statut', 'status', 'etat'] },
  { value: 'nature', label: 'Nature', aliases: ['nature', 'type'] },
  { value: 'hebergement', label: 'Mode d’hébergement', aliases: ['hebergement', 'hosting'] },
  { value: 'editeur', label: 'Éditeur', aliases: ['editeur', 'fournisseur', 'vendor'] },
  { value: 'domaine', label: 'Domaine', aliases: ['domaine'] },
  { value: 'description', label: 'Description', aliases: ['description', 'desc'] },
  { value: 'miseEnService', label: 'Mise en service', aliases: ['mise en service', 'date de mise'] },
]
</script>

<template>
  <McModal
    v-model:open="open"
    :title="`Importer des ${type.many}`"
    :type="{ label: type.label, icon: type.icon, layer: type.layer }"
    :subtitle="sheet ? `${sheet.name}${sheet.size !== null ? ` · ${sizeLabel(sheet.size)}` : ''} · ${plural(sheet.total, 'ligne', 'lignes')} · ${plural(sheet.columns.length, 'colonne', 'colonnes')}` : 'Depuis un tableur CSV ou Excel'"
    size="lg"
    :confirm-label="confirmLabel"
    :confirm-icon="phase === 'done' ? 'check' : 'upload'"
    :confirm-disabled="phase === 'mapping' && !!blocking"
    :loading="phase === 'importing'"
    :footer-note="footerNote"
    :dirty="phase === 'mapping'"
    @confirm="onConfirm"
  >
    <input ref="input" type="file" accept=".csv,.xlsx,.xls,text/csv" class="mc-scr-im-file" tabindex="-1" aria-hidden="true" @change="onPick" />

    <!-- 1. Fichier -->
    <div v-if="phase === 'choose'" class="mc-scr-im">
      <div
        class="mc-scr-im-drop"
        :class="{ 'is-over': dragging, 'is-error': fileError }"
        @dragenter="onDragEnter"
        @dragover.prevent
        @dragleave="onDragLeave"
        @drop="onDrop"
      >
        <span class="mc-scr-im-ic"><McIcon name="upload" size="lg" /></span>
        <p class="mc-scr-im-t">Déposez un fichier ici</p>
        <p class="mc-cap">CSV ou Excel, une ligne par {{ type.one }}, les noms de colonnes en première ligne.</p>
        <div class="mc-scr-im-acts">
          <McButton variant="secondary" size="sm" icon="folder" @click="input?.click()">Parcourir…</McButton>
          <McButton variant="outline" size="sm" icon="list" @click="useExample">Utiliser le fichier d’exemple</McButton>
        </div>
      </div>
      <p v-if="fileError" class="mc-scr-im-err" role="alert">{{ fileError }}</p>
      <p class="mc-cap mc-scr-im-tpl">
        Pas encore de fichier ?
        <button type="button" class="mc-scr-im-link" @click="downloadTemplate">Télécharger le modèle CSV</button>
        avec les colonnes attendues.
      </p>
    </div>

    <!-- 2. Colonnes -->
    <div v-else-if="phase === 'mapping' && sheet" class="mc-scr-im">
      <div class="mc-scr-im-bar">
        <span class="mc-scr-im-fic"><McIcon name="list" size="sm" />{{ sheet.name }}</span>
        <span class="mc-scr-grow" />
        <McButton variant="ghost" size="sm" icon="undo" @click="autoMap">Réassocier automatiquement</McButton>
        <McButton variant="ghost" size="sm" icon="x" @click="changeFile">Changer de fichier</McButton>
      </div>
      <p v-if="sheet.approx" class="mc-cap mc-scr-im-note">Classeur Excel : lecture simplifiée, les colonnes du modèle sont proposées. Pour un aperçu exact, enregistrez la feuille en CSV.</p>
      <table class="mc-scr-im-map">
        <thead>
          <tr>
            <th scope="col">Colonne du fichier</th>
            <th scope="col">Exemple</th>
            <th scope="col">Champ myCarto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="col in sheet.columns" :key="col">
            <th scope="row">{{ col }}</th>
            <td class="mc-scr-im-sample">{{ sample(col) || '—' }}</td>
            <td>
              <McSelect
                v-model="mapping[col]"
                size="sm"
                :options="fieldOptions"
                placeholder="Choisir un champ"
                :aria-label="`Champ myCarto pour la colonne ${col}`"
                :error="colError(col)"
              />
            </td>
          </tr>
        </tbody>
      </table>
      <p v-if="blocking" class="mc-scr-im-err" role="alert">{{ blocking }}</p>
      <p v-else-if="unmapped.length" class="mc-cap">
        {{ unmapped.length > 1 ? `Les colonnes ${unmapped.map((c) => `« ${c} »`).join(', ')} ne seront pas importées` : `La colonne « ${unmapped[0]} » ne sera pas importée` }} tant qu’aucun champ n’est choisi.
      </p>
    </div>

    <!-- 3. Import -->
    <div v-else-if="sheet" class="mc-scr-im mc-scr-im-run">
      <span class="mc-scr-im-ic" :class="{ 'is-ok': phase === 'done' }"><McIcon :name="phase === 'done' ? 'check' : 'upload'" size="lg" /></span>
      <p class="mc-scr-im-t">{{ phase === 'done' ? importedText : `Import en cours… ${progress} sur ${sheet.total}` }}</p>
      <div class="mc-scr-im-prog" role="progressbar" :aria-valuenow="pct" aria-valuemin="0" aria-valuemax="100" :aria-label="`Import : ${pct} %`">
        <span :style="{ width: `${pct}%` }" />
      </div>
      <template v-if="phase === 'done'">
        <p class="mc-cap">
          {{ plural(mapped.length, 'champ renseigné', 'champs renseignés') }} par {{ type.one }}.
          <template v-if="skipped"> {{ skipped > 1 ? `${skipped} lignes sans nom ont été écartées.` : '1 ligne sans nom a été écartée.' }}</template>
        </p>
        <McButton variant="outline" size="sm" icon="list" @click="seeResult">Voir dans l’explorateur</McButton>
      </template>
      <p v-else class="mc-cap">Vous pouvez fermer : l’import s’arrêtera sans rien créer.</p>
    </div>
  </McModal>
</template>

<style>
.mc-scr-im { display: grid; gap: 12px; }
.mc-scr-im-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.mc-scr-im-drop { display: grid; justify-items: center; gap: 6px; padding: 28px 20px; border: 1.5px dashed var(--line-strong); border-radius: var(--radius-md); background: var(--surface-sunken); text-align: center; transition: border-color .12s ease-out, background .12s ease-out; }
.mc-scr-im-drop.is-over { border-color: var(--accent); background: var(--accent-soft); }
.mc-scr-im-drop.is-error { border-color: var(--status-critical); }
.mc-scr-im-drop .mc-cap { margin: 0; max-width: 420px; }
.mc-scr-im-ic { width: 48px; height: 48px; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; background: var(--layer-applicatif-soft); color: var(--layer-applicatif); }
.mc-scr-im-ic.is-ok { background: var(--status-ok-soft); color: var(--status-ok); }
.mc-scr-im-t { margin: 4px 0 0; font: 600 15px/20px var(--font-display); }
.mc-scr-im-acts { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
.mc-scr-im-err { margin: 0; font-size: 13px; line-height: 18px; color: var(--status-critical); }
.mc-scr-im-tpl { margin: 0; }
.mc-scr-im-link { padding: 0; border: 0; background: none; color: var(--accent); font: inherit; text-decoration: underline; cursor: pointer; }
.mc-scr-im-link:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-scr-im-bar { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.mc-scr-im-bar .mc-scr-grow { flex: 1; }
.mc-scr-im-fic { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; min-width: 0; overflow-wrap: anywhere; }
.mc-scr-im-fic .mc-ico { color: var(--ink-subtle); }
.mc-scr-im-note { margin: 0; }
.mc-scr-im-map { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 18px; }
.mc-scr-im-map th, .mc-scr-im-map td { padding: 6px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
.mc-scr-im-map thead th { font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase; color: var(--ink-muted); }
.mc-scr-im-map tbody th { font-weight: 600; white-space: nowrap; }
.mc-scr-im-map td:last-child { width: 46%; }
.mc-scr-im-map .mc-field { gap: 2px; }
.mc-scr-im-sample { color: var(--ink-muted); max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-im-run { justify-items: center; text-align: center; padding: 20px 0 8px; }
.mc-scr-im-run .mc-cap { margin: 0; }
.mc-scr-im-prog { width: min(420px, 100%); height: 8px; border-radius: 999px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-im-prog span { display: block; height: 100%; border-radius: inherit; background: var(--accent); transition: width .1s linear; }
@media (prefers-reduced-motion: reduce) {
  .mc-scr-im-drop, .mc-scr-im-prog span { transition: none; }
}
</style>
