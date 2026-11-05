import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LostMap from './LostMap.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const meta = {
  title: 'Pages/Page 404',
  component: LostMap,
  tags: ['autodocs'],
  parameters: {
    ground: 'navy',
    docs: {
      description: {
        component:
          'Le dessin de la page 404 : une petite carte du SI, dessinée à plat comme les autres schémas, et un chemin en pointillés qui en sort vers une épingle jaune hors de la carte. Même idée de mouvement que partout ailleurs : les liens de la carte se tracent, puis le chemin, puis l’épingle se pose. Il suit son fond : encre navy sur les fonds clairs, blanche dans `.on-navy`.',
      },
    },
  },
  render: () => ({
    components: { LostMap },
    template: '<div style="max-width:34rem;margin-inline:auto"><LostMap /></div>',
  }),
} satisfies Meta<typeof LostMap>

export default meta
type Story = StoryObj<typeof meta>

export const Navy: Story = {}
export const Papier: Story = { parameters: { ground: 'paper' } }

/** La page entière, telle qu’elle s’affiche pour toute adresse inconnue. */
export const Page: Story = {
  parameters: { pad: false, ground: 'paper' },
  render: () => ({
    components: { NotFoundPage },
    template: '<NotFoundPage />',
  }),
}
