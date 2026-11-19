import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CriticiteScreen from './Criticite.vue'

const meta = {
  title: 'Écrans/Criticité des applications',
  id: 'ecrans-criticite',
  component: CriticiteScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Les 65 applications de l’inventaire par niveau de criticité DICP : matrice domaines × niveaux, puis les applications groupées du niveau très fort aux non évaluées. Les critères D, I, C et P se cochent (disponibilité seule à l’ouverture) : le niveau d’une application est le plus fort des critères retenus. Clic sur une case de la matrice : ce domaine et ce niveau seuls. Clic sur une application : sa fiche.',
      },
    },
  },
} satisfies Meta<typeof CriticiteScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Criticite: Story = {}
