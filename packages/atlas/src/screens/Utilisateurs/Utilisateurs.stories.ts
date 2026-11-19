import type { Meta, StoryObj } from '@storybook/vue3-vite'
import UtilisateursScreen from './Utilisateurs.vue'

const meta = {
  title: 'Écrans/Utilisateurs',
  id: 'ecrans-utilisateurs',
  component: UtilisateursScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Administration des accès : trois onglets. Utilisateurs (recherche, profil, désactivation avec « Annuler », invitation par adresse e-mail), Groupes (membres à ajouter ou retirer, nouveau groupe), Profils (matrice des droits par interrupteurs ; l’Administrateur garde tous les droits).',
      },
    },
  },
} satisfies Meta<typeof UtilisateursScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Utilisateurs: Story = {}
