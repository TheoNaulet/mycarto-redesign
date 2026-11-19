import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FournisseursScreen from './Fournisseurs.vue'

const meta = {
  title: 'Écrans/Fournisseurs',
  id: 'ecrans-fournisseurs',
  component: FournisseursScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Glossaire des 27 fournisseurs de la couche applicative : nœuds à onglet avec le nombre d’applications et l’état du contrat. Recherche (nom ou application fournie), tri par nom ou nombre d’applications, filtres d’état (Tous, Contrat expiré, Expire < 1 an, Sans contrat), index alphabétique (lettres sans fournisseur grisées ; un second clic retire la lettre), bascule Grille / Liste (tableau triable) et Carte. Clic sur un fournisseur : l’inspecteur montre ses applications et ses contrats ; un contrat mène à l’écran des contrats.',
      },
    },
  },
} satisfies Meta<typeof FournisseursScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Fournisseurs: Story = {}
