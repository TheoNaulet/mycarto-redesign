<script setup lang="ts">
// Écran « Diagrammes BPMN » : la liste des processus et de leurs diagrammes, dans l'administration.
// Ouvrir un diagramme mène au canevas BPMN (écran Processus), dont le fil d'Ariane ramène ici.
// Un processus sans diagramme s'ouvre dans la cartographie des processus, où l'inspecteur propose de le créer.
import { computed, ref } from 'vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import AdminNav from '../Explorateur/AdminNav.vue'
import { goPath, inApp } from '../bridge'
import { frDate } from '../../data/corbeille'
import { BPMN_DIAGRAMS, MACROS, type BpmnDiagram } from '../../data/processus'

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

interface Row {
  code: string
  name: string
  macro: string
  diagram?: BpmnDiagram
}
const rows: Row[] = MACROS.flatMap((m) =>
  m.processes.map((pr) => ({ code: pr.code, name: pr.name, macro: `${m.code} ${m.name}`, diagram: BPMN_DIAGRAMS.find((d) => d.code === pr.code) })),
)
const withDiagram = rows.filter((r) => r.diagram).length

/* ---------- Filtres ---------- */
const query = ref('')
const view = ref<'avec' | 'sans' | 'tous'>('avec')
const views = [
  { value: 'avec', label: `Avec diagramme · ${withDiagram}` },
  { value: 'sans', label: `Sans diagramme · ${rows.length - withDiagram}` },
  { value: 'tous', label: `Tous les processus · ${rows.length}` },
]
const filtered = computed(() => {
  const q = norm(query.value.trim())
  return rows.filter(
    (r) =>
      (view.value === 'tous' || (view.value === 'avec') === !!r.diagram) &&
      (!q || norm(`${r.code} ${r.name} ${r.macro} ${r.diagram?.title ?? ''} ${r.diagram?.proprietaire ?? ''}`).includes(q)),
  )
})

const sort = ref<DataTableSort | null>({ key: 'code', dir: 'asc' })
const columns: DataTableColumn<Row>[] = [
  { key: 'code', label: 'Processus', sortable: true },
  { key: 'diagram', label: 'Diagramme', sortable: true, sortValue: (r) => r.diagram?.title ?? '' },
  { key: 'contenu', label: 'Contenu', sortable: true, sortValue: (r) => r.diagram?.nbTaches ?? -1 },
  { key: 'proprietaire', label: 'Responsable', sortable: true, sortValue: (r) => r.diagram?.proprietaire ?? '' },
  { key: 'modifie', label: 'Modifié le', sortable: true, sortValue: (r) => r.diagram?.modifie ?? '' },
]

/** Dans Storybook, les paramètres d'adresse ne sont pas transmis : l'écran Processus s'ouvre seul. */
const target = (p: string) => (inApp() ? p : p.split('?')[0])
function open(r: Row) {
  goPath(target(r.diagram ? `/processus?diagramme=${r.code}&depuis=diagrammes` : `/processus?processus=${r.code}`))
}
</script>

<template>
  <div class="mc-scr-dg">
    <AdminNav active="Diagrammes BPMN" />

    <main class="mc-scr-dg-main">
      <header class="mc-scr-dg-head">
        <div class="mc-scr-dg-titles">
          <p class="mc-over">Modélisation</p>
          <h1 class="title-lg">Diagrammes BPMN</h1>
          <p class="mc-cap">{{ plural(withDiagram, 'processus décrit', 'processus décrits') }} sur {{ rows.length }} · les magasins de données d’un diagramme sont des applications de la cartographie</p>
        </div>
        <McButton variant="outline" icon="process" @click="goPath('/processus')">Voir la cartographie des processus</McButton>
      </header>

      <div class="mc-scr-dg-tools">
        <McSearchField
          v-model="query"
          class="mc-scr-dg-search"
          placeholder="Rechercher un processus, un diagramme"
          :count="query ? (filtered.length ? plural(filtered.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined"
        />
        <McToggleGroup v-model="view" label="Processus affichés" :options="views" />
      </div>

      <McDataTable
        v-model:sort="sort"
        class="mc-scr-dg-table"
        :columns="columns"
        :rows="filtered"
        row-key="code"
        icon="process"
        layer="metier"
        caption="Processus et diagrammes BPMN"
        empty-title="Aucun processus ne correspond"
        empty-text="Modifiez la recherche ou affichez tous les processus."
        @open="open"
      >
        <template #cell-code="{ row }">
          <span class="mc-scr-dg-proc">
            <b>{{ row.code }} {{ row.name }}</b>
            <span>{{ row.macro }}</span>
          </span>
        </template>
        <template #cell-diagram="{ row }">
          <span v-if="row.diagram" class="mc-scr-dg-diag">
            {{ row.diagram.title }}
            <McStatusChip :status="row.diagram.etat === 'publie' ? 'ok' : 'neutral'" size="sm">{{ row.diagram.etat === 'publie' ? 'Publié' : 'Brouillon' }}</McStatusChip>
          </span>
          <span v-else class="mc-scr-dg-none">Pas de diagramme</span>
        </template>
        <template #cell-contenu="{ row }">
          <span v-if="row.diagram">
            {{ plural(row.diagram.nbTaches, 'tâche', 'tâches') }}<template v-if="row.diagram.nbApplications"> · {{ plural(row.diagram.nbApplications, 'application', 'applications') }}</template>
          </span>
        </template>
        <template #cell-proprietaire="{ row }">
          <span v-if="row.diagram" class="mc-scr-dg-who"><McAvatar :name="row.diagram.proprietaire" />{{ row.diagram.proprietaire }}</span>
        </template>
        <template #cell-modifie="{ row }">{{ row.diagram ? frDate(row.diagram.modifie) : '' }}</template>
        <template #actions="{ row }">
          <McIconButton size="sm" :icon="row.diagram ? 'arrow-right' : 'plus'" :label="row.diagram ? `Ouvrir le diagramme ${row.diagram.title}` : `Créer le diagramme de ${row.code}`" @click="open(row)" />
        </template>
        <template #empty-action>
          <McButton variant="outline" size="sm" icon="x" @click="(query = ''), (view = 'tous')">Afficher tous les processus</McButton>
        </template>
      </McDataTable>
      <p class="mc-cap mc-scr-dg-hint">Un clic sur un diagramme l’ouvre en plein écran ; sur un processus sans diagramme, la cartographie des processus propose de le créer.</p>
    </main>
  </div>
</template>

<style>
.mc-scr-dg { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-dg-main { flex: 1 1 600px; min-width: 0; height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 24px 28px; box-sizing: border-box; }
.mc-scr-dg-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-dg-titles { flex: 1; min-width: 240px; }
.mc-scr-dg-titles .mc-over { margin: 0 0 2px; }
.mc-scr-dg-titles h1 { margin: 0; }
.mc-scr-dg-titles .mc-cap { margin: 4px 0 0; }
.mc-scr-dg-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-dg-search { width: 280px; }
.mc-scr-dg-table { flex: 1; min-height: 0; overflow: auto; }
.mc-scr-dg-proc { display: grid; gap: 2px; min-width: 0; }
.mc-scr-dg-proc b { font-weight: 600; }
.mc-scr-dg-proc span { font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-scr-dg-diag { display: inline-flex; align-items: center; gap: 8px; }
.mc-scr-dg-none { color: var(--ink-subtle); }
.mc-scr-dg-who { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.mc-scr-dg-hint { margin: 0; }

@media (min-width: 1800px) {
  .mc-scr-dg-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1179px) {
  .mc-scr-dg-main { padding: 18px 20px; }
  .mc-scr-dg-search { width: 220px; }
}
</style>
