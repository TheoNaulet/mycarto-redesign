import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FeatureIntro from './FeatureIntro.vue'
import TickList from '../ui/TickList.vue'
import { featureDetails } from '../../data/pages'

/** The real content of the Fonctionnalités page, by feature id. */
const feature = (id: string) => {
  const f = featureDetails.find((d) => d.id === id)!
  return { icon: f.icon, title: f.name, titleId: `story-${f.id}`, why: f.why, points: f.points ?? [] }
}
const interop = feature('interoperabilite')
const meta_ = feature('meta-modele')
const dash = feature('tableaux-de-bord')

const meta = {
  title: 'Produit/FeatureIntro',
  component: FeatureIntro,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'L’en-tête d’une fonctionnalité : son picto de marque dans une tuile encadrée, son nom, et la ligne qui dit pourquoi elle compte. La section autour choisit le fond ; les points, visuels et exemples suivent dans la page.',
      },
    },
  },
  args: { icon: interop.icon, title: interop.title, titleId: interop.titleId, why: interop.why, ground: 'light', align: 'start' },
  argTypes: {
    ground: { control: 'inline-radio', options: ['light', 'navy'] },
    align: { control: 'inline-radio', options: ['start', 'center'] },
  },
} satisfies Meta<typeof FeatureIntro>

export default meta
type Story = StoryObj<typeof meta>

export const SurJaune: Story = { parameters: { ground: 'yellow' } }

export const SurNavy: Story = {
  args: { icon: meta_.icon, title: meta_.title, titleId: meta_.titleId, why: meta_.why, ground: 'navy' },
  parameters: { ground: 'navy' },
}

export const Centre: Story = {
  args: { icon: dash.icon, title: dash.title, titleId: dash.titleId, why: dash.why, align: 'center' },
  parameters: { ground: 'cool' },
}

/** Avec ses points, comme sur la page Fonctionnalités. */
export const AvecSesPoints: Story = {
  parameters: { ground: 'yellow' },
  render: (args) => ({
    components: { FeatureIntro, TickList },
    setup: () => ({ args, points: interop.points }),
    template: `
      <div style="display:grid;gap:2rem">
        <FeatureIntro v-bind="args" />
        <TickList ground="yellow" :items="points" />
      </div>`,
  }),
}
