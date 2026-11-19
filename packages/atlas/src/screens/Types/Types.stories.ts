import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TypesScreen from './Types.vue'

const meta = {
  title: 'Écrans/Types',
  id: 'ecrans-types',
  component: TypesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Méta-modèle de l’administration : les types d’objets rangés par couche, leurs attributs et leurs relations. Un clic sur un attribut ouvre sa modification (nom, type de valeur, dictionnaire, saisie obligatoire) ; « Ajouter un attribut » ouvre la même modale ; la suppression demande confirmation puis propose « Annuler ». Les relations sont dites en mots (« Une application appartient à un ou plusieurs domaines ») et dessinées autour du type choisi ; un clic sur un type lié l’ouvre.',
      },
    },
  },
} satisfies Meta<typeof TypesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Types: Story = {}
