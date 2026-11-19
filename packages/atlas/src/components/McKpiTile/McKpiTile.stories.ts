import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McKpiTile from './McKpiTile.vue'
import McKpiOk from './McKpiOk.vue'

const meta = {
  title: 'Données/KpiTile',
  component: McKpiTile,
  args: { tone: 'critical', value: 25, label: 'Applications non valides', foot: 'sur 65 · les compléter →', href: '#', loading: false },
  parameters: {
    docs: {
      description: {
        component:
          'Indicateur de contrôle du tableau de bord : une petite carte à onglet d’état, le même langage que les nœuds. L’onglet porte le mot d’action (« À corriger », « À vérifier ») ; pas d’icône, pas de barre, pas d’aplat. Toute la carte mène à la liste filtrée. Les contrôles sans anomalie ne prennent pas de carte : ils se regroupent sur une ligne `McKpiOk`. 4 cartes par ligne au plus.',
      },
    },
  },
  render: (args) => ({
    components: { McKpiTile },
    setup: () => ({ args }),
    template: '<div style="max-width:220px"><McKpiTile v-bind="args" /></div>',
  }),
} satisfies Meta<typeof McKpiTile>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** À corriger, à vérifier, neutre, chargement, et la ligne des contrôles sans anomalie. Survoler une carte pour l’élévation. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McKpiTile, McKpiOk },
    template: `<div style="display:grid;gap:12px">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px">
        <McKpiTile tone="critical" :value="25" label="Applications non valides" foot="sur 65 · les compléter →" href="#" />
        <McKpiTile tone="warn" :value="13" label="Composants sans logiciel" foot="sur 58 · voir →" href="#" />
        <McKpiTile tone="neutral" :value="65" label="Applications" foot="dont 6 prévues" href="#" />
        <McKpiTile tone="warn" label="Machines sans composant" loading />
      </div>
      <McKpiOk label="Tous les flux ont une source et une cible." :count="2" />
      <McKpiOk label="Toutes les applications ont un responsable." :count="1" />
    </div>`,
  }),
}

/** Le chiffre est en cours de calcul : squelette, l’onglet et le libellé restent. */
export const Chargement: Story = { args: { loading: true } }

/** La ligne verte qui regroupe les contrôles sans anomalie. */
export const Sans_anomalie: Story = {
  name: 'Sans anomalie',
  render: () => ({
    components: { McKpiOk },
    template: '<McKpiOk label="Tous les flux ont une source et une cible." :count="2" />',
  }),
}
