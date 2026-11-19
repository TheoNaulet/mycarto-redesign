import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ExplorateurScreen from './Explorateur.vue'

const meta = {
  title: 'Écrans/Explorateur',
  id: 'ecrans-explorateur',
  component: ExplorateurScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Explorateur de l’administration : les types d’objets rangés par couche, puis la liste des applications. Recherche, filtres retirables, tri, pages, sélection avec barre d’actions groupées. Un clic sur une ligne ouvre l’inspecteur ; « Modifier » ouvre la saisie longue (Éditeur obligatoire), « Enregistrer » confirme par un toast avec « Annuler ». Interrupteur de démonstration en bas à gauche : erreur de chargement du tableau.',
      },
    },
  },
} satisfies Meta<typeof ExplorateurScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Explorateur: Story = {}
