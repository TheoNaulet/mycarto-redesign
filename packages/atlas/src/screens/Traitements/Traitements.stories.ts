import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TraitementsScreen from './Traitements.vue'

const meta = {
  title: 'Écrans/Traitements',
  id: 'ecrans-traitements',
  component: TraitementsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Registre des traitements RGPD : finalité, base légale, catégories de données (les données de santé sont sensibles), durée de conservation, applications concernées et responsable. Recherche, filtres (base légale, données sensibles, analyse d’impact, transferts hors UE), inspecteur avec liens vers les fiches des applications et vers les données.',
      },
    },
  },
} satisfies Meta<typeof TraitementsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Traitements: Story = {}
