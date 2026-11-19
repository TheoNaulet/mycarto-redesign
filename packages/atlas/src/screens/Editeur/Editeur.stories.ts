import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EditeurScreen from './Editeur.vue'

const meta = {
  title: 'Écrans/Éditeur de carte',
  id: 'ecrans-editeur',
  component: EditeurScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'La carte des applications et flux de Scolarité en modification. À gauche, le contenu de la carte : l’œil masque ou réaffiche un type d’objet, le filtre cherche un objet. Clic sur un flux : le panneau de droite le modifie (libellé, source, cible, liaison, fréquence, déclenchement, traitement, données échangées) et la carte suit en direct. Glisser un nœud le déplace. Barre du bas : Sélection, Main, Ajouter un objet, Relier (source puis cible), Post-it, Réorganiser, Annuler. Ctrl ou Cmd + Z annule la dernière modification, Suppr retire la sélection. « Publier la carte » confirme par un toast.',
      },
    },
  },
} satisfies Meta<typeof EditeurScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Editeur: Story = {}
