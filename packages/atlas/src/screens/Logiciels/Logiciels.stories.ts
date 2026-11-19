import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LogicielsScreen from './Logiciels.vue'

const meta = {
  title: 'Écrans/Logiciels',
  id: 'ecrans-logiciels',
  component: LogicielsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'La vue Obsolescence : les 40 logiciels référencés, rangés en trois groupes (obsolète, en voie d’obsolescence, non obsolète), avec leur fin de support (support étendu quand il existe) et leur nombre de déploiements. Recherche, filtres d’obsolescence et de famille, tri, bascule Grille / Liste. Clic sur un logiciel : l’inspecteur montre les applications qui l’emploient (vers leur fiche) et les machines où il est installé (vers l’écran Machines). Dans l’application, /logiciels?id=tomcat-5 ouvre un logiciel.',
      },
    },
  },
} satisfies Meta<typeof LogicielsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Logiciels: Story = {}
