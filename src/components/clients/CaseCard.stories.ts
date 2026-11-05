import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CaseCard from './CaseCard.vue'
import { caseStudies } from '../../data/cases'

const meta = {
  title: 'Clients/CaseCard',
  component: CaseCard,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Un cas client : visuel ou logo, l’organisation, son chiffre clé et une ligne. Toute la carte est un lien.' } },
  },
  args: { study: caseStudies[0] },
  render: (args) => ({
    components: { CaseCard },
    setup: () => ({ args }),
    template: '<div style="max-width:42rem"><CaseCard v-bind="args" /></div>',
  }),
} satisfies Meta<typeof CaseCard>

export default meta
type Story = StoryObj<typeof meta>

export const Carte: Story = {}

export const EnGrille: Story = {
  render: () => ({
    components: { CaseCard },
    setup: () => ({ studies: caseStudies.slice(0, 4) }),
    template: `<ul style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,34rem),1fr));gap:1.5rem"><li v-for="s in studies" :key="s.slug"><CaseCard :study="s" /></li></ul>`,
  }),
}
