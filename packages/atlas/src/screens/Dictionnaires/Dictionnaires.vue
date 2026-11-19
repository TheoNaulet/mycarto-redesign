<script setup lang="ts">
// Écran Dictionnaires : les listes de valeurs lues par les attributs « liste » des types d'objets.
// À gauche les dictionnaires ; au centre les valeurs (liste ou arborescence) à ajouter, renommer, supprimer ;
// à droite le détail de la valeur choisie. Tout se fait en mémoire, chaque changement s'annule depuis le toast.
import { computed, getCurrentInstance, nextTick, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goPath } from '../bridge'
import { dictionaries as seedDictionaries, valueCount, type DictValue, type Dictionary } from '../../data/dictionnaires'
import { objectTypes } from '../../data/metamodele'

const toast = useToast()
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x)) as T
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`

/* ---------- Dictionnaires ---------- */
const dicts = ref<Dictionary[]>(clone(seedDictionaries))
const currentId = ref(dicts.value[0].id)
const dict = computed(() => dicts.value.find((d) => d.id === currentId.value) ?? dicts.value[0])
const dictQuery = ref('')
const shownDicts = computed(() => {
  const q = norm(dictQuery.value)
  return q ? dicts.value.filter((d) => norm(d.name).includes(q)) : dicts.value
})

/** Un changement à annuler : tout l'état revient à la photo prise avant. */
function snapshot() {
  const before = clone(dicts.value)
  const sel = { dict: currentId.value, value: selectedId.value }
  return () => {
    dicts.value = before
    currentId.value = before.some((d) => d.id === sel.dict) ? sel.dict : before[0].id
    selectedId.value = sel.value
  }
}

/* ---------- Adresse : /dictionnaires?dictionnaire=statuts (identifiant ou nom) ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => {
  const q = (globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query
  if (q) return q as Record<string, unknown>
  return typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {}
})
watch(
  routeQuery,
  (q) => {
    const want = typeof q.dictionnaire === 'string' ? norm(q.dictionnaire) : ''
    if (!want) return
    const d = dicts.value.find((x) => x.id === want || norm(x.name) === want)
    if (d) currentId.value = d.id
  },
  { immediate: true },
)

/** « Application · Statut » → le type d'objet Application, pour ouvrir sa définition. */
function typeOfUse(use: string) {
  const label = norm(use.split(' · ')[0] ?? '')
  return objectTypes.find((t) => norm(t.label) === label)
}
function openUse(use: string) {
  const t = typeOfUse(use)
  goPath(t ? `/types-objets?type=${t.id}` : '/types-objets')
}

/* ---------- Valeurs : recherche, dépliage, sélection ---------- */
const expanded = ref<string[]>([])
const selectedId = ref<string | null>(null)
const valueQuery = ref('')

/** Parcourt les valeurs : la valeur, son parent et ses ancêtres (du plus haut au plus proche). */
function walk(list: DictValue[], fn: (v: DictValue, parent: DictValue | null, path: DictValue[]) => void, parent: DictValue | null = null, path: DictValue[] = []) {
  for (const v of list) {
    fn(v, parent, path)
    if (v.children) walk(v.children, fn, v, [...path, v])
  }
}
function find(id: string | null) {
  let hit: { v: DictValue; parent: DictValue | null; path: DictValue[] } | null = null
  if (id) walk(dict.value.values, (v, parent, path) => { if (v.id === id) hit = { v, parent, path } })
  return hit as { v: DictValue; parent: DictValue | null; path: DictValue[] } | null
}
const siblingsOf = (parentId: string | null) => (parentId ? (find(parentId)?.v.children ?? []) : dict.value.values)

/** Valeurs dont le libellé correspond à la recherche, avec leurs ancêtres pour garder le chemin. */
const matchIds = computed(() => {
  const q = norm(valueQuery.value)
  if (!q) return null
  const keep = new Set<string>()
  let hits = 0
  walk(dict.value.values, (v, _p, path) => {
    if (norm(v.label).includes(q)) {
      hits++
      keep.add(v.id)
      path.forEach((a) => keep.add(a.id))
    }
  })
  return { keep, hits }
})

interface Row {
  kind: 'value' | 'draft'
  v?: DictValue
  level: number
  parentId: string | null
}
const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const m = matchIds.value
  const visit = (list: DictValue[], level: number, parentId: string | null) => {
    for (const v of list) {
      if (m && !m.keep.has(v.id)) continue
      out.push({ kind: 'value', v, level, parentId })
      const open = m ? true : expanded.value.includes(v.id)
      if (v.children?.length && open) visit(v.children, level + 1, v.id)
      if (editing.value?.mode === 'add' && editing.value.parentId === v.id) out.push({ kind: 'draft', level: level + 1, parentId: v.id })
    }
  }
  visit(dict.value.values, 0, null)
  if (editing.value?.mode === 'add' && editing.value.parentId === null) out.push({ kind: 'draft', level: 0, parentId: null })
  return out
})
const total = computed(() => valueCount(dict.value.values))
const searchCount = computed(() => {
  const n = matchIds.value?.hits ?? 0
  return n ? `${n} résultat${n > 1 ? 's' : ''}` : 'Aucun résultat'
})
const isOpen = (id: string) => expanded.value.includes(id)
function toggle(id: string) {
  expanded.value = isOpen(id) ? expanded.value.filter((x) => x !== id) : [...expanded.value, id]
}
const allIds = () => {
  const ids: string[] = []
  walk(dict.value.values, (v) => v.children?.length && ids.push(v.id))
  return ids
}
const allOpen = computed(() => allIds().every((id) => expanded.value.includes(id)))
function toggleAll() {
  expanded.value = allOpen.value ? [] : allIds()
}

/* ---------- Saisie en ligne : ajouter et renommer ---------- */
interface Editing {
  mode: 'add' | 'rename'
  /** Valeur renommée. */
  id?: string
  /** Parent de la valeur ajoutée (null : premier niveau). */
  parentId: string | null
  draft: string
  tried: boolean
}
const editing = ref<Editing | null>(null)
const editInput = ref<HTMLInputElement[] | HTMLInputElement | null>(null)

async function focusEdit() {
  await nextTick()
  const el = Array.isArray(editInput.value) ? editInput.value[0] : editInput.value
  el?.focus()
  el?.select()
}
function cancelEdit() {
  editing.value = null
}
// Changer de dictionnaire : arborescence dépliée, sélection et saisie remises à zéro.
watch(
  currentId,
  () => {
    expanded.value = dict.value.tree ? dict.value.values.map((v) => v.id) : []
    selectedId.value = null
    valueQuery.value = ''
    cancelEdit()
  },
  { immediate: true },
)
const editError = computed(() => {
  const e = editing.value
  if (!e) return undefined
  const label = e.draft.trim()
  if (!label) return e.tried ? 'Saisissez un libellé.' : undefined
  const clash = siblingsOf(e.parentId).some((s) => s.id !== e.id && norm(s.label) === norm(label))
  return clash ? 'Cette valeur existe déjà à ce niveau.' : undefined
})

/** Ajoute une valeur : sous la valeur choisie (arborescence), sinon au premier niveau. */
function startAdd(parentId: string | null = null) {
  if (dict.value.tree && parentId === null) parentId = selectedId.value ?? dict.value.values[0]?.id ?? null
  if (parentId && !isOpen(parentId)) expanded.value = [...expanded.value, parentId]
  valueQuery.value = ''
  editing.value = { mode: 'add', parentId, draft: '', tried: false }
  focusEdit()
}
function startRename(v: DictValue) {
  valueQuery.value = valueQuery.value && norm(v.label).includes(norm(valueQuery.value)) ? valueQuery.value : ''
  editing.value = { mode: 'rename', id: v.id, parentId: find(v.id)?.parent?.id ?? null, draft: v.label, tried: false }
  selectedId.value = v.id
  focusEdit()
}
let seq = 0
function commitEdit() {
  const e = editing.value
  if (!e) return
  const label = e.draft.trim()
  if (!label) {
    if (e.mode === 'rename') return cancelEdit()
    e.tried = true
    return focusEdit()
  }
  if (editError.value) return focusEdit()
  const undo = snapshot()
  if (e.mode === 'rename') {
    const hit = find(e.id!)
    if (!hit || hit.v.label === label) return cancelEdit()
    const old = hit.v.label
    hit.v.label = label
    editing.value = null
    toast.success(`« ${old} » renommée en « ${label} »`, { actionLabel: 'Annuler', onAction: undo })
  } else {
    const nv: DictValue = { id: `n${++seq}-${Date.now()}`, label, usage: 0 }
    if (e.parentId) {
      const parent = find(e.parentId)!.v
      parent.children = [...(parent.children ?? []), nv]
    } else dict.value.values.push(nv)
    selectedId.value = nv.id
    editing.value = null
    const where = e.parentId ? ` sous « ${find(e.parentId)!.v.label} »` : ''
    toast.success(`Valeur « ${label} » ajoutée${where}`, { actionLabel: 'Annuler', onAction: undo })
  }
}
function onEditKey(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    commitEdit()
  } else if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    cancelEdit()
  }
}
/** En quittant le champ : on garde ce qui est valide, on abandonne un ajout vide. */
function onEditBlur() {
  const e = editing.value
  if (!e) return
  if (!e.draft.trim() && e.mode === 'add') return cancelEdit()
  if (!editError.value) commitEdit()
}

/* ---------- Suppression ---------- */
const deleteTarget = ref<DictValue | null>(null)
const deleteOpen = computed({
  get: () => !!deleteTarget.value,
  set: (o: boolean) => {
    if (!o) deleteTarget.value = null
  },
})
const usageOf = (v: DictValue): number => (v.usage ?? 0) + (v.children ?? []).reduce((n, c) => n + usageOf(c), 0)
const deleteText = computed(() => {
  const v = deleteTarget.value
  if (!v) return { sub: '', use: '' }
  const subs = valueCount(v.children ?? [])
  const n = usageOf(v)
  const noun = dict.value.noun
  const they = noun.feminine ? 'elles' : 'ils'
  const it = noun.feminine ? 'elle' : 'il'
  return {
    sub: subs ? `${subs > 1 ? `Ses ${subs} sous-valeurs seront aussi supprimées.` : 'Sa sous-valeur sera aussi supprimée.'}` : '',
    use: n
      ? `${plural(n, noun.one, noun.many)} ${n > 1 ? 'portent' : 'porte'} ${subs ? 'ces valeurs' : 'cette valeur'} : ${n > 1 ? they : it} ${n > 1 ? 'passeront' : 'passera'} à « Non renseigné ».`
      : 'Aucun objet ne porte cette valeur.',
  }
})
function askDelete(v: DictValue) {
  selectedId.value = v.id
  deleteTarget.value = v
}
function confirmDelete() {
  const v = deleteTarget.value
  if (!v) return
  const undo = snapshot()
  const hit = find(v.id)
  const list = hit?.parent ? hit.parent.children! : dict.value.values
  list.splice(list.indexOf(v), 1)
  if (hit?.parent && !hit.parent.children!.length) delete hit.parent.children
  selectedId.value = hit?.parent?.id ?? null
  deleteTarget.value = null
  toast.success(`Valeur « ${v.label} » supprimée`, { actionLabel: 'Annuler', onAction: undo })
}

/** Trie chaque niveau de A à Z. */
function sortAll() {
  const undo = snapshot()
  const sortList = (list: DictValue[]) => {
    list.sort((a, b) => a.label.localeCompare(b.label, 'fr', { sensitivity: 'base', numeric: true }))
    list.forEach((v) => v.children && sortList(v.children))
  }
  sortList(dict.value.values)
  toast.success('Valeurs triées de A à Z', { actionLabel: 'Annuler', onAction: undo })
}

/* ---------- Détail de la valeur choisie ---------- */
const selected = computed(() => find(selectedId.value))
const usageLabel = (v: DictValue) => {
  const n = usageOf(v)
  if (v.usage === undefined && !v.children?.length) return 'Usage non calculé'
  if (!n) return 'Aucun objet ne l’utilise'
  return `Utilisée par ${plural(n, dict.value.noun.one, dict.value.noun.many)}`
}
const rowUsage = (v: DictValue) => {
  const n = usageOf(v)
  return v.usage === undefined ? '' : String(n)
}
function onRowKey(e: KeyboardEvent, r: Row) {
  const v = r.v!
  if (e.key === 'F2') {
    e.preventDefault()
    startRename(v)
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault()
    askDelete(v)
  } else if (e.key === 'ArrowRight' && v.children?.length && !isOpen(v.id)) toggle(v.id)
  else if (e.key === 'ArrowLeft' && v.children?.length && isOpen(v.id)) toggle(v.id)
}

/* ---------- Créer, renommer, supprimer un dictionnaire ---------- */
const dictModal = ref<'create' | 'rename' | null>(null)
const dictForm = ref({ name: '', description: '', structure: 'liste', tried: false })
const dictOpen = computed({
  get: () => dictModal.value !== null,
  set: (o: boolean) => {
    if (!o) dictModal.value = null
  },
})
function openCreateDict() {
  dictForm.value = { name: '', description: '', structure: 'liste', tried: false }
  dictModal.value = 'create'
}
function openRenameDict() {
  dictForm.value = { name: dict.value.name, description: dict.value.description, structure: dict.value.tree ? 'arbre' : 'liste', tried: false }
  dictModal.value = 'rename'
}
const dictError = computed(() => {
  const name = dictForm.value.name.trim()
  if (!name) return dictForm.value.tried ? 'Donnez un nom au dictionnaire.' : undefined
  const clash = dicts.value.some((d) => norm(d.name) === norm(name) && !(dictModal.value === 'rename' && d.id === dict.value.id))
  return clash ? 'Un dictionnaire porte déjà ce nom.' : undefined
})
const dictDirty = computed(() =>
  dictModal.value === 'rename' ? dictForm.value.name !== dict.value.name || dictForm.value.description !== dict.value.description : !!dictForm.value.name.trim(),
)
function saveDict() {
  dictForm.value.tried = true
  const name = dictForm.value.name.trim()
  if (!name || dictError.value) return
  const undo = snapshot()
  if (dictModal.value === 'rename') {
    const old = dict.value.name
    dict.value.name = name
    dict.value.description = dictForm.value.description.trim()
    toast.success(old === name ? 'Dictionnaire enregistré' : `Dictionnaire renommé en « ${name} »`, { actionLabel: 'Annuler', onAction: undo })
  } else {
    const tree = dictForm.value.structure === 'arbre'
    const d: Dictionary = {
      id: `dict-${++seq}-${Date.now()}`,
      name,
      description: dictForm.value.description.trim() || 'Nouvelle liste de valeurs.',
      usedBy: [],
      tree,
      noun: { one: 'objet', many: 'objets', feminine: false },
      values: tree ? [{ id: `n${++seq}-${Date.now()}`, label: 'Racine', usage: 0 }] : [],
    }
    dicts.value.push(d)
    currentId.value = d.id
    toast.success(`Dictionnaire « ${name} » créé`, { actionLabel: 'Annuler', onAction: undo })
    nextTick(() => startAdd(tree ? d.values[0].id : null))
  }
  dictModal.value = null
}

const dictDeleteOpen = ref(false)
function confirmDeleteDict() {
  const undo = snapshot()
  const d = dict.value
  dicts.value = dicts.value.filter((x) => x.id !== d.id)
  currentId.value = dicts.value[0]?.id ?? ''
  dictDeleteOpen.value = false
  toast.success(`Dictionnaire « ${d.name} » supprimé`, { actionLabel: 'Annuler', onAction: undo })
}
const dictDeleteText = computed(() => {
  const d = dict.value
  const n = valueCount(d.values)
  const attrs = d.usedBy.length
  return `${n ? `Ses ${plural(n, 'valeur', 'valeurs')} ${n > 1 ? 'seront supprimées' : 'sera supprimée'}.` : 'Il ne contient aucune valeur.'} ${
    attrs ? `${attrs > 1 ? `Les ${attrs} attributs qui le lisent` : 'L’attribut qui le lit'} (${d.usedBy.join(', ')}) ${attrs > 1 ? 'deviendront' : 'deviendra'} du texte libre.` : 'Aucun attribut ne le lit.'
  }`
})
</script>

<template>
  <div class="mc-scr-dc">
    <AdminNav active="Dictionnaires" />

    <!-- Dictionnaires -->
    <nav class="mc-scr-dc-list" aria-label="Dictionnaires">
      <span class="mc-over mc-scr-dc-listhd">Dictionnaires · {{ dicts.length }}</span>
      <McSearchField v-model="dictQuery" size="sm" placeholder="Filtrer les dictionnaires" />
      <button
        v-for="d in shownDicts"
        :key="d.id"
        type="button"
        class="mc-scr-dc-it"
        :class="{ 'is-on': d.id === currentId }"
        :aria-current="d.id === currentId ? 'true' : undefined"
        @click="currentId = d.id"
      >
        <span class="mc-scr-dc-th"><McIcon :name="d.tree ? 'layers' : 'list'" size="sm" /></span>
        <span class="mc-scr-dc-itx">
          <span class="mc-scr-dc-itn">{{ d.name }}</span>
          <span class="mc-cap">{{ plural(valueCount(d.values), 'valeur', 'valeurs') }}{{ d.tree ? ' · arborescence' : '' }}</span>
        </span>
      </button>
      <p v-if="!shownDicts.length" class="mc-cap mc-scr-dc-none">Aucun dictionnaire ne correspond à « {{ dictQuery }} ».</p>
      <McButton variant="outline" size="sm" icon="plus" class="mc-scr-dc-new" @click="openCreateDict">Nouveau dictionnaire</McButton>
    </nav>

    <main class="mc-scr-dc-main">
      <template v-if="dicts.length">
        <header class="mc-scr-dc-head">
          <div class="mc-scr-dc-titles">
            <p class="mc-over">Dictionnaire{{ dict.tree ? ' en arborescence' : '' }}</p>
            <h1 class="title-lg">{{ dict.name }}</h1>
            <p class="mc-scr-dc-desc">{{ dict.description }}</p>
          </div>
          <McButton variant="outline" icon="pencil" @click="openRenameDict">Renommer</McButton>
          <McIconButton icon="trash" variant="danger" label="Supprimer le dictionnaire" @click="dictDeleteOpen = true" />
          <McButton icon="plus" @click="startAdd()">Ajouter une valeur</McButton>
        </header>

        <div class="mc-scr-dc-body">
          <section class="mc-scr-dc-values" aria-label="Valeurs">
            <div class="mc-scr-dc-tools">
              <McSearchField v-model="valueQuery" size="sm" class="mc-scr-dc-search" placeholder="Rechercher une valeur" :count="valueQuery ? searchCount : undefined" />
              <span class="mc-cap">{{ plural(total, 'valeur', 'valeurs') }}</span>
              <span class="mc-scr-dc-grow" />
              <McButton v-if="dict.tree" variant="ghost" size="sm" :icon="allOpen ? 'minus' : 'plus'" @click="toggleAll">{{ allOpen ? 'Tout replier' : 'Tout déplier' }}</McButton>
              <McButton variant="ghost" size="sm" icon="filter" :disabled="total < 2" @click="sortAll">Trier de A à Z</McButton>
            </div>

            <ul v-if="rows.length" class="mc-scr-dc-rows" :class="{ 'is-tree': dict.tree }" role="list">
              <li
                v-for="r in rows"
                :key="r.kind === 'draft' ? `draft-${r.parentId}` : r.v!.id"
                class="mc-scr-dc-row"
                :class="{ 'is-sel': r.kind === 'value' && r.v!.id === selectedId, 'is-draft': r.kind === 'draft' }"
                :style="{ '--lvl': r.level }"
              >
                <!-- Ajout ou renommage en ligne -->
                <template v-if="r.kind === 'draft' || (editing?.mode === 'rename' && editing.id === r.v!.id)">
                  <span class="mc-scr-dc-chev" aria-hidden="true" />
                  <div class="mc-scr-dc-edit">
                    <div class="mc-input sm" :class="{ 'is-error': !!editError }">
                      <input
                        ref="editInput"
                        v-model="editing!.draft"
                        :aria-label="editing!.mode === 'add' ? 'Libellé de la nouvelle valeur' : `Nouveau libellé de ${r.v?.label}`"
                        :aria-invalid="!!editError"
                        :placeholder="editing!.mode === 'add' ? (r.parentId ? `ex. nouvelle valeur sous « ${find(r.parentId)?.v.label} »` : 'ex. nouvelle valeur') : undefined"
                        @keydown="onEditKey"
                        @blur="onEditBlur"
                      />
                    </div>
                    <span class="mc-cap" :class="{ 'mc-scr-dc-err': editError }">{{ editError ?? 'Entrée pour valider, Échap pour annuler' }}</span>
                  </div>
                  <span class="mc-scr-dc-acts is-shown">
                    <McIconButton size="sm" icon="check" label="Valider" @mousedown.prevent @click="commitEdit" />
                    <McIconButton size="sm" icon="x" label="Annuler la saisie" @mousedown.prevent @click="cancelEdit" />
                  </span>
                </template>

                <template v-else>
                  <button
                    v-if="r.v!.children?.length"
                    type="button"
                    class="mc-scr-dc-chev"
                    :class="{ 'is-open': isOpen(r.v!.id) || !!matchIds }"
                    :aria-expanded="isOpen(r.v!.id) || !!matchIds"
                    :aria-label="`${isOpen(r.v!.id) ? 'Replier' : 'Déplier'} ${r.v!.label}`"
                    :disabled="!!matchIds"
                    @click="toggle(r.v!.id)"
                  >
                    <McIcon name="chevron-right" size="sm" />
                  </button>
                  <span v-else class="mc-scr-dc-chev" aria-hidden="true" />
                  <button type="button" class="mc-scr-dc-lbl" :aria-pressed="r.v!.id === selectedId" @click="selectedId = r.v!.id" @dblclick="startRename(r.v!)" @keydown="onRowKey($event, r)">
                    <McIcon v-if="dict.tree" :name="r.level === 0 && r.v!.children?.length ? 'folder' : dict.id === 'contribution-flux' ? 'app' : 'dashed-circle'" size="sm" class="mc-scr-dc-ic" />
                    <span class="mc-scr-dc-name">{{ r.v!.label }}</span>
                    <span v-if="r.v!.children?.length" class="mc-count">{{ r.v!.children.length }}</span>
                  </button>
                  <span class="mc-scr-dc-use" :title="usageLabel(r.v!)">{{ rowUsage(r.v!) }}</span>
                  <span class="mc-scr-dc-acts">
                    <McIconButton v-if="dict.tree" size="sm" icon="plus" :label="`Ajouter une sous-valeur à ${r.v!.label}`" @click="startAdd(r.v!.id)" />
                    <McIconButton size="sm" icon="pencil" :label="`Renommer ${r.v!.label}`" @click="startRename(r.v!)" />
                    <McIconButton size="sm" icon="trash" variant="danger" :label="`Supprimer ${r.v!.label}`" @click="askDelete(r.v!)" />
                  </span>
                </template>
              </li>
            </ul>
            <McEmptyState
              v-else-if="valueQuery"
              size="compact"
              title="Aucune valeur ne correspond"
              :text="`Rien ne contient « ${valueQuery} » dans ${dict.name}.`"
            >
              <template #action><McButton variant="outline" size="sm" icon="x" @click="valueQuery = ''">Effacer la recherche</McButton></template>
            </McEmptyState>
            <McEmptyState v-else size="compact" icon="list" title="Ce dictionnaire est vide" text="Ajoutez la première valeur : elle sera proposée dans les attributs qui lisent cette liste.">
              <template #action><McButton variant="outline" size="sm" icon="plus" @click="startAdd()">Ajouter une valeur</McButton></template>
            </McEmptyState>
            <p class="mc-cap mc-scr-dc-hint">Double-clic ou F2 pour renommer, Suppr pour supprimer.</p>
          </section>

          <!-- Détail -->
          <aside class="mc-scr-dc-side" aria-label="Détail">
            <template v-if="selected">
              <span class="mc-over">Valeur</span>
              <h2 class="mc-scr-dc-h2">{{ selected.v.label }}</h2>
              <p v-if="selected.path.length" class="mc-cap mc-scr-dc-path">{{ [...selected.path.map((p) => p.label), selected.v.label].join(' › ') }}</p>
              <dl class="mc-scr-dc-kv">
                <dt>Usage</dt>
                <dd>{{ usageLabel(selected.v) }}</dd>
                <template v-if="dict.tree">
                  <dt>Sous-valeurs</dt>
                  <dd>{{ selected.v.children?.length ? plural(valueCount(selected.v.children), 'sous-valeur', 'sous-valeurs') : 'Aucune' }}</dd>
                </template>
              </dl>
              <div class="mc-scr-dc-sideacts">
                <McButton variant="outline" size="sm" icon="pencil" @click="startRename(selected.v)">Renommer</McButton>
                <McButton v-if="dict.tree" variant="outline" size="sm" icon="plus" @click="startAdd(selected.v.id)">Ajouter une sous-valeur</McButton>
                <McButton variant="ghost" size="sm" icon="trash" @click="askDelete(selected.v)">Supprimer</McButton>
              </div>
            </template>
            <template v-else>
              <span class="mc-over">Lu par</span>
              <ul v-if="dict.usedBy.length" class="mc-scr-dc-attrs">
                <li v-for="a in dict.usedBy" :key="a">
                  <button type="button" class="mc-scr-dc-use-link" :title="`Voir l’attribut dans le type ${typeOfUse(a)?.label ?? ''}`" @click="openUse(a)"><McIcon name="link" size="sm" />{{ a }}</button>
                </li>
              </ul>
              <p v-else class="mc-cap">Aucun attribut ne lit encore ce dictionnaire. Reliez-le depuis les types d’objets.</p>
              <McButton variant="outline" size="sm" icon="layers" class="mc-scr-dc-meta" @click="goPath('/types-objets')">Voir les types d’objets</McButton>
              <hr class="mc-hr" />
              <p class="mc-cap">Choisissez une valeur pour voir son usage et la modifier.</p>
            </template>
          </aside>
        </div>
      </template>

      <McEmptyState v-else icon="book" title="Aucun dictionnaire" text="Créez une liste de valeurs pour la proposer dans les attributs des types d’objets.">
        <template #action><McButton icon="plus" @click="openCreateDict">Nouveau dictionnaire</McButton></template>
      </McEmptyState>
    </main>

    <!-- Supprimer une valeur -->
    <McModal
      v-model:open="deleteOpen"
      danger
      :title="`Supprimer « ${deleteTarget?.label ?? ''} » ?`"
      confirm-label="Supprimer"
      confirm-icon="trash"
      @confirm="confirmDelete"
    >
      <p class="mc-scr-dc-mtext">
        {{ [deleteText.sub, deleteText.use].filter(Boolean).join(' ') }}
      </p>
      <p class="mc-cap">Vous pourrez annuler depuis le message de confirmation.</p>
    </McModal>

    <!-- Créer ou renommer un dictionnaire -->
    <McModal
      v-model:open="dictOpen"
      :title="dictModal === 'create' ? 'Nouveau dictionnaire' : `Renommer ${dict?.name ?? ''}`"
      :confirm-label="dictModal === 'create' ? 'Créer' : 'Enregistrer'"
      :confirm-disabled="!!dictError"
      :dirty="dictDirty"
      @confirm="saveDict"
    >
      <div class="mc-scr-dc-form">
        <McTextField v-model="dictForm.name" label="Nom" required placeholder="ex. Types de licence" :error="dictError" />
        <McTextField v-model="dictForm.description" label="Description" placeholder="ex. Les modes de licence des logiciels" />
        <div v-if="dictModal === 'create'" class="mc-field">
          <span class="mc-field-label">Structure</span>
          <McToggleGroup
            v-model="dictForm.structure"
            label="Structure"
            :options="[
              { value: 'liste', label: 'Liste', icon: 'list' },
              { value: 'arbre', label: 'Arborescence', icon: 'layers' },
            ]"
          />
          <span class="mc-cap">{{ dictForm.structure === 'arbre' ? 'Les valeurs se rangent sous une racine, sur plusieurs niveaux.' : 'Une liste simple, sur un seul niveau.' }}</span>
        </div>
      </div>
    </McModal>

    <!-- Supprimer un dictionnaire -->
    <McModal
      v-model:open="dictDeleteOpen"
      danger
      :title="`Supprimer ${dict?.name ?? ''} ?`"
      confirm-label="Supprimer le dictionnaire"
      confirm-icon="trash"
      @confirm="confirmDeleteDict"
    >
      <p v-if="dict" class="mc-scr-dc-mtext">{{ dictDeleteText }}</p>
    </McModal>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-dc-use-link { display: inline-flex; align-items: center; gap: 6px; padding: 0; border: 0; background: none; font: inherit; color: var(--accent); text-align: left; cursor: pointer; }
.mc-scr-dc-use-link:hover { text-decoration: underline; }
.mc-scr-dc-use-link:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
.mc-scr-dc { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }

.mc-scr-dc-list { width: 260px; flex: none; display: flex; flex-direction: column; gap: 4px; padding: 16px 12px; border-right: 1px solid var(--line); background: var(--surface); box-sizing: border-box; overflow-y: auto; }
.mc-scr-dc-listhd { padding: 0 10px 6px; }
.mc-scr-dc-list .mc-search, .mc-scr-dc-list > .mc-input { margin-bottom: 6px; }
.mc-scr-dc-it { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: inherit; font-size: 13px; line-height: 18px; text-align: left; cursor: pointer; }
.mc-scr-dc-it:hover { background: var(--surface-sunken); }
.mc-scr-dc-it.is-on { background: var(--accent-soft); }
.mc-scr-dc-it.is-on .mc-scr-dc-itn { font-weight: 600; }
.mc-scr-dc-it:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
.mc-scr-dc-th { width: 28px; height: 28px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; flex: none; background: var(--surface-sunken); color: var(--ink-muted); }
.mc-scr-dc-it.is-on .mc-scr-dc-th { background: var(--surface); color: var(--accent); }
.mc-scr-dc-itx { flex: 1; min-width: 0; display: grid; }
.mc-scr-dc-itn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-dc-none { margin: 4px 10px; }
.mc-scr-dc-new { margin-top: 8px; align-self: flex-start; }

.mc-scr-dc-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; container-type: inline-size; }
.mc-scr-dc-head { display: flex; align-items: flex-start; gap: 10px; flex-wrap: wrap; }
.mc-scr-dc-titles { flex: 1; min-width: 220px; }
.mc-scr-dc-titles .mc-over { margin: 0 0 2px; }
.mc-scr-dc-titles h1 { margin: 0; }
.mc-scr-dc-desc { margin: 4px 0 0; font-size: 13px; line-height: 18px; color: var(--ink-muted); max-width: 640px; }

.mc-scr-dc-body { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 18px; align-items: start; }
.mc-scr-dc-values { display: grid; gap: 10px; min-width: 0; }
.mc-scr-dc-tools { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.mc-scr-dc-search { width: 260px; }
.mc-scr-dc-grow { flex: 1; }
.mc-scr-dc-hint { margin: 0; }

.mc-scr-dc-rows { list-style: none; margin: 0; padding: 4px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-dc-row { --lvl: 0; display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 2px 6px 2px calc(6px + var(--lvl) * 22px); border-radius: var(--radius-sm); }
.mc-scr-dc-row:hover { background: var(--surface-sunken); }
.mc-scr-dc-row.is-sel { background: var(--accent-soft); }
.mc-scr-dc-row.is-draft, .mc-scr-dc-row.is-draft:hover { background: transparent; align-items: flex-start; padding-block: 6px; }
.mc-scr-dc-rows:not(.is-tree) .mc-scr-dc-chev { display: none; }
.mc-scr-dc-chev { width: 22px; height: 22px; flex: none; display: inline-flex; align-items: center; justify-content: center; padding: 0; border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--ink-subtle); cursor: pointer; }
button.mc-scr-dc-chev:hover { color: var(--ink); background: var(--surface); }
button.mc-scr-dc-chev:disabled { cursor: default; }
.mc-scr-dc-chev .mc-ico { transition: transform .12s ease-out; }
.mc-scr-dc-chev.is-open .mc-ico { transform: rotate(90deg); }
.mc-scr-dc-chev:focus-visible, .mc-scr-dc-lbl:focus-visible { outline: 2px solid var(--focus); outline-offset: 1px; }
.mc-scr-dc-lbl { flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px; height: 30px; padding: 0 6px; border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--ink); font: 400 14px/20px var(--font-sans); text-align: left; cursor: pointer; }
.mc-scr-dc-row.is-sel .mc-scr-dc-lbl { font-weight: 600; }
.mc-scr-dc-ic { color: var(--ink-subtle); flex: none; }
.mc-scr-dc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-dc-use { min-width: 32px; text-align: right; font-size: 12px; line-height: 16px; color: var(--ink-muted); font-variant-numeric: tabular-nums; }
.mc-scr-dc-acts { display: flex; gap: 2px; opacity: 0; }
.mc-scr-dc-row:hover .mc-scr-dc-acts, .mc-scr-dc-row:focus-within .mc-scr-dc-acts, .mc-scr-dc-row.is-sel .mc-scr-dc-acts, .mc-scr-dc-acts.is-shown { opacity: 1; }
.mc-scr-dc-edit { flex: 1; min-width: 0; display: grid; gap: 4px; }
.mc-scr-dc-edit input { font: inherit; }
.mc-scr-dc-err { color: var(--status-critical); }

.mc-scr-dc-side { background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); padding: 16px; display: grid; gap: 10px; align-content: start; position: sticky; top: 0; }
.mc-scr-dc-h2 { margin: 0; font: 600 16px/22px var(--font-display); overflow-wrap: anywhere; }
.mc-scr-dc-path { margin: -4px 0 0; overflow-wrap: anywhere; }
.mc-scr-dc-kv { display: grid; grid-template-columns: auto 1fr; gap: 6px 12px; margin: 4px 0; font-size: 13px; line-height: 18px; }
.mc-scr-dc-kv dt { color: var(--ink-muted); }
.mc-scr-dc-kv dd { margin: 0; }
.mc-scr-dc-sideacts { display: flex; flex-wrap: wrap; gap: 6px; }
.mc-scr-dc-attrs { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; font-size: 13px; line-height: 18px; }
.mc-scr-dc-attrs li { display: flex; align-items: center; gap: 8px; }
.mc-scr-dc-attrs .mc-ico { color: var(--ink-subtle); }
.mc-scr-dc-meta { justify-self: start; }
.mc-scr-dc-side .mc-hr { margin: 2px 0; }
.mc-scr-dc-side .mc-cap { margin: 0; }

.mc-scr-dc-mtext { margin: 0 0 8px; font-size: 14px; line-height: 20px; }
.mc-scr-dc-form { display: grid; gap: 14px; }
.mc-scr-dc-form .mc-field { display: grid; gap: 6px; justify-items: start; }

@media (min-width: 1800px) {
  .mc-scr-dc-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
  .mc-scr-dc-body { grid-template-columns: minmax(0, 1fr) 340px; gap: 24px; }
  .mc-scr-dc-list { width: 280px; }
}
@media (max-width: 1360px) {
  .mc-scr-dc-list { width: 220px; }
  .mc-scr-dc-main { padding: 20px 22px; }
}
@container (max-width: 760px) {
  .mc-scr-dc-body { grid-template-columns: minmax(0, 1fr); }
  .mc-scr-dc-side { position: static; }
  .mc-scr-dc-search { width: 200px; }
}
@media (prefers-reduced-motion: reduce) {
  .mc-scr-dc-chev .mc-ico { transition: none; }
}
</style>
