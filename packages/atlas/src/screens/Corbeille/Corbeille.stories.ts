import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CorbeilleScreen from './Corbeille.vue'

const meta = {
  title: 'Écrans/Corbeille',
  id: 'ecrans-corbeille',
  component: CorbeilleScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Corbeille de l’administration : les objets supprimés ces 30 derniers jours, avec qui les a supprimés et quand ils seront effacés. Recherche, filtre par type, tri, sélection groupée. « Restaurer » remet l’objet en place (toast avec « Annuler ») ; « Supprimer définitivement » et « Vider la corbeille » demandent confirmation.',
      },
    },
  },
} satisfies Meta<typeof CorbeilleScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Corbeille: Story = {}
