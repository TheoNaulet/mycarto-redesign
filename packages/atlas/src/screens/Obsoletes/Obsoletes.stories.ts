import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ObsoletesScreen from './Obsoletes.vue'

const meta = {
  title: 'Écrans/Applications obsolètes',
  id: 'ecrans-applications-obsoletes',
  component: ObsoletesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Les applications exposées à un logiciel obsolète ou en fin de support, calculées depuis leurs composants : chaque raison se lit en chaîne (application, composant et machine, logiciel, fin de support). Triées de la plus exposée à la moins exposée ; filtres Plus supporté / Fin de support proche. Clic sur une application : sa fiche ; sur un logiciel : l’écran Logiciels ; sur une machine : l’écran Machines. APOGEE propose « Voir sur la carte » (Infrastructure).',
      },
    },
  },
} satisfies Meta<typeof ObsoletesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Obsoletes: Story = {}
