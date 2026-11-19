import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McLayerStack from './McLayerStack.vue'
import type { LayerStackLayer } from './types'

const homeLayers: LayerStackLayer[] = [
  {
    n: 1,
    layer: 'metier',
    name: 'Couche métier',
    cells: [
      { icon: 'process', label: 'Processus', count: 22, maps: 2 },
      { icon: 'org', label: 'Unités organisationnelles', count: 11, maps: 2 },
      { icon: 'shield', label: 'Traitements', description: 'Registre RGPD' },
      { icon: 'user', label: 'Référents métier', description: 'Par application' },
      { icon: 'globe', label: 'Pays', description: 'Aucun saisi', empty: true },
    ],
  },
  {
    n: 2,
    layer: 'fonctionnel',
    name: 'Couche fonctionnelle',
    cells: [
      { icon: 'folder', label: 'Domaines', count: 10, maps: 2 },
      { icon: 'pos', label: 'Quartiers du POS', count: 5, maps: 2 },
      { icon: 'database', label: 'Données', description: 'Objets de données' },
      { icon: 'user', label: 'Référents fonctionnels', description: 'Par application' },
    ],
  },
  {
    n: 3,
    layer: 'applicatif',
    name: 'Couche applicative',
    cells: [
      { icon: 'app', label: 'Applications', count: 65, maps: 3, alert: { status: 'critical', label: '25 non valides' } },
      { icon: 'building', label: 'Fournisseurs', count: 27 },
      { icon: 'contract', label: 'Contrats', count: 25, alert: { status: 'critical', label: '15 expirés' } },
      { icon: 'project', label: 'Projets', description: 'Portefeuille' },
    ],
  },
  {
    n: 4,
    layer: 'technique',
    name: 'Couche technique',
    cells: [
      { icon: 'pin', label: 'Sites', count: 3, maps: 2 },
      { icon: 'software', label: 'Logiciels', count: 40, maps: 2, alert: { status: 'critical', label: '11 obsolètes' } },
      { icon: 'server', label: 'Machines', description: 'Physiques et VM', maps: 2 },
      { icon: 'user', label: 'Référents techniques', description: 'Par application' },
    ],
  },
]

const meta = {
  title: 'Accueil/LayerStack',
  component: McLayerStack,
  args: { layers: homeLayers, columns: 5, offset: 20, headingLevel: 2, loading: false, loadingCells: 4 },
  parameters: {
    docs: {
      description: {
        component:
          'Les « strates » de l’accueil : les 4 couches du SI empilées comme des feuilles, de la couche métier (en haut) à la couche technique (en bas), chacune décalée vers la droite. Onglet numéroté à la couleur de la couche ; cases séparées par des filets. Chaque case montre un nombre (ou une courte description), le type, les alertes et le nombre de cartes. Clic : `open(cell, layer)`. Une case sans objet est estompée. L’accueil est une page, pas un canevas.',
      },
    },
  },
  render: (args) => ({
    components: { McLayerStack },
    setup: () => ({ args }),
    template: '<McLayerStack v-bind="args" />',
  }),
} satisfies Meta<typeof McLayerStack>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Rempli (avec alertes, cartes, case vide), puis chargement. Cliquer une case affiche son nom. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McLayerStack },
    setup: () => ({ homeLayers, last: ref('') }),
    template: `<div class="mc-col" style="gap:28px">
      <span class="mc-over">Rempli · {{ last ? 'ouvert : ' + last : 'cliquer une case' }}</span>
      <McLayerStack :layers="homeLayers" @open="(c) => (last = c.label)" />
      <span class="mc-over">Chargement</span>
      <McLayerStack loading />
    </div>`,
  }),
}

/** Les chiffres arrivent : cases squelettes, les onglets des 4 couches sont déjà là. */
export const Chargement: Story = { args: { layers: [], loading: true } }
