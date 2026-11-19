import type { Meta, StoryObj } from '@storybook/vue3-vite'
import InfrastructureScreen from './Infrastructure.vue'

const meta = {
  title: 'Écrans/Infrastructure',
  id: 'ecrans-infrastructure',
  component: InfrastructureScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Machines nécessaires à APOGEE : ses composants, rangés par environnement (Production, Développement), et les machines qui les hébergent, reliées par des liens d’hébergement en pointillé. La lentille « Obsolescence » est allumée : chaque nœud prend la couleur de son état et dit pourquoi. Clic sur une ligne de la légende : ces objets seuls restent nets. Clic sur un nœud : ses liens passent en accent et l’inspecteur le montre ; sophocle propose « Voir l’impact d’un arrêt ». Les vues Fiche, Flux et POS mènent aux autres écrans.',
      },
    },
  },
} satisfies Meta<typeof InfrastructureScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Infrastructure: Story = {}
