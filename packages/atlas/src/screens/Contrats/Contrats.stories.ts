import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ContratsScreen from './Contrats.vue'

const meta = {
  title: 'Écrans/Contrats',
  id: 'ecrans-contrats',
  component: ContratsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Les 25 contrats du SI, groupés par échéance : Expirés (15), Expirent dans moins d’un an (6), Plus d’un an (4). La lentille « Échéance des contrats » est allumée : chaque contrat prend la couleur de son échéance. Clic sur une ligne de la légende : ce groupe seul reste net. Clic sur un contrat : l’inspecteur le montre (CONT000035, AMUE, expiré, couvre APOGEE et APOGEE WEB) ; « Renouveler » repousse la fin de la durée de reconduction et recolore le contrat (« Annuler » dans le toast revient en arrière) ; « Modifier » ouvre le formulaire du contrat. Lentille « Aucune » : les contrats reviennent aux couleurs de couche.',
      },
    },
  },
} satisfies Meta<typeof ContratsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Contrats: Story = {}
