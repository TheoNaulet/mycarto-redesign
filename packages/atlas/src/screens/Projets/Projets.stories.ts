import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ProjetsScreen from './Projets.vue'

const meta = {
  title: 'Écrans/Projets',
  id: 'ecrans-projets',
  component: ProjetsScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Portefeuille de projets en colonnes par état (À l’étude, En cours, Terminé) : dates, responsable, avancement, applications concernées (vers leurs fiches), liens vers l’impact, les contrats, la carte ou l’infrastructure. « Nouveau projet » ouvre une modale et ajoute la carte dans « À l’étude » ; l’inspecteur permet de changer l’état.',
      },
    },
  },
} satisfies Meta<typeof ProjetsScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Projets: Story = {}
