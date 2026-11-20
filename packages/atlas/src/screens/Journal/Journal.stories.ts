import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Screen from './Journal.vue'

const meta = {
  title: 'Écrans/Journal',
  id: 'ecrans-journal',
  component: Screen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Historique (journal des modifications) de l’administration : toutes les modifications de la cartographie, filtrables par type de changement et par carte. Une ligne de la carte de Scolarité ouvre la comparaison de versions ; une application, sa fiche ; une suppression, la corbeille.',
      },
    },
  },
} satisfies Meta<typeof Screen>

export default meta
type Story = StoryObj<typeof meta>

export const Journal: Story = {}
