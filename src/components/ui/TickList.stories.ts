import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TickList from './TickList.vue'
import { featureDetails } from '../../data/pages'

const meta = {
  title: 'Briques/TickList',
  component: TickList,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Des points cochés dans un disque jaune. Sur fond jaune, le disque passe au blanc ; sur navy, le texte passe au blanc.' } },
  },
  args: {
    items: featureDetails.find((d) => d.id === 'cartes')?.points ?? [],
    ground: 'light',
    size: 'l',
  },
  argTypes: {
    ground: { control: 'inline-radio', options: ['light', 'navy', 'yellow'] },
    size: { control: 'inline-radio', options: ['m', 'l'] },
  },
} satisfies Meta<typeof TickList>

export default meta
type Story = StoryObj<typeof meta>

export const SurPapier: Story = {}
export const SurJaune: Story = { args: { ground: 'yellow' }, parameters: { ground: 'yellow' } }
export const SurNavy: Story = { args: { ground: 'navy' }, parameters: { ground: 'navy' } }
export const Moyenne: Story = { args: { size: 'm' } }
