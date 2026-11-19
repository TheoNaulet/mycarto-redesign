import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LiensDomainesScreen from './LiensDomaines.vue'

const meta = {
  title: 'Écrans/Liens entre domaines',
  id: 'ecrans-liens-domaines',
  component: LiensDomainesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Les 10 domaines fonctionnels et les flux qui passent de l’un à l’autre : l’épaisseur et le chiffre d’un lien disent le nombre de flux. Clic sur un lien : la liste de ses flux, chaque application vers sa fiche. Clic sur un domaine : ses liens ; Scolarité ouvre la carte des applications et flux de Scolarité.',
      },
    },
  },
} satisfies Meta<typeof LiensDomainesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const LiensDomaines: Story = {}
