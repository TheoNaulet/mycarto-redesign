import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ClientsMap from './ClientsMap.vue'

const meta = {
  title: 'Clients/ClientsMap',
  component: ClientsMap,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'AB+ Software à Montpellier et quelques clients en France, en carte à plat. Le tracé et les villes sont de vraies coordonnées projetées, rien n’est placé à l’œil. À l’arrivée, Montpellier se pose, puis chaque flux se trace et sa ville apparaît. Chaque client est placé à la ville de son siège.',
      },
    },
  },
  render: () => ({
    components: { ClientsMap },
    template: '<div style="max-width:44rem"><ClientsMap /></div>',
  }),
} satisfies Meta<typeof ClientsMap>

export default meta
export const Carte: StoryObj<typeof meta> = {}
