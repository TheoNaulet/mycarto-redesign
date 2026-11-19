import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PaysScreen from './Pays.vue'

const meta = {
  title: 'Écrans/Pays',
  id: 'ecrans-pays',
  component: PaysScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Pays de la couche métier. Aucun pays n’est saisi au départ : l’état vide propose « Ajouter un pays » (modale : pays dans une liste, villes des sites) ou de rattacher les 3 sites déjà cartographiés (Lyon, Montpellier, Paris) à la France. Les pays sont rangés par continent, avec leur appartenance à l’Union européenne ; l’inspecteur montre les sites, permet d’en ajouter et de supprimer le pays (avec annulation). Lien vers le registre des traitements pour les transferts hors UE.',
      },
    },
  },
} satisfies Meta<typeof PaysScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Pays: Story = {}
