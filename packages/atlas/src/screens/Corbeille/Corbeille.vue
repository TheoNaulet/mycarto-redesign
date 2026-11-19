<script setup lang="ts">
// Écran Corbeille : les objets supprimés, à restaurer ou à effacer définitivement avant la purge automatique (30 jours).
import { computed, ref, watch } from 'vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort, RowKey } from '../../components/McDataTable/types'
import McBulkBar from '../../components/McBulkBar/McBulkBar.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import { deletedApps } from '../../data/session'
import { slugOf } from '../../data/applications'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McModal from '../../components/McModal/McModal.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { daysLeft, frDate, trashItems, trashTypes, TRASH_DAYS, type TrashItem } from '../../data/corbeille'

const toast = useToast()

const items = ref<TrashItem[]>(trashItems.map((x) => ({ ...x })))
const typeOf = (x: TrashItem) => trashTypes[x.type]
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const objects = (n: number) => plural(n, 'objet', 'objets')

/* ---------- Recherche et filtre ---------- */
const query = ref('')
const typeFilter = ref<McSelectValue | null>(null)
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const typeOptions = computed<McSelectOption[]>(() =>
  Object.entries(trashTypes)
    .filter(([id]) => items.value.some((x) => x.type === id))
    .map(([id, t]) => ({ value: id, label: `${t.label} (${items.value.filter((x) => x.type === id).length})` })),
)
watch(items, () => {
  if (typeFilter.value && !items.value.some((x) => x.type === typeFilter.value)) typeFilter.value = null
})
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return items.value.filter((x) => (!typeFilter.value || x.type === typeFilter.value) && (!q || norm(`${x.name} ${typeOf(x).label} ${x.deletedBy}`).includes(q)))
})
const filtering = computed(() => !!query.value.trim() || !!typeFilter.value)
function clearFilters() {
  query.value = ''
  typeFilter.value = null
}

const sort = ref<DataTableSort | null>({ key: 'deletedAt', dir: 'desc' })
const columns: DataTableColumn<TrashItem>[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'type', label: 'Type', sortable: true, sortValue: (r) => typeOf(r).label },
  { key: 'deletedBy', label: 'Supprimé par', sortable: true },
  { key: 'deletedAt', label: 'Supprimé le', sortable: true, sortValue: (r) => r.deletedAt },
  { key: 'purge', label: 'Effacement', sortable: true, sortValue: (r) => daysLeft(r) },
]
const purgeLabel = (x: TrashItem) => {
  const n = daysLeft(x)
  return n === 0 ? 'Effacé aujourd’hui' : n === 1 ? 'Effacé demain' : `Effacé dans ${n} jours`
}
const purgeStatus = (x: TrashItem) => (daysLeft(x) <= 3 ? 'critical' : daysLeft(x) <= 7 ? 'warn' : 'neutral')

/* ---------- Sélection ---------- */
const selected = ref<RowKey[]>([])
const selectedItems = computed(() => items.value.filter((x) => selected.value.includes(x.id)))
watch(filtered, (list) => (selected.value = selected.value.filter((id) => list.some((x) => x.id === id))))

/* ---------- Restaurer ---------- */
const restoredWord = (x: TrashItem) => (typeOf(x).feminine ? 'restaurée' : 'restauré')
function restore(list: TrashItem[]) {
  if (!list.length) return
  const before = items.value
  const ids: RowKey[] = list.map((x) => x.id)
  items.value = items.value.filter((x) => !ids.includes(x.id))
  selected.value = selected.value.filter((id) => !ids.includes(id))
  // Une application restaurée réapparaît dans l'explorateur, les cartes et sa fiche.
  const apps = list.filter((x) => x.type === 'application').map((x) => slugOf(x.name))
  apps.forEach((slug) => deletedApps.delete(slug))
  const msg = list.length === 1 ? `${typeOf(list[0]).label} « ${list[0].name} » ${restoredWord(list[0])}` : `${objects(list.length)} restaurés`
  toast.success(msg, {
    actionLabel: 'Annuler',
    onAction: () => {
      items.value = before
      apps.forEach((slug) => deletedApps.add(slug))
    },
  })
}

/* ---------- Suppression définitive ---------- */
const confirmOpen = ref(false)
const pending = ref<TrashItem[]>([])
const emptying = ref(false)
const deleting = ref(false)
function askDelete(list: TrashItem[]) {
  if (!list.length) return
  pending.value = list
  emptying.value = false
  confirmOpen.value = true
}
function askEmpty() {
  if (!items.value.length) return
  pending.value = items.value
  emptying.value = true
  confirmOpen.value = true
}
const confirmTitle = computed(() => {
  if (emptying.value) return 'Vider la corbeille'
  const l = pending.value
  return l.length === 1 ? `Supprimer définitivement « ${l[0].name} »` : `Supprimer définitivement ${objects(l.length)}`
})
const confirmText = computed(() => {
  const l = pending.value
  if (emptying.value) return l.length === 1 ? 'L’objet de la corbeille sera effacé.' : `Les ${l.length} objets de la corbeille seront effacés.`
  if (l.length === 1) {
    const t = typeOf(l[0])
    return `${t.feminine ? 'Cette' : /^[aeiouyhé]/i.test(t.label) ? 'Cet' : 'Ce'} ${t.label.toLowerCase()} sera ${t.feminine ? 'effacée' : 'effacé'}, avec ses relations et son historique.`
  }
  return `Les ${l.length} objets sélectionnés seront effacés, avec leurs relations et leur historique.`
})
function confirmDelete() {
  deleting.value = true
  setTimeout(() => {
    const ids: RowKey[] = pending.value.map((x) => x.id)
    const n = ids.length
    const one = pending.value[0]
    items.value = items.value.filter((x) => !ids.includes(x.id))
    selected.value = selected.value.filter((id) => !ids.includes(id))
    deleting.value = false
    confirmOpen.value = false
    if (emptying.value) toast.success(`Corbeille vidée : ${objects(n)} ${n > 1 ? 'effacés' : 'effacé'}`)
    else if (n === 1) toast.success(`${typeOf(one).label} « ${one.name} » ${typeOf(one).feminine ? 'effacée' : 'effacé'} définitivement`)
    else toast.success(`${objects(n)} effacés définitivement`)
  }, 500)
}

const headCount = computed(() => (items.value.length ? objects(items.value.length) : 'vide'))
</script>

<template>
  <div class="mc-scr-cb">
    <AdminNav active="Corbeille" />

    <main class="mc-scr-cb-main">
      <header class="mc-scr-cb-head">
        <div class="mc-scr-cb-titles">
          <p class="mc-over">Données</p>
          <h1 class="title-lg">Corbeille</h1>
          <p class="mc-cap">Les objets supprimés restent {{ TRASH_DAYS }} jours avant d’être effacés · {{ headCount }}</p>
        </div>
        <McButton variant="danger" icon="trash" :disabled="!items.length" @click="askEmpty">Vider la corbeille</McButton>
      </header>

      <template v-if="items.length">
        <div class="mc-scr-cb-tools">
          <McSearchField
            v-model="query"
            class="mc-scr-cb-search"
            placeholder="Rechercher un objet supprimé"
            :count="query ? (filtered.length ? plural(filtered.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined"
          />
          <McSelect v-model="typeFilter" class="mc-scr-cb-type" size="sm" :options="typeOptions" clearable placeholder="Tous les types" aria-label="Type d’objet" />
          <McButton v-if="filtering" variant="ghost" size="sm" icon="x" @click="clearFilters">Tout effacer</McButton>
        </div>

        <div class="mc-scr-cb-zone">
          <McDataTable
            v-model:selected="selected"
            v-model:sort="sort"
            class="mc-scr-cb-table"
            :columns="columns"
            :rows="filtered"
            row-key="id"
            selectable
            :icon="(r: TrashItem) => typeOf(r).icon"
            caption="Objets supprimés"
            empty-title="Aucun objet supprimé ne correspond"
            empty-text="Modifiez la recherche ou choisissez un autre type."
            @open="(r: TrashItem) => restore([r])"
          >
            <template #cell-type="{ row }">
              <McTypeChip :type="typeOf(row).label" :layer="typeOf(row).layer" :icon="typeOf(row).icon" size="sm" />
            </template>
            <template #cell-deletedBy="{ row }">
              <span class="mc-scr-cb-who"><McAvatar :name="row.deletedBy" />{{ row.deletedBy }}</span>
            </template>
            <template #cell-deletedAt="{ row }">{{ frDate(row.deletedAt) }}</template>
            <template #cell-purge="{ row }">
              <McStatusChip :status="purgeStatus(row)" size="sm">{{ purgeLabel(row) }}</McStatusChip>
            </template>
            <template #actions="{ row }">
              <McIconButton size="sm" icon="undo" :label="`Restaurer ${row.name}`" @click="restore([row])" />
              <McIconButton size="sm" icon="trash" variant="danger" :label="`Supprimer définitivement ${row.name}`" @click="askDelete([row])" />
            </template>
            <template #empty-action>
              <McButton variant="outline" size="sm" icon="x" @click="clearFilters">Effacer les filtres</McButton>
            </template>
          </McDataTable>

          <McBulkBar :count="selected.length" :forms="{ one: 'objet sélectionné', other: 'objets sélectionnés' }" floating @clear="selected = []">
            <McButton variant="ghost" size="sm" icon="undo" @click="restore(selectedItems)">Restaurer</McButton>
            <McButton variant="ghost" size="sm" icon="trash" @click="askDelete(selectedItems)">Supprimer définitivement</McButton>
          </McBulkBar>
        </div>
        <p class="mc-cap mc-scr-cb-hint">Un clic sur une ligne restaure l’objet à sa place, avec ses relations.</p>
      </template>

      <div v-else class="mc-scr-cb-empty">
        <McEmptyState icon="trash" title="La corbeille est vide" :text="`Les objets que vous supprimez y restent ${TRASH_DAYS} jours : vous pouvez les restaurer pendant ce délai.`" />
      </div>
    </main>

    <McModal
      v-model:open="confirmOpen"
      :title="confirmTitle"
      danger
      :confirm-label="emptying ? 'Vider la corbeille' : 'Supprimer définitivement'"
      confirm-icon="trash"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <p class="mc-scr-cb-ctext">{{ confirmText }} Cette action est irréversible.</p>
      <ul v-if="pending.length > 1 && pending.length <= 6" class="mc-scr-cb-clist">
        <li v-for="x in pending" :key="x.id"><McTypeChip :type="typeOf(x).label" :layer="typeOf(x).layer" :icon="typeOf(x).icon" size="sm" /> {{ x.name }}</li>
      </ul>
    </McModal>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-cb { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-cb-main { flex: 1 1 600px; min-width: 0; height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 24px 28px; box-sizing: border-box; }
.mc-scr-cb-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-cb-titles { flex: 1; min-width: 240px; }
.mc-scr-cb-titles .mc-over { margin: 0 0 2px; }
.mc-scr-cb-titles h1 { margin: 0; }
.mc-scr-cb-titles .mc-cap { margin: 4px 0 0; }
.mc-scr-cb-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-cb-search { width: 280px; }
.mc-scr-cb-type { width: 220px; }
.mc-scr-cb-zone { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.mc-scr-cb-zone > .mc-scr-cb-table { flex: 1; min-height: 0; overflow: auto; }
.mc-scr-cb-who { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.mc-scr-cb-hint { margin: 0; }
.mc-scr-cb-empty { flex: 1; display: grid; place-items: center; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-cb-ctext { margin: 0; font-size: 14px; line-height: 20px; }
.mc-scr-cb-clist { margin: 12px 0 0; padding: 0; list-style: none; display: grid; gap: 6px; font-size: 13px; }
.mc-scr-cb-clist li { display: flex; align-items: center; gap: 8px; }

@media (min-width: 1800px) {
  .mc-scr-cb-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1179px) {
  .mc-scr-cb-main { padding: 18px 20px; }
  .mc-scr-cb-search { width: 220px; }
}
</style>
