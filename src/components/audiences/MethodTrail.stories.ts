import type { Meta, StoryObj } from '@storybook/vue3-vite'
import MethodTrail from './MethodTrail.vue'
import { methodSteps } from '../../data/audiences'

const meta = {
  title: 'Produit/MethodTrail',
  component: MethodTrail,
  tags: ['autodocs'],
  parameters: {
    ground: 'yellow',
    docs: {
      description: {
        component:
          'La méthode dessinée comme une route sur le jaune de la marque : la chaussée se trace à l’arrivée (`v-draw`), puis chaque étape se pose. Chaque étape est un lien vers sa section.',
      },
    },
  },
  args: { steps: methodSteps },
} satisfies Meta<typeof MethodTrail>

export default meta
export const Route: StoryObj<typeof meta> = {}
