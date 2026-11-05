import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SiteHeader from './SiteHeader.vue'

const meta = {
  title: 'Navigation/SiteHeader',
  component: SiteHeader,
  parameters: {
    pad: false,
    docs: {
      description: {
        component:
          'L’en-tête et ses menus déroulants, lus dans `src/data/nav.ts` (la même source que le pied de page et le plan du site). Ouverture au survol et au clic, fermeture avec Échap ou un clic à l’extérieur. Sous le palier `--bp-l`, les menus passent dans un tiroir en accordéon.',
      },
    },
  },
  render: () => ({
    components: { SiteHeader },
    template: '<div style="min-height:34rem"><SiteHeader /></div>',
  }),
} satisfies Meta<typeof SiteHeader>

export default meta
type Story = StoryObj<typeof meta>

export const Bureau: Story = {}

/** Le menu « Produit » ouvert, comme après un clic. */
export const MenuOuvert: Story = {
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('.menu__trigger')?.click()
  },
}

export const Mobile: Story = {
  globals: { viewport: { value: 'mobile2', isRotated: false } },
  play: async ({ canvasElement }) => {
    canvasElement.querySelector<HTMLButtonElement>('.header__toggle')?.click()
  },
}
