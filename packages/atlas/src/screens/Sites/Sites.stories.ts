import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SitesScreen from './Sites.vue'

const meta = {
  title: 'Écrans/Sites',
  id: 'ecrans-sites',
  component: SitesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Les trois sites (Lyon, Montpellier, Paris) : machines, baies et obsolescence. Le site choisi montre ses baies et leurs machines physiques (ESX1 à ESX3 marqués « Cluster philosophe »), puis ses machines virtuelles, rangées par ce qui les fait tourner. Clic sur une machine : l’écran Machines, cette machine ouverte. Dans l’application, /sites?site=Lyon ouvre un site.',
      },
    },
  },
} satisfies Meta<typeof SitesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Sites: Story = {}
