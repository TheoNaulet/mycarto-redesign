import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CarteScreen from './Carte.vue'

const meta = {
  title: 'Écrans/Carte des flux',
  id: 'ecrans-carte-des-flux',
  component: CarteScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Les applications et flux de Scolarité. Clic sur un nœud, une pilule ou un domaine : il est sélectionné, ses liens passent en accent, le reste s’estompe et l’inspecteur le montre (APOGEE en entier, les autres en bref). Clic sur le vide ou Échap : désélection. Lentille « Obsolescence » : les nœuds prennent la couleur de leur état et la légende s’ouvre. Clic droit sur un nœud : menu contextuel (« Voir l’impact d’un arrêt »). Main ou molette : déplacer ; Ctrl + molette ou − / + : zoomer.',
      },
    },
  },
} satisfies Meta<typeof CarteScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Carte: Story = {}
