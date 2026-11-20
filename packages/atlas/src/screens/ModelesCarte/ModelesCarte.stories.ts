import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Screen from './ModelesCarte.vue'

const meta = {
  title: 'Écrans/Modèles de carte',
  id: 'ecrans-modeles-de-carte',
  component: Screen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Modèles de carte de l’administration, en cartes avec une vignette de leur disposition et les types d’objets qu’ils montrent. Ouvrir « Applis et flux d’un domaine » mène à l’éditeur, dont le retour ramène à cette liste.',
      },
    },
  },
} satisfies Meta<typeof Screen>

export default meta
type Story = StoryObj<typeof meta>

export const ModelesDeCarte: Story = {}
