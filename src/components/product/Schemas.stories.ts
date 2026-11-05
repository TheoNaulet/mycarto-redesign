import type { Meta, StoryObj } from '@storybook/vue3-vite'
import LayersIllustration from './LayersIllustration.vue'
import UsersAppsChart from './UsersAppsChart.vue'
import MapIllustration from '../MapIllustration.vue'

/**
 * The hand-drawn flat schemas. Each one draws itself once on arrival (v-draw), and is shown
 * complete with reduced motion. They never pretend to be screenshots of the product.
 */
const meta = {
  title: 'Produit/Schémas',
  parameters: {
    docs: {
      description: {
        component:
          'Les schémas dessinés à plat dans le style de la marque. Chacun se trace une fois à l’arrivée (`v-draw`) et s’affiche complet avec « réduire les animations ». Ils ne simulent jamais de fausses captures du produit.',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const frame = (inner: string) => `<div style="max-width:36rem;margin-inline:auto">${inner}</div>`

/** Les cinq couches du SI ; une chaîne descend d’un objectif stratégique jusqu’à un serveur. */
export const Couches: Story = {
  render: () => ({ components: { LayersIllustration }, template: frame('<LayersIllustration />') }),
}

/** L’argument des tarifs : le SI grandit plus vite que l’équipe, le prix suit l’équipe. */
export const UtilisateursEtApplications: Story = {
  render: () => ({ components: { UsersAppsChart }, template: frame('<UsersAppsChart />') }),
}

/** Une carte générée (le POS d’un SI fictif) : les flux se tracent, puis le badge se pose. */
export const Carte: Story = {
  parameters: { ground: 'yellow' },
  render: () => ({ components: { MapIllustration }, template: frame('<MapIllustration />') }),
}
