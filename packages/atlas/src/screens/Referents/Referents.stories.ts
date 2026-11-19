import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ReferentsScreen from './Referents.vue'

const meta = {
  title: 'Écrans/Référents',
  id: 'ecrans-referents',
  component: ReferentsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Référents des applications, par type (onglets Tous, Métier, Fonctionnels, Techniques ; l’adresse /referents?type=metier ouvre l’onglet voulu). Chaque personne : fonction, service, adresse de messagerie, nombre d’applications suivies ; l’inspecteur liste ses applications (vers leurs fiches). Les applications sans référent du type affiché sont signalées.',
      },
    },
  },
} satisfies Meta<typeof ReferentsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Referents: Story = {}
