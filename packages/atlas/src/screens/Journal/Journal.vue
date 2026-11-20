<script setup lang="ts">
// Écran « Historique » du menu : le journal des modifications, toutes cartes et tous objets confondus.
// Il reste dans l'administration ; seule une ligne ouvre un objet : la comparaison de versions d'une carte,
// la fiche d'une application, ou la corbeille pour un objet supprimé.
import { computed, ref } from 'vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McTypeChip from '../../components/McTypeChip/McTypeChip.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goFiche, goPath } from '../bridge'
import { getApplication } from '../../data/applications'
import { frDate, trashTypes } from '../../data/corbeille'
import { CARTE_SCOLARITE, journalEntries, journalKinds, type JournalEntry, type JournalKind } from '../../data/journal'
import { downloadCsv } from '../Explorateur/csv'

const toast = useToast()
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const typeOf = (x: JournalEntry) => trashTypes[x.type]

/* ---------- Filtres ---------- */
const query = ref('')
const kind = ref<'tous' | JournalKind>('tous')
const carte = ref<McSelectValue | null>(null)
const kindOptions = computed(() => [
  { value: 'tous', label: `Tout · ${journalEntries.length}` },
  ...(['add', 'mod', 'del'] as JournalKind[]).map((k) => ({ value: k, label: `${journalKinds[k].label}s · ${journalEntries.filter((e) => e.kind === k || (k === 'mod' && e.kind === 'pub')).length}` })),
])
const carteOptions = computed<McSelectOption[]>(() =>
  [...new Set(journalEntries.map((e) => e.carte).filter((c): c is string => !!c))].map((c) => ({ value: c, label: c })),
)
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return journalEntries.filter(
    (e) =>
      (kind.value === 'tous' || e.kind === kind.value || (kind.value === 'mod' && e.kind === 'pub')) &&
      (!carte.value || e.carte === carte.value) &&
      (!q || norm(`${e.objet} ${e.texte} ${e.par} ${e.carte ?? ''} ${typeOf(e).label}`).includes(q)),
  )
})
const filtering = computed(() => !!query.value.trim() || kind.value !== 'tous' || !!carte.value)
function clearFilters() {
  query.value = ''
  kind.value = 'tous'
  carte.value = null
}

const sort = ref<DataTableSort | null>({ key: 'date', dir: 'desc' })
const columns: DataTableColumn<JournalEntry>[] = [
  { key: 'objet', label: 'Objet', sortable: true },
  { key: 'kind', label: 'Changement', sortable: true, sortValue: (r) => journalKinds[r.kind].label },
  { key: 'carte', label: 'Carte', sortable: true, sortValue: (r) => r.carte ?? '' },
  { key: 'par', label: 'Par', sortable: true },
  { key: 'date', label: 'Quand', sortable: true, sortValue: (r) => `${r.date} ${r.heure}` },
]

/* ---------- Ouvrir : ce que la ligne désigne ---------- */
/** Ce qu'ouvre la ligne, ou rien. La comparaison de versions n'existe que pour la carte de Scolarité. */
function target(e: JournalEntry): { label: string; icon: 'history' | 'app' | 'trash'; go: () => void } | null {
  if (e.carte === CARTE_SCOLARITE) return { label: 'Comparer les versions', icon: 'history', go: () => goPath('/historique?depuis=journal') }
  if (e.kind === 'del') return { label: 'Voir dans la corbeille', icon: 'trash', go: () => goPath('/corbeille') }
  if (e.type === 'application' && getApplication(e.objet)) return { label: 'Ouvrir la fiche', icon: 'app', go: () => goFiche(e.objet) }
  return null
}
function open(e: JournalEntry) {
  const t = target(e)
  if (t) t.go()
  else toast.info(`« ${e.objet} » n’a pas encore d’historique détaillé dans cette démonstration.`)
}

function exportCsv() {
  const out = filtered.value.map((e) => [frDate(e.date), e.heure, journalKinds[e.kind].label, typeOf(e).label, e.objet, e.texte, e.carte ?? '', e.par])
  downloadCsv([['Date', 'Heure', 'Changement', 'Type', 'Objet', 'Détail', 'Carte', 'Par'], ...out], 'journal-des-modifications.csv')
  toast.success(`Journal exporté : ${plural(out.length, 'ligne', 'lignes')} en CSV`)
}
</script>

<template>
  <div class="mc-scr-jr">
    <AdminNav active="Historique" />

    <main class="mc-scr-jr-main">
      <header class="mc-scr-jr-head">
        <div class="mc-scr-jr-titles">
          <p class="mc-over">Données</p>
          <h1 class="title-lg">Historique</h1>
          <p class="mc-cap">Toutes les modifications de la cartographie · {{ plural(journalEntries.length, 'changement', 'changements') }} ces 15 derniers jours</p>
        </div>
        <McButton variant="outline" icon="export" :disabled="!filtered.length" @click="exportCsv">Exporter</McButton>
      </header>

      <div class="mc-scr-jr-tools">
        <McSearchField
          v-model="query"
          class="mc-scr-jr-search"
          placeholder="Rechercher un objet, une personne"
          :count="query ? (filtered.length ? plural(filtered.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined"
        />
        <McToggleGroup v-model="kind" label="Type de changement" :options="kindOptions" />
        <McSelect v-model="carte" class="mc-scr-jr-carte" size="sm" :options="carteOptions" clearable placeholder="Toutes les cartes" aria-label="Carte" />
        <McButton v-if="filtering" variant="ghost" size="sm" icon="x" @click="clearFilters">Tout effacer</McButton>
      </div>

      <McDataTable
        v-model:sort="sort"
        class="mc-scr-jr-table"
        :columns="columns"
        :rows="filtered"
        row-key="id"
        :icon="(r: JournalEntry) => typeOf(r).icon"
        caption="Journal des modifications"
        empty-title="Aucun changement ne correspond"
        empty-text="Modifiez la recherche ou les filtres."
        @open="open"
      >
        <template #cell-objet="{ row }">
          <span class="mc-scr-jr-obj">
            <b>{{ row.objet }}</b>
            <span>{{ row.texte }}</span>
          </span>
        </template>
        <template #cell-kind="{ row }">
          <span class="mc-scr-jr-kind" :class="`k-${row.kind}`"><McIcon :name="journalKinds[row.kind].icon" size="sm" />{{ journalKinds[row.kind].label }}</span>
          <McTypeChip class="mc-scr-jr-type" :type="typeOf(row).label" :layer="typeOf(row).layer" :icon="typeOf(row).icon" size="sm" />
        </template>
        <template #cell-carte="{ row }">
          <span v-if="row.carte">{{ row.carte }}</span>
          <span v-else class="mc-scr-jr-none">Hors carte</span>
        </template>
        <template #cell-par="{ row }">
          <span class="mc-scr-jr-who"><McAvatar :name="row.par" />{{ row.par }}</span>
        </template>
        <template #cell-date="{ row }">
          <span class="mc-scr-jr-when">{{ frDate(row.date) }}<span>{{ row.heure }}</span></span>
        </template>
        <template #actions="{ row }">
          <McIconButton v-if="target(row)" size="sm" :icon="target(row)!.icon" :label="`${target(row)!.label} : ${row.objet}`" @click="target(row)!.go()" />
        </template>
        <template #empty-action>
          <McButton variant="outline" size="sm" icon="x" @click="clearFilters">Effacer les filtres</McButton>
        </template>
      </McDataTable>
      <p class="mc-cap mc-scr-jr-hint">Un clic sur un changement de carte ouvre la comparaison de ses versions ; sur une application, sa fiche.</p>
    </main>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-jr { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-jr-main { flex: 1 1 600px; min-width: 0; height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 24px 28px; box-sizing: border-box; }
.mc-scr-jr-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-jr-titles { flex: 1; min-width: 240px; }
.mc-scr-jr-titles .mc-over { margin: 0 0 2px; }
.mc-scr-jr-titles h1 { margin: 0; }
.mc-scr-jr-titles .mc-cap { margin: 4px 0 0; }
.mc-scr-jr-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-jr-search { width: 280px; }
.mc-scr-jr-carte { width: 260px; }
.mc-scr-jr-table { flex: 1; min-height: 0; overflow: auto; }
.mc-scr-jr-obj { display: grid; gap: 2px; min-width: 0; }
.mc-scr-jr-obj b { font-weight: 600; }
.mc-scr-jr-obj span { font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-jr-kind { display: inline-flex; align-items: center; gap: 6px; margin-right: 8px; font-size: 13px; white-space: nowrap; }
.mc-scr-jr-kind.k-add { color: var(--status-ok); }
.mc-scr-jr-kind.k-del { color: var(--status-critical); }
.mc-scr-jr-kind.k-mod, .mc-scr-jr-kind.k-pub { color: var(--ink-muted); }
.mc-scr-jr-none { color: var(--ink-subtle); }
.mc-scr-jr-who { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.mc-scr-jr-when { display: inline-flex; gap: 6px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.mc-scr-jr-when span { color: var(--ink-subtle); }
.mc-scr-jr-hint { margin: 0; }

@media (min-width: 1800px) {
  .mc-scr-jr-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1179px) {
  .mc-scr-jr-main { padding: 18px 20px; }
  .mc-scr-jr-search { width: 220px; }
  .mc-scr-jr-type { display: none; }
}
</style>
