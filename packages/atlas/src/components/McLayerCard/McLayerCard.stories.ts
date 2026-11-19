import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { ref } from 'vue'
import McLayerCard from './McLayerCard.vue'
import McObjectTile from './McObjectTile.vue'
import type { ObjectTileItem } from './types'

const metier: ObjectTileItem[] = [
  { label: 'Pays', icon: 'globe', empty: true, emptyHint: 'Aucun pays saisi' },
  { label: 'Organigramme', icon: 'org', maps: 2 },
  { label: 'Processus', icon: 'process', maps: 3 },
  { label: 'Traitements', icon: 'shield' },
]
const applicatif: ObjectTileItem[] = [
  { label: 'Applications', icon: 'app', maps: 3, alert: { status: 'critical', label: '25', title: '25 applications non valides' } },
  { label: 'Projets', icon: 'project' },
  { label: 'Fournisseurs', icon: 'building' },
  { label: 'Contrats', icon: 'contract', alert: { status: 'warn', label: '6', title: '6 contrats expirent dans 3 mois' } },
]

const meta = {
  title: 'Accueil/LayerCard',
  component: McLayerCard,
  args: { n: 3, layer: 'applicatif', name: 'Couche applicative', summary: '65 applications · 142 flux', tiles: applicatif, loading: false, loadingTiles: 4, onOpen: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Version « cartes » de l’accueil, au choix avec `McLayerStack` : une couche du SI (fond adouci, numéro dans un rond, résumé à droite) et ses tuiles `McObjectTile`. La tuile montre le type, le nombre de cartes en haut à gauche et une puce d’alerte en haut à droite ; elle monte d’1px au survol ; vide, elle est estompée avec une infobulle (« Aucun pays saisi »). Toujours les 4 couches, de la couche métier à la couche technique.',
      },
    },
  },
  render: (args) => ({
    components: { McLayerCard },
    setup: () => ({ args }),
    template: '<div style="max-width:640px"><McLayerCard v-bind="args" /></div>',
  }),
} satisfies Meta<typeof McLayerCard>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Couches remplies (avec tuile vide, cartes, alertes), chargement, puis les états d’une tuile seule. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McLayerCard, McObjectTile },
    setup: () => ({ metier, applicatif, last: ref('') }),
    template: `<div class="mc-col" style="max-width:640px;gap:20px">
      <span class="mc-cap">{{ last ? 'Ouvert : ' + last : 'Cliquer une tuile' }}</span>
      <McLayerCard :n="1" layer="metier" name="Couche métier" summary="5 types · 48 objets" :tiles="metier" @open="(t) => (last = t.label)" />
      <McLayerCard :n="3" layer="applicatif" name="Couche applicative" summary="65 applications · 142 flux" :tiles="applicatif" @open="(t) => (last = t.label)" />
      <McLayerCard :n="4" layer="technique" name="Couche technique" loading />
      <span class="mc-over">Tuile seule</span>
      <div class="mc-row lg">
        <McObjectTile label="Machines" icon="server" layer="technique" />
        <McObjectTile label="Logiciels" icon="software" layer="technique" :maps="2" :alert="{ status: 'critical', label: '11', title: '11 logiciels obsolètes' }" />
        <McObjectTile label="Sites" icon="pin" layer="technique" :maps="1" />
        <McObjectTile label="Pays" icon="globe" layer="metier" empty empty-hint="Aucun pays saisi" />
      </div>
    </div>`,
  }),
}

export const Chargement: Story = { args: { loading: true } }

/** La tuile seule, avec ses contrôles. */
export const Tuile: Story = {
  render: () => ({
    components: { McObjectTile },
    template: `<McObjectTile label="Applications" icon="app" layer="applicatif" :maps="3" :alert="{ status: 'critical', label: '25', title: '25 applications non valides' }" />`,
  }),
}
