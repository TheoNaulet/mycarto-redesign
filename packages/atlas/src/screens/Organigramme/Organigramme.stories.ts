import type { Meta, StoryObj } from '@storybook/vue3-vite'
import OrganigrammeScreen from './Organigramme.vue'

const meta = {
  title: 'Écrans/Organigramme',
  id: 'ecrans-organigramme',
  component: OrganigrammeScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'L’organigramme de la couche métier : 11 directions en cartes à onglet (sigle), leurs services, et l’inspecteur de la direction sélectionnée. La DRH montre ses 10 applications rangées par service, avec les non valides ; les autres directions, leurs services et un état vide. Le champ filtre directions et services en direct. La pilule « Processus » ouvre l’écran des processus. Main ou molette : déplacer ; Ctrl + molette ou − / + : zoomer ; recadrer : ajuster à la fenêtre.',
      },
    },
  },
} satisfies Meta<typeof OrganigrammeScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Organigramme: Story = {}
