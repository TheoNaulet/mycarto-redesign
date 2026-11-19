import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TableauxDeBordScreen from './TableauxDeBord.vue'

const meta = {
  title: 'Écrans/Tableaux de bord',
  id: 'ecrans-tableaux-de-bord',
  component: TableauxDeBordScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Liste des tableaux de bord en cartes avec vignette : Santé du SI ouvre le tableau de bord, les autres l’ouvrent sous leur nom. Favoris, filtre (tous, mes tableaux, partagés), et « Nouveau tableau de bord » : modale (nom, modèle, partage) qui ajoute la carte.',
      },
    },
  },
} satisfies Meta<typeof TableauxDeBordScreen>

export default meta
type Story = StoryObj<typeof meta>

export const TableauxDeBord: Story = {}
