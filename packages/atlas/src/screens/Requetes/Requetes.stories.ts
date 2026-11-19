import type { Meta, StoryObj } from '@storybook/vue3-vite'
import RequetesScreen from './Requetes.vue'

const meta = {
  title: 'Écrans/Requêtes',
  id: 'ecrans-requetes',
  component: RequetesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Modèles de requête de l’administration : les requêtes enregistrées à gauche (« Applications sans composant », « Flux sans sortie »…), un constructeur visuel au centre (type d’objet, conditions champ · opérateur · valeur, toutes ou au moins une). « Lancer » calcule le résultat sur les données de la cartographie ; une ligne ouvre la fiche de l’application (ou l’infrastructure pour une machine), « Exporter en CSV » télécharge le résultat. « Enregistrer » garde la requête modifiée.',
      },
    },
  },
} satisfies Meta<typeof RequetesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Requetes: Story = {}
