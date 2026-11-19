<script setup lang="ts">
// Écran « Démarrage » : une cartographie vide, trois étapes pour la remplir.
// Étape 1 : déposer un tableur, associer ses colonnes aux champs myCarto, importer.
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'
import McCanvas from '../../components/McCanvas/McCanvas.vue'
import McAppBar from '../../components/McAppBar/McAppBar.vue'
import McAvatarStack, { type McAvatarPerson } from '../../components/McAvatar/McAvatarStack.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import { goPath } from '../bridge'
import { parseCsv, normCol } from '../Explorateur/csv'
import { appRows } from '../../data/applications'

const toast = useToast()

const people: McAvatarPerson[] = [
  { name: 'Théo Naulet', initials: 'TN', color: 1 },
  { name: 'William Vidal', initials: 'WV', color: 4 },
  { name: 'Samuel Faure', initials: 'SF', color: 5 },
]

/* ---------- Étapes ---------- */
interface Step {
  title: string
  text: string
  icon: IconName
  layer: Layer
}
const steps: Step[] = [
  { title: 'Importer vos applications', text: 'Un tableur suffit : nom, statut, éditeur.', icon: 'upload', layer: 'applicatif' },
  { title: 'Les ranger par domaine', text: 'Glissez-les dans Scolarité, Finances, RH…', icon: 'folder', layer: 'fonctionnel' },
  { title: 'Les relier par des flux', text: 'Tracez qui envoie quoi à qui.', icon: 'flow', layer: 'applicatif' },
]
const active = ref(0)
const later = reactive<boolean[]>([false, false, false])
const tabEls = ref<HTMLButtonElement[]>([])
function onTabKey(e: KeyboardEvent, i: number) {
  let next: number | null = null
  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % steps.length
  else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + steps.length) % steps.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = steps.length - 1
  if (next === null) return
  e.preventDefault()
  active.value = next
  tabEls.value[next]?.focus()
}
function postpone(i: number) {
  later[i] = true
  if (active.value === i) active.value = 0
  toast.info(`Étape ${i + 1} reportée : vous la retrouverez ici.`, { actionLabel: 'Annuler', onAction: () => (later[i] = false) })
}

/* ---------- Fichier : un CSV est vraiment lu (colonnes, lignes) ; un classeur Excel l'est de façon simplifiée ---------- */
interface LoadedFile {
  name: string
  size?: number
  columns: string[]
  rows: string[][]
  /** Classeur Excel : colonnes du modèle, pas le contenu réel. */
  approx: boolean
}
const file = ref<LoadedFile | null>(null)
const fileError = ref('')
const dragging = ref(false)
let dragDepth = 0
const input = ref<HTMLInputElement>()

const sizeLabel = (n: number) => (n < 1024 ? `${n} o` : n < 1024 * 1024 ? `${Math.round(n / 1024)} Ko` : `${(n / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`)

/** L'exemple : l'inventaire d'une université, en cinq colonnes. */
const exampleTable = (): string[][] => [['Nom', 'Statut', 'Hébergement', 'Editeur', 'Domaine fonctionnel'], ...appRows.map((a) => [a.name, a.statut, a.hebergement, a.editeur ?? '', a.domaine])]
function setFile(f: LoadedFile) {
  fileError.value = ''
  file.value = f
  resetMapping()
  phase.value = 'mapping'
  active.value = 0
}
async function load(f: File) {
  if (/\.csv$/i.test(f.name)) {
    const table = parseCsv(await f.text())
    if (table.length < 2) {
      fileError.value = `« ${f.name} » ne contient pas de lignes à importer. La première ligne doit porter les noms de colonnes.`
      return
    }
    const [head, ...rows] = table
    setFile({ name: f.name, size: f.size, columns: head.map((h, i) => h.trim() || `Colonne ${i + 1}`), rows, approx: false })
  } else if (/\.xlsx$/i.test(f.name)) {
    const [head, ...rows] = exampleTable()
    setFile({ name: f.name, size: f.size, columns: head, rows, approx: true })
  } else fileError.value = `« ${f.name} » n’est pas un tableur. Déposez un fichier .xlsx ou .csv.`
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
function loadExample() {
  const [head, ...rows] = exampleTable()
  setFile({ name: 'applications-universite.csv', columns: head, rows, approx: false })
}
const meta = computed(() => {
  const f = file.value
  if (!f) return ''
  const parts = [`${f.rows.length} ligne${f.rows.length > 1 ? 's' : ''}`, `${f.columns.length} colonne${f.columns.length > 1 ? 's' : ''} détectée${f.columns.length > 1 ? 's' : ''}`]
  if (f.size !== undefined) parts.unshift(sizeLabel(f.size))
  if (f.approx) parts.push('classeur Excel lu de façon simplifiée')
  return parts.join(' · ')
})
function removeFile() {
  file.value = null
  phase.value = 'mapping'
  fileError.value = ''
}

/* ---------- Correspondance des colonnes ---------- */
const fieldOptions: McSelectOption[] = [
  { value: 'nom', label: 'Nom de l’application' },
  { value: 'statut', label: 'Statut' },
  { value: 'hebergement', label: 'Type d’hébergement' },
  { value: 'fournisseur', label: 'Fournisseur' },
  { value: 'domaine', label: 'Domaine' },
  { value: 'ignore', label: 'Ne pas importer' },
]
const columns = computed(() => file.value?.columns ?? [])
/** Noms de colonne reconnus d'office (« Domaine fonctionnel » reste à associer : le nom est ambigu). */
const ALIASES: Record<string, string[]> = {
  nom: ['nom', 'name', 'application', 'libelle', 'nom de l application'],
  statut: ['statut', 'status', 'etat'],
  hebergement: ['hebergement', 'type d hebergement', 'hosting'],
  fournisseur: ['editeur', 'fournisseur', 'vendor'],
  domaine: ['domaine'],
}
const mapping = reactive<Record<string, McSelectValue | null>>({})
function resetMapping() {
  for (const k of Object.keys(mapping)) delete mapping[k]
  const taken = new Set<string>()
  for (const c of columns.value) {
    const n = normCol(c).replace(/[’']/g, ' ')
    const hit = Object.keys(ALIASES).find((f) => !taken.has(f) && ALIASES[f].includes(n))
    mapping[c] = hit ?? null
    if (hit) taken.add(hit)
  }
}
const unmapped = computed(() => columns.value.filter((c) => !mapping[c]))
const domainMapped = computed(() => Object.values(mapping).includes('domaine'))
const colOf = (field: string) => columns.value.find((c) => mapping[c] === field)
const nameMapped = computed(() => !!colOf('nom'))
/** Lignes qui deviendront des applications : celles qui ont un nom. */
const importable = computed(() => {
  const f = file.value
  const c = colOf('nom')
  if (!f || !c) return []
  const i = f.columns.indexOf(c)
  return f.rows.filter((r) => r[i]?.trim())
})
const TOTAL = computed(() => importable.value.length)
/** Applications sans domaine après l'import. */
const withoutDomain = computed(() => {
  const f = file.value
  const c = colOf('domaine')
  if (!f || !c) return TOTAL.value
  const i = f.columns.indexOf(c)
  return importable.value.filter((r) => !r[i]?.trim()).length
})
/** Les premiers noms importés, pour l'écran de fin. */
const firstNames = computed(() => {
  const f = file.value
  const c = colOf('nom')
  if (!f || !c) return []
  const i = f.columns.indexOf(c)
  return importable.value.slice(0, 4).map((r) => r[i].trim())
})

/* ---------- Import ---------- */
type Phase = 'mapping' | 'importing' | 'done'
const phase = ref<Phase>('mapping')
const progress = ref(0)
const imported = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(timer))

const importedCount = ref(0)
const appsLabel = (n: number) => `${n} application${n > 1 ? 's' : ''}`
function startImport() {
  const total = TOTAL.value
  if (!total) return
  phase.value = 'importing'
  progress.value = 0
  clearInterval(timer)
  const step = Math.max(1, Math.ceil(total / 60))
  timer = setInterval(() => {
    progress.value = Math.min(total, progress.value + step)
    if (progress.value >= total) {
      clearInterval(timer)
      phase.value = 'done'
      imported.value = true
      importedCount.value = total
      toast.success(`${appsLabel(total)} importée${total > 1 ? 's' : ''}`)
    }
  }, 30)
}
const pct = computed(() => (TOTAL.value ? Math.round((progress.value / TOTAL.value) * 100) : 0))
const subtitle = computed(() => (imported.value ? appsLabel(importedCount.value) : 'Créée à l’instant'))
</script>

<template>
  <div class="mc-scr-dm">
    <McCanvas fill label="Cartographie vide" />

    <McAppBar
      class="mc-scr-dm-bar"
      :meta="{ title: 'Nouvelle cartographie', subtitle }"
      :listen-shortcut="false"
      @home.prevent="goPath('/')"
      @search="toast.info('La recherche s’ouvrira dès que la cartographie aura des objets.')"
    >
      <template #actions>
        <McAvatarStack :people="people" label="3 personnes sur la cartographie" />
      </template>
    </McAppBar>

    <main class="mc-scr-dm-main">
      <!-- Colonne de gauche : bienvenue, étapes, dépôt -->
      <div class="mc-scr-dm-left">
        <div>
          <p class="mc-over mc-scr-dm-over">Bienvenue</p>
          <h1 class="display mc-scr-dm-h1">Votre cartographie est vide.<br />Trois étapes pour la remplir.</h1>
        </div>

        <div class="mc-scr-dm-steps" role="tablist" aria-label="Étapes de démarrage" aria-orientation="vertical">
          <div
            v-for="(s, i) in steps"
            :key="s.title"
            class="mc-scr-dm-step"
            :class="[`l-${s.layer}`, { 'is-active': active === i, 'is-done': i === 0 && imported && active !== 0 }]"
          >
            <span class="mc-scr-dm-stab">Étape {{ i + 1 }}</span>
            <button
              :ref="(el) => (tabEls[i] = el as HTMLButtonElement)"
              type="button"
              role="tab"
              class="mc-scr-dm-steptab"
              :aria-selected="active === i"
              :aria-controls="`mc-scr-dm-panel-${i}`"
              :tabindex="active === i ? 0 : -1"
              @click="active = i"
              @keydown="onTabKey($event, i)"
            >
              <span class="mc-scr-dm-ic"><McIcon :name="i === 0 && imported ? 'check' : s.icon" size="lg" /></span>
              <span class="mc-scr-dm-tx"><b>{{ s.title }}</b><span>{{ s.text }}</span></span>
            </button>
            <template v-if="i === 0">
              <McStatusChip v-if="imported" status="ok" size="sm">Terminée</McStatusChip>
              <McStatusChip v-else status="neutral" size="sm">En cours</McStatusChip>
            </template>
            <McStatusChip v-else-if="later[i]" status="neutral" size="sm">Plus tard</McStatusChip>
            <McButton v-else variant="outline" size="sm" @click="postpone(i)">Plus tard</McButton>
          </div>
        </div>

        <div
          class="mc-scr-dm-drop"
          :class="{ 'is-over': dragging, 'is-error': fileError }"
          @dragenter="onDragEnter"
          @dragover.prevent
          @dragleave="onDragLeave"
          @drop="onDrop"
        >
          <span class="mc-scr-dm-dropic"><McIcon :name="dragging ? 'export' : 'upload'" size="lg" /></span>
          <b>{{ dragging ? 'Lâchez le fichier ici' : file ? 'Déposez un autre fichier .xlsx ou .csv' : 'Déposez un fichier .xlsx ou .csv' }}</b>
          <span class="mc-cap mc-scr-dm-dropcap">
            ou <a href="#" @click.prevent="input?.click()">parcourez vos fichiers</a> · ou
            <a href="#" @click.prevent="loadExample">partez d’un exemple (université, 65 applications)</a>
          </span>
          <span v-if="fileError" class="mc-field-error mc-scr-dm-err" role="alert"><McIcon name="alert-octagon" size="sm" />{{ fileError }}</span>
          <input ref="input" type="file" accept=".xlsx,.csv" class="mc-scr-dm-file" tabindex="-1" aria-hidden="true" @change="onPick" />
        </div>
      </div>

      <!-- Colonne de droite : le panneau de l'étape active -->
      <section :id="`mc-scr-dm-panel-${active}`" class="mc-float mc-scr-dm-panel" role="tabpanel" :aria-label="steps[active].title">
        <template v-if="active === 0">
          <McEmptyState
            v-if="!file"
            size="compact"
            icon="upload"
            title="Aucun fichier pour l’instant"
            text="Déposez votre tableur à gauche : chaque ligne devient une application. Vous choisirez ensuite quelle colonne remplit quel champ."
          >
            <template #action>
              <McButton variant="outline" size="sm" icon="play" @click="loadExample">Essayer avec l’exemple</McButton>
            </template>
          </McEmptyState>

          <template v-else>
            <div class="mc-scr-dm-filehd">
              <span class="mc-scr-dm-fileic"><McIcon :name="phase === 'done' ? 'check-circle' : 'list'" size="lg" /></span>
              <div class="mc-scr-dm-filetx">
                <b class="title">{{ file.name }}</b>
                <span class="mc-cap">{{ meta }}</span>
              </div>
              <McIconButton v-if="phase === 'mapping'" icon="x" size="sm" label="Retirer le fichier" @click="removeFile" />
            </div>

            <!-- Correspondance -->
            <template v-if="phase === 'mapping'">
              <div class="mc-over mc-scr-dm-maphd"><span>Colonne du fichier</span><span /><span>Champ myCarto</span><span /></div>
              <div>
                <div v-for="c in columns" :key="c" class="mc-scr-dm-map">
                  <span class="mc-code">{{ c }}</span>
                  <span class="mc-scr-dm-arrow"><McIcon name="arrow-right" size="sm" /></span>
                  <div :class="{ 'mc-scr-dm-unmapped': mapping[c] === null }">
                    <McSelect v-model="mapping[c]" :options="fieldOptions" size="sm" placeholder="Choisir un champ" :aria-label="`Champ myCarto pour la colonne ${c}`" />
                  </div>
                  <span
                    class="mc-scr-dm-state"
                    :class="mapping[c] === null ? 'is-warn' : mapping[c] === 'ignore' ? 'is-off' : 'is-ok'"
                    :title="mapping[c] === null ? 'Colonne non associée' : mapping[c] === 'ignore' ? 'Colonne ignorée' : 'Colonne associée'"
                  >
                    <McIcon :name="mapping[c] === null ? 'alert-triangle' : mapping[c] === 'ignore' ? 'dashed-circle' : 'check'" size="sm" />
                  </span>
                </div>
              </div>
              <div v-for="c in unmapped" :key="c" class="mc-scr-dm-warn" role="status">
                <McIcon name="alert-triangle" size="sm" />
                <span v-if="/domaine/i.test(c) && !domainMapped">« {{ c }} » n’est associé à rien. Associez-le à « Domaine » pour ranger les applications automatiquement.</span>
                <span v-else>« {{ c }} » n’est associé à rien : choisissez un champ, ou « Ne pas importer ».</span>
              </div>
              <div v-if="!nameMapped" class="mc-scr-dm-warn" role="alert">
                <McIcon name="alert-octagon" size="sm" />
                <span>Associez une colonne à « Nom de l’application » : chaque ligne a besoin d’un nom pour devenir une application.</span>
              </div>
              <div class="mc-scr-dm-actions">
                <McButton variant="outline" @click="removeFile">Annuler</McButton>
                <McButton icon="upload" :disabled="!TOTAL" @click="startImport">Importer {{ appsLabel(TOTAL) }}</McButton>
              </div>
            </template>

            <!-- Import en cours -->
            <div v-else-if="phase === 'importing'" class="mc-scr-dm-progress">
              <div class="mc-scr-dm-ptext"><span>Import en cours… {{ progress }} / {{ TOTAL }}</span><span class="mc-cap">{{ pct }} %</span></div>
              <div class="mc-scr-dm-bar2" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" :aria-valuemax="TOTAL" aria-label="Import des applications">
                <span :style="{ width: pct + '%' }" />
              </div>
              <span class="mc-cap">Création des fiches, des éditeurs et des statuts. Vous pouvez quitter cette page : l’import continue.</span>
            </div>

            <!-- Import terminé -->
            <div v-else class="mc-scr-dm-done">
              <span class="mc-scr-dm-doneic"><McIcon name="check-circle" size="xl" /></span>
              <b class="title-lg">{{ appsLabel(importedCount) }} importée{{ importedCount > 1 ? 's' : '' }}</b>
              <p>
                {{ firstNames.join(', ') }}{{ importedCount > firstNames.length ? '…' : '' }}<br />
                <template v-if="!withoutDomain">Elles sont déjà rangées dans leurs domaines.</template>
                <template v-else-if="withoutDomain === importedCount">Aucune n’a de domaine : vous les rangerez à l’étape 2.</template>
                <template v-else>dont {{ withoutDomain }} sans domaine : vous {{ withoutDomain > 1 ? 'les' : 'la' }} rangerez à l’étape 2.</template>
              </p>
              <div class="mc-scr-dm-actions">
                <McButton variant="outline" @click="active = 1">Passer à l’étape 2</McButton>
                <McButton icon="map" @click="goPath('/')">Voir la cartographie</McButton>
              </div>
            </div>
          </template>
        </template>

        <McEmptyState
          v-else
          size="compact"
          :icon="steps[active].icon"
          :layer="steps[active].layer"
          :title="active === 1 ? 'Ranger les applications par domaine' : 'Relier les applications par des flux'"
        >
          <template v-if="!imported">Importez d’abord vos applications : cette étape s’appuie sur elles.</template>
          <template v-else-if="active === 1">Ouvrez la carte, puis glissez chaque application dans son domaine : Scolarité, Finances, RH… {{ withoutDomain ? `${withoutDomain} ${withoutDomain > 1 ? 'attendent' : 'attend'} encore ${withoutDomain > 1 ? 'leur' : 'son'} domaine.` : '' }}</template>
          <template v-else>Sur la carte, choisissez « Relier » puis tirez un trait d’une application à l’autre. Nommez le flux par ce qu’il fait : « Maj des données étudiantes ».</template>
          <template #action>
            <McButton v-if="!imported" variant="outline" size="sm" icon="upload" @click="active = 0">Revenir à l’import</McButton>
            <McButton v-else size="sm" icon="map" @click="goPath('/carte')">Ouvrir la carte</McButton>
          </template>
        </McEmptyState>
      </section>
    </main>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-dm { position: relative; width: 100%; height: 100vh; min-height: 640px; overflow: hidden; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); }
.mc-scr-dm-bar { position: absolute; left: 16px; right: 16px; top: 16px; z-index: 5; }
.mc-scr-dm-main { position: absolute; inset: 84px 24px 16px; display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); gap: 28px; align-items: start; overflow: auto; z-index: 2; pointer-events: none; }
.mc-scr-dm-main > * { pointer-events: auto; }
/* Grands écrans : le parcours reste centré (1440px au plus) et descend un peu sur les écrans hauts. */
@media (min-width: 1800px) {
  .mc-scr-dm-bar { max-width: 1728px; margin-inline: auto; }
  .mc-scr-dm-main { max-width: 1440px; margin-inline: auto; }
}
@media (min-height: 1000px) {
  .mc-scr-dm-main { padding-top: clamp(0px, calc((100vh - 900px) / 4), 120px); }
}
.mc-scr-dm-left { display: grid; gap: 12px; }
.mc-scr-dm-over { margin: 0 0 6px; }
.mc-scr-dm-h1 { margin: 0; color: var(--ink); }

/* Étapes : des cartes à onglet, qui servent d'onglets à la colonne de droite. */
.mc-scr-dm-steps { display: grid; gap: 4px; }
.mc-scr-dm-step { position: relative; margin-top: 18px; display: flex; align-items: center; gap: 12px; padding: 0 16px 0 0; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); border-top-left-radius: 0; box-shadow: var(--shadow-node); transition: border-color .12s, box-shadow .12s, opacity .12s; }
.mc-scr-dm-step.is-active { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent), var(--shadow-node); }
.mc-scr-dm-step.is-done { opacity: .6; }
.mc-scr-dm-step.is-done:hover { opacity: 1; }
.mc-scr-dm-stab { position: absolute; left: -1px; bottom: 100%; height: 18px; padding: 0 9px; border-radius: 6px 6px 0 0; font: 700 10px/18px var(--font-sans); letter-spacing: .06em; text-transform: uppercase; color: var(--surface); background: var(--lc); }
.mc-scr-dm-steptab { flex: 1; min-width: 0; display: flex; align-items: center; gap: 14px; padding: 12px 0 12px 16px; border: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; border-radius: var(--radius-md); }
.mc-scr-dm-steptab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.mc-scr-dm-ic { width: 40px; height: 40px; border-radius: 10px; background: var(--ls); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-dm-tx { flex: 1; min-width: 0; display: grid; gap: 2px; }
.mc-scr-dm-tx b { font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-scr-dm-tx span { font-size: 13px; line-height: 18px; color: var(--ink-muted); }

/* Zone de dépôt */
.mc-scr-dm-drop { position: relative; margin-top: 6px; border: 2px dashed var(--line-strong); border-radius: var(--radius-lg); padding: 22px 24px; display: grid; justify-items: center; gap: 8px; text-align: center; background: color-mix(in srgb, var(--surface) 60%, transparent); transition: border-color .12s, background-color .12s; }
.mc-scr-dm-drop.is-over { border-color: var(--accent); background: color-mix(in srgb, var(--accent) 8%, var(--surface)); }
.mc-scr-dm-drop.is-error { border-color: var(--status-critical); }
.mc-scr-dm-drop b { font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-scr-dm-dropic { width: 52px; height: 52px; border-radius: 16px; background: var(--layer-applicatif-soft); color: var(--layer-applicatif); display: inline-flex; align-items: center; justify-content: center; }
.mc-scr-dm-dropcap { font-size: 12px; }
.mc-scr-dm-dropcap a { color: var(--accent); }
.mc-scr-dm-err { justify-content: center; }
.mc-scr-dm-file { position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; }

/* Panneau de droite */
.mc-scr-dm-panel { padding: 18px 20px; display: grid; gap: 14px; min-height: 0; }
.mc-scr-dm-panel > .mc-empty { padding: 28px 12px; }
.mc-scr-dm-filehd { display: flex; align-items: center; gap: 10px; }
.mc-scr-dm-fileic { width: 36px; height: 36px; border-radius: 10px; background: var(--status-ok-soft); color: var(--status-ok); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-dm-filetx { flex: 1; min-width: 0; display: grid; }
.mc-scr-dm-filetx b { font-size: 15px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-dm-maphd, .mc-scr-dm-map { display: grid; grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr) 24px; gap: 10px; align-items: center; }
.mc-scr-dm-map { padding: 8px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
.mc-scr-dm-map:last-child { border-bottom: 0; }
.mc-scr-dm-arrow { color: var(--ink-subtle); display: inline-flex; }
.mc-scr-dm-state { display: inline-flex; }
.mc-scr-dm-state.is-ok { color: var(--status-ok); }
.mc-scr-dm-state.is-warn { color: var(--status-warn); }
.mc-scr-dm-state.is-off { color: var(--ink-subtle); }
.mc-scr-dm-unmapped .mc-input { border-color: var(--status-warn); box-shadow: 0 0 0 3px var(--status-warn-soft); }
.mc-scr-dm-warn { display: flex; gap: 10px; align-items: flex-start; padding: 10px 12px; border-radius: var(--radius-sm); background: var(--status-warn-soft); color: var(--ink); font-size: 13px; line-height: 18px; }
.mc-scr-dm-warn > .mc-ico { color: var(--status-warn); margin-top: 1px; }
.mc-scr-dm-actions { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }

.mc-scr-dm-progress { display: grid; gap: 10px; padding: 12px 0 4px; }
.mc-scr-dm-ptext { display: flex; justify-content: space-between; font-size: 13px; font-variant-numeric: tabular-nums; }
.mc-scr-dm-bar2 { height: 8px; border-radius: 4px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-dm-bar2 > span { display: block; height: 100%; border-radius: 4px; background: var(--accent); transition: width .03s linear; }

.mc-scr-dm-done { display: grid; justify-items: center; gap: 8px; text-align: center; padding: 16px 0 4px; }
.mc-scr-dm-done p { margin: 0 0 8px; color: var(--ink-muted); font-size: 13px; line-height: 18px; }
.mc-scr-dm-doneic { width: 64px; height: 64px; border-radius: 18px; background: var(--status-ok-soft); color: var(--status-ok); display: inline-flex; align-items: center; justify-content: center; }

@media (max-height: 760px) {
  .mc-scr-dm-h1 { font-size: 28px; line-height: 34px; }
  .mc-scr-dm-steptab { padding-top: 9px; padding-bottom: 9px; }
  .mc-scr-dm-drop { padding: 14px 20px; gap: 6px; }
}
</style>
