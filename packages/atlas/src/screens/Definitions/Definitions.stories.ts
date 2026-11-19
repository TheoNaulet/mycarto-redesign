import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DefinitionsScreen from './Definitions.vue'

const meta = {
  title: 'Écrans/Définitions',
  id: 'ecrans-definitions',
  component: DefinitionsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Glossaire des notions de myCarto (Couche, Domaine, Application, Flux, POS, Quartier, Îlot, Lentille, DICP…), avec recherche, filtre par couche, index alphabétique et un lien « Voir » vers l’écran où chaque notion se voit.',
      },
    },
  },
} satisfies Meta<typeof DefinitionsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Definitions: Story = {}
