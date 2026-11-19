import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PosScreen from './Pos.vue'

const meta = {
  title: 'Écrans/POS',
  id: 'ecrans-pos',
  component: PosScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Le plan d’occupation des sols complet, lu par la lentille « Couverture applicative » : cinq zones (Support, Opération, Référentiels, Pilotage et contrôle, Échange), leurs quartiers en cartes et leurs îlots en puces teintées selon le nombre d’applications ; les îlots vides, en pointillé, sont les trous du SI. Clic sur un quartier : il est sélectionné et l’inspecteur liste ses îlots et ses applications. « Afficher les îlots vides » masque ou montre les îlots sans application. La légende donne l’occupation et isole les îlots ou les quartiers vides.',
      },
    },
  },
} satisfies Meta<typeof PosScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Pos: Story = { name: 'POS' }
