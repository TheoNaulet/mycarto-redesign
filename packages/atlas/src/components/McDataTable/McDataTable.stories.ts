import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { ref, type ConcreteComponent } from 'vue'
import McDataTable from './McDataTable.vue'
import type { DataTableColumn, DataTableSort, RowKey } from './types'
import McBulkBar from '../McBulkBar/McBulkBar.vue'
import McButton from '../McButton/McButton.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import McIcon from '../../icons/McIcon.vue'
import type { Status } from '../../utils/types'

interface Application {
  id: string
  name: string
  statut: 'Active' | 'Prévue'
  obsolescence: { status: Status; label: string }
  hebergement: 'On-premise' | 'SaaS' | null
  utilisateurs: number | null
  description: string
}

const ob = {
  ok: { status: 'ok', label: 'À jour' },
  warn: { status: 'warn', label: 'Fin de support 2027' },
  crit: { status: 'critical', label: 'Infra obsolète' },
  nc: { status: 'unknown', label: 'NC' },
} as const

const applications: Application[] = [
  { id: 'abricot', name: 'ABRICOT', statut: 'Active', obsolescence: ob.ok, hebergement: 'On-premise', utilisateurs: 120, description: 'Analyse budgétaire et restitutions financières' },
  { id: 'abyla', name: 'ABYLA', statut: 'Active', obsolescence: ob.warn, hebergement: 'SaaS', utilisateurs: 45, description: 'Gestion des conventions de stage' },
  { id: 'ad', name: 'ACTIVE DIRECTORY', statut: 'Active', obsolescence: ob.ok, hebergement: 'On-premise', utilisateurs: 8200, description: 'Annuaire et authentification des comptes' },
  { id: 'agrhum', name: 'AGRHUM', statut: 'Active', obsolescence: ob.crit, hebergement: 'On-premise', utilisateurs: 60, description: 'Gestion administrative des personnels' },
  { id: 'alertes', name: 'ALERTES-DIPLOMES', statut: 'Prévue', obsolescence: ob.nc, hebergement: null, utilisateurs: null, description: 'Alerte des diplômés à la remise des parchemins' },
  { id: 'amande', name: 'AMANDE', statut: 'Active', obsolescence: ob.ok, hebergement: 'SaaS', utilisateurs: 30, description: 'Suivi des amendes et des pénalités de la bibliothèque' },
  { id: 'apogee', name: 'APOGEE', statut: 'Active', obsolescence: ob.crit, hebergement: 'On-premise', utilisateurs: 1250, description: 'Gestion des étudiants et des enseignements' },
  { id: 'apogee-web', name: 'APOGEE WEB', statut: 'Active', obsolescence: ob.warn, hebergement: 'On-premise', utilisateurs: 23000, description: 'Inscriptions et résultats en ligne pour les étudiants' },
  { id: 'apoip', name: 'APOIP', statut: 'Active', obsolescence: ob.crit, hebergement: 'On-premise', utilisateurs: 90, description: 'Inscriptions pédagogiques' },
  { id: 'astre', name: 'ASTRE RH', statut: 'Prévue', obsolescence: ob.nc, hebergement: 'SaaS', utilisateurs: null, description: 'Gestion des ressources humaines' },
  { id: 'bibasse', name: 'BIBASSE', statut: 'Active', obsolescence: ob.ok, hebergement: 'SaaS', utilisateurs: 340, description: 'Catalogue des bibliothèques' },
  { id: 'c2i', name: 'C2I', statut: 'Active', obsolescence: ob.warn, hebergement: 'On-premise', utilisateurs: 15, description: 'Certification informatique et internet' },
  { id: 'calcium', name: 'CALCIUM', statut: 'Active', obsolescence: ob.ok, hebergement: 'On-premise', utilisateurs: 410, description: 'Agendas partagés des personnels' },
]

const obRank: Record<Status, number> = { critical: 0, warn: 1, ok: 2, unknown: 3 }

const columns: DataTableColumn<Application>[] = [
  { key: 'name', label: 'Application', sortable: true },
  { key: 'statut', label: 'Statut', sortable: true, width: '96px' },
  { key: 'obsolescence', label: 'Obsolescence', sortable: true, sortValue: (r) => obRank[r.obsolescence.status] },
  { key: 'hebergement', label: 'Hébergement', sortable: true },
  { key: 'utilisateurs', label: 'Utilisateurs', sortable: true, align: 'right' },
  { key: 'description', label: 'Description', muted: true },
]

/** Cellules communes : statut et obsolescence en puces, actions de ligne. */
const cells = `
  <template #cell-statut="{ row }"><McStatusChip size="sm">{{ row.statut }}</McStatusChip></template>
  <template #cell-obsolescence="{ row }"><McStatusChip size="sm" :status="row.obsolescence.status">{{ row.obsolescence.label }}</McStatusChip></template>
  <template #actions="{ row }">
    <button type="button" class="mc-ibtn sm" :aria-label="'Modifier ' + row.name" title="Modifier"><McIcon name="pencil" size="sm" /></button>
    <button type="button" class="mc-ibtn sm" :aria-label="'Plus d’actions sur ' + row.name" title="Plus d’actions"><McIcon name="more" size="sm" /></button>
  </template>`

const comps = { McDataTable, McStatusChip, McIcon, McButton, McBulkBar }

const meta = {
  title: 'Données/DataTable',
  // Composant générique : Storybook ne sait pas typer ses args, on le présente comme un composant simple.
  component: McDataTable as unknown as ConcreteComponent,
  args: {
    columns,
    rows: applications,
    rowKey: 'id',
    selectable: true,
    icon: 'app',
    layer: 'applicatif',
    caption: 'Applications',
    loading: false,
    loadingRows: 8,
    error: '',
    emptyTitle: 'Aucune application ne correspond à ces filtres',
    emptyText: 'Retirez un filtre pour élargir la recherche.',
    onOpen: fn(),
    onRetry: fn(),
  },
  parameters: {
    docs: {
      description: {
        component:
          'Tableau d’objets de l’explorateur : trier, sélectionner, ouvrir, agir. En-tête collant, tri au clic (`v-model:sort`, croissant → décroissant → ordre d’origine, `aria-sort`). Cases à cocher avec en-tête « tout » à trois états (`v-model:selected`) : la `McBulkBar` apparaît dès qu’une ligne est cochée. Clic ou Entrée sur une ligne : `open` (l’inspecteur s’ouvre, le tableau reste en place). Actions de ligne visibles au survol et au focus. Cellules personnalisables par slot `cell-<clé>`. Valeurs vides : « — ». États : chargement (squelettes, `aria-busy`), erreur (« Réessayer » → `retry`), vide (phrase + action).',
      },
    },
  },
  render: (args) => ({
    components: comps,
    setup: () => ({ args, selected: ref<RowKey[]>(['apogee']), sort: ref<DataTableSort | null>(null) }),
    template: `<McDataTable v-bind="args" v-model:selected="selected" v-model:sort="sort">${cells}</McDataTable>`,
  }),
} satisfies Meta

export default meta
type Story = StoryObj

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Le cas réel : trier (cliquer un en-tête), cocher (la barre d’actions apparaît en bas), ouvrir une ligne. */
export const Applications: Story = {
  parameters: { pad: false },
  render: () => ({
    components: comps,
    setup() {
      const selected = ref<RowKey[]>([])
      const sort = ref<DataTableSort | null>({ key: 'name', dir: 'asc' })
      const opened = ref('')
      return { columns, applications, selected, sort, opened }
    },
    template: `<div style="position:relative;padding:16px 16px 88px;min-height:560px;box-sizing:border-box">
      <div class="mc-row" style="margin-bottom:12px">
        <b style="font:700 17px/24px var(--font-display)">{{ applications.length }} applications</b>
        <span class="mc-cap" style="margin-left:auto">{{ opened ? 'Inspecteur : ' + opened : 'Cliquer une ligne pour l’ouvrir' }}</span>
      </div>
      <McDataTable :columns="columns" :rows="applications" row-key="id" icon="app" layer="applicatif" caption="Applications" selectable max-height="460px"
        v-model:selected="selected" v-model:sort="sort" @open="opened = $event.name">${cells}</McDataTable>
      <McBulkBar :count="selected.length" floating @clear="selected = []">
        <McButton variant="ghost" size="sm" icon="pencil">Modifier</McButton>
        <McButton variant="ghost" size="sm" icon="map">Ajouter à une carte</McButton>
        <McButton variant="ghost" size="sm" icon="export">Exporter</McButton>
        <McButton variant="ghost" size="sm" icon="trash">Supprimer</McButton>
      </McBulkBar>
    </div>`,
  }),
}

/** Normal (une ligne cochée), chargement, erreur, vide : les quatre états de données. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: comps,
    setup: () => ({ columns, rows: applications.slice(5, 9), selected: ref<RowKey[]>(['apogee']), onRetry: fn() }),
    template: `<div class="mc-col" style="gap:28px">
      <div class="mc-col"><span class="mc-over">Normal</span>
        <McDataTable :columns="columns" :rows="rows" icon="app" selectable v-model:selected="selected">${cells}</McDataTable></div>
      <div class="mc-col"><span class="mc-over">Chargement</span>
        <McDataTable :columns="columns" icon="app" selectable loading :loading-rows="4" /></div>
      <div class="mc-col"><span class="mc-over">Erreur</span>
        <McDataTable :columns="columns" icon="app" selectable error="Le serveur n’a pas répondu. Vos filtres sont conservés." errorTitle="Impossible de charger les applications" @retry="onRetry" /></div>
      <div class="mc-col"><span class="mc-over">Vide</span>
        <McDataTable :columns="columns" icon="app" selectable empty-icon="filter" empty-title="Aucune application ne correspond à ces filtres" empty-text="Retirez un filtre pour élargir la recherche.">
          <template #empty-action><McButton variant="outline" size="sm" icon="x">Effacer les filtres</McButton></template>
        </McDataTable></div>
    </div>`,
  }),
}

/** Squelettes à la forme des lignes (40px), en-tête conservé, tri et case « tout » désactivés. */
export const Chargement: Story = { args: { loading: true } }

/** « Réessayer » simule un nouvel essai qui réussit. */
export const Erreur: Story = {
  render: () => ({
    components: comps,
    setup() {
      const error = ref('Le serveur n’a pas répondu. Vos filtres sont conservés.')
      const retrying = ref(false)
      const retry = () => {
        retrying.value = true
        setTimeout(() => {
          retrying.value = false
          error.value = ''
        }, 1200)
      }
      return { columns, applications, error, retrying, retry }
    },
    template: `<McDataTable :columns="columns" :rows="applications.slice(0, 5)" icon="app" selectable :error="error" :retrying="retrying"
      error-title="Impossible de charger les applications" @retry="retry">${cells}</McDataTable>`,
  }),
}

/** Aucune ligne : une phrase qui dit quoi faire, et l’action qui débloque. */
export const Vide: Story = {
  render: () => ({
    components: comps,
    setup() {
      const filtered = ref(true)
      return { columns, applications, filtered }
    },
    template: `<McDataTable :columns="columns" :rows="filtered ? [] : applications.slice(0, 5)" icon="app" selectable empty-icon="filter"
      empty-title="Aucune application ne correspond à ces filtres" empty-text="Retirez le filtre « Hébergement : Cloud privé » pour élargir la recherche.">
      <template #empty-action><McButton variant="outline" size="sm" icon="x" @click="filtered = false">Effacer les filtres</McButton></template>
      ${cells}
    </McDataTable>`,
  }),
}
