import type { Meta, StoryObj } from '@storybook/vue3-vite'
import HistoriqueScreen from './Historique.vue'

const meta = {
  title: 'Écrans/Historique',
  id: 'ecrans-historique',
  component: HistoriqueScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'La carte Applications et flux de Scolarité en mode comparaison avec la version publiée du 18/05. Les objets ajoutés, modifiés ou supprimés portent un badge. Clic sur une date de la frise : la comparaison s’arrête à cette version (objets pas encore créés masqués, changements recomptés). « Rejouer » parcourt les versions une à une. « Montrer seulement les changements » estompe le reste ; clic sur un changement du panneau : son objet est mis en avant. « Restaurer la version du 18/05 » demande confirmation puis confirme par un toast. « Quitter la comparaison » revient à la carte.',
      },
    },
  },
} satisfies Meta<typeof HistoriqueScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Historique: Story = {}
