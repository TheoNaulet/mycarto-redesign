import type { Meta, StoryObj } from '@storybook/vue3-vite'
import PageHero from './PageHero.vue'
import BaseButton from './BaseButton.vue'
import LayersIllustration from '../product/LayersIllustration.vue'

const meta = {
  title: 'Briques/PageHero',
  component: PageHero,
  tags: ['autodocs'],
  parameters: {
    pad: false,
    docs: {
      description: {
        component:
          'L’ouverture de chaque page intérieure (ici, celle de la page Logiciel) : un grand titre, une ligne et les actions à gauche, le visuel propre à la page à droite. `full` lui fait remplir l’écran sous l’en-tête ; les pages utilitaires (mentions, FAQ) le laissent de côté.',
      },
    },
  },
  args: { ground: 'paper', full: false },
  argTypes: { ground: { control: 'inline-radio', options: ['paper', 'cool', 'navy', 'yellow'] } },
  render: (args) => ({
    components: { PageHero, BaseButton, LayersIllustration },
    setup: () => ({ args }),
    template: `
      <PageHero v-bind="args">
        <template #title>Le logiciel de cartographie du SI</template>
        <template #lede>Process, applications, flux, infrastructures, données : tout votre SI, couche par couche, dans un seul référentiel.</template>
        <template #actions>
          <BaseButton to="/demo" size="l" :variant="args.ground === 'yellow' ? 'navy' : 'primary'">Demander une démo</BaseButton>
          <BaseButton to="/tarifs" variant="ghost" size="l">Voir les tarifs</BaseButton>
        </template>
        <template #aside><LayersIllustration /></template>
      </PageHero>`,
  }),
} satisfies Meta<typeof PageHero>

export default meta
type Story = StoryObj<typeof meta>

export const Papier: Story = {}
/** Sur le jaune, l’action principale passe en navy : le jaune y disparaîtrait. */
export const Jaune: Story = { args: { ground: 'yellow' } }
export const Navy: Story = { args: { ground: 'navy' } }

export const SansVisuel: Story = {
  args: { ground: 'cool' },
  render: (args) => ({
    components: { PageHero },
    setup: () => ({ args }),
    template: `
      <PageHero v-bind="args">
        <template #title>Mentions légales</template>
              </PageHero>`,
  }),
}
