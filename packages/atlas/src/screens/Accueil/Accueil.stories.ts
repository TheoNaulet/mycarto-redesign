import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AccueilScreen from './Accueil.vue'

const meta = {
  title: 'Écrans/Accueil',
  id: 'ecrans-accueil',
  component: AccueilScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'L’accueil de myCarto : barre d’application, grande recherche (⌘K ouvre la palette), les 4 couches du SI avec leurs comptes et alertes, la liste « À traiter » et les cartes récemment consultées. Cliquer « Applications », une ligne « À traiter » ou une carte récente ouvre l’écran correspondant.',
      },
    },
  },
} satisfies Meta<typeof AccueilScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Accueil: Story = {}
