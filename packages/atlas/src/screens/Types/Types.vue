<script setup lang="ts">
// Écran Types d'objets : le méta-modèle. Les types rangés par couche, leurs attributs (à modifier, ajouter, supprimer)
// et leurs relations, dites en mots et dessinées autour du type choisi.
import { computed, getCurrentInstance, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McTree, { type TreeNode } from '../../components/McTree/McTree.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn } from '../../components/McDataTable/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McModal from '../../components/McModal/McModal.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goToScreen } from '../Explorateur/shell'
import { goPath, inApp } from '../bridge'
import {
  attributeKinds,
  dictionnaireNames,
  isMandatory,
  objectTypes,
  targetPhrase,
  typeGroups,
  type Attribute,
  type AttributeKind,
  type ObjectType,
  type Relation,
} from '../../data/metamodele'
import { dictionaries as seedDictionaries } from '../../data/dictionnaires'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/* ---------- Méta-modèle, modifiable en mémoire ---------- */
const types = ref<ObjectType[]>(JSON.parse(JSON.stringify(objectTypes)) as ObjectType[])
const typeOf = (id: string) => types.value.find((t) => t.id === id)

/* ---------- Arbre des types ---------- */
const typeId = ref<string | null>('application')
const expanded = ref<string[]>(['applicatif'])
const query = ref('')

const tree = computed<TreeNode[]>(() =>
  typeGroups.map((g) => ({
    id: g.id,
    label: g.label,
    layer: g.layer,
    children: types.value.filter((t) => t.group === g.id).map((t) => ({ id: t.id, label: t.label, count: t.attributes.length })),
  })),
)
const shownTree = computed<TreeNode[]>(() => {
  const q = norm(query.value.trim())
  if (!q) return tree.value
  return tree.value
    .map((g) => (norm(g.label).includes(q) ? g : { ...g, children: g.children?.filter((c) => norm(c.label).includes(q)) }))
    .filter((g) => g.children?.length)
})
const treeExpanded = computed({
  get: () => (query.value.trim() ? shownTree.value.map((g) => g.id) : expanded.value),
  set: (v: string[]) => {
    if (!query.value.trim()) expanded.value = v
  },
})
// Un groupe de l'arbre n'est pas un type : le choisir le déplie et garde le type affiché.
watch(typeId, (id, old) => {
  if (id && !typeOf(id)) {
    if (!expanded.value.includes(id)) expanded.value = [...expanded.value, id]
    typeId.value = old ?? 'application'
  }
})
function selectType(id: string) {
  const t = typeOf(id)
  if (!t) return
  if (!expanded.value.includes(t.group)) expanded.value = [...expanded.value, t.group]
  query.value = ''
  typeId.value = id
}

/* ---------- Adresse : /types-objets?type=machine ---------- */
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => ((globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query ?? {}) as Record<string, unknown>)
watch(
  routeQuery,
  (q) => {
    if (typeof q.type === 'string' && typeOf(q.type)) selectType(q.type)
  },
  { immediate: true },
)

const type = computed(() => typeOf(typeId.value ?? 'application') ?? types.value[0])
const group = computed(() => typeGroups.find((g) => g.id === type.value.group)!)
const article = (t: ObjectType) => (t.feminine ? 'Une' : 'Un')
const requiredCount = computed(() => type.value.attributes.filter((a) => a.required).length)
const summary = computed(() => {
  const n = type.value.attributes.length
  const r = requiredCount.value
  const req = r === 0 ? 'aucun obligatoire' : `dont ${plural(r, 'obligatoire', 'obligatoires')}`
  return `${plural(n, 'attribut', 'attributs')}, ${req} · ${plural(type.value.relations.length, 'relation', 'relations')}`
})

/** Les types qui ont leur propre écran y mènent ; les autres s'ouvrent dans l'explorateur, filtré sur le type. */
const OWN_SCREEN: Record<string, string> = {
  machine: '/machines',
  logiciel: '/logiciels',
  fournisseur: '/fournisseurs',
  contrat: '/contrats',
  projet: '/projets',
  processus: '/processus',
  diagramme: '/processus',
}
function openObjects() {
  const own = OWN_SCREEN[type.value.id]
  if (own) goPath(own)
  else if (inApp()) goPath(`/explorateur?type=${type.value.id}`)
  else goToScreen('explorateur')
}

/** Un attribut « liste » mène à son dictionnaire. */
const dictId = (name: string) => seedDictionaries.find((d) => d.name === name)?.id
function openDict(name: string) {
  const id = dictId(name)
  goPath(id ? `/dictionnaires?dictionnaire=${id}` : '/dictionnaires')
}

/* ---------- Attributs ---------- */
const columns: DataTableColumn<Attribute>[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'type', label: 'Type', sortable: true },
  { key: 'required', label: 'Saisie', sortable: true, sortValue: (a) => (a.required ? 0 : 1) },
  { key: 'dictionnaire', label: 'Dictionnaire', muted: true },
]
const isLocked = (a: Attribute) => a.id === type.value.attributes[0]?.id

/** Remet la liste des attributs d'un type telle qu'elle était. */
function snapshot(t: ObjectType) {
  const before = t.attributes.map((a) => ({ ...a }))
  return () => {
    const live = typeOf(t.id)
    if (live) live.attributes = before
  }
}

/* ---------- Modale : modifier ou ajouter un attribut ---------- */
interface Form {
  name: string
  type: McSelectValue | null
  required: boolean
  dictionnaire: McSelectValue | null
}
const blank = (): Form => ({ name: '', type: 'Texte', required: false, dictionnaire: null })
const editOpen = ref(false)
const editMode = ref<'edit' | 'create'>('edit')
const editId = ref<string | null>(null)
const form = ref<Form>(blank())
const original = ref<Form>(blank())
const tried = ref(false)

const kindOptions: McSelectOption[] = attributeKinds.map((k) => ({ value: k, label: k }))
const dictOptions: McSelectOption[] = dictionnaireNames.map((d) => ({ value: d, label: d }))
const isList = computed(() => form.value.type === 'Liste (dictionnaire)')

function openEdit(a: Attribute) {
  editMode.value = 'edit'
  editId.value = a.id
  form.value = { name: a.name, type: a.type, required: a.required, dictionnaire: a.dictionnaire ?? null }
  original.value = { ...form.value }
  tried.value = false
  editOpen.value = true
}
function openCreate() {
  editMode.value = 'create'
  editId.value = null
  form.value = blank()
  original.value = blank()
  tried.value = false
  editOpen.value = true
}

const nameError = computed(() => {
  const n = form.value.name.trim()
  if (!n) return 'Saisissez un nom.'
  const dup = type.value.attributes.find((a) => a.id !== editId.value && norm(a.name) === norm(n))
  return dup ? `« ${dup.name} » existe déjà pour ce type. Choisissez un autre nom.` : undefined
})
const dictError = computed(() => (isList.value && !form.value.dictionnaire ? 'Choisissez le dictionnaire qui donne les valeurs.' : undefined))
const shownNameError = computed(() => (tried.value || form.value.name.trim() || editMode.value === 'edit' ? nameError.value : undefined))
const shownDictError = computed(() => (tried.value || editMode.value === 'edit' ? dictError.value : undefined))
const changed = computed(() => JSON.stringify(form.value) !== JSON.stringify(original.value))
const locked = computed(() => editMode.value === 'edit' && !!editId.value && editId.value === type.value.attributes[0]?.id)

function save() {
  tried.value = true
  if (nameError.value || dictError.value) return
  const t = type.value
  const undo = snapshot(t)
  const value: Omit<Attribute, 'id'> = {
    name: form.value.name.trim(),
    type: form.value.type as AttributeKind,
    required: form.value.required,
    ...(isList.value && form.value.dictionnaire ? { dictionnaire: String(form.value.dictionnaire) } : {}),
  }
  if (editMode.value === 'edit' && editId.value) {
    t.attributes = t.attributes.map((a) => (a.id === editId.value ? { id: a.id, ...value } : a))
    toast.success(`Attribut « ${value.name} » enregistré`, { actionLabel: 'Annuler', onAction: undo })
  } else {
    let n = t.attributes.length + 1
    while (t.attributes.some((a) => a.id === `${t.id}-${n}`)) n++
    t.attributes = [...t.attributes, { id: `${t.id}-${n}`, ...value }]
    toast.success(`Attribut « ${value.name} » ajouté aux ${t.many}`, { actionLabel: 'Annuler', onAction: undo })
  }
  editOpen.value = false
}

/* ---------- Suppression ---------- */
const deleting = ref<Attribute | null>(null)
const deleteOpen = computed({
  get: () => !!deleting.value,
  set: (v: boolean) => {
    if (!v) deleting.value = null
  },
})
function confirmDelete() {
  const a = deleting.value
  if (!a) return
  const t = type.value
  const undo = snapshot(t)
  t.attributes = t.attributes.filter((x) => x.id !== a.id)
  deleting.value = null
  toast.success(`Attribut « ${a.name} » supprimé`, { actionLabel: 'Annuler', onAction: undo })
}

/* ---------- Relations ---------- */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)
const relTarget = (r: Relation) => typeOf(r.target)!
const viaText = (r: Relation) => {
  const v = r.via ? typeOf(r.via) : undefined
  return v ? `, par des ${v.many}` : ''
}

/* ---------- Schéma : le type au centre, ses cibles autour ---------- */
const W = 460
const H = 320
const CX = W / 2
const CY = H / 2
const NW = 116
const NH = 32
const CW = 140
const CH = 40

interface DNode {
  id: string
  t: ObjectType
  x: number
  y: number
  label: string
  self: boolean
  mandatory: boolean
}
/** Point où la droite centre → cible sort d'une boîte de w × h centrée en (x, y). */
function exitPoint(x: number, y: number, dx: number, dy: number, w: number, h: number) {
  const k = Math.min(dx ? w / 2 / Math.abs(dx) : Infinity, dy ? h / 2 / Math.abs(dy) : Infinity)
  return { x: x + dx * k, y: y + dy * k }
}
const diagram = computed(() => {
  const byTarget = new Map<string, Relation[]>()
  for (const r of type.value.relations) byTarget.set(r.target, [...(byTarget.get(r.target) ?? []), r])
  const entries = [...byTarget.entries()]
  const n = entries.length
  // Du haut, dans le sens des aiguilles d'une montre ; jamais pile à gauche ou à droite, où le trait serait trop court pour son verbe.
  const step = 360 / Math.max(n, 1)
  const start = -90 + (n % 4 === 0 ? step / 2 : 0)
  const nodes: DNode[] = entries.map(([target, rels], i) => {
    const a = ((start + i * step) * Math.PI) / 180
    const t = typeOf(target)!
    return {
      id: target,
      t,
      x: CX + 168 * Math.cos(a),
      y: CY + 120 * Math.sin(a),
      label: rels.map((r) => r.verb).join(' · '),
      self: target === type.value.id,
      mandatory: rels.some((r) => isMandatory(r.cardinality)),
    }
  })
  const edges = nodes.map((nd) => {
    const dx = nd.x - CX
    const dy = nd.y - CY
    const s = exitPoint(CX, CY, dx, dy, CW, CH)
    const e = exitPoint(nd.x, nd.y, -dx, -dy, NW + 8, NH + 8)
    return { id: nd.id, x1: s.x, y1: s.y, x2: e.x, y2: e.y, lx: s.x + (e.x - s.x) * 0.55, ly: s.y + (e.y - s.y) * 0.55, label: nd.label, mandatory: nd.mandatory }
  })
  return { nodes, edges }
})
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s)
</script>

<template>
  <div class="mc-scr-ty">
    <AdminNav active="Types d'objets" />

    <!-- Types -->
    <aside class="mc-scr-ty-types" aria-label="Types d'objets">
      <McSearchField v-model="query" size="sm" placeholder="Filtrer les types" />
      <McTree v-model="typeId" v-model:expanded="treeExpanded" :nodes="shownTree" />
      <p v-if="!shownTree.length" class="mc-cap mc-scr-ty-none">Aucun type ne correspond à « {{ query }} ».</p>
      <p class="mc-cap mc-scr-ty-foot">Le chiffre à droite : le nombre d’attributs du type.</p>
    </aside>

    <main class="mc-scr-ty-main">
      <header class="mc-scr-ty-head">
        <span class="mc-scr-ty-tile" :class="`l-${type.layer}`"><McIcon :name="type.icon" /></span>
        <div class="mc-scr-ty-titles">
          <p class="mc-over">{{ group.label }}</p>
          <h1 class="title-lg">{{ type.label }}</h1>
          <p class="mc-cap">{{ summary }}</p>
        </div>
        <McButton variant="outline" icon="list" @click="openObjects">Voir les {{ type.many }}</McButton>
        <McButton icon="plus" @click="openCreate">Ajouter un attribut</McButton>
      </header>

      <div class="mc-scr-ty-body">
        <div class="mc-scr-ty-col">
          <section class="mc-scr-ty-sec" aria-labelledby="mc-scr-ty-attrs">
            <h2 id="mc-scr-ty-attrs" class="mc-over">Attributs</h2>
            <McDataTable
              :columns="columns"
              :rows="type.attributes"
              row-key="id"
              :caption="`Attributs du type ${type.label}`"
              empty-title="Aucun attribut"
              empty-text="Ajoutez le premier attribut de ce type."
              empty-icon="list"
              @open="openEdit"
            >
              <template #cell-dictionnaire="{ row }">
                <button v-if="row.dictionnaire" type="button" class="mc-scr-ty-link" :title="`Ouvrir le dictionnaire ${row.dictionnaire}`" @click.stop="openDict(row.dictionnaire)">{{ row.dictionnaire }}</button>
              </template>
              <template #cell-required="{ row }">
                <span class="mc-scr-ty-req" :class="{ 'is-on': row.required }">{{ row.required ? 'Obligatoire' : 'Facultative' }}</span>
              </template>
              <template #actions="{ row }">
                <McIconButton size="sm" icon="pencil" :label="`Modifier l’attribut ${row.name}`" @click="openEdit(row)" />
                <McIconButton
                  size="sm"
                  icon="trash"
                  variant="danger"
                  :disabled="isLocked(row)"
                  :label="isLocked(row) ? `${row.name} identifie chaque objet : il ne se supprime pas` : `Supprimer l’attribut ${row.name}`"
                  @click="deleting = row"
                />
              </template>
              <template #empty-action>
                <McButton variant="outline" size="sm" icon="plus" @click="openCreate">Ajouter un attribut</McButton>
              </template>
            </McDataTable>
          </section>

          <section class="mc-scr-ty-sec" aria-labelledby="mc-scr-ty-rels">
            <h2 id="mc-scr-ty-rels" class="mc-over">Relations</h2>
            <ul v-if="type.relations.length" class="mc-scr-ty-rels">
              <li v-for="r in type.relations" :key="`${r.verb}-${r.target}`" class="mc-scr-ty-rel">
                <span class="mc-scr-ty-tile sm" :class="`l-${relTarget(r).layer}`"><McIcon :name="relTarget(r).icon" size="sm" /></span>
                <p class="mc-scr-ty-sentence">
                  {{ article(type) }} {{ type.one }} <strong>{{ lower(r.verb) }}</strong>{{ ' ' }}
                  <button type="button" class="mc-scr-ty-link" :title="`Voir le type ${relTarget(r).label}`" @click="selectType(r.target)">{{ targetPhrase(r.cardinality, relTarget(r)) }}</button>{{ viaText(r) }}
                </p>
                <span class="mc-scr-ty-req" :class="{ 'is-on': isMandatory(r.cardinality) }">{{ isMandatory(r.cardinality) ? 'Obligatoire' : 'Facultative' }}</span>
                <span class="mc-code mc-scr-ty-card" :title="`Cardinalité ${r.cardinality}`">{{ r.cardinality }}</span>
              </li>
            </ul>
            <p v-else class="mc-cap">Ce type n’a aucune relation.</p>
          </section>
        </div>

        <aside class="mc-scr-ty-diag" aria-label="Schéma des relations">
          <span class="mc-over">Schéma</span>
          <svg :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="`${type.label} et ses ${plural(diagram.nodes.length, 'type lié', 'types liés')}`">
            <defs>
              <marker id="mc-scr-ty-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" class="mc-scr-ty-arrowhead" />
              </marker>
            </defs>
            <g v-for="e in diagram.edges" :key="`e-${e.id}`">
              <line :x1="e.x1" :y1="e.y1" :x2="e.x2" :y2="e.y2" class="mc-scr-ty-edge" :class="{ 'is-opt': !e.mandatory }" marker-end="url(#mc-scr-ty-arrow)" />
              <text :x="e.lx" :y="e.ly + 3" text-anchor="middle" class="mc-scr-ty-elabel">{{ clip(e.label, 26) }}</text>
            </g>
            <g class="mc-scr-ty-dnode is-center" :class="`l-${type.layer}`">
              <rect :x="CX - CW / 2" :y="CY - CH / 2" :width="CW" :height="CH" rx="8" />
              <text :x="CX" :y="CY + 4" text-anchor="middle">{{ clip(type.label, 18) }}</text>
            </g>
            <g
              v-for="nd in diagram.nodes"
              :key="`n-${nd.id}`"
              class="mc-scr-ty-dnode"
              :class="[`l-${nd.t.layer}`, { 'is-self': nd.self }]"
              role="button"
              tabindex="0"
              :aria-label="nd.self ? `${nd.t.label} (ce type)` : `Voir le type ${nd.t.label}`"
              @click="selectType(nd.id)"
              @keydown.enter.prevent="selectType(nd.id)"
              @keydown.space.prevent="selectType(nd.id)"
            >
              <rect :x="nd.x - NW / 2" :y="nd.y - NH / 2" :width="NW" :height="NH" rx="7" />
              <text :x="nd.x" :y="nd.y + 4" text-anchor="middle">{{ clip(nd.t.label, 17) }}</text>
            </g>
          </svg>
          <p class="mc-cap">Trait plein : relation obligatoire ; pointillé : facultative. Cliquez un type pour l’ouvrir.</p>
        </aside>
      </div>
    </main>

    <!-- Attribut -->
    <McModal
      v-model:open="editOpen"
      :title="editMode === 'create' ? 'Nouvel attribut' : `Modifier l’attribut ${original.name}`"
      :type="{ label: type.label, icon: type.icon, layer: type.layer }"
      :subtitle="editMode === 'create' ? `Il s’ajoutera à la fiche de chaque ${type.one}` : undefined"
      :confirm-label="editMode === 'create' ? 'Ajouter' : 'Enregistrer'"
      :confirm-disabled="!!nameError || !!dictError || (editMode === 'edit' && !changed)"
      :dirty="changed"
      @confirm="save"
    >
      <div class="mc-scr-ty-form">
        <McTextField v-model="form.name" label="Nom" required placeholder="ex. Nombre d’utilisateurs" :readonly="locked" :help="locked ? 'Le nom identifie chaque objet : il reste obligatoire.' : undefined" :error="shownNameError" />
        <McSelect v-model="form.type" label="Type de valeur" :options="kindOptions" :disabled="locked" />
        <McSelect
          v-if="isList"
          v-model="form.dictionnaire"
          label="Dictionnaire"
          required
          placeholder="Choisir un dictionnaire"
          :options="dictOptions"
          :error="shownDictError"
          help="Les valeurs proposées à la saisie viennent de ce dictionnaire."
        />
        <McSwitch v-model="form.required" label="Saisie obligatoire" help="Une fiche sans cette valeur est signalée comme non valide." :disabled="locked" block />
      </div>
    </McModal>

    <McModal
      v-model:open="deleteOpen"
      danger
      :title="`Supprimer l’attribut ${deleting?.name ?? ''}`"
      confirm-label="Supprimer"
      confirm-icon="trash"
      @confirm="confirmDelete"
    >
      <p class="mc-scr-ty-p">
        La valeur de cet attribut disparaîtra de la fiche de chaque {{ type.one }}. Vous pourrez annuler juste après la suppression.
      </p>
    </McModal>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-ty { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }

.mc-scr-ty-types { width: 240px; flex: none; display: flex; flex-direction: column; gap: 10px; padding: 16px 12px; border-right: 1px solid var(--line); background: var(--surface); box-sizing: border-box; overflow-y: auto; }
.mc-scr-ty-none { margin: 0; padding: 0 8px; }
.mc-scr-ty-foot { margin: auto 0 0; padding: 0 8px; }

.mc-scr-ty-main { flex: 1 1 600px; min-width: 0; height: 100%; overflow: auto; box-sizing: border-box; padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; container-type: inline-size; }
.mc-scr-ty-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.mc-scr-ty-titles { flex: 1; min-width: 200px; }
.mc-scr-ty-titles .mc-over, .mc-scr-ty-titles h1 { margin: 0 0 2px; }
.mc-scr-ty-titles .mc-cap { margin: 0; }

.mc-scr-ty-tile { width: 40px; height: 40px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-scr-ty-tile.sm { width: 28px; height: 28px; border-radius: 8px; }
.mc-scr-ty-tile.l-metier { background: var(--layer-metier-soft); color: var(--layer-metier); }
.mc-scr-ty-tile.l-fonctionnel { background: var(--layer-fonctionnel-soft); color: var(--layer-fonctionnel); }
.mc-scr-ty-tile.l-applicatif { background: var(--layer-applicatif-soft); color: var(--layer-applicatif); }
.mc-scr-ty-tile.l-technique { background: var(--layer-technique-soft); color: var(--layer-technique); }

.mc-scr-ty-body { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 20px; align-items: start; }
.mc-scr-ty-col { display: grid; gap: 22px; min-width: 0; }
.mc-scr-ty-sec { display: grid; gap: 10px; min-width: 0; }
.mc-scr-ty-sec h2 { margin: 0; }
.mc-scr-ty-sec .mc-table td.muted { width: 40%; }

.mc-scr-ty-req { display: inline-flex; align-items: center; height: 20px; padding: 0 8px; border-radius: var(--radius-pill); font: 600 11px/14px var(--font-sans); background: var(--surface-sunken); color: var(--ink-muted); white-space: nowrap; }
.mc-scr-ty-req.is-on { background: var(--accent-soft); color: var(--accent); }

.mc-scr-ty-rels { list-style: none; margin: 0; padding: 0; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-ty-rel { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-bottom: 1px solid var(--line); }
.mc-scr-ty-rel:last-child { border-bottom: 0; }
.mc-scr-ty-sentence { flex: 1; min-width: 0; margin: 0; font-size: 14px; line-height: 20px; }
.mc-scr-ty-sentence strong { font-weight: 600; }
.mc-scr-ty-link { padding: 0; border: 0; background: none; color: var(--accent); font: inherit; cursor: pointer; text-decoration: underline; text-decoration-color: var(--accent-soft); text-underline-offset: 3px; }
.mc-scr-ty-link:hover { text-decoration-color: currentColor; }
.mc-scr-ty-link:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; border-radius: 2px; }
.mc-scr-ty-card { font-size: 12px; color: var(--ink-muted); min-width: 30px; text-align: right; }

.mc-scr-ty-diag { position: sticky; top: 0; display: grid; gap: 10px; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-ty-diag svg { width: 100%; height: auto; display: block; overflow: visible; }
.mc-scr-ty-diag .mc-cap { margin: 0; }
.mc-scr-ty-edge { stroke: var(--ink-subtle); stroke-width: 1.5; }
.mc-scr-ty-edge.is-opt { stroke-dasharray: 4 3; }
.mc-scr-ty-arrowhead { fill: var(--ink-subtle); }
.mc-scr-ty-elabel { font: 500 10px/1 var(--font-sans); fill: var(--ink-muted); paint-order: stroke; stroke: var(--surface); stroke-width: 4px; stroke-linejoin: round; }
.mc-scr-ty-dnode rect { stroke-width: 1.5; }
.mc-scr-ty-dnode text { font: 600 12px/1 var(--font-sans); fill: var(--ink); pointer-events: none; }
.mc-scr-ty-dnode.is-center text { font-size: 13px; font-weight: 700; }
.mc-scr-ty-dnode:not(.is-center) { cursor: pointer; }
.mc-scr-ty-dnode:not(.is-center):hover rect { stroke-width: 2.5; }
.mc-scr-ty-dnode:focus { outline: none; }
.mc-scr-ty-dnode:focus-visible rect { stroke: var(--focus); stroke-width: 3; }
.mc-scr-ty-dnode.is-self rect { stroke-dasharray: 4 3; }
.mc-scr-ty-dnode.l-metier rect { fill: var(--layer-metier-soft); stroke: var(--layer-metier); }
.mc-scr-ty-dnode.l-fonctionnel rect { fill: var(--layer-fonctionnel-soft); stroke: var(--layer-fonctionnel); }
.mc-scr-ty-dnode.l-applicatif rect { fill: var(--layer-applicatif-soft); stroke: var(--layer-applicatif); }
.mc-scr-ty-dnode.l-technique rect { fill: var(--layer-technique-soft); stroke: var(--layer-technique); }

.mc-scr-ty-form { display: grid; gap: 14px; }
.mc-scr-ty-p { margin: 0; font-size: 14px; line-height: 20px; color: var(--ink-muted); }

@media (min-width: 1800px) {
  .mc-scr-ty-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
  .mc-scr-ty-body { grid-template-columns: minmax(0, 1fr) 460px; gap: 24px; }
  .mc-scr-ty-types { width: 260px; }
}
@media (max-width: 1179px) {
  .mc-scr-ty-types { width: 212px; padding-inline: 10px; }
  .mc-scr-ty-main { padding: 20px 22px; }
}
@container (max-width: 940px) {
  .mc-scr-ty-body { grid-template-columns: minmax(0, 1fr); }
  .mc-scr-ty-diag { position: static; max-width: 560px; }
}
@container (max-width: 560px) {
  .mc-scr-ty-rel { flex-wrap: wrap; }
  .mc-scr-ty-sentence { flex-basis: calc(100% - 40px); }
}
</style>
