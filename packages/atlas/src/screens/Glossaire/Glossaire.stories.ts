import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GlossaireScreen from './Glossaire.vue'

const meta = {
  title: 'Écrans/Glossaire des applications',
  id: 'ecrans-glossaire',
  component: GlossaireScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Les applications de A à Z : une tuile par lettre (et 0123 pour les noms qui commencent par un chiffre) avec le nombre d’applications (toutes celles qui ont une fiche), les lettres vides grisées. Clic sur une lettre : ses applications, chacune vers sa fiche. La recherche filtre les tuiles et la liste.',
      },
    },
  },
} satisfies Meta<typeof GlossaireScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Glossaire: Story = {}
