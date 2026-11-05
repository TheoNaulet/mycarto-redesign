import type { Meta, StoryObj } from '@storybook/vue3-vite'
import BaseButton from './BaseButton.vue'

const meta = {
  title: 'Briques/BaseButton',
  component: BaseButton,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Le seul bouton du site. Il rend un `RouterLink` avec `to`, un lien avec `href`, sinon un vrai `<button>`. Un seul bouton primaire par vue ; le bouton contour prend l’encre de son fond, il n’est jamais restylé page par page.',
      },
    },
  },
  args: { to: '/demo', variant: 'primary', size: 'm' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'ghost', 'navy'] },
    size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
  },
  render: (args) => ({
    components: { BaseButton },
    setup: () => ({ args }),
    template: '<BaseButton v-bind="args">Demander une démo</BaseButton>',
  }),
} satisfies Meta<typeof BaseButton>

export default meta
type Story = StoryObj<typeof meta>

export const Primaire: Story = {}

export const Contour: Story = { args: { variant: 'ghost', to: '/contact' } }

export const Navy: Story = {
  args: { variant: 'navy' },
  parameters: { ground: 'cool', docs: { description: { story: 'Sur un fond jaune, où le bouton jaune se fondrait.' } } },
}

/** Le couple d’actions sur chacun des quatre fonds. Sur le jaune, l’action principale passe en navy. */
export const SurLesQuatreFonds: Story = {
  parameters: { pad: false },
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display:grid">
        <div v-for="g in grounds" :key="g.name" :class="{ 'on-navy': g.navy }" :style="{ background: g.bg, padding: '2rem var(--gutter)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }">
          <BaseButton to="/demo" size="l" :variant="g.name === 'yellow' ? 'navy' : 'primary'">Demander une démo</BaseButton>
          <BaseButton to="/contact" variant="ghost" size="l">Contact commercial</BaseButton>
        </div>
      </div>`,
    setup: () => ({
      grounds: [
        { name: 'paper', bg: 'var(--paper)' },
        { name: 'cool', bg: 'var(--paper-cool)' },
        { name: 'yellow', bg: 'var(--yellow)' },
        { name: 'navy', bg: 'var(--navy)', navy: true },
      ],
    }),
  }),
}

export const Tailles: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display:flex;gap:0.75rem;align-items:center;flex-wrap:wrap">
        <BaseButton to="/demo" size="s">Taille s, en-tête</BaseButton>
        <BaseButton to="/demo">Taille m</BaseButton>
        <BaseButton to="/demo" size="l">Taille l, hero</BaseButton>
      </div>`,
  }),
}

export const BoutonDeFormulaire: Story = {
  render: () => ({
    components: { BaseButton },
    template: `
      <div style="display:flex;gap:0.75rem;flex-wrap:wrap">
        <BaseButton type="submit" size="l">Demander ma démo</BaseButton>
        <BaseButton type="submit" size="l" disabled><span class="spinner" aria-hidden="true" />Envoi en cours</BaseButton>
      </div>`,
  }),
}
