import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DonneesScreen from './Donnees.vue'

const meta = {
  title: 'Écrans/Données',
  id: 'ecrans-donnees',
  component: DonneesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Objets de données de la couche fonctionnelle, avec leur sensibilité (sensible, personnelle, non personnelle), l’application qui fait foi, les flux qui les transportent (vers la carte des flux), les applications qui les gèrent (vers leurs fiches) et les traitements du registre RGPD qui les utilisent.',
      },
    },
  },
} satisfies Meta<typeof DonneesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Donnees: Story = {}
