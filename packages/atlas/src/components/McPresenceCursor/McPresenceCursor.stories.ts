import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McPresenceCursor from './McPresenceCursor.vue'

const meta = {
  title: 'Canevas/PresenceCursor',
  component: McPresenceCursor,
  args: { name: 'Samuel', color: 5, idle: false },
  argTypes: { color: { control: { type: 'range', min: 1, max: 6, step: 1 } } },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Curseur d’une autre personne présente sur la même carte, avec son prénom. Flèche pleine et pilule dans la couleur de la personne (`data-1…6`), la même que son avatar dans l’AppBar. `idle` l’estompe ; il disparaît après 10 s d’inactivité, l’avatar reste dans la barre.',
      },
    },
  },
  render: (args) => ({
    components: { McPresenceCursor },
    setup: () => ({ args }),
    template: '<McPresenceCursor v-bind="args" />',
  }),
} satisfies Meta<typeof McPresenceCursor>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McPresenceCursor },
    setup: () => ({ people: ['William', 'Gwenaël', 'Lionel', 'Samuel', 'Antoine', 'Pierre'] }),
    template: `<div class="mc-col" style="gap:20px">
      <div class="mc-row lg"><McPresenceCursor v-for="(p, i) in people" :key="p" :name="p" :color="i + 1" /></div>
      <div class="mc-row lg"><span class="mc-over" style="width:120px">Inactifs</span><McPresenceCursor v-for="(p, i) in people.slice(0, 3)" :key="p" :name="p" :color="i + 1" idle /></div>
    </div>`,
  }),
}
