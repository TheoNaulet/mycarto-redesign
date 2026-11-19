import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ProcessusScreen from './Processus.vue'

const meta = {
  title: 'Écrans/Processus',
  id: 'ecrans-processus',
  component: ProcessusScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Les processus de la couche métier. Vue « Macro-processus » : pilotage, réalisation et support en cartes à onglet (code), chaque processus en nœud ; clic sur un processus : son inspecteur. Clic sur S1.6 Gestion des achats et approvisionnements : la vue « Diagramme » ouvre le BPMN « Achat de fournitures ». Ses magasins de données (AMANDE, CARAMBOLE, MARACUJA) sont des applications : clic ou Entrée ouvre leur inspecteur, « Ouvrir la fiche » mène à la fiche.',
      },
    },
  },
} satisfies Meta<typeof ProcessusScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Processus: Story = {}
