// Blocs Vue des pages de documentation (Couleurs, Pictogrammes).
// Les pages MDX sont rendues par React : elles ne peuvent pas monter un composant Vue directement.
// Elles passent donc par ces stories (<Story of={…} />), rendues par Vue. Masquées de la barre latérale.
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TokenSwatches from './TokenSwatches.vue'
import IconGallery from './IconGallery.vue'

const meta = {
  title: 'Fondations/Blocs',
  component: TokenSwatches,
  tags: ['!dev', '!autodocs'],
  parameters: { layout: 'fullscreen' },
  render: (args) => ({
    components: { TokenSwatches },
    setup: () => ({ args }),
    template: '<TokenSwatches v-bind="args" />',
  }),
} satisfies Meta<typeof TokenSwatches>

export default meta
type Story = StoryObj<typeof meta>

export const Marque: Story = { args: { prefixes: ['navy', 'yellow', 'on-', 'accent', 'focus'] } }
export const Fonds: Story = { args: { prefixes: ['canvas', 'surface', 'line', 'ink', 'edge'] } }
export const Couches: Story = { args: { prefixes: ['layer-'] } }
export const Etats: Story = { args: { prefixes: ['status-'] } }
export const Autres: Story = { args: { prefixes: ['crit-', 'data-', 'sticky-'] } }

export const Pictogrammes: Story = {
  render: () => ({ components: { IconGallery }, template: '<IconGallery />' }),
}
