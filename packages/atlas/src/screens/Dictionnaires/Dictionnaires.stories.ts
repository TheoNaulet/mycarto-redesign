import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DictionnairesScreen from './Dictionnaires.vue'

const meta = {
  title: 'Écrans/Dictionnaires',
  id: 'ecrans-dictionnaires',
  component: DictionnairesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Dictionnaires de l’administration : les listes de valeurs lues par les attributs « liste » des types d’objets. À gauche les dictionnaires (Contribution Flux en arborescence : Racine > applications ; statuts, hébergements, natures, niveaux DICP, fréquences de flux…). Au centre les valeurs : ajout et renommage en ligne (Entrée valide, Échap annule, double-clic ou F2 pour renommer), suppression confirmée par une modale qui dit ce qui en dépend, tri de A à Z. Chaque changement s’annule depuis le toast. À droite, l’usage de la valeur choisie.',
      },
    },
  },
} satisfies Meta<typeof DictionnairesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Dictionnaires: Story = {}
