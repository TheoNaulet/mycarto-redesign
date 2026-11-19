import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MachinesScreen from './Machines.vue'

const meta = {
  title: 'Écrans/Machines',
  id: 'ecrans-machines',
  component: MachinesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Les 28 machines physiques et virtuelles des sites de Paris, Lyon et Montpellier : système et fin de support, composants et applications hébergés, obsolescence. Recherche (nom, système, site, application), filtres de type, de site et d’obsolescence, tri, bascule Liste / Grille. Clic sur une machine : l’inspecteur montre ses applications (vers leur fiche), ses composants et ses machines virtuelles. « Voir l’impact d’un arrêt » ouvre l’écran Impact pour sophocle et, pour les autres, calcule sur place ce qui s’arrêterait. Dans l’application, /machines?id=einstein ouvre une machine et ?site=Paris filtre un site.',
      },
    },
  },
} satisfies Meta<typeof MachinesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Machines: Story = {}
