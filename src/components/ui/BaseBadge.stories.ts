import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseBadge from './BaseBadge.vue'

const meta = {
  title: 'Briques/BaseBadge',
  component: BaseBadge,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Un fait court dans une pastille : une date, un secteur, un référentiel, « Vous êtes ici ». Il ne se clique jamais : une action est un `BaseButton`. `as` choisit l’élément (`li` dans une liste, `time` pour une date).',
      },
    },
  },
  args: { tone: 'navy', size: 'm', as: 'span' },
  argTypes: {
    tone: { control: 'inline-radio', options: ['navy', 'yellow', 'outline'] },
    size: { control: 'inline-radio', options: ['s', 'm'] },
  },
  render: (args) => ({
    components: { BaseBadge },
    setup: () => ({ args }),
    template: '<BaseBadge v-bind="args">Santé</BaseBadge>',
  }),
} satisfies Meta<typeof BaseBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Navy: Story = {}

export const Jaune: Story = { args: { tone: 'yellow' } }

/** Une liste de faits : les référentiels de la page Méthode. */
export const EnListe: Story = {
  parameters: { ground: 'yellow' },
  render: () => ({
    components: { BaseBadge },
    setup: () => ({ items: ['TOGAF', 'ArchiMate', 'Zachman', 'ITIL', 'COBIT', 'BPMN 2'] }),
    template: `<ul style="display:flex;flex-wrap:wrap;gap:0.5rem"><BaseBadge v-for="i in items" :key="i" as="li">{{ i }}</BaseBadge></ul>`,
  }),
}

/** Une date et son lieu, comme en tête du prochain club. */
export const DateEtLieu: Story = {
  render: () => ({
    components: { BaseBadge },
    template: `<p style="display:flex;gap:0.5rem;flex-wrap:wrap"><BaseBadge as="time" datetime="2026-11-19T09:30">jeudi 19 novembre, 9 h 30</BaseBadge><BaseBadge tone="outline">En ligne</BaseBadge></p>`,
  }),
}

export const Petite: Story = { args: { size: 's' } }
