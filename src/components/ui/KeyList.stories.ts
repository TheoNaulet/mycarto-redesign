import type { Meta, StoryObj } from '@storybook/vue3-vite'
import KeyList from './KeyList.vue'
import { features } from '../../data/content'

const legend = features.map((f) => ({ name: f.name, line: f.line, icon: `/brand/features/${f.icon}.svg` }))

const meta = {
  title: 'Briques/KeyList',
  component: KeyList,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'La liste encadrée, signature de la légende de la home : cadre navy de 3 px, coins de 20 px, lignes séparées par des filets. Une ligne avec `to` devient un lien avec une flèche. Elle sert aux menus, aux en-têtes de page et aux listes de services.',
      },
    },
  },
  args: { items: legend, layout: 'columns', arrow: 'right', iconSize: 'm' },
  argTypes: {
    layout: { control: 'inline-radio', options: ['stack', 'columns'] },
    arrow: { control: 'inline-radio', options: ['right', 'down'] },
    iconSize: { control: 'inline-radio', options: ['m', 'l'] },
  },
} satisfies Meta<typeof KeyList>

export default meta
type Story = StoryObj<typeof meta>

/** La légende de la home : nom à gauche, ligne à droite. */
export const Legende: Story = {}

/** Empilée et liée, comme les sommaires d’en-tête de page. */
export const Liens: Story = {
  args: {
    layout: 'stack',
    items: legend.slice(0, 3).map((k, i) => ({ ...k, to: ['/fonctionnalites', '/integration', '/tarifs'][i] })),
  },
}

export const Ancres: Story = {
  args: {
    layout: 'stack',
    arrow: 'down',
    items: legend.slice(0, 3).map((k) => ({ ...k, to: '#fonctionnalites' })),
  },
}
