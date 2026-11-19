import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ImpactScreen from './Impact.vue'

const meta = {
  title: 'Écrans/Impact',
  id: 'ecrans-impact',
  component: ImpactScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Impact d’un arrêt de sophocle : la machine arrêtée, les 2 applications qu’elle héberge, les applications touchées par les flux. Le panneau « Simulation » règle la profondeur (1 niveau, 2 niveaux, Tout : le niveau suivant reste visible, estompé) et l’inclusion des flux asynchrones ; chiffres et liste des plus critiques suivent. « Exporter le rapport d’impact » ouvre le panneau Partager et exporter (fichier PDF, PNG ou SVG des objets touchés). Clic sur un objet : le chemin depuis l’arrêt reste en rouge.',
      },
    },
  },
} satisfies Meta<typeof ImpactScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Impact: Story = {}
