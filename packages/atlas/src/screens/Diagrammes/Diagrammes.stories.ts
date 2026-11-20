import type { Meta, StoryObj } from '@storybook/vue3-vite'
import Screen from './Diagrammes.vue'

const meta = {
  title: 'Écrans/Diagrammes BPMN',
  id: 'ecrans-diagrammes-bpmn',
  component: Screen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Diagrammes BPMN de l’administration : les processus de l’établissement, avec ou sans diagramme. Ouvrir un diagramme mène au canevas BPMN, dont le fil d’Ariane ramène à cette liste ; un processus sans diagramme s’ouvre dans la cartographie des processus.',
      },
    },
  },
} satisfies Meta<typeof Screen>

export default meta
type Story = StoryObj<typeof meta>

export const DiagrammesBpmn: Story = {}
