<script setup lang="ts">
// Fenêtre « Modifier une application », la même partout : l'Explorateur, la fiche, et les cartes
// (inspecteur d'une application). Elle s'ouvre sur place, sans quitter l'écran ;
// l'enregistrement met à jour l'inventaire de la session, que tous les écrans lisent.
import { computed, ref } from 'vue'
import McModal, { type ModalSection } from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McFormField from '../../components/McFormField/McFormField.vue'
import { useToast } from '../../components/McToast/useToast'
import type { Criticity } from '../../utils/types'
import { blankRow, editeurs, groupes, machines, rowFromApp, sessionRows, today, type AppRow } from '../Explorateur/data'
import { getApplication, slugOf } from '../../data/applications'
import { deletedApps } from '../../data/session'
import { de } from '../Accueil/nav'

const emit = defineEmits<{ saved: [row: AppRow, kind: 'edit' | 'added' | 'create'] }>()
const toast = useToast()
const rows = sessionRows
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

interface Form {
  name: string
  nature: McSelectValue | null
  description: string
  statut: McSelectValue | null
  groupe: McSelectValue | null
  miseEnService: string
  finDeService: string
  d: McSelectValue | null
  i: McSelectValue | null
  c: McSelectValue | null
  p: McSelectValue | null
  hebergement: McSelectValue | null
  machine: McSelectValue | null
  editeur: McSelectValue | null
  cout: string
  commentaire: string
}
const editOpen = ref(false)
const editMode = ref<'edit' | 'create'>('edit')
const editId = ref<number | null>(null)
const section = ref('general')
const saving = ref(false)
const form = ref<Form>(blankForm())
const original = ref<Form>(blankForm())

function blankForm(): Form {
  return {
    name: '', nature: 'Application', description: '', statut: 'Prévue', groupe: 'Groupe complet', miseEnService: '', finDeService: '',
    d: null, i: null, c: null, p: null, hebergement: 'On-premise', machine: null, editeur: null, cout: '', commentaire: '',
  }
}
const lvl = (c: Criticity) => (c === 0 ? null : c)
function formOf(r: AppRow): Form {
  return {
    name: r.name, nature: r.nature, description: r.description, statut: r.statut, groupe: r.groupe, miseEnService: r.miseEnService,
    finDeService: r.finDeService, d: lvl(r.dicp.d), i: lvl(r.dicp.i), c: lvl(r.dicp.c), p: lvl(r.dicp.p), hebergement: r.hebergement,
    machine: r.machine || null, editeur: r.editeur, cout: r.cout, commentaire: '',
  }
}
/** Ligne en cours de modification qui n'est pas encore dans le tableau (application hors inventaire). */
const draftRow = ref<AppRow | null>(null)
/** Base d'une création : domaine, flux… (ceux de l'application dupliquée, sinon vides). */
const createBase = ref<AppRow | null>(null)
function openEdit(r: AppRow, at = 'general') {
  editMode.value = 'edit'
  draftRow.value = rows.value.some((x) => x.id === r.id) ? null : r
  editId.value = r.id
  form.value = formOf(r)
  original.value = formOf(r)
  section.value = at
  editOpen.value = true
}
function openCreate(from?: AppRow) {
  editMode.value = 'create'
  editId.value = null
  createBase.value = from ?? null
  form.value = from ? { ...formOf(from), name: `Copie ${de(from.name)}` } : blankForm()
  original.value = blankForm()
  section.value = 'general'
  editOpen.value = true
}

const changed = computed(() => (Object.keys(form.value) as (keyof Form)[]).filter((k) => (form.value[k] ?? '') !== (original.value[k] ?? '')))
const isMod = (k: keyof Form) => editMode.value === 'edit' && changed.value.includes(k)
const nameError = computed(() => (!form.value.name.trim() ? 'Saisissez un nom.' : undefined))
const editorError = computed(() => (!form.value.editeur ? "Choisissez l'éditeur pour pouvoir enregistrer." : undefined))
const showErrors = computed(() => editMode.value === 'edit')
const errorCount = computed(() => [nameError.value, editorError.value].filter(Boolean).length)

const sectionFields: Record<string, (keyof Form)[]> = {
  general: ['name', 'nature', 'description', 'statut', 'groupe'],
  cycle: ['miseEnService', 'finDeService'],
  dicp: ['d', 'i', 'c', 'p'],
  hebergement: ['hebergement', 'machine'],
  fournisseur: ['editeur', 'cout'],
  relations: [],
  commentaire: ['commentaire'],
}
const modalSections = computed<ModalSection[]>(() =>
  [
    { id: 'general', label: 'Général', icon: 'info' as const },
    { id: 'cycle', label: 'Cycle de vie', icon: 'calendar' as const },
    { id: 'dicp', label: 'Sécurité (DICP)', icon: 'shield' as const },
    { id: 'hebergement', label: 'Hébergement', icon: 'server' as const },
    { id: 'fournisseur', label: 'Fournisseur et coûts', icon: 'contract' as const },
    { id: 'relations', label: 'Relations', icon: 'link' as const },
    { id: 'commentaire', label: 'Commentaire', icon: 'comment' as const },
  ].map((s) => ({
    ...s,
    modified: sectionFields[s.id].some((k) => isMod(k)),
    error: showErrors.value && ((s.id === 'general' && !!nameError.value) || (s.id === 'fournisseur' && !!editorError.value)),
  })),
)
const footerNote = computed(() => {
  const parts: string[] = []
  const n = editMode.value === 'edit' ? changed.value.length : 0
  if (n) parts.push(plural(n, 'modification', 'modifications'))
  if (showErrors.value && errorCount.value) parts.push(plural(errorCount.value, 'champ à corriger', 'champs à corriger'))
  if (!showErrors.value && errorCount.value) parts.push('Nom et éditeur sont obligatoires')
  return parts.length ? parts.join(' · ') : undefined
})
const modalTitle = computed(() => (editMode.value === 'create' ? (createBase.value ? `Dupliquer ${createBase.value.name}` : 'Nouvelle application') : `Modifier ${original.value.name}`))
const editedRow = computed(() => rows.value.find((r) => r.id === editId.value) ?? (draftRow.value?.id === editId.value ? draftRow.value : undefined))
const modalSubtitle = computed(() =>
  editMode.value === 'create'
    ? createBase.value
      ? 'La copie reprend ses champs ; ses flux et ses cartes ne sont pas copiés'
      : 'Elle sera créée dans la couche applicative'
    : draftRow.value
      ? 'Pas encore dans l’inventaire : elle y sera ajoutée à l’enregistrement'
      : editedRow.value
        ? `Créée le ${editedRow.value.creee} · modifiée le ${editedRow.value.modifiee}` : undefined,
)

const opts = (list: string[]): McSelectOption[] => list.map((v) => ({ value: v, label: v }))
const natureOptions = opts(['Application', 'Module applicatif'])
const statutOptions = opts(['Active', 'Prévue'])
const groupeOptions = opts(groupes)
const hebergementOptions = opts(['On-premise', 'SaaS'])
const machineOptions = opts(machines)
const editeurOptions = opts(editeurs)
const critOptions: McSelectOption[] = ([1, 2, 3, 4] as const).map((c) => ({ value: c, label: ['Faible', 'Modérée', 'Forte', 'Très forte'][c - 1], criticity: c }))

function toRow(f: Form, base: AppRow): AppRow {
  const c = (v: McSelectValue | null) => (Number(v ?? 0) as Criticity)
  return {
    ...base,
    name: f.name.trim(),
    nature: f.nature as AppRow['nature'],
    description: f.description,
    statut: f.statut as AppRow['statut'],
    groupe: String(f.groupe ?? ''),
    miseEnService: f.miseEnService,
    finDeService: f.finDeService,
    dicp: { d: c(f.d), i: c(f.i), c: c(f.c), p: c(f.p) },
    hebergement: f.hebergement as AppRow['hebergement'],
    machine: String(f.machine ?? ''),
    editeur: f.editeur ? String(f.editeur) : null,
    cout: f.cout,
    modifiee: today(),
  }
}

function save() {
  saving.value = true
  setTimeout(() => {
    saving.value = false
    editOpen.value = false
    const before = rows.value
    if (editMode.value === 'edit' && editedRow.value) {
      const updated = toRow(form.value, editedRow.value)
      const isNew = !rows.value.some((r) => r.id === updated.id)
      rows.value = isNew ? [...rows.value, updated] : rows.value.map((r) => (r.id === updated.id ? updated : r))
      draftRow.value = null
      toast.success(isNew ? `${updated.name} ajoutée à l’inventaire` : `${updated.name} enregistrée`, { actionLabel: 'Annuler', onAction: () => (rows.value = before) })
      emit('saved', updated, isNew ? 'added' : 'edit')
    } else {
      const id = Math.max(...rows.value.map((r) => r.id)) + 1
      const src = createBase.value
      const base: AppRow = src ? { ...src, id, flux: 0, creee: today() } : blankRow(id)
      const created = toRow(form.value, base)
      rows.value = [...rows.value, created]
      emit('saved', created, 'create')
      toast.success(src ? `${created.name} créée` : 'Application créée', { actionLabel: 'Annuler', onAction: () => (rows.value = before) })
      createBase.value = null
    }
  }, 600)
}

/** Ouvre l'application par son nom ou son identifiant d'adresse (« apogee ») : celle de l'inventaire,
 * sinon celle qu'une carte cite (elle rejoindra l'inventaire à l'enregistrement). Faux si elle est inconnue. */
function openApp(nameOrSlug: string, opts: { duplicate?: boolean; section?: string } = {}): boolean {
  const slug = slugOf(nameOrSlug)
  const inTable = rows.value.find((x) => slugOf(x.name) === slug && !deletedApps.has(slug))
  const known = getApplication(nameOrSlug) ?? getApplication(slug)
  const r = inTable ?? (known ? rowFromApp(known, Math.max(...rows.value.map((x) => x.id)) + 1) : undefined)
  if (!r) {
    toast.error(`Aucune application « ${nameOrSlug} » à modifier.`)
    return false
  }
  if (opts.duplicate) openCreate(r)
  else openEdit(r, opts.section)
  return true
}

defineExpose({ openEdit, openCreate, openApp })
</script>

<template>
  <McModal
    v-model:open="editOpen"
    v-model:section="section"
    :title="modalTitle"
    :type="{ label: 'Application', icon: 'app', layer: 'applicatif' }"
    :subtitle="modalSubtitle"
    size="lg"
    :sections="modalSections"
    :footer-note="footerNote"
    :confirm-label="editMode === 'create' ? 'Créer' : 'Enregistrer'"
    :confirm-disabled="errorCount > 0"
    :loading="saving"
    :dirty="changed.length > 0"
    @confirm="save"
  >
    <section data-section="general" class="mc-appedit-sec">
      <h3>Général</h3>
      <div class="mc-grid2">
        <McTextField v-model="form.name" label="Nom" required placeholder="ex. APOGEE" :modified="isMod('name')" :error="showErrors ? nameError : undefined" />
        <McSelect v-model="form.nature" label="Nature" :options="natureOptions" :modified="isMod('nature')" />
        <div class="mc-appedit-span2">
          <McTextField v-model="form.description" label="Description" placeholder="ex. Gestion des étudiants" :modified="isMod('description')" />
        </div>
        <McSelect v-model="form.statut" label="Statut" :options="statutOptions" :modified="isMod('statut')" />
        <McSelect v-model="form.groupe" label="Groupe propriétaire" required :options="groupeOptions" :modified="isMod('groupe')" />
      </div>
    </section>

    <section data-section="cycle" class="mc-appedit-sec">
      <h3>Cycle de vie</h3>
      <div class="mc-grid2">
        <McTextField v-model="form.miseEnService" label="Mise en service" icon-end="calendar" placeholder="JJ/MM/AAAA" :modified="isMod('miseEnService')" />
        <McTextField v-model="form.finDeService" label="Fin de service" icon-end="calendar" placeholder="JJ/MM/AAAA" help="Laissez vide si aucune fin n'est prévue." :modified="isMod('finDeService')" />
      </div>
    </section>

    <section data-section="dicp" class="mc-appedit-sec">
      <h3>Sécurité (DICP)</h3>
      <div class="mc-grid2">
        <McSelect v-model="form.d" label="Disponibilité" criticity-letter="D" :options="critOptions" clearable placeholder="Non renseignée" :modified="isMod('d')" />
        <McSelect v-model="form.i" label="Intégrité" criticity-letter="I" :options="critOptions" clearable placeholder="Non renseignée" :modified="isMod('i')" />
        <McSelect v-model="form.c" label="Confidentialité" criticity-letter="C" :options="critOptions" clearable placeholder="Non renseignée" :modified="isMod('c')" />
        <McSelect v-model="form.p" label="Preuve" criticity-letter="P" :options="critOptions" clearable placeholder="Non renseignée" :modified="isMod('p')" />
      </div>
      <p class="mc-cap mc-appedit-tip">Astuce : les niveaux DICP alimentent la lentille Criticité et le tableau de bord.</p>
    </section>

    <section data-section="hebergement" class="mc-appedit-sec">
      <h3>Hébergement</h3>
      <div class="mc-grid2">
        <McSelect v-model="form.hebergement" label="Mode d'hébergement" :options="hebergementOptions" :modified="isMod('hebergement')" />
        <McSelect v-model="form.machine" label="Machine" :options="machineOptions" clearable :modified="isMod('machine')" :disabled="form.hebergement === 'SaaS'" :help="form.hebergement === 'SaaS' ? 'Hébergée chez l’éditeur : pas de machine à lier.' : undefined" />
      </div>
    </section>

    <section data-section="fournisseur" class="mc-appedit-sec">
      <h3>Fournisseur et coûts</h3>
      <div class="mc-grid2">
        <McSelect
          v-model="form.editeur"
          label="Éditeur"
          required
          placeholder="Choisir un fournisseur"
          :options="editeurOptions"
          :modified="isMod('editeur')"
          :error="showErrors ? editorError : undefined"
        />
        <McTextField v-model="form.cout" label="Coût total de possession" placeholder="ex. 12 400" suffix="€ / an" :modified="isMod('cout')" />
      </div>
    </section>

    <section data-section="relations" class="mc-appedit-sec">
      <h3>Relations</h3>
      <p class="mc-cap mc-appedit-tip">
        <template v-if="editedRow && editMode === 'edit'">{{ editedRow.flux }} flux, {{ editedRow.machine ? '1 machine' : 'aucune machine' }}, 1 domaine. Elles se modifient depuis l’inspecteur.</template>
        <template v-else>Les relations se créent depuis l’inspecteur, une fois l’application enregistrée.</template>
      </p>
    </section>

    <section data-section="commentaire" class="mc-appedit-sec mc-appedit-last">
      <h3>Commentaire</h3>
      <McFormField v-slot="{ id, describedBy }" label="Commentaire" help="Visible par tous les contributeurs de la fiche." :modified="isMod('commentaire')" @reset="form.commentaire = original.commentaire">
        <div class="mc-input mc-textarea mc-appedit-textarea">
          <textarea :id="id" v-model="form.commentaire" rows="4" :aria-describedby="describedBy" placeholder="ex. Migration prévue vers la version SaaS en 2026" />
        </div>
      </McFormField>
    </section>
  </McModal>
</template>

<style>
.mc-appedit-sec { display: grid; gap: 14px; }
.mc-appedit-sec.mc-appedit-last { min-height: 260px; align-content: start; }
.mc-appedit-sec .mc-grid2 { align-items: start; }
.mc-appedit-span2 { grid-column: span 2; }
.mc-appedit-tip { margin: 0; }
.mc-appedit-textarea textarea { min-height: 72px; }
</style>
