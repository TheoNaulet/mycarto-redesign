import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ReglagesScreen from './Reglages.vue'

const meta = {
  title: 'Écrans/Réglages',
  id: 'ecrans-reglages',
  component: ReglagesScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Règles de couleur de l’administration : les six lentilles, et l’éditeur de « Échéance des contrats ». Chaque niveau a un état et une condition sur la date ; la première règle vraie l’emporte. Monter, descendre, supprimer, ajouter un niveau. L’aperçu compte en direct les 25 contrats actuels (15 expirés, 6 à 12 mois, 4 à plus d’un an) : passer 12 à 18 mois déplace deux contrats. Clic sur un niveau de l’aperçu : ses contrats. « Annuler » revient à la version enregistrée, « Enregistrer la lentille » confirme par un toast. Les autres lentilles ont un éditeur allégé.',
      },
    },
  },
} satisfies Meta<typeof ReglagesScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Reglages: Story = {}
